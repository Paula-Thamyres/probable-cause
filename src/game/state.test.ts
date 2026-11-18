import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import { createInitialState, startGame } from './state'

describe('createInitialState', () => {
  it('starts a playable game with uniform suspicion', () => {
    const state = createInitialState(CIVILIANS, 'ren')

    expect(state.status).toBe('playing')
    expect(state.turn).toBe(1)
    expect(state.eliminatedIds).toEqual([])
    expect(state.clues).toEqual([])
    expect(Object.keys(state.beliefs)).toHaveLength(CIVILIANS.length)
  })

  it('rejects a player that is not a civilian', () => {
    expect(() => createInitialState(CIVILIANS, 'ghost')).toThrow('Unknown player civilian')
  })

  it('rejects a cast too small to reach the win condition', () => {
    expect(() => createInitialState(CIVILIANS.slice(0, 5), 'takeshi')).toThrow(
      'Not enough civilians',
    )
  })
})

describe('startGame', () => {
  it('picks the player from the injected random number', () => {
    expect(startGame(CIVILIANS, () => 0).playerId).toBe(CIVILIANS.at(0)?.id)
    expect(startGame(CIVILIANS, () => 0.999).playerId).toBe(CIVILIANS.at(-1)?.id)
  })

  it('rejects an empty cast', () => {
    expect(() => startGame([], () => 0)).toThrow('without civilians')
  })
})
