/**
 * HydrationTracker - Widget for tracking daily water intake
 */

import { motion } from 'framer-motion'
import { useHydration } from '../../hooks/useHydration'

export function HydrationTracker() {
  const { hydration, isLoading, addGlass, addGlasses, isAdding } = useHydration()

  if (isLoading || !hydration) {
    return (
      <div className="bg-system-black/50 border border-system-border rounded-lg p-4">
        <div className="h-32 flex items-center justify-center">
          <span className="text-system-text-muted font-mono text-sm">
            Loading hydration...
          </span>
        </div>
      </div>
    )
  }

  const { glasses, target, progress, goalMet } = hydration

  return (
    <div className={`bg-system-black/50 border rounded-lg p-4 ${
      goalMet ? 'border-system-accent' : 'border-system-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="font-mono text-sm text-system-accent">
            {'>'} HYDRATION
          </span>
        </div>
        {goalMet && (
          <span className="text-xs font-mono text-system-accent bg-system-accent/20 px-2 py-1 rounded">
            ✓ GOAL MET
          </span>
        )}
      </div>

      {/* Glass visualization */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: target }, (_, i) => (
          <GlassIcon
            key={i}
            filled={i < glasses}
            index={i}
          />
        ))}
      </div>

      {/* Progress text */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-2xl font-mono font-bold text-white">
          {glasses}
          <span className="text-sm text-system-text-muted">/{target}</span>
        </span>
        <span className="text-sm font-mono text-system-text-muted">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-system-border rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full ${goalMet ? 'bg-system-xp' : 'bg-blue-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Quick add buttons */}
      {!goalMet && (
        <div className="flex gap-2">
          <button
            onClick={() => addGlass()}
            disabled={isAdding}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 
                       text-blue-400 font-mono text-sm py-2 rounded transition-colors
                       disabled:opacity-50"
          >
            {isAdding ? '...' : '+1 Glass'}
          </button>
          <button
            onClick={() => addGlasses(2)}
            disabled={isAdding}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 
                       text-blue-400 font-mono text-sm py-2 rounded transition-colors
                       disabled:opacity-50"
          >
            {isAdding ? '...' : '+2 Glasses'}
          </button>
        </div>
      )}
    </div>
  )
}

function GlassIcon({ filled, index }: { filled: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`w-8 h-10 rounded-b-lg border-2 relative overflow-hidden ${
        filled
          ? 'border-blue-400'
          : 'border-system-border'
      }`}
    >
      {filled && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-blue-400/60"
          initial={{ height: 0 }}
          animate={{ height: '80%' }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        />
      )}
    </motion.div>
  )
}

/**
 * Compact hydration widget for dashboard
 */
export function HydrationWidgetCompact() {
  const { hydration, addGlass, isAdding } = useHydration()

  if (!hydration) return null

  const { glasses, target, goalMet } = hydration

  return (
    <div className="flex items-center gap-3 bg-system-black/30 rounded-lg p-3">
      <span className="text-xl">💧</span>
      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-bold ${goalMet ? 'text-system-accent' : 'text-white'}`}>
            {glasses}
          </span>
          <span className="text-xs font-mono text-system-text-muted">
            /{target}
          </span>
        </div>
        <div className="h-1 bg-system-border rounded-full overflow-hidden mt-1">
          <div
            className={`h-full ${goalMet ? 'bg-system-accent' : 'bg-blue-400'}`}
            style={{ width: `${Math.min(100, (glasses / target) * 100)}%` }}
          />
        </div>
      </div>
      {!goalMet && (
        <button
          onClick={() => addGlass()}
          disabled={isAdding}
          className="text-blue-400 hover:text-blue-300 text-lg disabled:opacity-50"
        >
          +
        </button>
      )}
    </div>
  )
}
