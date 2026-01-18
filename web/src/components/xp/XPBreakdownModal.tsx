import { motion, AnimatePresence } from 'framer-motion'
import { useXPBreakdown } from '@/hooks/useXPTimeline'

interface XPBreakdownModalProps {
  eventId: string | null
  onClose: () => void
}

export function XPBreakdownModal({ eventId, onClose }: XPBreakdownModalProps) {
  const { data, isLoading } = useXPBreakdown(eventId)

  return (
    <AnimatePresence>
      {eventId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
          >
            <div className="system-window p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-system-blue">
                  XP BREAKDOWN
                </h3>
                <button
                  onClick={onClose}
                  className="text-system-text-muted hover:text-system-text"
                >
                  ✕
                </button>
              </div>

              {isLoading ? (
                <div className="text-system-text-muted text-center py-8">
                  <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : data ? (
                <div className="space-y-4">
                  {/* Event description */}
                  <div className="text-system-text">
                    {data.event.description}
                  </div>

                  {/* Calculation breakdown */}
                  <div className="border border-system-border rounded p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-system-text-muted">Base XP</span>
                      <span className="text-system-text">
                        {data.event.baseAmount}
                      </span>
                    </div>

                    {data.modifiers.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-system-text-muted">
                          {mod.description}
                        </span>
                        <span
                          className={
                            mod.multiplier >= 1
                              ? 'text-system-green'
                              : 'text-system-red'
                          }
                        >
                          ×{mod.multiplier.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-system-border pt-2 flex justify-between font-bold">
                      <span className="text-system-text">Final XP</span>
                      <span className="text-system-green">
                        +{data.event.finalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Level info */}
                  {data.event.levelAfter > data.event.levelBefore && (
                    <div className="bg-system-gold/10 border border-system-gold/30 rounded p-3 text-center">
                      <div className="text-system-gold font-bold">
                        LEVEL UP!
                      </div>
                      <div className="text-system-text-muted text-sm">
                        Level {data.event.levelBefore} → Level{' '}
                        {data.event.levelAfter}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-system-text-muted text-xs text-center">
                    {new Date(data.event.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-system-text-muted text-center py-8">
                  Event not found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
