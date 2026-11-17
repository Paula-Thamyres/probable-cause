import { describe, expect, it } from 'vitest'
import { chooseWatch } from '../ai/detective'
import type { Beliefs } from '../ai/suspicion'
import { CIVILIANS } from '../data/civilians'
import { MAX_TURNS, applyAction } from './actions'
import type { Action } from './actions'
import { createInitialState } from './state'
import type { GameState } from './state'

const PLAYER_ID = 'ren'
const STRIKE_ON_NAO: Action = { type: 'eliminate', targetId: 'nao', shift: 'manha' }

function newGame(): GameState {
  return createInitialState(CIVILIANS, PLAYER_ID)
}

function beliefOf(beliefs: Beliefs, id: string): number {
  return beliefs[id] ?? 0
}

describe('detective watch', () => {
  it('starts on the most likely strike point', () => {
    expect(newGame().watch).toEqual({ region: 'centro', shift: 'noite' })
  })

  it('marks the clue as watched when the player strikes inside the watch', () => {
    const state = applyAction(newGame(), {
      type: 'eliminate',
      targetId: 'takeshi',
      shift: 'noite',
    })

    expect(state.clues[0]?.watched).toBe(true)
  })

  it('leaves the clue unwatched outside the watch', () => {
    const state = applyAction(newGame(), STRIKE_ON_NAO)

    expect(state.clues[0]?.watched).toBeUndefined()
  })

  it('exposes the player more when the strike lands inside the watch', () => {
    const exposed: GameState = { ...newGame(), watch: { region: 'leste', shift: 'manha' } }
    const hidden: GameState = { ...newGame(), watch: { region: 'sul', shift: 'tarde' } }

    const exposedBelief = beliefOf(applyAction(exposed, STRIKE_ON_NAO).beliefs, PLAYER_ID)
    const hiddenBelief = beliefOf(applyAction(hidden, STRIKE_ON_NAO).beliefs, PLAYER_ID)

    expect(exposedBelief).toBeGreaterThan(hiddenBelief)
  })

  it('chooses the next watch from the updated beliefs', () => {
    const state = applyAction(newGame(), STRIKE_ON_NAO)
    const alive = CIVILIANS.filter((civilian) => !state.eliminatedIds.includes(civilian.id))

    expect(state.watch).toEqual(chooseWatch(state.beliefs, alive))
  })

  it('stops moving the watch once the game is over', () => {
    const game = { ...newGame(), turn: MAX_TURNS }
    const state = applyAction(game, { type: 'wait' })

    expect(state.status).toBe('lost')
    expect(state.watch).toEqual(game.watch)
  })
})
