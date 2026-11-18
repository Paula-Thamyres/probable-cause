import { describe, expect, it } from 'vitest'
import { normalizeBeliefs } from '../ai/suspicion'
import { CIVILIANS } from '../data/civilians'
import { newGame } from '../test/helpers'
import { applyAction } from './actions'
import type { Action } from './actions'
import { withEvent } from './events'
import type { GameState } from './state'
import type { GameEvent } from './types'

const SUSPECT_ID = 'takeshi'
const SUSPECT_WEIGHT = 0.95
const FIRST_TURN = 1

interface ActionCase {
  action: Action
  event: GameEvent
}

const ACTION_CASES: readonly ActionCase[] = [
  {
    action: { type: 'eliminate', targetId: 'nao', shift: 'manha' },
    event: { type: 'eliminated', turn: FIRST_TURN, civilianId: 'nao' },
  },
  {
    action: { type: 'frame', civilianId: 'nao' },
    event: { type: 'framed', turn: FIRST_TURN, civilianId: 'nao' },
  },
  { action: { type: 'alibi' }, event: { type: 'alibi', turn: FIRST_TURN } },
  { action: { type: 'wait' }, event: { type: 'waited', turn: FIRST_TURN } },
]

function suspectBeliefs() {
  const share = (1 - SUSPECT_WEIGHT) / (CIVILIANS.length - 1)
  const weights = CIVILIANS.map((civilian) => [
    civilian.id,
    civilian.id === SUSPECT_ID ? SUSPECT_WEIGHT : share,
  ])

  return normalizeBeliefs(Object.fromEntries(weights))
}

describe('game events', () => {
  it('starts with an empty log', () => {
    expect(newGame().events).toEqual([])
  })

  it('appends an event without changing the original state', () => {
    const game = newGame()
    const next = withEvent(game, { type: 'waited', turn: FIRST_TURN })

    expect(next.events).toEqual([{ type: 'waited', turn: FIRST_TURN }])
    expect(game.events).toEqual([])
  })

  it.each(ACTION_CASES)('records the event for a $action.type action', ({ action, event }) => {
    expect(applyAction(newGame(), action).events).toEqual([event])
  })

  it('numbers each event with the turn it happened in', () => {
    const state = applyAction(applyAction(newGame(), { type: 'wait' }), { type: 'wait' })

    expect(state.events.map((event) => event.turn)).toEqual([1, 2])
  })

  it('records an arrest in the turn of the accusation', () => {
    const game: GameState = { ...newGame(), beliefs: suspectBeliefs() }
    const state = applyAction(game, { type: 'alibi' })

    expect(state.arrestedIds).toEqual([SUSPECT_ID])
    expect(state.events).toEqual([
      { type: 'alibi', turn: FIRST_TURN },
      { type: 'arrested', turn: FIRST_TURN, civilianId: SUSPECT_ID },
    ])
  })
})
