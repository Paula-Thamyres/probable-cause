import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import type { GameEvent } from '../game/types'
import { EventLog } from './EventLog'

const EVENTS: readonly GameEvent[] = [
  { type: 'waited', turn: 1 },
  { type: 'eliminated', turn: 2, civilianId: 'nao' },
  { type: 'arrested', turn: 2, civilianId: 'takeshi' },
]

function renderLog(events: readonly GameEvent[]): void {
  render(<EventLog events={events} civilians={CIVILIANS} />)
}

describe('EventLog', () => {
  it('shows a hint while there are no events', () => {
    renderLog([])

    expect(screen.getByText('Nenhuma jogada ainda.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('lists one item per event', () => {
    renderLog(EVENTS)

    expect(screen.getAllByRole('listitem')).toHaveLength(EVENTS.length)
  })

  it('shows the latest event first', () => {
    renderLog(EVENTS)

    const items = screen.getAllByRole('listitem').map((item) => item.textContent)

    expect(items).toEqual([
      'turno 2 · o detetive prendeu Takeshi M.',
      'turno 2 · você eliminou Nao F.',
      'turno 1 · você esperou',
    ])
  })

  it('announces new entries politely to screen readers', () => {
    renderLog(EVENTS)

    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite')
  })

  it('does not reorder the array it receives', () => {
    const events = [...EVENTS]

    renderLog(events)

    expect(events).toEqual(EVENTS)
  })
})
