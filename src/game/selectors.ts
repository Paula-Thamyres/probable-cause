import type { GameState } from './state'
import type { Civilian } from './types'

function pickByIds(state: GameState, ids: readonly string[]): Civilian[] {
  return ids.flatMap((id) => state.civilians.filter((civilian) => civilian.id === id))
}

export function getPlayer(state: GameState): Civilian {
  const player = state.civilians.find((civilian) => civilian.id === state.playerId)

  if (!player) {
    throw new Error(`Unknown player civilian: ${state.playerId}`)
  }

  return player
}

export function getEliminated(state: GameState): Civilian[] {
  return pickByIds(state, state.eliminatedIds)
}

export function getArrested(state: GameState): Civilian[] {
  return pickByIds(state, state.arrestedIds)
}

export function getActiveCivilians(state: GameState): Civilian[] {
  return state.civilians.filter(
    (civilian) =>
      !state.eliminatedIds.includes(civilian.id) && !state.arrestedIds.includes(civilian.id),
  )
}

export function getTargets(state: GameState): Civilian[] {
  return getActiveCivilians(state).filter((civilian) => civilian.id !== state.playerId)
}
