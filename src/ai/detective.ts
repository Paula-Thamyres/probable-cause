import { REGIONS, SHIFTS } from '../game/types'
import type { Civilian, Slot } from '../game/types'
import { clueLikelihood } from './suspicion'
import type { Beliefs } from './suspicion'

export const WATCH_COUNT = 3

const ALL_SLOTS: readonly Slot[] = REGIONS.flatMap((region) =>
  SHIFTS.map((shift) => ({ region, shift })),
)

function strikeDistribution(civilian: Civilian): number[] {
  const likelihoods = ALL_SLOTS.map((slot) => clueLikelihood(civilian, slot))
  const total = likelihoods.reduce((sum, value) => sum + value, 0)

  return likelihoods.map((value) => value / total)
}

function scoreSlots(beliefs: Beliefs, civilians: readonly Civilian[]): number[] {
  const suspects = civilians.map((civilian) => ({
    belief: beliefs[civilian.id] ?? 0,
    distribution: strikeDistribution(civilian),
  }))

  return ALL_SLOTS.map((_, index) =>
    suspects.reduce(
      (sum, { belief, distribution }) => sum + belief * (distribution[index] ?? 0),
      0,
    ),
  )
}

export function chooseWatches(
  beliefs: Beliefs,
  civilians: readonly Civilian[],
  count = WATCH_COUNT,
): Slot[] {
  if (civilians.length === 0) {
    throw new Error('Cannot choose a watch without civilians')
  }

  if (!Number.isInteger(count) || count < 1 || count > ALL_SLOTS.length) {
    throw new RangeError(`Watch count must be between 1 and ${ALL_SLOTS.length}`)
  }

  const scores = scoreSlots(beliefs, civilians)
  const ranked = ALL_SLOTS.map((slot, index) => ({ slot, score: scores[index] ?? 0 }))
  ranked.sort((a, b) => b.score - a.score)

  return ranked.slice(0, count).map(({ slot }) => slot)
}