import { describe, expect, it } from 'vitest'
import { sum } from '../test/helpers'
import { applyAlibi, relaxBeliefs } from './countermeasures'

describe('applyAlibi', () => {
  it('lowers the suspect and raises the others', () => {
    const result = applyAlibi({ a: 0.6, b: 0.4 }, 'a')

    expect(result.a).toBeLessThan(0.6)
    expect(result.b).toBeGreaterThan(0.4)
    expect(sum(Object.values(result))).toBeCloseTo(1)
  })

  it('rejects an unknown suspect', () => {
    expect(() => applyAlibi({ a: 1 }, 'ghost')).toThrow('Unknown suspect')
  })
})

describe('relaxBeliefs', () => {
  it('keeps the beliefs as they are with rate 0', () => {
    const result = relaxBeliefs({ a: 0.9, b: 0.1 }, 0)

    expect(result.a).toBeCloseTo(0.9)
    expect(result.b).toBeCloseTo(0.1)
  })

  it('gives an even split with rate 1', () => {
    const result = relaxBeliefs({ a: 0.9, b: 0.1 }, 1)

    expect(result.a).toBeCloseTo(0.5)
    expect(result.b).toBeCloseTo(0.5)
  })

  it('rejects a rate outside 0 to 1', () => {
    expect(() => relaxBeliefs({ a: 1 }, -0.1)).toThrow('between 0 and 1')
    expect(() => relaxBeliefs({ a: 1 }, 1.1)).toThrow('between 0 and 1')
  })

  it('moves every belief toward an even split', () => {
    const result = relaxBeliefs({ a: 0.9, b: 0.1 })

    expect(result.a).toBeLessThan(0.9)
    expect(result.b).toBeGreaterThan(0.1)
    expect(sum(Object.values(result))).toBeCloseTo(1)
  })
})
