import { describe, expect, it } from 'vitest'
import { createUniformBeliefs } from '../ai/suspicion'
import type { Beliefs } from '../ai/suspicion'
import { CIVILIANS } from '../data/civilians'
import { applyAction } from './actions'
import { GameError } from './errors'
import { MAX_TURNS, createInitialState } from './state'
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

function corneredState(): GameState {
  const rest = 0.05 / (CIVILIANS.length - 1)
  const beliefs = Object.fromEntries(
    CIVILIANS.map((civilian) => [civilian.id, civilian.id === PLAYER_ID ? 0.95 : rest]),
  )

  return { ...newGame(), beliefs }
}

function oneKillFromVictory(): GameState {
  const eliminatedIds = ['takeshi', 'aiko', 'mei', 'sora']
  const alive = CIVILIANS.filter((civilian) => !eliminatedIds.includes(civilian.id))

  return { ...newGame(), eliminatedIds, turn: 8, beliefs: createUniformBeliefs(alive) }
}

const SIX_ARRESTED = ['takeshi', 'aiko', 'mei', 'sora', 'kenji', 'yuki']
const SEVEN_ARRESTED = [...SIX_ARRESTED, 'haru']

function withArrested(arrestedIds: string[]): GameState {
  const alive = CIVILIANS.filter((civilian) => !arrestedIds.includes(civilian.id))

  return { ...newGame(), arrestedIds, beliefs: createUniformBeliefs(alive) }
}

describe('eliminate', () => {
  it('records the clue, removes the victim and advances the turn', () => {
    const state = applyAction(newGame(), { type: 'eliminate', targetId: 'takeshi', shift: 'noite' })

    expect(state.eliminatedIds).toEqual(['takeshi'])
    expect(state.clues).toEqual([{ region: 'centro', shift: 'noite', watched: true }])
    expect(state.beliefs).not.toHaveProperty('takeshi')
    expect(sum(Object.values(state.beliefs))).toBeCloseTo(1)
    expect(state.turn).toBe(2)
  })

  it('rejects an unknown target', () => {
    expect(() =>
      applyAction(newGame(), { type: 'eliminate', targetId: 'ghost', shift: 'noite' }),
    ).toThrow('Unknown civilian')
  })

  it('rejects targeting the player', () => {
    expect(() =>
      applyAction(newGame(), { type: 'eliminate', targetId: PLAYER_ID, shift: 'noite' }),
    ).toThrow('cannot target themselves')
  })

  it('rejects a target that is already eliminated', () => {
    const state = applyAction(newGame(), { type: 'eliminate', targetId: 'takeshi', shift: 'noite' })

    expect(() =>
      applyAction(state, { type: 'eliminate', targetId: 'takeshi', shift: 'noite' }),
    ).toThrow('already eliminated')
  })

  it('rejects a shift in which the player is not free', () => {
    expect(() =>
      applyAction(newGame(), { type: 'eliminate', targetId: 'takeshi', shift: 'tarde' }),
    ).toThrow('not free')
  })
})

describe('countermeasures', () => {
  const afterKill = applyAction(newGame(), { type: 'eliminate', targetId: 'nao', shift: 'manha' })

  it('lowers suspicion on the player with an alibi', () => {
    const state = applyAction(afterKill, { type: 'alibi' })

    expect(beliefOf(state.beliefs, PLAYER_ID)).toBeLessThan(beliefOf(afterKill.beliefs, PLAYER_ID))
  })

  it('cools the detective down when waiting', () => {
    const state = applyAction(afterKill, { type: 'wait' })

    expect(beliefOf(state.beliefs, PLAYER_ID)).toBeLessThan(beliefOf(afterKill.beliefs, PLAYER_ID))
  })

  it('raises suspicion on the framed civilian', () => {
    const game = newGame()
    const state = applyAction(game, { type: 'frame', civilianId: 'aiko' })

    expect(beliefOf(state.beliefs, 'aiko')).toBeGreaterThan(beliefOf(game.beliefs, 'aiko'))
    expect(state.clues).toHaveLength(1)
  })

  it('rejects framing the player', () => {
    expect(() =>
      applyAction(newGame(), { type: 'frame', civilianId: PLAYER_ID }),
    ).toThrow('cannot target themselves')
  })
})

describe('game outcome', () => {
  it('is won after eliminating enough targets', () => {
    const state = applyAction(oneKillFromVictory(), { type: 'eliminate', targetId: 'yuki', shift: 'noite' })

    expect(state.status).toBe('won')
  })

  it('is lost when the detective becomes certain', () => {
    const state = applyAction(corneredState(), { type: 'eliminate', targetId: 'nao', shift: 'manha' })

    expect(state.status).toBe('lost')
  })

  it('is lost when the turns run out', () => {
    const lastTurn = { ...newGame(), turn: MAX_TURNS }
    const state = applyAction(lastTurn, { type: 'wait' })

    expect(state.status).toBe('lost')
    expect(state.turn).toBe(MAX_TURNS)
  })

  it('keeps playing while there are still enough targets to win', () => {
    const state = applyAction(withArrested(SIX_ARRESTED), { type: 'wait' })

    expect(state.status).toBe('playing')
  })

  it('is lost when too few targets are left to win', () => {
    const state = applyAction(withArrested(SEVEN_ARRESTED), { type: 'wait' })

    expect(state.status).toBe('lost')
  })

  it('accepts no action once the game is over', () => {
    const lost = applyAction({ ...newGame(), turn: MAX_TURNS }, { type: 'wait' })

    expect(() => applyAction(lost, { type: 'wait' })).toThrow('already over')
  })

  it('does not mutate the previous state', () => {
    const game = newGame()
    const snapshot = structuredClone(game)

    applyAction(game, { type: 'eliminate', targetId: 'takeshi', shift: 'noite' })

    expect(game).toEqual(snapshot)
  })
})

describe('rule violations', () => {
  it('are reported as GameError', () => {
    const move = { type: 'eliminate', targetId: 'ghost', shift: 'manha' } as const

    expect(() => applyAction(newGame(), move)).toThrow(GameError)
  })
})
