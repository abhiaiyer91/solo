import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TypewriterText } from '@/components/system'

interface ReturnProtocolOffer {
  shouldOffer: boolean
  absenceInfo: {
    daysSinceActivity: number
    level: 'none' | 'short' | 'medium' | 'long'
    streakAtDeparture: number
    lastActivityDate: string | null
  }
  message: string | null
}

interface ReturnProtocolStatus {
  isActive: boolean
  currentDay: number
  startedAt: string | null
  requiredQuests: number
  daysRemaining: number
  canDecline: boolean
}

export function ReturnProtocolModal() {
  const queryClient = useQueryClient()
  const [dismissed, setDismissed] = useState(false)

  // Check if protocol should be offered
  const { data: offer, isLoading } = useQuery<ReturnProtocolOffer>({
    queryKey: ['return-protocol', 'check'],
    queryFn: async () => {
      const res = await api.get('/api/player/return-protocol/check') as Response
      if (!res.ok) throw new Error('Failed to check return protocol')
      return res.json() as Promise<ReturnProtocolOffer>
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/player/return-protocol/accept') as Response
      if (!res.ok) throw new Error('Failed to accept protocol')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-protocol'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      setDismissed(true)
    },
  })

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/player/return-protocol/decline') as Response
      if (!res.ok) throw new Error('Failed to decline protocol')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-protocol'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      setDismissed(true)
    },
  })

  // Don't show if loading, no offer, or dismissed
  if (isLoading || !offer?.shouldOffer || dismissed) {
    return null
  }

  const isProcessing = acceptMutation.isPending || declineMutation.isPending

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full"
        >
          <div className="system-window p-8 border-system-purple/50">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 mx-auto mb-4 border-2 border-system-purple rounded-lg flex items-center justify-center"
              >
                <span className="text-system-purple text-2xl font-bold">↺</span>
              </motion.div>

              <h2 className="text-system-text text-lg font-bold">
                RETURN PROTOCOL
              </h2>
            </div>

            {/* Message */}
            {offer.message && (
              <div className="mb-6 p-4 bg-system-black/50 border border-system-border rounded">
                <TypewriterText text={offer.message} speed={15} />
              </div>
            )}

            {/* Protocol explanation */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 border border-system-purple rounded flex items-center justify-center text-system-purple text-xs">1</span>
                <span className="text-system-text-muted">Day 1: Only 1 core quest required</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 border border-system-purple rounded flex items-center justify-center text-system-purple text-xs">2</span>
                <span className="text-system-text-muted">Day 2: 2 core quests required</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 border border-system-purple rounded flex items-center justify-center text-system-purple text-xs">3</span>
                <span className="text-system-text-muted">Day 3: 3 core quests (near-normal)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => acceptMutation.mutate()}
                disabled={isProcessing}
                className="w-full py-3 border border-system-purple rounded bg-system-purple/10 text-system-purple
                           hover:bg-system-purple/20 transition-colors disabled:opacity-50"
              >
                {acceptMutation.isPending ? 'Activating...' : 'Accept Protocol'}
              </button>

              <button
                type="button"
                onClick={() => declineMutation.mutate()}
                disabled={isProcessing}
                className="w-full py-3 border border-system-border rounded text-system-text-muted
                           hover:bg-system-panel transition-colors disabled:opacity-50"
              >
                {declineMutation.isPending ? 'Processing...' : 'Full Intensity (4 quests)'}
              </button>
            </div>

            {/* Footer note */}
            <p className="text-system-text-muted text-xs text-center mt-4">
              The System records presence, not perfection.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Indicator for active return protocol
 */
export function ReturnProtocolIndicator() {
  const { data: status } = useQuery<ReturnProtocolStatus>({
    queryKey: ['return-protocol', 'status'],
    queryFn: async () => {
      const res = await api.get('/api/player/return-protocol') as Response
      if (!res.ok) throw new Error('Failed to get status')
      return res.json() as Promise<ReturnProtocolStatus>
    },
  })

  if (!status?.isActive) {
    return null
  }

  return (
    <div className="p-3 border border-system-purple/50 rounded bg-system-purple/10">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-system-purple rounded-full animate-pulse" />
        <span className="text-system-purple text-sm font-medium">
          Return Protocol Day {status.currentDay}/3
        </span>
      </div>
      <p className="text-system-text-muted text-xs mt-1">
        {status.requiredQuests} core quest{status.requiredQuests > 1 ? 's' : ''} required today
      </p>
    </div>
  )
}
