import { useState, useCallback, useRef } from 'react'
import { createId } from '@paralleldrive/cuid2'

/**
 * Celebration state manager for coordinating game animations
 * 
 * Manages queues of celebrations to prevent overlapping and ensure
 * important moments (level ups) take priority.
 */

interface LevelUpCelebration {
  type: 'levelUp'
  previousLevel: number
  newLevel: number
}

interface XPGain {
  type: 'xp'
  id: string
  amount: number
  source: string
  bonus?: number
}

interface QuestCompletion {
  type: 'questComplete'
  questId: string
  questName: string
  xpAwarded: number
}

interface StreakMilestone {
  type: 'streakMilestone'
  streakDays: number
}

interface TitleUnlock {
  type: 'titleUnlock'
  titleId: string
  titleName: string
}

type Celebration = 
  | LevelUpCelebration 
  | XPGain 
  | QuestCompletion 
  | StreakMilestone
  | TitleUnlock

interface CelebrationState {
  levelUp: LevelUpCelebration | null
  xpGains: XPGain[]
  questComplete: QuestCompletion | null
  streakMilestone: StreakMilestone | null
  titleUnlock: TitleUnlock | null
}

const initialState: CelebrationState = {
  levelUp: null,
  xpGains: [],
  questComplete: null,
  streakMilestone: null,
  titleUnlock: null,
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>(initialState)
  const queueRef = useRef<Celebration[]>([])

  /**
   * Process the next celebration in queue
   */
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return

    const next = queueRef.current.shift()
    if (!next) return

    switch (next.type) {
      case 'levelUp':
        setState((prev) => ({ ...prev, levelUp: next }))
        break
      case 'xp':
        setState((prev) => ({ ...prev, xpGains: [...prev.xpGains, next] }))
        break
      case 'questComplete':
        setState((prev) => ({ ...prev, questComplete: next }))
        break
      case 'streakMilestone':
        setState((prev) => ({ ...prev, streakMilestone: next }))
        break
      case 'titleUnlock':
        setState((prev) => ({ ...prev, titleUnlock: next }))
        break
    }
  }, [])

  /**
   * Queue a celebration
   */
  const queueCelebration = useCallback((celebration: Celebration) => {
    // Level ups are highest priority - move to front
    if (celebration.type === 'levelUp') {
      queueRef.current.unshift(celebration)
    } else {
      queueRef.current.push(celebration)
    }
    
    // Process immediately if nothing active
    const hasActive = 
      state.levelUp || 
      state.questComplete || 
      state.streakMilestone || 
      state.titleUnlock

    if (!hasActive) {
      processQueue()
    }
  }, [state, processQueue])

  /**
   * Celebrate a level up
   */
  const celebrateLevelUp = useCallback((previousLevel: number, newLevel: number) => {
    queueCelebration({
      type: 'levelUp',
      previousLevel,
      newLevel,
    })
  }, [queueCelebration])

  /**
   * Show XP gain toast
   */
  const showXPGain = useCallback((amount: number, source: string, bonus?: number) => {
    const gain: XPGain = {
      type: 'xp',
      id: createId(),
      amount,
      source,
      bonus,
    }
    setState((prev) => ({ ...prev, xpGains: [...prev.xpGains, gain] }))
  }, [])

  /**
   * Celebrate quest completion
   */
  const celebrateQuestComplete = useCallback((questId: string, questName: string, xpAwarded: number) => {
    queueCelebration({
      type: 'questComplete',
      questId,
      questName,
      xpAwarded,
    })
  }, [queueCelebration])

  /**
   * Celebrate streak milestone
   */
  const celebrateStreakMilestone = useCallback((streakDays: number) => {
    // Only celebrate at specific milestones
    const milestones = [7, 14, 30, 60, 90, 180, 365]
    if (milestones.includes(streakDays)) {
      queueCelebration({
        type: 'streakMilestone',
        streakDays,
      })
    }
  }, [queueCelebration])

  /**
   * Celebrate title unlock
   */
  const celebrateTitleUnlock = useCallback((titleId: string, titleName: string) => {
    queueCelebration({
      type: 'titleUnlock',
      titleId,
      titleName,
    })
  }, [queueCelebration])

  /**
   * Dismiss level up celebration
   */
  const dismissLevelUp = useCallback(() => {
    setState((prev) => ({ ...prev, levelUp: null }))
    setTimeout(processQueue, 100)
  }, [processQueue])

  /**
   * Dismiss XP gain
   */
  const dismissXPGain = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      xpGains: prev.xpGains.filter((g) => g.id !== id),
    }))
  }, [])

  /**
   * Dismiss quest complete
   */
  const dismissQuestComplete = useCallback(() => {
    setState((prev) => ({ ...prev, questComplete: null }))
    setTimeout(processQueue, 100)
  }, [processQueue])

  /**
   * Dismiss streak milestone
   */
  const dismissStreakMilestone = useCallback(() => {
    setState((prev) => ({ ...prev, streakMilestone: null }))
    setTimeout(processQueue, 100)
  }, [processQueue])

  /**
   * Dismiss title unlock
   */
  const dismissTitleUnlock = useCallback(() => {
    setState((prev) => ({ ...prev, titleUnlock: null }))
    setTimeout(processQueue, 100)
  }, [processQueue])

  /**
   * Clear all celebrations
   */
  const clearAll = useCallback(() => {
    setState(initialState)
    queueRef.current = []
  }, [])

  return {
    // State
    levelUp: state.levelUp,
    xpGains: state.xpGains,
    questComplete: state.questComplete,
    streakMilestone: state.streakMilestone,
    titleUnlock: state.titleUnlock,
    
    // Actions
    celebrateLevelUp,
    showXPGain,
    celebrateQuestComplete,
    celebrateStreakMilestone,
    celebrateTitleUnlock,
    
    // Dismissals
    dismissLevelUp,
    dismissXPGain,
    dismissQuestComplete,
    dismissStreakMilestone,
    dismissTitleUnlock,
    clearAll,
  }
}

/**
 * Helper to create a celebration context
 * Use this to provide celebration functions to the entire app
 */
export type CelebrationContext = ReturnType<typeof useCelebration>
