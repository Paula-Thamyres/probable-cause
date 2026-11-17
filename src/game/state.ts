import { chooseWatch } from '../ai/detective'
import { createUniformBeliefs } from '../ai/suspicion'
import type { Beliefs } from '../ai/suspicion'
import type { Civilian, Clue, Slot } from './types'

export const TARGETS_TO_WIN = 5

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  civilians: readonly Civilian[]
  playerId: string
  eliminatedIds: readonly string[]
  arrestedIds: readonly string[]
  clues: readonly Clue[]
  beliefs: Beliefs
  watch: Slot
  turn: number
  status: GameStatus
}

export function createInitialState(
  civilians: readonly Civilian[],
  playerId: string,
): GameState {
  if (!civilians.some((civilian) => civilian.id === playerId)) {
    throw new Error(`Unknown player civilian: ${playerId}`)
  }

  if (civilians.length - 1 < TARGETS_TO_WIN) {
    throw new Error('Not enough civilians to reach the win condition')
  }

  const beliefs = createUniformBeliefs(civilians)

  return {
    civilians,
    playerId,
    eliminatedIds: [],
    arrestedIds: [],
    clues: [],
    beliefs,
    watch: chooseWatch(beliefs, civilians),
    turn: 1,
    status: 'playing',
  }
}
