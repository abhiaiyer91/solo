import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer, useLevelProgress } from '@/hooks/usePlayer'
import { useQuests } from '@/hooks/useQuests'
import {
  useDayStatus,
  useReconciliationItems,
  useDaySummary,
  getPhaseStyles,
} from '@/hooks/useDayStatus'
import { useUnlocks } from '@/hooks/useUnlocks'
import { QuestList } from '@/components/quest'
import { SeasonalQuestSection } from '@/components/quest/SeasonalQuest'
import { XPTimeline } from '@/components/xp'
import { SystemMessage, TypewriterText } from '@/components/system'
import { ShadowObservation } from '@/components/ShadowObservation'
import { Reconciliation, DaySummary, LateNightMode } from '@/components/daily'
import { UnlockProgress } from '@/components/UnlockProgress'
import { UnlockCelebration } from '@/components/UnlockCelebration'
import { ReturnProtocolIndicator } from '@/components/ReturnProtocolModal'
import { useDailyGreeting } from '@/hooks/useNarrative'

function getFallbackMessage(streak: number, level: number, phase?: string): string {
  // Evening/Night specific messages
  if (phase === 'evening') {
    return `The day winds down.\nTime remaining is limited.\nConfirm your progress.`
  }
  if (phase === 'night') {
    return `Day closing soon.\nThe System awaits reconciliation.`
  }
  if (phase === 'closed') {
    return `Day is closed.\nRest. Tomorrow awaits.`
  }

  if (streak >= 30) {
    return `Day ${streak}. The pattern holds.\nYour consistency is no longer effort.\nIt is identity.`
  }
  if (streak >= 14) {
    return `Day ${streak}. Two weeks of recorded compliance.\nPatterns are forming.\nThe System observes.`
  }
  if (streak >= 7) {
    return `Day ${streak}. One week without failure.\nThe easy part is over.\nNow begins the real test.`
  }
  if (streak >= 3) {
    return `Day ${streak}. Early data suggests potential.\nThe System will continue monitoring.`
  }
  if (streak > 0) {
    return `Day ${streak}. Continuation logged.\nThe System records all outcomes.`
  }
  return `Level ${level} Hunter. Daily objectives await.\nThe System does not wait.`
}

export function Dashboard() {
  const { data: player, isLoading: playerLoading } = usePlayer()
  const { data: levelProgress } = useLevelProgress()
  const { data: questsData, isLoading: questsLoading } = useQuests()
  const { data: dayStatus } = useDayStatus()
  const { data: reconciliationData } = useReconciliationItems()
  const { data: summaryData } = useDaySummary()
  const { pendingCelebration, markAsSeen } = useUnlocks()

  // UI State
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Get dynamic greeting from narrative system
  const { content: narrativeGreeting } = useDailyGreeting({
    currentStreak: player?.currentStreak ?? 0,
    level: player?.level ?? 1,
    name: player?.name ?? 'Hunter',
    debuffActive: player?.debuffActive ?? false,
  })

  const stats = [
    { label: 'STR', value: player?.str ?? 10, color: 'text-stat-str' },
    { label: 'AGI', value: player?.agi ?? 10, color: 'text-stat-agi' },
    { label: 'VIT', value: player?.vit ?? 10, color: 'text-stat-vit' },
    { label: 'DISC', value: player?.disc ?? 10, color: 'text-stat-disc' },
  ]

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING HUNTER DATA...</span>
          </div>
        </div>
      </div>
    )
  }

  // Determine phase styles
  const phase = dayStatus?.phase ?? 'midday'
  const phaseStyles = getPhaseStyles(phase)
  const isDayClosed = dayStatus?.isDayClosed ?? false
  const shouldShowReconciliationPrompt = dayStatus?.shouldShowReconciliation && !isDayClosed

  // Use narrative content if available, otherwise fall back to local message
  const dailyMessage =
    narrativeGreeting ?? getFallbackMessage(player?.currentStreak ?? 0, player?.level ?? 1, phase)

  // Handle reconciliation complete
  const handleReconciliationComplete = () => {
    setShowReconciliation(false)
  }

  // Handle day close
  const handleDayClose = () => {
    setShowReconciliation(false)
    setShowSummary(true)
  }

  // Handle view summary from late night mode
  const handleViewSummary = () => {
    setShowSummary(true)
  }

  // Handle dismiss summary
  const handleDismissSummary = () => {
    setShowSummary(false)
  }

  // Show late night mode if day is closed
  if (isDayClosed && dayStatus?.timeUntilMidnight && !showSummary) {
    return (
      <div className={`space-y-6 ${phaseStyles.bgClass}`}>
        <LateNightMode
          timeUntilMidnight={dayStatus.timeUntilMidnight}
          onViewSummary={handleViewSummary}
        />
      </div>
    )
  }

  // Show summary modal
  if (showSummary && summaryData?.summary) {
    return (
      <div className={`space-y-6 ${phaseStyles.bgClass}`}>
        <DaySummary summary={summaryData.summary} onDismiss={handleDismissSummary} />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${phaseStyles.bgClass}`}>
      {/* Unlock Celebration Modal */}
      <UnlockCelebration
        unlock={pendingCelebration}
        onDismiss={() => pendingCelebration && markAsSeen(pendingCelebration.id)}
      />

      {/* Reconciliation Modal */}
      <AnimatePresence>
        {showReconciliation && reconciliationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={() => setShowReconciliation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Reconciliation
                items={reconciliationData.items}
                onComplete={handleReconciliationComplete}
                onCloseDay={handleDayClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconciliation Prompt Banner */}
      {shouldShowReconciliationPrompt && !showReconciliation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="system-window p-4 border-system-purple/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-system-purple rounded-full animate-pulse" />
              <div>
                <span className="text-system-text font-medium">Day Closing Soon</span>
                <p className="text-system-text-muted text-sm">
                  {reconciliationData?.items.length ?? 0} items need confirmation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReconciliation(true)}
              className="btn-primary text-sm px-4 py-2"
            >
              Start Reconciliation
            </button>
          </div>
        </motion.div>
      )}

      {/* Daily System Message */}
      <SystemMessage
        variant={player?.currentStreak && player.currentStreak >= 7 ? 'success' : 'default'}
      >
        <TypewriterText text={dailyMessage} speed={25} />
      </SystemMessage>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-blue rounded-full" />
            ATTRIBUTES
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 border border-system-border rounded bg-system-black/50"
              >
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-system-text-muted text-xs uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* XP Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-system-text-muted">Level Progress</span>
              <span className="text-system-blue">
                {levelProgress?.xpProgress ?? 0} / {levelProgress?.xpNeeded ?? 100} XP
              </span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${levelProgress?.progressPercent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="mt-6 p-4 border border-system-gold/30 rounded bg-system-gold/5">
            <div className="flex items-center justify-between">
              <span className="text-system-text-muted text-sm">Current Streak</span>
              <span className="text-system-gold text-2xl font-bold">
                {player?.currentStreak ?? 0} days
              </span>
            </div>
          </div>

        {/* Return Protocol Indicator */}
        <ReturnProtocolIndicator />

        {/* Weekend Bonus Indicator */}
        {player?.weekendBonusActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 border border-system-purple/50 rounded bg-system-purple/10"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-system-purple rounded-full animate-pulse" />
                <div>
                  <span className="text-system-purple font-medium text-sm">
                    WEEKEND BONUS ACTIVE
                  </span>
                  <p className="text-system-text-muted text-xs">
                    +{player.weekendBonusPercent}% XP on all completions
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Daily Quests Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="system-window p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-system-text flex items-center gap-2">
              <span className="w-2 h-2 bg-system-purple rounded-full" />
              DAILY QUESTS
              {questsData?.date && (
                <span className="text-sm text-system-text-muted font-normal ml-2">
                  {questsData.date}
                </span>
              )}
            </h2>

            {/* Phase indicator */}
            {phase && (
              <span className={`text-xs uppercase ${phaseStyles.accentClass}`}>{phase}</span>
            )}
          </div>

          <QuestList quests={questsData?.quests ?? []} isLoading={questsLoading} />

          {/* Seasonal Quests Section */}
          <div className="mt-6 pt-4 border-t border-system-border">
            <h3 className="text-sm font-medium text-system-text mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-system-purple rounded-full" />
              SEASONAL OBJECTIVES
            </h3>
            <SeasonalQuestSection />
          </div>

          {/* Reconciliation button in quests panel for evening/night */}
          {shouldShowReconciliationPrompt && (
            <div className="mt-4 pt-4 border-t border-system-border">
              <button
                type="button"
                onClick={() => setShowReconciliation(true)}
                className="w-full py-3 border border-system-purple/50 rounded bg-system-purple/10 text-system-purple hover:bg-system-purple/20 transition-colors"
              >
                Close Day ({reconciliationData?.items.length ?? 0} items pending)
              </button>
            </div>
          )}
        </motion.div>

        {/* Shadow Observation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <ShadowObservation />
        </motion.div>

        {/* XP Timeline Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="system-window p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-green rounded-full" />
            XP HISTORY
          </h2>
          <XPTimeline />
        </motion.div>

        {/* Unlock Progress Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <UnlockProgress maxItems={4} />
        </motion.div>
      </div>
    </div>
  )
}
