import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import { getActiveCivilians, getArrested, getEliminated, getPlayer, getTargets } from './selectors'
import { createInitialState } from './state'

const PLAYER_ID = 'mei'
const ELIMINATED_ID = 'takeshi'
const ARRESTED_ID = 'aiko'

function buildState() {
  return {
    ...createInitialState(CIVILIANS, PLAYER_ID),
    eliminatedIds: [ELIMINATED_ID],
    arrestedIds: [ARRESTED_ID],
  }
}

function toIds(civilians: readonly { id: string }[]): string[] {
  return civilians.map((civilian) => civilian.id)
}

describe('selectors', () => {
  it('getPlayer returns the hidden player', () => {
    expect(getPlayer(buildState()).id).toBe(PLAYER_ID)
  })

  it('getEliminated returns only the eliminated civilians', () => {
    expect(toIds(getEliminated(buildState()))).toEqual([ELIMINATED_ID])
  })

  it('getArrested returns only the arrested civilians', () => {
    expect(toIds(getArrested(buildState()))).toEqual([ARRESTED_ID])
  })

  it('getActiveCivilians leaves out eliminated and arrested ones but keeps the player', () => {
    const ids = toIds(getActiveCivilians(buildState()))

    expect(ids).toHaveLength(CIVILIANS.length - 2)
    expect(ids).not.toContain(ELIMINATED_ID)
    expect(ids).not.toContain(ARRESTED_ID)
    expect(ids).toContain(PLAYER_ID)
  })

  it('getTargets is the active civilians without the player', () => {
    const ids = toIds(getTargets(buildState()))

    expect(ids).toHaveLength(CIVILIANS.length - 3)
    expect(ids).not.toContain(PLAYER_ID)
  })
})

describe('getPlayer', () => {
  it('rejects a state whose player is not among the civilians', () => {
    const state = { ...buildState(), playerId: 'ghost' }

    expect(() => getPlayer(state)).toThrow('Unknown player civilian')
  })
})
