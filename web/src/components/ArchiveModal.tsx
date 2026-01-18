import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useArchiveOffer,
  useSoftReset,
  useDeclineArchive,
  useArchives,
  type Archive,
} from '@/hooks/useArchives'
import { TypewriterText } from '@/components/system'

export function ArchiveModal() {
  const { data: offer, isLoading } = useArchiveOffer()
  const softReset = useSoftReset()
  const declineArchive = useDeclineArchive()
  const [showConfirm, setShowConfirm] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (isLoading || !offer?.shouldOffer || dismissed) {
    return null
  }

  const handleDecline = async () => {
    await declineArchive.mutateAsync()
    setDismissed(true)
  }

  const handleConfirmReset = async () => {
    await softReset.mutateAsync()
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-system-black/90"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg p-8 border border-system-purple/50 rounded-lg bg-system-panel"
        >
          {!showConfirm ? (
            <>
              {/* Main offer */}
              <h2 className="text-lg font-bold text-system-purple mb-4">
                [SYSTEM DETECTION]
              </h2>

              <div className="mb-6 text-system-text font-mono text-sm leading-relaxed whitespace-pre-line">
                {offer.narrative ? (
                  <TypewriterText text={offer.narrative} speed={20} />
                ) : (
                  <>
                    Extended absence detected: {offer.daysSinceActivity} days.
                    {'\n\n'}
                    Current state:{'\n'}
                    • Level: {offer.currentLevel}{'\n'}
                    • Total XP: {offer.totalXp.toLocaleString()}{'\n'}
                    • Longest Streak: {offer.longestStreak} days
                  </>
                )}
              </div>

              {/* Stats summary */}
              <div className="mb-6 p-4 bg-system-black/50 border border-system-border rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-system-text-muted">Days Away</div>
                    <div className="text-xl font-bold text-system-purple">
                      {offer.daysSinceActivity}
                    </div>
                  </div>
                  <div>
                    <div className="text-system-text-muted">Current Level</div>
                    <div className="text-xl font-bold text-system-text">
                      {offer.currentLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={declineArchive.isPending}
                  className="w-full py-3 border border-system-blue/50 rounded text-system-blue font-medium hover:bg-system-blue/10 transition-colors disabled:opacity-50"
                >
                  {declineArchive.isPending ? 'Continuing...' : 'CONTINUE — Keep my progress'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={declineArchive.isPending}
                  className="w-full py-3 border border-system-purple/50 rounded text-system-purple font-medium hover:bg-system-purple/10 transition-colors disabled:opacity-50"
                >
                  ARCHIVE — Start fresh
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation screen */}
              <h2 className="text-lg font-bold text-system-red mb-4">
                [ARCHIVE CONFIRMATION]
              </h2>

              <div className="mb-6 text-system-text font-mono text-sm leading-relaxed">
                <p className="mb-4">This action will:</p>
                <ul className="space-y-2 text-system-text-muted">
                  <li>• Store your current progress permanently</li>
                  <li>• Reset your level to 1</li>
                  <li>• Clear your current XP ({offer.totalXp.toLocaleString()} XP)</li>
                  <li>• Reset your streak</li>
                </ul>
                <p className="mt-4 text-system-yellow">
                  Your archived run will be viewable in your profile.
                </p>
                <p className="mt-2 text-system-red font-bold">
                  This cannot be undone.
                </p>
              </div>

              {/* Confirmation actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={softReset.isPending}
                  className="w-full py-3 border border-system-border rounded text-system-text-muted hover:text-system-text transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={softReset.isPending}
                  className="w-full py-3 border border-system-red/50 rounded text-system-red font-bold hover:bg-system-red/10 transition-colors disabled:opacity-50"
                >
                  {softReset.isPending ? 'Archiving...' : 'CONFIRM ARCHIVE & RESET'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Component to display in Profile page
export function ArchivesHistory() {
  const { data, isLoading } = useArchives()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-4 h-4 border-2 border-system-purple border-t-transparent rounded-full animate-spin" />
        <span className="text-system-text-muted text-sm">Loading archives...</span>
      </div>
    )
  }

  const archives = data?.archives ?? []

  if (archives.length === 0) {
    return (
      <div className="text-system-text-muted text-sm text-center py-4">
        No archived runs
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {archives.map((archive, index) => (
        <ArchiveCard key={archive.id} archive={archive} runNumber={archives.length - index} />
      ))}
    </div>
  )
}

function ArchiveCard({ archive, runNumber }: { archive: Archive; runNumber: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-system-border rounded bg-system-panel/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-system-purple/20 border border-system-purple/50 flex items-center justify-center text-xs text-system-purple font-bold">
            {runNumber}
          </span>
          <span className="text-system-text font-medium">Run #{runNumber}</span>
        </div>
        <span className="text-system-text-muted text-xs">
          {new Date(archive.archivedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-system-text-muted text-xs">Final Level</div>
          <div className="font-bold text-system-text">{archive.levelAtArchive}</div>
        </div>
        <div>
          <div className="text-system-text-muted text-xs">Total XP</div>
          <div className="font-bold text-system-text">{archive.totalXpAtArchive.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-system-text-muted text-xs">Active Days</div>
          <div className="font-bold text-system-text">{archive.activeDays}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-system-border grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-system-text-muted">Longest Streak: </span>
          <span className="text-system-text">{archive.longestStreak} days</span>
        </div>
        <div>
          <span className="text-system-text-muted">Dungeons: </span>
          <span className="text-system-text">{archive.dungeonsCleared}</span>
        </div>
      </div>
    </motion.div>
  )
}
