import { describe, expect, it } from 'vitest'
import type { GameEvent } from '../game/types'
import { CIVILIANS } from './civilians'
import { describeEvent } from './eventMessages'

const TURN = 3

const MESSAGES: readonly [GameEvent, string][] = [
  [{ type: 'eliminated', turn: TURN, civilianId: 'nao' }, 'você eliminou Nao F.'],
  [
    { type: 'framed', turn: TURN, civilianId: 'takeshi' },
    'você deixou uma pista falsa sobre Takeshi M.',
  ],
  [{ type: 'alibi', turn: TURN }, 'você usou um álibi'],
  [{ type: 'waited', turn: TURN }, 'você esperou'],
  [{ type: 'arrested', turn: TURN, civilianId: 'takeshi' }, 'o detetive prendeu Takeshi M.'],
]

describe('describeEvent', () => {
  it.each(MESSAGES)('describes the %j event', (event, message) => {
    expect(describeEvent(event, CIVILIANS)).toBe(message)
  })

  it('falls back to the id when the civilian is unknown', () => {
    const event: GameEvent = { type: 'eliminated', turn: TURN, civilianId: 'ghost' }

    expect(describeEvent(event, CIVILIANS)).toBe('você eliminou ghost')
  })
})