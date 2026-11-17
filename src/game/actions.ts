import { applyAlibi, relaxBeliefs } from '../ai/countermeasures'
import { chooseWatch } from '../ai/detective'
import { updateBeliefs } from '../ai/suspicion'
import { resolveAccusation } from './accusation'
import { getActiveCivilians, getPlayer, getTargets } from './selectors'
import { TARGETS_TO_WIN } from './state'
import type { GameState, GameStatus } from './state'
import type { Civilian, Clue, Shift, Slot } from './types'

export const MAX_TURNS = 12

export type Action =
  | { type: 'eliminate'; targetId: string; shift: Shift }
  | { type: 'alibi' }
  | { type: 'frame'; civilianId: string }
  | { type: 'wait' }

function assertPlaying(state: GameState): void {
  if (state.status !== 'playing') {
    throw new Error('The game is already over')
  }
}

function findTarget(state: GameState, id: string): Civilian {
  const civilian = state.civilians.find((candidate) => candidate.id === id)

  if (!civilian) {
    throw new Error(`Unknown civilian: ${id}`)
  }

  if (civilian.id === state.playerId) {
    throw new Error('The player cannot target themselves')
  }

  if (state.eliminatedIds.includes(civilian.id)) {
    throw new Error(`${civilian.name} is already eliminated`)
  }

  if (state.arrestedIds.includes(civilian.id)) {
    throw new Error(`${civilian.name} is already arrested`)
  }

  return civilian
}

function isSameSlot(a: Slot, b: Slot): boolean {
  return a.region === b.region && a.shift === b.shift
}

function makeClue(state: GameState, slot: Slot): Clue {
  return isSameSlot(slot, state.watch) ? { ...slot, watched: true } : slot
}

function eliminate(state: GameState, targetId: string, shift: Shift): GameState {
  const target = findTarget(state, targetId)

  if (!getPlayer(state).freeShifts.includes(shift)) {
    throw new Error(`The player is not free during ${shift}`)
  }

  const clue = makeClue(state, { region: target.region, shift })
  const next = { ...state, eliminatedIds: [...state.eliminatedIds, target.id] }

  return {
    ...next,
    clues: [...state.clues, clue],
    beliefs: updateBeliefs(state.beliefs, getActiveCivilians(next), clue),
  }
}

function frame(state: GameState, civilianId: string): GameState {
  const framed = findTarget(state, civilianId)
  const [shift] = framed.freeShifts

  if (!shift) {
    throw new Error(`${framed.name} has no free shift to be framed in`)
  }

  const clue = makeClue(state, { region: framed.region, shift })

  return {
    ...state,
    clues: [...state.clues, clue],
    beliefs: updateBeliefs(state.beliefs, getActiveCivilians(state), clue),
  }
}

function establishAlibi(state: GameState): GameState {
  return { ...state, beliefs: applyAlibi(state.beliefs, state.playerId) }
}

function wait(state: GameState): GameState {
  return { ...state, beliefs: relaxBeliefs(state.beliefs) }
}

function performAction(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'eliminate':
      return eliminate(state, action.targetId, action.shift)
    case 'alibi':
      return establishAlibi(state)
    case 'frame':
      return frame(state, action.civilianId)
    case 'wait':
      return wait(state)
  }
}

export function canStillWin(state: GameState): boolean {
  return state.eliminatedIds.length + getTargets(state).length >= TARGETS_TO_WIN
}

function resolveStatus(state: GameState): GameStatus {
  if (state.status === 'lost') {
    return 'lost'
  }

  if (state.eliminatedIds.length >= TARGETS_TO_WIN) {
    return 'won'
  }

  if (!canStillWin(state)) {
    return 'lost'
  }

  return state.turn >= MAX_TURNS ? 'lost' : 'playing'
}

function endTurn(state: GameState): GameState {
  const accused = resolveAccusation(state)
  const status = resolveStatus(accused)

  if (status !== 'playing') {
    return { ...accused, status }
  }

  return {
    ...accused,
    status,
    turn: accused.turn + 1,
    watch: chooseWatch(accused.beliefs, getActiveCivilians(accused)),
  }
}

export function applyAction(state: GameState, action: Action): GameState {
  assertPlaying(state)
  return endTurn(performAction(state, action))
}
