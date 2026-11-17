import type { Beliefs } from '../ai/suspicion'

export type AlertLevel = 'low' | 'medium' | 'high'

export const MEDIUM_ALERT_THRESHOLD = 0.25
export const HIGH_ALERT_THRESHOLD = 0.6

export function getAlertLevel(beliefs: Beliefs, playerId: string): AlertLevel {
  const belief = beliefs[playerId] ?? 0

  if (belief >= HIGH_ALERT_THRESHOLD) {
    return 'high'
  }

  if (belief >= MEDIUM_ALERT_THRESHOLD) {
    return 'medium'
  }

  return 'low'
}
