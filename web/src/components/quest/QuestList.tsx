import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { QuestCard } from './QuestCard'
import { QuestInput } from './QuestInput'
import { useResetQuest, useRemoveQuest, type Quest } from '@/hooks/useQuests'

interface XPGain {
  xp: number
  levelUp?: number
}

interface XPLoss {
  xp: number
}

interface QuestListProps {
  quests: Quest[]
  isLoading?: boolean
}

export function QuestList({ quests, isLoading }: QuestListProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [xpGain, setXpGain] = useState<XPGain | null>(null)
  const [xpLoss, setXpLoss] = useState<XPLoss | null>(null)
  const [resettingQuestId, setResettingQuestId] = useState<string | null>(null)
  const [removingQuestId, setRemovingQuestId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const resetQuest = useResetQuest()
  const removeQuest = useRemoveQuest()

  const handleQuestComplete = (xp: number, leveledUp: boolean, newLevel?: number) => {
    setXpGain({ xp, levelUp: leveledUp ? newLevel : undefined })
    setTimeout(() => setXpGain(null), 3000)
  }

  const handleQuestReset = (questId: string) => {
    setResettingQuestId(questId)
    resetQuest.mutate(questId, {
      onSuccess: (result) => {
        // Explicitly refetch to update UI
        queryClient.refetchQueries({ queryKey: ['quests'] })
        queryClient.refetchQueries({ queryKey: ['player'] })
        queryClient.refetchQueries({ queryKey: ['xp', 'timeline'] })
        setXpLoss({ xp: result.xpRemoved })
        setTimeout(() => setXpLoss(null), 3000)
      },
      onSettled: () => {
        setResettingQuestId(null)
      },
    })
  }

  const handleQuestRemove = (questId: string) => {
    setRemovingQuestId(questId)
    removeQuest.mutate(questId, {
      onSuccess: () => {
        // Explicitly refetch to update UI
        queryClient.refetchQueries({ queryKey: ['quests'] })
        queryClient.refetchQueries({ queryKey: ['quest-templates'] })
      },
      onSettled: () => {
        setRemovingQuestId(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted">Loading quests...</span>
        </div>
      </div>
    )
  }

  if (!quests || quests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-system-text-muted">
          [SYSTEM] No quests available. Run the seed script to add quest templates.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <QuestCard
              quest={quest}
              onClick={() => setSelectedQuest(quest)}
              onReset={() => handleQuestReset(quest.id)}
              isResetting={resettingQuestId === quest.id}
              onRemove={() => handleQuestRemove(quest.id)}
              isRemoving={removingQuestId === quest.id}
            />
          </motion.div>
        ))}
      </div>

      {/* Quest Input Modal */}
      {selectedQuest && (
        <QuestInput
          quest={selectedQuest}
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onSuccess={handleQuestComplete}
        />
      )}

      {/* XP Gain Notification */}
      <AnimatePresence>
        {xpGain && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-8 right-8 system-window p-4 z-50"
          >
            <div className="text-system-green text-xl font-bold">+{xpGain.xp} XP</div>
            {xpGain.levelUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-system-gold font-bold"
              >
                LEVEL UP! Now Level {xpGain.levelUp}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Loss Notification (Quest Reset) */}
      <AnimatePresence>
        {xpLoss && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-8 right-8 system-window p-4 z-50"
          >
            <div className="text-system-red text-xl font-bold">-{xpLoss.xp} XP</div>
            <div className="text-system-text-muted text-sm">Quest reset</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
