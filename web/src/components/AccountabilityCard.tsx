/**
 * AccountabilityCard - Partner status card component
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  type AccountabilityPartner,
  useSendNudge,
  useDisconnectPartner,
  getStatusColor,
  getCompletionColor,
} from '../hooks/useAccountability'

interface AccountabilityCardProps {
  partner: AccountabilityPartner
  onDisconnect?: () => void
}

export function AccountabilityCard({ partner, onDisconnect }: AccountabilityCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const nudgeMutation = useSendNudge()
  const disconnectMutation = useDisconnectPartner()

  const handleNudge = () => {
    nudgeMutation.mutate(partner.partnerId)
  }

  const handleDisconnect = () => {
    disconnectMutation.mutate(partner.partnerId, {
      onSuccess: () => {
        setShowConfirm(false)
        onDisconnect?.()
      },
    })
  }

  const completionColor = getCompletionColor(partner.todayCompletion)
  const statusColor = getStatusColor(partner.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-system-black/50 border border-system-border rounded-lg p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-mono font-bold text-white">
            {partner.partnerName ?? 'Anonymous Partner'}
          </h3>
          <span className={`text-xs font-mono ${statusColor}`}>
            {partner.status === 'active' ? '● Connected' : '○ ' + partner.status}
          </span>
        </div>

        {/* Today's completion */}
        <div className="text-right">
          <span className={`text-2xl font-mono font-bold ${completionColor}`}>
            {partner.todayCompletion}%
          </span>
          <p className="text-xs font-mono text-system-text-muted">today</p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="mb-4">
        <p className="text-xs font-mono text-system-text-muted mb-2">This Week</p>
        <div className="flex gap-1">
          {partner.weeklyCompletion.map((day, i) => (
            <WeekDayCell key={i} day={day} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {partner.status === 'active' && (
          <button
            onClick={handleNudge}
            disabled={!partner.canNudge || nudgeMutation.isPending}
            className="flex-1 py-2 bg-system-accent/10 hover:bg-system-accent/20 
                       border border-system-accent/30 text-system-accent font-mono 
                       text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nudgeMutation.isPending
              ? 'Sending...'
              : partner.canNudge
              ? '👋 Nudge'
              : '✓ Nudged Today'}
          </button>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-2 text-system-text-muted hover:text-red-400 
                     font-mono text-xs transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Disconnect confirmation */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-system-border"
        >
          <p className="text-xs font-mono text-system-text-muted mb-3">
            Disconnect from {partner.partnerName ?? 'this partner'}?
            <br />
            You'll need to wait 7 days to reconnect.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 
                         border border-red-500/50 text-red-400 font-mono 
                         text-xs rounded transition-colors"
            >
              {disconnectMutation.isPending ? 'Disconnecting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 text-system-text-muted font-mono text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function WeekDayCell({ day }: { day: { day: string; completed: boolean | null } }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[10px] font-mono text-system-text-muted mb-1">
        {day.day}
      </p>
      <div
        className={`h-6 rounded flex items-center justify-center text-xs ${
          day.completed === null
            ? 'bg-system-border/30 text-system-text-muted'
            : day.completed
            ? 'bg-system-accent/20 text-system-accent'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {day.completed === null ? '–' : day.completed ? '✓' : '✗'}
      </div>
    </div>
  )
}

/**
 * Empty state for no partners
 */
export function NoPartnersCard({ onAddPartner }: { onAddPartner: () => void }) {
  return (
    <div className="bg-system-black/50 border border-dashed border-system-border rounded-lg p-6 text-center">
      <span className="text-3xl block mb-3">🤝</span>
      <p className="font-mono text-sm text-white mb-2">
        No accountability partners yet
      </p>
      <p className="font-mono text-xs text-system-text-muted mb-4">
        Connect with up to 3 partners to stay accountable
      </p>
      <button
        onClick={onAddPartner}
        className="px-4 py-2 bg-system-accent/20 hover:bg-system-accent/30 
                   border border-system-accent/50 text-system-accent font-mono 
                   text-sm rounded transition-colors"
      >
        + Add Partner
      </button>
    </div>
  )
}
