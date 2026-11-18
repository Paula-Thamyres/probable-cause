import type { Civilian, GameEvent } from '../game/types'

function nameOf(civilians: readonly Civilian[], id: string): string {
  return civilians.find((civilian) => civilian.id === id)?.name ?? id
}

export function describeEvent(event: GameEvent, civilians: readonly Civilian[]): string {
  switch (event.type) {
    case 'eliminated':
      return `você eliminou ${nameOf(civilians, event.civilianId)}`
    case 'framed':
      return `você deixou uma pista falsa sobre ${nameOf(civilians, event.civilianId)}`
    case 'alibi':
      return 'você usou um álibi'
    case 'waited':
      return 'você esperou'
    case 'arrested':
      return `o detetive prendeu ${nameOf(civilians, event.civilianId)}`
  }
}
