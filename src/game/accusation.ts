import { relaxBeliefs } from '../ai/countermeasures'
import { normalizeBeliefs } from '../ai/suspicion'
import { withEvent } from './events'
import type { GameState } from './state'

export const ACCUSATION_THRESHOLD = 0.9
const ARREST_SHAKE_RATE = 0.6

function findTopSuspect(state: GameState): [string, number] | undefined {
  return Object.entries(state.beliefs).sort(([, a], [, b]) => b - a)[0]
}

function arrest(state: GameState, suspectId: string): GameState {
  const remaining = Object.fromEntries(
    Object.entries(state.beliefs).filter(([id]) => id !== suspectId),
  )

  return {
    ...state,
    arrestedIds: [...state.arrestedIds, suspectId],
    beliefs: relaxBeliefs(normalizeBeliefs(remaining), ARREST_SHAKE_RATE),
  }
}

export function resolveAccusation(state: GameState): GameState {
  const top = findTopSuspect(state)

  if (!top || top[1] < ACCUSATION_THRESHOLD) {
    return state
  }

  const [suspectId] = top

  if (suspectId === state.playerId) {
    return { ...state, status: 'lost' }
  }

  const arrested = arrest(state, suspectId)

  return resolveAccusation(
    withEvent(arrested, { type: 'arrested', turn: state.turn, civilianId: suspectId }),
  )
}
