/**
 * ShadowCollection - Display extracted shadows from boss defeats
 */

import { motion } from 'framer-motion'

export interface Shadow {
  id: string
  shadowId: string
  name: string
  bossName: string
  extractedAt: string
  abilityName: string
  abilityDescription: string
  triggerCount: number
  isActive: boolean
}

interface ShadowCollectionProps {
  shadows: Shadow[]
  isLoading?: boolean
}

export function ShadowCollection({ shadows, isLoading }: ShadowCollectionProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <span className="font-mono text-sm text-system-text-muted">Loading shadows...</span>
      </div>
    )
  }

  if (shadows.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">👤</span>
        <p className="font-mono text-sm text-system-text-muted">
          No shadows extracted yet
        </p>
        <p className="font-mono text-xs text-system-text-muted mt-1">
          Defeat bosses to extract their power
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">👥</span>
        <h2 className="font-mono text-sm font-bold text-system-text">
          YOUR SHADOWS
        </h2>
        <span className="font-mono text-xs text-system-text-muted">
          ({shadows.length})
        </span>
      </div>

      <div className="grid gap-4">
        {shadows.map((shadow, i) => (
          <ShadowCard key={shadow.id} shadow={shadow} index={i} />
        ))}
      </div>
    </div>
  )
}

function ShadowCard({ shadow, index }: { shadow: Shadow; index: number }) {
  const extractedDate = new Date(shadow.extractedAt)
  const formattedDate = extractedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-system-black/60 border rounded-lg p-4 ${
        shadow.isActive
          ? 'border-purple-500/50'
          : 'border-system-border opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wide">
            {shadow.name}
          </h3>
          <p className="font-mono text-xs text-system-text-muted">
            Formerly: {shadow.bossName}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-mono ${
            shadow.isActive ? 'text-purple-400' : 'text-gray-500'
          }`}>
            {shadow.isActive ? 'ACTIVE' : 'DORMANT'}
          </span>
        </div>
      </div>

      {/* Quote */}
      <p className="font-mono text-xs text-gray-400 italic mb-3">
        "What once defeated you now warns you."
      </p>

      {/* Ability */}
      <div className="bg-purple-950/20 border border-purple-500/20 rounded p-3 mb-3">
        <p className="font-mono text-xs text-purple-300 mb-1">
          Ability: {shadow.abilityName}
        </p>
        <p className="font-mono text-xs text-purple-400/70">
          {shadow.abilityDescription}
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs font-mono text-system-text-muted">
        <span>Extracted: {formattedDate}</span>
        <span>Activations: {shadow.triggerCount}</span>
      </div>
    </motion.div>
  )
}

/**
 * Shadow extraction animation
 */
export function ShadowExtractionCeremony({
  shadow,
  onComplete,
}: {
  shadow: Shadow
  onComplete: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md text-center">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-sm text-purple-400 mb-6 tracking-wider"
        >
          SHADOW EXTRACTION COMPLETE
        </motion.p>

        {/* Shadow icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-6xl mb-6"
        >
          👤
        </motion.div>

        {/* Shadow name */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-mono text-xl text-white font-bold mb-4"
        >
          {shadow.name}
        </motion.h2>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 mb-8"
        >
          <p className="font-mono text-sm text-gray-400">
            {shadow.bossName} now serves you.
          </p>
          <p className="font-mono text-sm text-gray-300">
            What once controlled you has been subdued.
            <br />
            Its patterns are now visible to you.
          </p>
        </motion.div>

        {/* Ability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mb-6"
        >
          <p className="font-mono text-xs text-purple-400 mb-2 tracking-wider">
            SHADOW ABILITY ACQUIRED
          </p>
          <p className="font-mono text-sm text-white font-bold mb-1">
            {shadow.abilityName}
          </p>
          <p className="font-mono text-xs text-purple-300/70">
            {shadow.abilityDescription}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onComplete}
          className="px-6 py-2 border border-purple-500/50 text-purple-400 
                     font-mono text-sm hover:bg-purple-500/10 transition-colors"
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  )
}

/**
 * Compact shadow indicator for profile header
 */
export function ShadowIndicator({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-purple-400">
      <span>👥</span>
      <span>{count}</span>
    </div>
  )
}
