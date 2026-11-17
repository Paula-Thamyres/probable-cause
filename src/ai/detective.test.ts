import { describe, expect, it } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import { chooseWatch } from './detective'
import type { Beliefs } from './suspicion'

function certainAbout(id: string): Beliefs {
  return Object.fromEntries(
    CIVILIANS.map((civilian) => [civilian.id, civilian.id === id ? 1 : 0]),
  )
}

describe('chooseWatch', () => {
  it('watches where the most suspected civilian would strike', () => {
    expect(chooseWatch(certainAbout('yuki'), CIVILIANS)).toEqual({
      region: 'norte',
      shift: 'manha',
    })
    expect(chooseWatch(certainAbout('sora'), CIVILIANS)).toEqual({
      region: 'oeste',
      shift: 'tarde',
    })
  })

  it('follows the civilian the detective suspects more', () => {
    const beliefs = { ...certainAbout('yuki'), yuki: 0.6, sora: 0.4 }

    expect(chooseWatch(beliefs, CIVILIANS)).toEqual({ region: 'norte', shift: 'manha' })
  })

  it('rejects an empty civilian list', () => {
    expect(() => chooseWatch({}, [])).toThrow('without civilians')
  })
})
