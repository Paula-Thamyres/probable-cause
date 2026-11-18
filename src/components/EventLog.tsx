import { describeEvent } from '../data/eventMessages'
import type { Civilian, GameEvent } from '../game/types'
import { TerminalPanel } from './TerminalPanel'

interface EventLogProps {
  events: readonly GameEvent[]
  civilians: readonly Civilian[]
}

export function EventLog({ events, civilians }: EventLogProps) {
  const latestFirst = [...events].reverse()

  return (
    <TerminalPanel title="REGISTRO">
      {latestFirst.length === 0 ? (
        <p className="text-neutral-400">Nenhuma jogada ainda.</p>
      ) : (
        <ul aria-live="polite" className="max-h-40 space-y-1 overflow-y-auto">
          {latestFirst.map((event, index) => (
            <li
              key={events.length - 1 - index}
              className={index === 0 ? 'text-neutral-100' : 'text-neutral-400'}
            >
              <span className="text-neutral-400">turno {event.turn}</span> ·{' '}
              {describeEvent(event, civilians)}
            </li>
          ))}
        </ul>
      )}
    </TerminalPanel>
  )
}
