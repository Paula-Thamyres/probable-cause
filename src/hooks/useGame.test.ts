import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CIVILIANS } from '../data/civilians'
import * as actions from '../game/actions'
import { useGame } from './useGame'

const INVALID_MOVE = { type: 'eliminate', targetId: 'ghost', shift: 'noite' } as const

function renderGame() {
  return renderHook(() => useGame(CIVILIANS))
}

describe('useGame', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts a fresh game without errors', () => {
    const { result } = renderGame()

    expect(result.current.state.turn).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('applies a valid move', () => {
    const { result } = renderGame()

    act(() => result.current.play({ type: 'wait' }))

    expect(result.current.state.turn).toBe(2)
  })

  it('reports a rule violation in Portuguese and keeps the game', () => {
    const { result } = renderGame()

    act(() => result.current.play(INVALID_MOVE))

    expect(result.current.error).toBe('Essa jogada não é válida. Tente outra.')
    expect(result.current.state.turn).toBe(1)
  })

  it('clears the error after a valid move', () => {
    const { result } = renderGame()

    act(() => result.current.play(INVALID_MOVE))
    act(() => result.current.play({ type: 'wait' }))

    expect(result.current.error).toBeNull()
  })

  it('logs unexpected errors and shows a generic message', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(actions, 'applyAction').mockImplementation(() => {
      throw new Error('boom')
    })
    const { result } = renderGame()

    act(() => result.current.play({ type: 'wait' }))

    expect(result.current.error).toBe('Algo deu errado. Tente de novo.')
    expect(logged).toHaveBeenCalled()
  })

  it('restarts the game and clears the error', () => {
    const { result } = renderGame()

    act(() => result.current.play({ type: 'wait' }))
    act(() => result.current.play(INVALID_MOVE))
    act(() => result.current.restart())

    expect(result.current.state.turn).toBe(1)
    expect(result.current.error).toBeNull()
  })
})
