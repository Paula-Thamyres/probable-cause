import type { GameState } from './state'
import type { GameEvent } from './types'

export function withEvent(state: GameState, event: GameEvent): GameState {
  return { ...state, events: [...state.events, event] }
}
