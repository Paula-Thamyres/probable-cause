export const REGIONS = ['centro', 'norte', 'sul', 'leste', 'oeste'] as const
export const SHIFTS = ['manha', 'tarde', 'noite'] as const

export type RegionId = (typeof REGIONS)[number]
export type Shift = (typeof SHIFTS)[number]

export interface Civilian {
  id: string
  name: string
  region: RegionId
  freeShifts: readonly Shift[]
}

export interface Slot {
  region: RegionId
  shift: Shift
}

export interface Clue extends Slot {
  watched?: boolean
}

export type GameEvent =
  | { type: 'eliminated'; turn: number; civilianId: string }
  | { type: 'framed'; turn: number; civilianId: string }
  | { type: 'alibi'; turn: number }
  | { type: 'waited'; turn: number }
  | { type: 'arrested'; turn: number; civilianId: string }
