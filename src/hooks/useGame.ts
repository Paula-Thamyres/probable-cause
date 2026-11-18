import { useState } from 'react'
import { applyAction } from '../game/actions'
import type { Action } from '../game/actions'
import { GameError } from '../game/errors'
import { startGame } from '../game/state'
import type { Civilian } from '../game/types'

const INVALID_MOVE_MESSAGE = 'Essa jogada não é válida. Tente outra.'
const UNEXPECTED_ERROR_MESSAGE = 'Algo deu errado. Tente de novo.'

function describeError(error: unknown): string {
  return error instanceof GameError ? INVALID_MOVE_MESSAGE : UNEXPECTED_ERROR_MESSAGE
}

export function useGame(civilians: readonly Civilian[]) {
  const [state, setState] = useState(() => startGame(civilians))
  const [error, setError] = useState<string | null>(null)

  function play(action: Action): void {
    try {
      setState(applyAction(state, action))
      setError(null)
    } catch (caught) {
      if (!(caught instanceof GameError)) {
        console.error(caught)
      }

      setError(describeError(caught))
    }
  }

  function restart(): void {
    setState(startGame(civilians))
    setError(null)
  }

  return { state, error, play, restart }
}
