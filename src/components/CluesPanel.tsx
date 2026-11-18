import { REGION_LABELS, SHIFT_LABELS } from '../data/labels'
import type { Clue } from '../game/types'
import { TerminalPanel } from './TerminalPanel'

interface CluesPanelProps {
  clues: readonly Clue[]
}

export function CluesPanel({ clues }: CluesPanelProps) {
  return (
    <TerminalPanel title="PISTAS">
      {clues.length === 0 ? (
        <p className="text-neutral-400">Nenhuma pista deixada.</p>
      ) : (
        <ol className="space-y-1">
          {clues.map((clue, index) => (
            <li key={`clue-${index + 1}`}>
              {index + 1}. {REGION_LABELS[clue.region]} · {SHIFT_LABELS[clue.shift]}
            </li>
          ))}
        </ol>
      )}
    </TerminalPanel>
  )
}
