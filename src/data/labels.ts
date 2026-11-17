import type { AlertLevel } from '../game/alert'
import type { RegionId, Shift } from '../game/types'

export const REGION_LABELS: Record<RegionId, string> = {
  centro: 'Centro',
  norte: 'Norte',
  sul: 'Sul',
  leste: 'Leste',
  oeste: 'Oeste',
}

export const SHIFT_LABELS: Record<Shift, string> = {
  manha: 'manhã',
  tarde: 'tarde',
  noite: 'noite',
}

export const ALERT_LABELS: Record<AlertLevel, string> = {
  low: 'baixo',
  medium: 'médio',
  high: 'alto',
}
