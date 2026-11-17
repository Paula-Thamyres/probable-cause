import { describe, expect, it } from 'vitest'
import type { Beliefs } from '../ai/suspicion'
import { CIVILIANS } from '../data/civilians'
import { applyAction } from './actions'
import { ACCUSATION_THRESHOLD, resolveAccusation } from './accusation'
import { getTargets } from './selectors'
import { createInitialState } from './state'
import type { GameState } from './state'

const PLAYER_ID = 'ren'

function newGame(): GameState {
  return createInitialState(CIVILIANS, PLAYER_ID)
}

function beliefOf(beliefs: Beliefs, id: string): number {
  return beliefs[id] ?? 0
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function withTopSuspect(topId: string, topBelief: number): GameState {
  const rest = (1 - topBelief) / (CIVILIANS.length - 1)
  const beliefs = Object.fromEntries(
    CIVILIANS.map((civilian) => [civilian.id, civilian.id === topId ? topBelief : rest]),
  )

  return { ...newGame(), beliefs }
}

describe('resolveAccusation', () => {
  it('does nothing while nobody reaches the threshold', () => {
    const state = withTopSuspect('kenji', ACCUSATION_THRESHOLD - 0.05)

    expect(resolveAccusation(state)).toEqual(state)
  })

  it('loses the game when the player is accused', () => {
    expect(resolveAccusation(withTopSuspect(PLAYER_ID, 0.95)).status).toBe('lost')
  })

  it('arrests an innocent civilian and keeps playing', () => {
    const state = resolveAccusation(withTopSuspect('rina', 0.95))

    expect(state.status).toBe('playing')
    expect(state.arrestedIds).toEqual(['rina'])
    expect(state.beliefs).not.toHaveProperty('rina')
    expect(sum(Object.values(state.beliefs))).toBeCloseTo(1)
  })

  it('removes the arrested civilian from the targets', () => {
    const state = resolveAccusation(withTopSuspect('rina', 0.95))

    expect(getTargets(state).map((civilian) => civilian.id)).not.toContain('rina')
  })

  it('shakes the detective after a wrong arrest', () => {
    const beliefs = {
      ...Object.fromEntries(CIVILIANS.map((civilian) => [civilian.id, 0.002])),
      rina: 0.92,
      [PLAYER_ID]: 0.06,
    }
    const beliefWithoutShake = 0.06 / 0.08

    const state = resolveAccusation({ ...newGame(), beliefs })

    expect(beliefOf(state.beliefs, PLAYER_ID)).toBeLessThan(beliefWithoutShake)
  })
})

describe('accusation during a turn', () => {
  it('arrests the decoy at the end of the turn', () => {
    const state = applyAction(withTopSuspect('rina', 0.95), { type: 'alibi' })

    expect(state.arrestedIds).toEqual(['rina'])
    expect(state.status).toBe('playing')
  })

  it('rejects targeting an arrested civilian', () => {
    const state = resolveAccusation(withTopSuspect('rina', 0.95))

    expect(() =>
      applyAction(state, { type: 'eliminate', targetId: 'rina', shift: 'noite' }),
    ).toThrow('already arrested')
  })

  it('is lost when too few targets remain to reach the goal', () => {
    const arrestedIds = ['takeshi', 'aiko', 'mei', 'sora', 'kenji', 'yuki', 'haru']
    const state = applyAction({ ...newGame(), arrestedIds }, { type: 'wait' })

    expect(state.status).toBe('lost')
  })
})
