import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import { WATCH_COUNT, chooseWatches } from './detective'
import type { Beliefs } from './suspicion'

function certainAbout(id: string): Beliefs {
  return Object.fromEntries(CIVILIANS.map((civilian) => [civilian.id, civilian.id === id ? 1 : 0]))
}

describe('chooseWatches', () => {
  it('watches first where the most suspected civilian would strike', () => {
    expect(chooseWatches(certainAbout('yuki'), CIVILIANS)[0]).toEqual({
      region: 'norte',
      shift: 'manha',
    })
    expect(chooseWatches(certainAbout('sora'), CIVILIANS)[0]).toEqual({
      region: 'oeste',
      shift: 'tarde',
    })
  })

  it('follows the civilian the detective suspects more', () => {
    const beliefs = { ...certainAbout('yuki'), yuki: 0.6, sora: 0.4 }

    expect(chooseWatches(beliefs, CIVILIANS)[0]).toEqual({ region: 'norte', shift: 'manha' })
  })

  it('returns the default number of distinct slots', () => {
    const watches = chooseWatches(certainAbout('yuki'), CIVILIANS)
    const distinct = new Set(watches.map((slot) => `${slot.region}-${slot.shift}`))

    expect(watches).toHaveLength(WATCH_COUNT)
    expect(distinct.size).toBe(WATCH_COUNT)
  })

  it('returns as many slots as requested', () => {
    expect(chooseWatches(certainAbout('yuki'), CIVILIANS, 5)).toHaveLength(5)
  })

  it('rejects a count outside the available slots', () => {
    expect(() => chooseWatches(certainAbout('yuki'), CIVILIANS, 0)).toThrow('between 1 and')
    expect(() => chooseWatches(certainAbout('yuki'), CIVILIANS, 16)).toThrow('between 1 and')
  })

  it('rejects an empty civilian list', () => {
    expect(() => chooseWatches({}, [])).toThrow('without civilians')
  })
})
