import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Action } from '../game/actions'
import type { Civilian } from '../game/types'
import { ActionBar } from './ActionBar'

const PLAYER: Civilian = {
  id: 'player',
  name: 'Jogadora',
  region: 'centro',
  freeShifts: ['manha', 'noite'],
}
const FIRST_TARGET: Civilian = {
  id: 'alvo-a',
  name: 'Alvo A.',
  region: 'norte',
  freeShifts: ['tarde'],
}
const SECOND_TARGET: Civilian = {
  id: 'alvo-b',
  name: 'Alvo B.',
  region: 'sul',
  freeShifts: ['noite'],
}
const TARGETS = [FIRST_TARGET, SECOND_TARGET]
const ACTION_LABELS = ['Eliminar', 'Pista falsa', 'Álibi', 'Esperar']
const SIMPLE_ACTIONS: readonly [string, Action][] = [
  ['Álibi', { type: 'alibi' }],
  ['Esperar', { type: 'wait' }],
]

function renderBar(props: Partial<ComponentProps<typeof ActionBar>> = {}) {
  const onPlay = vi.fn<(action: Action) => void>()

  render(
    <ActionBar player={PLAYER} targets={TARGETS} disabled={false} onPlay={onPlay} {...props} />,
  )

  return { onPlay, user: userEvent.setup() }
}

describe('ActionBar', () => {
  it('offers the four actions', () => {
    renderBar()

    for (const label of ACTION_LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('eliminates the first target in the first free shift by default', async () => {
    const { onPlay, user } = renderBar()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onPlay).toHaveBeenCalledWith({
      type: 'eliminate',
      targetId: FIRST_TARGET.id,
      shift: 'manha',
    })
  })

  it('eliminates the person and the shift the user picked', async () => {
    const { onPlay, user } = renderBar()

    await user.selectOptions(screen.getAllByLabelText('pessoa')[0], SECOND_TARGET.id)
    await user.selectOptions(screen.getByLabelText('turno'), 'noite')
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onPlay).toHaveBeenCalledWith({
      type: 'eliminate',
      targetId: SECOND_TARGET.id,
      shift: 'noite',
    })
  })

  it('leaves a false clue about the person the user picked', async () => {
    const { onPlay, user } = renderBar()

    await user.selectOptions(screen.getAllByLabelText('pessoa')[1], SECOND_TARGET.id)
    await user.click(screen.getByRole('button', { name: 'Pista falsa' }))

    expect(onPlay).toHaveBeenCalledWith({ type: 'frame', civilianId: SECOND_TARGET.id })
  })

  it.each(SIMPLE_ACTIONS)('plays %s without choosing anyone', async (label, action) => {
    const { onPlay, user } = renderBar()

    await user.click(screen.getByRole('button', { name: label }))

    expect(onPlay).toHaveBeenCalledWith(action)
  })

  it('locks every control while disabled', async () => {
    const { onPlay, user } = renderBar({ disabled: true })

    for (const control of [...screen.getAllByRole('button'), ...screen.getAllByRole('combobox')]) {
      expect(control).toBeDisabled()
    }

    await user.click(screen.getByRole('button', { name: 'Esperar' }))

    expect(onPlay).not.toHaveBeenCalled()
  })

  it('does not eliminate or frame when there is nobody to pick', async () => {
    const { onPlay, user } = renderBar({ targets: [] })

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Pista falsa' }))

    expect(onPlay).not.toHaveBeenCalled()
  })
})
