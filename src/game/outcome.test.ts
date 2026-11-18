import { describe, expect, it } from 'vitest'
import { PLAYER_ID, SEVEN_ARRESTED, newGame } from '../test/helpers'
import { getOutcome } from './outcome'
import { MAX_TURNS } from './state'
import type { GameState } from './state'

describe('getOutcome', () => {
  it('is playing while the game is on', () => {
    expect(getOutcome(newGame())).toBe('playing')
  })

  it('is won once the game is won', () => {
    expect(getOutcome({ ...newGame(), status: 'won' })).toBe('won')
  })

  it('is accused when the detective is certain about the player', () => {
    const beliefs = { ...newGame().beliefs, [PLAYER_ID]: 0.95 }

    expect(getOutcome({ ...newGame(), status: 'lost', beliefs })).toBe('accused')
  })

  it('is timeout when the turns run out', () => {
    expect(getOutcome({ ...newGame(), status: 'lost', turn: MAX_TURNS })).toBe('timeout')
  })

  it('is cornered when too few targets are left to win', () => {
    const state: GameState = { ...newGame(), status: 'lost', arrestedIds: SEVEN_ARRESTED }

    expect(getOutcome(state)).toBe('cornered')
  })
})
