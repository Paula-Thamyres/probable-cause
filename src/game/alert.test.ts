import { describe, expect, it } from 'vitest'
import { getAlertLevel } from './alert'

describe('getAlertLevel', () => {
  it('returns low when the detective barely suspects the player', () => {
    expect(getAlertLevel({ me: 0.1, other: 0.9 }, 'me')).toBe('low')
  })

  it('returns medium from the medium threshold up to the high one', () => {
    expect(getAlertLevel({ me: 0.25, other: 0.75 }, 'me')).toBe('medium')
    expect(getAlertLevel({ me: 0.59, other: 0.41 }, 'me')).toBe('medium')
  })

  it('returns high from the high threshold up', () => {
    expect(getAlertLevel({ me: 0.6, other: 0.4 }, 'me')).toBe('high')
  })

  it('returns low when the player is not in the beliefs', () => {
    expect(getAlertLevel({ other: 1 }, 'me')).toBe('low')
  })
})
