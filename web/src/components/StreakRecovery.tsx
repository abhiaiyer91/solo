/**
 * Streak Recovery Component
 * 
 * UI for grace token management and streak recovery.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GraceTokenStatus {
  tokens: number
  maxTokens: number
  nextTokenIn: number
  canRecover: boolean
  recoveryExpiresAt: string | null
}

interface StreakRecoveryProps {
  status: GraceTokenStatus
  currentStreak: number
  onRecover: () => Promise<{ success: boolean; message: string }>
  onDismiss: () => void
}

export function StreakRecovery({
  status,
  currentStreak,
  onRecover,
  onDismiss,
}: StreakRecoveryProps) {
  const [isRecovering, setIsRecovering] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRecover = async () => {
    setIsRecovering(true)
    try {
      const res = await onRecover()
      setResult(res)
    } catch (error) {
      setResult({ success: false, message: 'Recovery failed. Please try again.' })
    } finally {
      setIsRecovering(false)
    }
  }

  const timeRemaining = status.recoveryExpiresAt
    ? getTimeRemaining(status.recoveryExpiresAt)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4"
    >
      <div className="bg-gray-900 border border-yellow-500/50 rounded-lg p-6 max-w-md w-full">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className={`text-6xl mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? '🔥' : '💔'}
              </div>
              <h2 className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.success ? 'Streak Recovered!' : 'Recovery Failed'}
              </h2>
              <p className="text-gray-300 mb-6">{result.message}</p>
              <button
                onClick={onDismiss}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">⚠️</div>
                <h2 className="text-xl font-bold text-yellow-400">Streak At Risk!</h2>
                <p className="text-gray-400 mt-2">
                  Your {currentStreak}-day streak is about to break
                </p>
              </div>

              {/* Grace Tokens */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Grace Tokens</span>
                  <span className="font-bold">{status.tokens} / {status.maxTokens}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: status.maxTokens }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        i < status.tokens ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Recovery Countdown */}
              {timeRemaining && (
                <div className="text-center mb-6 p-3 bg-red-900/20 border border-red-800/50 rounded">
                  <div className="text-sm text-gray-400">Recovery window closes in</div>
                  <div className="text-2xl font-bold text-red-400">
                    {timeRemaining.hours}h {timeRemaining.minutes}m
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {status.canRecover && status.tokens > 0 ? (
                  <button
                    onClick={handleRecover}
                    disabled={isRecovering}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 rounded font-bold transition-colors"
                  >
                    {isRecovering ? 'Recovering...' : 'Use Grace Token to Recover'}
                  </button>
                ) : (
                  <div className="text-center text-gray-500 py-3">
                    {status.tokens === 0
                      ? 'No grace tokens available'
                      : 'Recovery not available'}
                  </div>
                )}
                
                <button
                  onClick={onDismiss}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                >
                  {status.canRecover ? 'Accept Streak Break' : 'Dismiss'}
                </button>
              </div>

              {/* Earn More Info */}
              {status.tokens < status.maxTokens && (
                <div className="mt-6 text-center text-sm text-gray-500">
                  Earn a grace token every {7} consecutive days.
                  {status.nextTokenIn > 0 && (
                    <span className="block mt-1">
                      Next token in {status.nextTokenIn} days
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/**
 * Grace Token Display (for profile/dashboard)
 */
interface GraceTokenDisplayProps {
  tokens: number
  maxTokens: number
  nextTokenIn: number
}

export function GraceTokenDisplay({ tokens, maxTokens, nextTokenIn }: GraceTokenDisplayProps) {
  return (
    <div className="p-4 bg-gray-900 rounded border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">Grace Tokens</span>
        <span className="text-yellow-400 font-bold">{tokens}/{maxTokens}</span>
      </div>
      
      <div className="flex gap-1 mb-2">
        {Array.from({ length: maxTokens }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-3 rounded-full ${
              i < tokens ? 'bg-yellow-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      
      {tokens < maxTokens && (
        <div className="text-xs text-gray-500">
          Next token in {nextTokenIn} day{nextTokenIn !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

/**
 * Helper to calculate time remaining
 */
function getTimeRemaining(expiresAt: string): { hours: number; minutes: number } {
  const expires = new Date(expiresAt)
  const now = new Date()
  
  const diffMs = Math.max(0, expires.getTime() - now.getTime())
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return { hours, minutes }
}
