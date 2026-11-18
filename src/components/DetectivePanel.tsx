import type { Beliefs } from '../ai/suspicion'
import { ALERT_LABELS, REGION_LABELS, SHIFT_LABELS } from '../data/labels'
import { getAlertLevel } from '../game/alert'
import type { Civilian, Slot } from '../game/types'
import { TerminalPanel } from './TerminalPanel'

interface DetectivePanelProps {
  civilians: readonly Civilian[]
  beliefs: Beliefs
  playerId: string
  watches: readonly Slot[]
  arrested: readonly Civilian[]
  hardMode: boolean
}

const BAR_SEGMENTS = 10

function toPercent(value: number): number {
  return Math.round(value * 100)
}

function renderBar(value: number): string {
  const filled = Math.round(value * BAR_SEGMENTS)
  return '#'.repeat(filled) + '-'.repeat(BAR_SEGMENTS - filled)
}

export function DetectivePanel({
  civilians,
  beliefs,
  playerId,
  watches,
  arrested,
  hardMode,
}: DetectivePanelProps) {
  const suspects = civilians
    .filter((civilian) => civilian.id in beliefs)
    .map((civilian) => ({ civilian, belief: beliefs[civilian.id] ?? 0 }))
    .sort((a, b) => (hardMode ? 0 : b.belief - a.belief))

  return (
    <TerminalPanel title="DETETIVE">
      <ul className="space-y-1">
        {suspects.map(({ civilian, belief }) => (
          <li
            key={civilian.id}
            className={`flex justify-between gap-2 ${civilian.id === playerId ? 'text-neutral-100' : ''}`}
          >
            <span>
              {civilian.name}
              {civilian.id === playerId && ' (você)'}
            </span>
            <span>{hardMode ? '' : `[${renderBar(belief)}] ${toPercent(belief)}%`}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-neutral-800 pt-2 text-neutral-200">
        <p>&gt; vigiando:</p>
        <ul className="pl-4">
          {watches.map((slot) => (
            <li key={`${slot.region}-${slot.shift}`}>
              {REGION_LABELS[slot.region]} · {SHIFT_LABELS[slot.shift]}
            </li>
          ))}
        </ul>
      </div>
      {hardMode && (
        <p className="mt-1 text-neutral-200">
          &gt; nível de alerta: {ALERT_LABELS[getAlertLevel(beliefs, playerId)]}
        </p>
      )}
      {arrested.length > 0 && (
        <p className="mt-1 text-neutral-400">
          &gt; presos: {arrested.map((civilian) => civilian.name).join(', ')}
        </p>
      )}
    </TerminalPanel>
  )
}
