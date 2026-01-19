/**
 * MeditationTimer - Meditation session timer component
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  useMeditationTimer,
  useMeditationProgress,
  useLogMeditation,
  formatTime,
  getCalmingMessage,
} from '../../hooks/useMeditation'

interface MeditationTimerProps {
  targetMinutes?: number
  onComplete?: () => void
}

export function MeditationTimer({
  targetMinutes = 10,
  onComplete,
}: MeditationTimerProps) {
  const timer = useMeditationTimer(targetMinutes)
  const { data: progress } = useMeditationProgress()
  const logMutation = useLogMeditation()

  const handleComplete = async () => {
    const minutes = Math.ceil(timer.elapsedSeconds / 60)
    await logMutation.mutateAsync({ minutes, source: 'timer' })
    timer.stop()
    onComplete?.()
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 
                    border border-slate-700/50 rounded-lg p-8 text-center">
      {/* Header */}
      <div className="mb-8">
        <span className="text-3xl mb-2 block">🧘</span>
        <h3 className="font-mono text-sm text-teal-400">
          {'>'} MINDFULNESS
        </h3>
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        {/* Circular Progress */}
        <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-teal-400"
            strokeDasharray={565.5} // 2 * PI * 90
            initial={{ strokeDashoffset: 565.5 }}
            animate={{ strokeDashoffset: 565.5 * (1 - timer.progress / 100) }}
            transition={{ duration: 0.5 }}
            transform="rotate(-90 100 100)"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-white">
            {timer.isCompleted
              ? formatTime(timer.elapsedSeconds)
              : formatTime(timer.remainingSeconds)}
          </span>
          <span className="text-xs font-mono text-slate-500 mt-1">
            {timer.isCompleted ? 'completed' : 'remaining'}
          </span>
        </div>
      </div>

      {/* Calming Message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={timer.state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-mono text-slate-400 mb-8 italic"
        >
          {getCalmingMessage(timer.state)}
        </motion.p>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {timer.state === 'idle' && (
          <button
            onClick={timer.start}
            className="px-8 py-3 bg-teal-500/20 hover:bg-teal-500/30 
                       border border-teal-500/50 text-teal-400 font-mono 
                       rounded-lg transition-colors"
          >
            Begin Session
          </button>
        )}

        {timer.state === 'active' && (
          <>
            <button
              onClick={timer.pause}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 
                         border border-slate-600 text-slate-300 font-mono 
                         rounded-lg transition-colors"
            >
              Pause
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 
                         border border-teal-500/50 text-teal-400 font-mono 
                         rounded-lg transition-colors"
            >
              End Early
            </button>
          </>
        )}

        {timer.state === 'paused' && (
          <>
            <button
              onClick={timer.resume}
              className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 
                         border border-teal-500/50 text-teal-400 font-mono 
                         rounded-lg transition-colors"
            >
              Resume
            </button>
            <button
              onClick={timer.stop}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 
                         border border-slate-600 text-slate-300 font-mono 
                         rounded-lg transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {timer.state === 'completed' && (
          <button
            onClick={handleComplete}
            disabled={logMutation.isPending}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 
                       text-slate-900 font-mono font-bold rounded-lg 
                       transition-colors disabled:opacity-50"
          >
            {logMutation.isPending ? 'Saving...' : 'Complete ✓'}
          </button>
        )}
      </div>

      {/* Today's Progress */}
      {progress && (
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex justify-center items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-white">
              {progress.totalMinutes}
            </span>
            <span className="text-sm font-mono text-slate-500">
              / {progress.targetMinutes} min today
            </span>
          </div>
          {progress.goalMet && (
            <span className="text-xs font-mono text-teal-400 mt-1 block">
              ✓ Daily goal achieved
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact meditation widget
 */
export function MeditationWidget() {
  const { data: progress } = useMeditationProgress()

  if (!progress) return null

  const percent = Math.min(100, (progress.totalMinutes / progress.targetMinutes) * 100)

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🧘</span>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={`font-mono font-bold ${progress.goalMet ? 'text-teal-400' : 'text-white'}`}>
              {progress.totalMinutes}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / {progress.targetMinutes} min
            </span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full ${progress.goalMet ? 'bg-teal-400' : 'bg-slate-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
