import { ACCUSATION_THRESHOLD } from './accusation'
import { canStillWin } from './actions'
import type { GameState } from './state'

export type Outcome = 'playing' | 'won' | 'accused' | 'cornered' | 'timeout'

export function getOutcome(state: GameState): Outcome {
  if (state.status === 'playing') {
    return 'playing'
  }

  if (state.status === 'won') {
    return 'won'
  }

  if ((state.beliefs[state.playerId] ?? 0) >= ACCUSATION_THRESHOLD) {
    return 'accused'
  }

  return canStillWin(state) ? 'timeout' : 'cornered'
}
