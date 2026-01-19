/**
 * TimezonePrompt - Prompt for timezone change detection
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  useTimezoneDetection,
  useUpdateTimezone,
  getTimezoneName,
  getTimezoneOffsetDiff,
  formatOffsetDiff,
} from '../hooks/useTimezoneDetection'

interface TimezonePromptProps {
  userTimezone: string | undefined
}

export function TimezonePrompt({ userTimezone }: TimezonePromptProps) {
  const { change, shouldPrompt, dismiss } = useTimezoneDetection(userTimezone)
  const updateMutation = useUpdateTimezone()

  if (!shouldPrompt || !change) return null

  const offsetDiff = getTimezoneOffsetDiff(change.oldTimezone, change.newTimezone)

  const handleUpdate = async () => {
    await updateMutation.mutateAsync(change.newTimezone)
    dismiss()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-slate-900/95 border border-amber-500/50 rounded-lg 
                        shadow-xl shadow-amber-500/10 p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-xl">🌍</span>
            <div>
              <h3 className="font-mono text-sm font-bold text-amber-400">
                Timezone Change Detected
              </h3>
              <p className="font-mono text-xs text-slate-400 mt-1">
                Your device timezone differs from your profile.
              </p>
            </div>
          </div>

          {/* Timezone comparison */}
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center text-sm font-mono">
              <div>
                <span className="text-slate-500 text-xs block">Current Profile</span>
                <span className="text-slate-300">{getTimezoneName(change.oldTimezone)}</span>
              </div>
              <span className="text-slate-500">→</span>
              <div className="text-right">
                <span className="text-slate-500 text-xs block">Detected</span>
                <span className="text-amber-400">{getTimezoneName(change.newTimezone)}</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs font-mono text-slate-500">
                ({formatOffsetDiff(offsetDiff)} difference)
              </span>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs font-mono text-slate-400 mb-4">
            Changing your timezone affects when your daily quests reset and 
            how streak calculations work.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 
                         border border-amber-500/50 text-amber-400 font-mono 
                         text-sm rounded transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Updating...' : `Update to ${change.newTimezone.split('/').pop()}`}
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2 text-slate-400 hover:text-slate-300 
                         font-mono text-sm transition-colors"
            >
              Keep {change.oldTimezone.split('/').pop()}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Inline timezone status indicator
 */
export function TimezoneStatus({ 
  timezone, 
  onEdit 
}: { 
  timezone: string
  onEdit?: () => void 
}) {
  const now = new Date()
  
  // Get local time in user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  const localTime = formatter.format(now)

  return (
    <button
      onClick={onEdit}
      className="flex items-center gap-2 text-xs font-mono text-slate-400 
                 hover:text-slate-300 transition-colors"
    >
      <span>🕐</span>
      <span>{localTime}</span>
      <span className="text-slate-600">({timezone.split('/').pop()})</span>
    </button>
  )
}
