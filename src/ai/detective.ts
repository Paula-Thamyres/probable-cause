import { REGIONS, SHIFTS } from '../game/types'
import type { Civilian, Slot } from '../game/types'
import { clueLikelihood } from './suspicion'
import type { Beliefs } from './suspicion'

const ALL_SLOTS: readonly Slot[] = REGIONS.flatMap((region) =>
  SHIFTS.map((shift) => ({ region, shift })),
)

function strikeDistribution(civilian: Civilian): number[] {
  const likelihoods = ALL_SLOTS.map((slot) => clueLikelihood(civilian, slot))
  const total = likelihoods.reduce((sum, value) => sum + value, 0)

  return likelihoods.map((value) => value / total)
}

export function chooseWatch(beliefs: Beliefs, civilians: readonly Civilian[]): Slot {
  if (civilians.length === 0) {
    throw new Error('Cannot choose a watch without civilians')
  }

  const suspects = civilians.map((civilian) => ({
    belief: beliefs[civilian.id] ?? 0,
    distribution: strikeDistribution(civilian),
  }))

  const scores = ALL_SLOTS.map((_, index) =>
    suspects.reduce(
      (sum, { belief, distribution }) => sum + belief * (distribution[index] ?? 0),
      0,
    ),
  )

  const best = ALL_SLOTS[scores.indexOf(Math.max(...scores))]

  if (!best) {
    throw new Error('No slot available to watch')
  }

  return best
}
