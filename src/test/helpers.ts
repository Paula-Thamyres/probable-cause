import type { Beliefs } from '../ai/suspicion'
import { CIVILIANS } from '../data/civilians'
import { createInitialState } from '../game/state'
import type { GameState } from '../game/state'

export const PLAYER_ID = 'ren'
export const SIX_ARRESTED = ['takeshi', 'aiko', 'mei', 'sora', 'kenji', 'yuki']
export const SEVEN_ARRESTED = [...SIX_ARRESTED, 'haru']

export function newGame(): GameState {
  return createInitialState(CIVILIANS, PLAYER_ID)
}

export function beliefOf(beliefs: Beliefs, id: string): number {
  return beliefs[id] ?? 0
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
