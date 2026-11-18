import { normalizeBeliefs } from './suspicion'
import type { Beliefs } from './suspicion'

const ALIBI_FACTOR = 0.5
const DEFAULT_RELAX_RATE = 0.15

export function applyAlibi(beliefs: Beliefs, suspectId: string): Beliefs {
  if (!(suspectId in beliefs)) {
    throw new Error(`Unknown suspect: ${suspectId}`)
  }

  const weights = Object.fromEntries(
    Object.entries(beliefs).map(([id, belief]) => [
      id,
      id === suspectId ? belief * ALIBI_FACTOR : belief,
    ]),
  )

  return normalizeBeliefs(weights)
}

export function relaxBeliefs(beliefs: Beliefs, rate: number = DEFAULT_RELAX_RATE): Beliefs {
  if (rate < 0 || rate > 1) {
    throw new Error('Relax rate must be between 0 and 1')
  }

  const entries = Object.entries(beliefs)
  const uniformShare = 1 / entries.length

  return Object.fromEntries(
    entries.map(([id, belief]) => [id, belief * (1 - rate) + uniformShare * rate]),
  )
}
