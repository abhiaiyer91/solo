/**
 * VisualStateContext - Global visual state provider
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

export type VisualState =
  | 'normal'
  | 'debuffed'
  | 'streak-high'
  | 'boss-active'
  | 'dungeon-active'
  | 'weekend-bonus'
  | 'evening'
  | 'night'

export interface VisualStateContextValue {
  state: VisualState
  className: string
  overlayActive: boolean
  stateLabel: string
}

const VisualStateContext = createContext<VisualStateContextValue>({
  state: 'normal',
  className: '',
  overlayActive: false,
  stateLabel: '',
})

interface PlayerState {
  debuffActive?: boolean
  currentStreak?: number
  activeBossAttempt?: boolean
  activeDungeonAttempt?: boolean
  weekendBonusActive?: boolean
}

interface DayStatus {
  phase: 'morning' | 'afternoon' | 'evening' | 'night'
}

/**
 * Determine visual state from player and day status
 */
export function determineVisualState(
  player?: PlayerState,
  dayStatus?: DayStatus
): VisualState {
  if (!player) return dayStatus?.phase === 'night' ? 'night' : dayStatus?.phase === 'evening' ? 'evening' : 'normal'

  // Priority order (highest first)
  if (player.activeBossAttempt) return 'boss-active'
  if (player.activeDungeonAttempt) return 'dungeon-active'
  if (player.debuffActive) return 'debuffed'
  if (player.currentStreak && player.currentStreak >= 30) return 'streak-high'
  if (player.weekendBonusActive) return 'weekend-bonus'
  if (dayStatus?.phase === 'night') return 'night'
  if (dayStatus?.phase === 'evening') return 'evening'
  return 'normal'
}

/**
 * Get CSS classes for visual state
 */
function getStateClassName(state: VisualState): string {
  const classMap: Record<VisualState, string> = {
    normal: '',
    debuffed: 'visual-state-debuffed',
    'streak-high': 'visual-state-streak-high',
    'boss-active': 'visual-state-boss',
    'dungeon-active': 'visual-state-dungeon',
    'weekend-bonus': 'visual-state-weekend',
    evening: 'visual-state-evening',
    night: 'visual-state-night',
  }
  return classMap[state]
}

/**
 * Get state label for display
 */
function getStateLabel(state: VisualState): string {
  const labelMap: Record<VisualState, string> = {
    normal: '',
    debuffed: 'DEBUFF ACTIVE',
    'streak-high': 'STREAK MASTERY',
    'boss-active': 'BOSS BATTLE',
    'dungeon-active': 'DUNGEON ACTIVE',
    'weekend-bonus': 'WEEKEND BONUS',
    evening: 'EVENING',
    night: 'QUIET HOURS',
  }
  return labelMap[state]
}

interface VisualStateProviderProps {
  children: ReactNode
  player?: PlayerState
  dayStatus?: DayStatus
}

export function VisualStateProvider({
  children,
  player,
  dayStatus,
}: VisualStateProviderProps) {
  const value = useMemo(() => {
    const state = determineVisualState(player, dayStatus)
    return {
      state,
      className: getStateClassName(state),
      overlayActive: ['debuffed', 'boss-active', 'dungeon-active'].includes(state),
      stateLabel: getStateLabel(state),
    }
  }, [player, dayStatus])

  return (
    <VisualStateContext.Provider value={value}>
      {children}
    </VisualStateContext.Provider>
  )
}

/**
 * Hook to consume visual state
 */
export function useVisualState(): VisualStateContextValue {
  return useContext(VisualStateContext)
}

/**
 * Hook for just the state value
 */
export function useCurrentVisualState(): VisualState {
  return useContext(VisualStateContext).state
}

/**
 * Check if in special state
 */
export function useIsSpecialState(): boolean {
  const { state } = useContext(VisualStateContext)
  return state !== 'normal' && state !== 'evening' && state !== 'night'
}
