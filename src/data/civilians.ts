import type { Civilian } from '../game/types'

export const CIVILIANS: readonly Civilian[] = [
  { id: 'takeshi', name: 'Takeshi M.', region: 'centro', freeShifts: ['noite'] },
  { id: 'aiko', name: 'Aiko S.', region: 'norte', freeShifts: ['tarde', 'noite'] },
  { id: 'mei', name: 'Mei H.', region: 'sul', freeShifts: ['manha', 'tarde'] },
  { id: 'ren', name: 'Ren K.', region: 'leste', freeShifts: ['manha', 'noite'] },
  { id: 'sora', name: 'Sora T.', region: 'oeste', freeShifts: ['tarde'] },
  { id: 'kenji', name: 'Kenji O.', region: 'centro', freeShifts: ['manha', 'noite'] },
  { id: 'yuki', name: 'Yuki N.', region: 'norte', freeShifts: ['manha'] },
  { id: 'haru', name: 'Haru D.', region: 'sul', freeShifts: ['tarde', 'noite'] },
  { id: 'nao', name: 'Nao F.', region: 'leste', freeShifts: ['tarde'] },
  { id: 'rina', name: 'Rina A.', region: 'oeste', freeShifts: ['manha', 'tarde'] },
  { id: 'daichi', name: 'Daichi L.', region: 'centro', freeShifts: ['tarde', 'noite'] },
  { id: 'emi', name: 'Emi V.', region: 'sul', freeShifts: ['noite'] },
]
