import type { Civilian, Clue } from '../game/types'

export type Beliefs = Readonly<Record<string, number>>

const REGION_MATCH_LIKELIHOOD = 0.7
const REGION_MISMATCH_LIKELIHOOD = 0.15
const SHIFT_FREE_LIKELIHOOD = 0.9
const SHIFT_BUSY_LIKELIHOOD = 0.05
const WATCHED_REGION_MISMATCH_LIKELIHOOD = 0.03
const WATCHED_SHIFT_BUSY_LIKELIHOOD = 0.01

export function createUniformBeliefs(civilians: readonly Civilian[]): Beliefs {
  if (civilians.length === 0) {
    throw new Error('Cannot build beliefs without civilians')
  }

  const share = 1 / civilians.length
  return Object.fromEntries(civilians.map((civilian) => [civilian.id, share]))
}

export function normalizeBeliefs(weights: Readonly<Record<string, number>>): Beliefs {
  const entries = Object.entries(weights)
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)

  if (total <= 0) {
    throw new Error('Cannot normalize beliefs without positive weight')
  }

  return Object.fromEntries(entries.map(([id, weight]) => [id, weight / total]))
}

export function clueLikelihood(civilian: Civilian, clue: Clue): number {
  const regionMismatch = clue.watched
    ? WATCHED_REGION_MISMATCH_LIKELIHOOD
    : REGION_MISMATCH_LIKELIHOOD
  const shiftBusy = clue.watched
    ? WATCHED_SHIFT_BUSY_LIKELIHOOD
    : SHIFT_BUSY_LIKELIHOOD

  const regionWeight =
    civilian.region === clue.region ? REGION_MATCH_LIKELIHOOD : regionMismatch
  const shiftWeight = civilian.freeShifts.includes(clue.shift)
    ? SHIFT_FREE_LIKELIHOOD
    : shiftBusy

  return regionWeight * shiftWeight
}

export function updateBeliefs(
  beliefs: Beliefs,
  civilians: readonly Civilian[],
  clue: Clue,
): Beliefs {
  const weights = Object.fromEntries(
    civilians.map((civilian) => [
      civilian.id,
      (beliefs[civilian.id] ?? 0) * clueLikelihood(civilian, clue),
    ]),
  )

  return normalizeBeliefs(weights)
}
