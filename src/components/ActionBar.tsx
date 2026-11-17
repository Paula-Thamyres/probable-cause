import { useState } from 'react'
import { REGION_LABELS, SHIFT_LABELS } from '../data/labels'
import type { Action } from '../game/actions'
import type { Civilian, Shift } from '../game/types'
import { TerminalPanel } from './TerminalPanel'

interface ActionBarProps {
  player: Civilian
  targets: readonly Civilian[]
  disabled: boolean
  onPlay: (action: Action) => void
}

const FIELD_STYLE = 'rounded border border-neutral-800 bg-black px-2 py-1 text-neutral-200'
const BUTTON_STYLE =
  'rounded border border-neutral-600 px-3 py-1 text-neutral-200 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40'

export function ActionBar({ player, targets, disabled, onPlay }: ActionBarProps) {
  const [chosenId, setChosenId] = useState('')
  const [chosenShift, setChosenShift] = useState<Shift | null>(null)

  const targetId = targets.some((target) => target.id === chosenId)
    ? chosenId
    : (targets[0]?.id ?? '')
  const shift = chosenShift ?? player.freeShifts[0]
  const selectedTarget = targets.find((target) => target.id === targetId)

  function handleShiftChange(value: string): void {
    const option = player.freeShifts.find((freeShift) => freeShift === value)

    if (option) {
      setChosenShift(option)
    }
  }

  function eliminate(): void {
    if (targetId && shift) {
      onPlay({ type: 'eliminate', targetId, shift })
    }
  }

  function frame(): void {
    if (targetId) {
      onPlay({ type: 'frame', civilianId: targetId })
    }
  }

  return (
    <TerminalPanel title="AÇÕES">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          pessoa
          <select
            className={FIELD_STYLE}
            value={targetId}
            disabled={disabled}
            onChange={(event) => setChosenId(event.target.value)}
          >
            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name} · {REGION_LABELS[target.region]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          turno
          <select
            className={FIELD_STYLE}
            value={shift ?? ''}
            disabled={disabled}
            onChange={(event) => handleShiftChange(event.target.value)}
          >
            {player.freeShifts.map((option) => (
              <option key={option} value={option}>
                {SHIFT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selectedTarget && (
        <p className="mt-3 text-neutral-400">
          alvo atual: {selectedTarget.name} ({REGION_LABELS[selectedTarget.region]})
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={BUTTON_STYLE} disabled={disabled} onClick={eliminate}>
          Eliminar
        </button>
        <button type="button" className={BUTTON_STYLE} disabled={disabled} onClick={frame}>
          Pista falsa
        </button>
        <button
          type="button"
          className={BUTTON_STYLE}
          disabled={disabled}
          onClick={() => onPlay({ type: 'alibi' })}
        >
          Álibi
        </button>
        <button
          type="button"
          className={BUTTON_STYLE}
          disabled={disabled}
          onClick={() => onPlay({ type: 'wait' })}
        >
          Esperar
        </button>
      </div>
    </TerminalPanel>
  )
}
