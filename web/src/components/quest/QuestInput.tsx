import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompleteQuest, type Quest } from '@/hooks/useQuests'

interface QuestInputProps {
  quest: Quest
  isOpen: boolean
  onClose: () => void
  onSuccess: (xp: number, leveledUp: boolean, newLevel?: number) => void
}

export function QuestInput({ quest, isOpen, onClose, onSuccess }: QuestInputProps) {
  const requirement = quest.requirement as { type: string; metric?: string; value?: number; expected?: boolean } | null
  const isNumeric = requirement?.type === 'numeric'
  const metric = requirement?.metric || 'value'

  const [value, setValue] = useState<number | boolean>(isNumeric ? 0 : false)
  const completeQuest = useCompleteQuest()

  // Reset value when quest changes
  useEffect(() => {
    setValue(isNumeric ? 0 : false)
  }, [quest.id, isNumeric])

  const handleSubmit = () => {
    const data = { [metric]: value }
    completeQuest.mutate(
      { questId: quest.id, data },
      {
        onSuccess: (result) => {
          onSuccess(result.xpAwarded, result.leveledUp, result.newLevel)
          onClose()
        },
      }
    )
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
          >
            <div className="system-window p-6">
              <h3 className="text-lg font-bold text-system-blue mb-2">
                {quest.name}
              </h3>
              <p className="text-system-text-muted text-sm mb-2">
                {quest.description}
              </p>
              <p className="text-system-text-muted text-xs mb-6 uppercase">
                {quest.category} Quest • +{quest.baseXP} XP
              </p>

              {completeQuest.error && (
                <div className="mb-4 p-3 border border-system-red/50 bg-system-red/10 rounded text-system-red text-sm">
                  {completeQuest.error.message}
                </div>
              )}

              {isNumeric ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-system-text-muted text-sm uppercase">
                      Enter value (target: {quest.targetValue})
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={value as number}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="mt-2 w-full px-4 py-3 bg-system-black border border-system-border rounded
                                 text-system-text text-2xl text-center
                                 focus:border-system-blue focus:outline-none"
                      placeholder="0"
                      autoFocus
                    />
                  </label>

                  {/* Quick buttons */}
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setValue(Math.floor(quest.targetValue * 0.5))}
                      className="px-3 py-1 text-sm border border-system-border rounded hover:border-system-blue text-system-text-muted hover:text-system-text transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue(Math.floor(quest.targetValue * 0.75))}
                      className="px-3 py-1 text-sm border border-system-border rounded hover:border-system-blue text-system-text-muted hover:text-system-text transition-colors"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue(quest.targetValue)}
                      className="px-3 py-1 text-sm border border-system-blue bg-system-blue/10 rounded text-system-blue"
                    >
                      100%
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setValue(true)}
                    className={`px-6 py-3 rounded border-2 transition-colors ${
                      value === true
                        ? 'border-system-green bg-system-green/20 text-system-green'
                        : 'border-system-border text-system-text-muted hover:border-system-green'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue(false)}
                    className={`px-6 py-3 rounded border-2 transition-colors ${
                      value === false
                        ? 'border-system-red bg-system-red/20 text-system-red'
                        : 'border-system-border text-system-text-muted hover:border-system-red'
                    }`}
                  >
                    NO
                  </button>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                  disabled={completeQuest.isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 btn-primary"
                  disabled={completeQuest.isPending}
                >
                  {completeQuest.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
