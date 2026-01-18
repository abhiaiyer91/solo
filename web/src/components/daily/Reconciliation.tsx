import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SystemMessage } from '@/components/system'

export interface ReconciliationItem {
  questId: string
  questName: string
  type: 'numeric' | 'boolean'
  category: string
  currentValue: number | null
  targetValue: number
  metric: string
  isComplete: boolean
}

interface ReconciliationProps {
  items: ReconciliationItem[]
  onComplete: () => void
  onCloseDay: () => void
}

interface ReconciliationItemInputProps {
  item: ReconciliationItem
  onSubmit: (questId: string, data: Record<string, number | boolean>) => void
  isSubmitting: boolean
}

function ReconciliationItemInput({ item, onSubmit, isSubmitting }: ReconciliationItemInputProps) {
  const [value, setValue] = useState<number | boolean>(
    item.type === 'numeric' ? (item.currentValue ?? 0) : false
  )

  const handleSubmit = () => {
    onSubmit(item.questId, { [item.metric]: value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-system-border rounded bg-system-black/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-system-text font-medium">{item.questName}</h4>
          <span className="text-xs text-system-text-muted uppercase">{item.category}</span>
        </div>
      </div>

      {item.type === 'numeric' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              value={value as number}
              onChange={(e) => setValue(Number(e.target.value))}
              className="flex-1 px-4 py-2 bg-system-black border border-system-border rounded
                         text-system-text text-lg text-center
                         focus:border-system-blue focus:outline-none"
              disabled={isSubmitting}
            />
            <span className="text-system-text-muted">/ {item.targetValue}</span>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => setValue(Math.floor(item.targetValue * 0.5))}
              className="px-3 py-1 text-xs border border-system-border rounded hover:border-system-blue text-system-text-muted hover:text-system-text transition-colors"
              disabled={isSubmitting}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setValue(Math.floor(item.targetValue * 0.75))}
              className="px-3 py-1 text-xs border border-system-border rounded hover:border-system-blue text-system-text-muted hover:text-system-text transition-colors"
              disabled={isSubmitting}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => setValue(item.targetValue)}
              className="px-3 py-1 text-xs border border-system-blue bg-system-blue/10 rounded text-system-blue"
              disabled={isSubmitting}
            >
              100%
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => setValue(true)}
            className={`px-6 py-2 rounded border-2 transition-colors ${
              value === true
                ? 'border-system-green bg-system-green/20 text-system-green'
                : 'border-system-border text-system-text-muted hover:border-system-green'
            }`}
            disabled={isSubmitting}
          >
            YES
          </button>
          <button
            type="button"
            onClick={() => setValue(false)}
            className={`px-6 py-2 rounded border-2 transition-colors ${
              value === false
                ? 'border-system-red bg-system-red/20 text-system-red'
                : 'border-system-border text-system-text-muted hover:border-system-red'
            }`}
            disabled={isSubmitting}
          >
            NO
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full mt-4 px-4 py-2 bg-system-blue/20 border border-system-blue text-system-blue rounded hover:bg-system-blue/30 transition-colors disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Recording...' : 'Confirm'}
      </button>
    </motion.div>
  )
}

async function submitReconciliation(questId: string, data: Record<string, number | boolean>) {
  const res = await fetch(`/api/day/reconciliation/${questId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to submit reconciliation')
  }

  return res.json()
}

async function closeDayRequest() {
  const res = await fetch('/api/day/close', {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to close day')
  }

  return res.json()
}

export function Reconciliation({ items, onComplete, onCloseDay }: ReconciliationProps) {
  const queryClient = useQueryClient()
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)

  const submitMutation = useMutation({
    mutationFn: ({ questId, data }: { questId: string; data: Record<string, number | boolean> }) =>
      submitReconciliation(questId, data),
    onSuccess: (_, variables) => {
      setCompletedItems((prev) => new Set(prev).add(variables.questId))
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })

      // Move to next item or complete
      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    },
  })

  const closeDayMutation = useMutation({
    mutationFn: closeDayRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['dayStatus'] })
      onCloseDay()
    },
  })

  const handleSubmit = (questId: string, data: Record<string, number | boolean>) => {
    submitMutation.mutate({ questId, data })
  }

  const handleCloseDay = () => {
    closeDayMutation.mutate()
  }

  const pendingItems = items.filter((item) => !completedItems.has(item.questId))
  const allComplete = pendingItems.length === 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="system-window p-6 evening-mode"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-system-text flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full animate-pulse" />
          DAILY RECONCILIATION
        </h2>
        <p className="text-system-text-muted text-sm mt-2">
          The day is closing. Confirm any remaining items.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent mb-6" />

      {items.length === 0 ? (
        <SystemMessage variant="success">
          All quests have been recorded for today.
          The System has recorded your progress.
        </SystemMessage>
      ) : (
        <>
          {/* Progress indicator */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-system-text-muted">
              {completedItems.size} / {items.length} confirmed
            </span>
            <div className="flex gap-1">
              {items.map((item, i) => (
                <div
                  key={item.questId}
                  className={`w-2 h-2 rounded-full ${
                    completedItems.has(item.questId)
                      ? 'bg-system-green'
                      : i === currentIndex
                        ? 'bg-system-blue animate-pulse'
                        : 'bg-system-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current item */}
          <AnimatePresence mode="wait">
            {!allComplete && pendingItems[0] && (
              <ReconciliationItemInput
                key={pendingItems[0].questId}
                item={pendingItems[0]}
                onSubmit={handleSubmit}
                isSubmitting={submitMutation.isPending}
              />
            )}
          </AnimatePresence>

          {/* Error message */}
          {submitMutation.error && (
            <div className="mt-4 p-3 border border-system-red/50 bg-system-red/10 rounded text-system-red text-sm">
              {submitMutation.error.message}
            </div>
          )}
        </>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent my-6" />

      {/* Close Day Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 btn-secondary"
          disabled={closeDayMutation.isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCloseDay}
          className={`flex-1 btn-primary ${!allComplete ? 'opacity-75' : ''}`}
          disabled={closeDayMutation.isPending}
        >
          {closeDayMutation.isPending
            ? 'Closing...'
            : allComplete
              ? 'Close Day'
              : `Close Day (${pendingItems.length} pending)`}
        </button>
      </div>

      {closeDayMutation.error && (
        <div className="mt-4 p-3 border border-system-red/50 bg-system-red/10 rounded text-system-red text-sm">
          {closeDayMutation.error.message}
        </div>
      )}
    </motion.div>
  )
}
