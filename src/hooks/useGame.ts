import { useState } from 'react'
import { applyAction } from '../game/actions'
import type { Action } from '../game/actions'
import { createInitialState } from '../game/state'
import type { GameState } from '../game/state'
import type { Civilian } from '../game/types'

function startGame(civilians: readonly Civilian[]): GameState {
  const player = civilians[Math.floor(Math.random() * civilians.length)]

  if (!player) {
    throw new Error('Cannot start a game without civilians')
  }

  return createInitialState(civilians, player.id)
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error'
}

export function useGame(civilians: readonly Civilian[]) {
  const [state, setState] = useState(() => startGame(civilians))
  const [error, setError] = useState<string | null>(null)

  function play(action: Action): void {
    try {
      setState(applyAction(state, action))
      setError(null)
    } catch (caught) {
      setError(describeError(caught))
    }
  }

  function restart(): void {
    setState(startGame(civilians))
    setError(null)
  }

  return { state, error, play, restart }
}
