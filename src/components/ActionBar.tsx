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

interface PersonFieldProps {
  targets: readonly Civilian[]
  value: string
  disabled: boolean
  onChange: (id: string) => void
}

interface ShiftFieldProps {
  shifts: Civilian['freeShifts']
  value: Shift | undefined
  disabled: boolean
  onChange: (value: string) => void
}

interface ActionButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
}

const FIELD_STYLE = 'rounded border border-neutral-800 bg-black px-2 py-1 text-neutral-200'
const BUTTON_STYLE =
  'w-28 rounded border border-neutral-600 px-3 py-1 text-neutral-200 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40'
const ROW_STYLE =
  'flex flex-wrap items-center gap-3 border-t border-neutral-900 py-2 first:border-t-0'

function ActionButton({ label, disabled, onClick }: ActionButtonProps) {
  return (
    <button type="button" className={BUTTON_STYLE} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}

function PersonField({ targets, value, disabled, onChange }: PersonFieldProps) {
  return (
    <label className="flex items-center gap-2">
      pessoa
      <select
        className={FIELD_STYLE}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {targets.map((target) => (
          <option key={target.id} value={target.id}>
            {target.name} · {REGION_LABELS[target.region]}
          </option>
        ))}
      </select>
    </label>
  )
}

function ShiftField({ shifts, value, disabled, onChange }: ShiftFieldProps) {
  return (
    <label className="flex items-center gap-2">
      turno
      <select
        className={FIELD_STYLE}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {shifts.map((option) => (
          <option key={option} value={option}>
            {SHIFT_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ActionBar({ player, targets, disabled, onPlay }: ActionBarProps) {
  const [chosenId, setChosenId] = useState('')
  const [chosenShift, setChosenShift] = useState<Shift | null>(null)

  const targetId = targets.some((target) => target.id === chosenId)
    ? chosenId
    : (targets[0]?.id ?? '')
  const shift = chosenShift ?? player.freeShifts[0]

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

  const personField = (
    <PersonField targets={targets} value={targetId} disabled={disabled} onChange={setChosenId} />
  )

  return (
    <TerminalPanel title="AÇÕES">
      <div className={ROW_STYLE}>
        <ActionButton label="Eliminar" disabled={disabled} onClick={eliminate} />
        {personField}
        <ShiftField
          shifts={player.freeShifts}
          value={shift}
          disabled={disabled}
          onChange={handleShiftChange}
        />
      </div>
      <div className={ROW_STYLE}>
        <ActionButton label="Pista falsa" disabled={disabled} onClick={frame} />
        {personField}
      </div>
      <div className={ROW_STYLE}>
        <ActionButton label="Álibi" disabled={disabled} onClick={() => onPlay({ type: 'alibi' })} />
      </div>
      <div className={ROW_STYLE}>
        <ActionButton
          label="Esperar"
          disabled={disabled}
          onClick={() => onPlay({ type: 'wait' })}
        />
      </div>
    </TerminalPanel>
  )
}
