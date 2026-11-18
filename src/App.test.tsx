import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { CIVILIANS } from './data/civilians'
import { MAX_TURNS, TARGETS_TO_WIN } from './game/state'

const PLAYER_NAME = CIVILIANS[0]?.name ?? ''

function renderGame() {
  render(<App />)

  return userEvent.setup()
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('presents the player and the goal', () => {
    renderGame()

    expect(screen.getByRole('heading', { name: 'probable-cause' })).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`Você é ${PLAYER_NAME}.*eliminar ${TARGETS_TO_WIN} alvos`)),
    ).toBeInTheDocument()
  })

  it('logs the moves in the REGISTRO panel', async () => {
    const user = renderGame()

    await user.click(screen.getByRole('button', { name: 'Esperar' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.getByText(/você esperou/)).toBeInTheDocument()
    expect(screen.getByText(/você eliminou/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('hides the percentages in hard mode', async () => {
    const user = renderGame()

    expect(screen.getAllByText(/\d+%/).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('checkbox', { name: /modo difícil/ }))

    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument()
    expect(screen.getByText(/nível de alerta/)).toBeInTheDocument()
  })

  it('ends the game when the turns run out and lets the user play again', async () => {
    const user = renderGame()

    for (let turn = 1; turn <= MAX_TURNS; turn += 1) {
      await user.click(screen.getByRole('button', { name: 'Esperar' }))
    }

    expect(screen.getByText(/Os turnos acabaram/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Esperar' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Jogar de novo' }))

    expect(screen.queryByText(/Os turnos acabaram/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Esperar' })).toBeEnabled()
  })
})