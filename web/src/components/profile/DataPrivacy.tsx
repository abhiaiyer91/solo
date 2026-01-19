/**
 * DataPrivacy - GDPR/CCPA compliant data export and account deletion UI
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface DeletionStatus {
  deletionRequested: boolean
  requestedAt: string | null
  daysRemaining: number | null
  scheduledDeletion: string | null
  canCancel: boolean
}

export function DataPrivacy() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const queryClient = useQueryClient()

  const { data: deletionStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['deletion-status'],
    queryFn: () => api.get<DeletionStatus>('/api/player/account/deletion-status'),
  })

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/player/export', {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `journey-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('/api/player/account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-status'] })
      setShowDeleteConfirm(false)
      setConfirmText('')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.post('/api/player/account/cancel-deletion'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-status'] })
    },
  })

  const canDelete = confirmText.toLowerCase() === 'delete my account'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-system-text flex items-center gap-2">
          <span className="text-system-blue">{'>'}</span> DATA & PRIVACY
        </h2>
        <p className="text-sm text-system-text-muted mt-1">
          Manage your data and account settings
        </p>
      </div>

      {/* Export Section */}
      <div className="system-window p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-system-text flex items-center gap-2">
              Export My Data
            </h3>
            <p className="text-sm text-system-text-muted mt-1">
              Download all your data as JSON. Includes quest history, XP timeline,
              stats, achievements, and health data.
            </p>
          </div>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-system-blue text-system-black font-bold rounded text-sm hover:bg-system-blue/80 disabled:opacity-50"
          >
            {exportMutation.isPending ? 'EXPORTING...' : 'EXPORT'}
          </button>
        </div>
        {exportMutation.isSuccess && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-system-green mt-2"
          >
            Export complete. Check your downloads folder.
          </motion.p>
        )}
      </div>

      {/* Deletion Section */}
      <div className="system-window p-4 border-system-red/30">
        {deletionStatus?.deletionRequested ? (
          // Pending deletion state
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-system-red rounded-full animate-pulse" />
              <h3 className="font-bold text-system-red">
                ACCOUNT DELETION PENDING
              </h3>
            </div>
            <p className="text-sm text-system-text">
              Your account is scheduled for deletion in{' '}
              <span className="text-system-red font-bold">
                {deletionStatus.daysRemaining} days
              </span>
              . All your data will be permanently removed after this period.
            </p>
            <p className="text-sm text-system-text-muted">
              Scheduled deletion:{' '}
              {deletionStatus.scheduledDeletion
                ? new Date(deletionStatus.scheduledDeletion).toLocaleDateString()
                : 'Unknown'}
            </p>
            {deletionStatus.canCancel && (
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-system-green text-system-black font-bold rounded text-sm hover:bg-system-green/80 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'CANCELING...' : 'CANCEL DELETION'}
              </button>
            )}
          </div>
        ) : (
          // Normal state
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-system-red flex items-center gap-2">
                  Delete Account
                </h3>
                <p className="text-sm text-system-text-muted mt-1">
                  Permanently delete your account and all associated data.
                  You&apos;ll have 30 days to change your mind.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-system-red/20 text-system-red border border-system-red/50 font-bold rounded text-sm hover:bg-system-red/30"
              >
                DELETE
              </button>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-system-red/30"
                >
                  <div className="bg-system-red/10 p-4 rounded border border-system-red/30">
                    <h4 className="font-bold text-system-red mb-2">
                      Confirm Account Deletion
                    </h4>
                    <p className="text-sm text-system-text mb-4">
                      This action will schedule your account for deletion in 30 days.
                      After that period, all your data will be permanently removed and cannot be recovered.
                    </p>
                    <p className="text-sm text-system-text-muted mb-3">
                      Type{' '}
                      <span className="text-system-text font-mono bg-system-black/50 px-1 rounded">
                        delete my account
                      </span>{' '}
                      to confirm:
                    </p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="delete my account"
                      className="w-full px-3 py-2 bg-system-black border border-system-red/30 rounded text-system-text placeholder:text-system-text/30 focus:border-system-red focus:outline-none mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setConfirmText('')
                        }}
                        className="flex-1 px-4 py-2 bg-system-panel text-system-text font-bold rounded text-sm hover:bg-system-panel/70"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate()}
                        disabled={!canDelete || deleteMutation.isPending}
                        className="flex-1 px-4 py-2 bg-system-red text-white font-bold rounded text-sm hover:bg-system-red/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteMutation.isPending ? 'PROCESSING...' : 'DELETE ACCOUNT'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Data Retention Notice */}
      <div className="text-xs text-system-text-muted space-y-2 p-4 bg-system-panel/30 rounded">
        <p className="font-bold text-system-text-muted/80">DATA RETENTION POLICY</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Quest history and XP data: Retained while account is active</li>
          <li>Health data: Synced from HealthKit, deleted with account</li>
          <li>Authentication data: Deleted immediately on account deletion</li>
          <li>Analytics: Anonymized after 90 days, deleted with account</li>
        </ul>
      </div>
    </div>
  )
}
