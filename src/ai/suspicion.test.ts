import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import type { Clue } from '../game/types'
import { createUniformBeliefs, updateBeliefs } from './suspicion'
import type { Beliefs } from './suspicion'

const NIGHT_DOWNTOWN_CLUE: Clue = { region: 'centro', shift: 'noite' }

function beliefOf(beliefs: Beliefs, id: string): number {
  return beliefs[id] ?? 0
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

describe('createUniformBeliefs', () => {
  it('gives every civilian the same share', () => {
    const beliefs = createUniformBeliefs(CIVILIANS)

    expect(Object.keys(beliefs)).toHaveLength(CIVILIANS.length)
    expect(beliefOf(beliefs, 'takeshi')).toBeCloseTo(1 / CIVILIANS.length)
  })

  it('rejects an empty civilian list', () => {
    expect(() => createUniformBeliefs([])).toThrow()
  })
})

describe('updateBeliefs', () => {
  const initial = createUniformBeliefs(CIVILIANS)

  it('keeps probabilities summing to one', () => {
    const updated = updateBeliefs(initial, CIVILIANS, NIGHT_DOWNTOWN_CLUE)

    expect(sum(Object.values(updated))).toBeCloseTo(1)
  })

  it('raises suspicion on civilians that match the clue', () => {
    const updated = updateBeliefs(initial, CIVILIANS, NIGHT_DOWNTOWN_CLUE)

    expect(beliefOf(updated, 'takeshi')).toBeGreaterThan(beliefOf(initial, 'takeshi'))
    expect(beliefOf(updated, 'yuki')).toBeLessThan(beliefOf(initial, 'yuki'))
  })

  it('does not mutate the previous beliefs', () => {
    const snapshot = { ...initial }

    updateBeliefs(initial, CIVILIANS, NIGHT_DOWNTOWN_CLUE)

    expect(initial).toEqual(snapshot)
  })

  it('rejects beliefs with no remaining probability', () => {
    expect(() => updateBeliefs({}, CIVILIANS, NIGHT_DOWNTOWN_CLUE)).toThrow()
  })
})

describe('watched clues', () => {
  it('concentrates suspicion more than an unwatched clue', () => {
    const initial = createUniformBeliefs(CIVILIANS)
    const unwatched = updateBeliefs(initial, CIVILIANS, NIGHT_DOWNTOWN_CLUE)
    const watched = updateBeliefs(initial, CIVILIANS, { ...NIGHT_DOWNTOWN_CLUE, watched: true })

    expect(beliefOf(watched, 'takeshi')).toBeGreaterThan(beliefOf(unwatched, 'takeshi'))
    expect(beliefOf(watched, 'yuki')).toBeLessThan(beliefOf(unwatched, 'yuki'))
  })
})
