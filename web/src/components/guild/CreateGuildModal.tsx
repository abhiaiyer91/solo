import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateGuild } from '@/hooks/useGuild'

interface CreateGuildModalProps {
  isOpen: boolean
  onClose: () => void
  userLevel: number
}

const MIN_LEVEL_TO_CREATE = 10

export function CreateGuildModal({ isOpen, onClose, userLevel }: CreateGuildModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [minLevel, setMinLevel] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const createGuild = useCreateGuild()

  const canCreate = userLevel >= MIN_LEVEL_TO_CREATE

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (name.length < 3 || name.length > 30) {
      setError('Guild name must be 3-30 characters')
      return
    }

    try {
      await createGuild.mutateAsync({
        name,
        description: description || undefined,
        isPublic,
        minLevel,
      })
      onClose()
      setName('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guild')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="system-window p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-system-blue mb-4">
                CREATE GUILD
              </h2>

              {!canCreate ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-system-text-muted mb-2">
                    You must be Level {MIN_LEVEL_TO_CREATE} to create a guild
                  </p>
                  <p className="text-system-text">
                    Current Level: <span className="text-system-blue">{userLevel}</span>
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-blue transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Guild Name */}
                  <div>
                    <label className="block text-sm text-system-text-muted mb-1">
                      Guild Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter guild name (3-30 chars)"
                      className="w-full px-4 py-2 rounded border border-system-border bg-system-black text-system-text placeholder:text-system-text-muted focus:border-system-blue focus:outline-none"
                      maxLength={30}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm text-system-text-muted mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is your guild about?"
                      rows={3}
                      className="w-full px-4 py-2 rounded border border-system-border bg-system-black text-system-text placeholder:text-system-text-muted focus:border-system-blue focus:outline-none resize-none"
                      maxLength={200}
                    />
                  </div>

                  {/* Min Level */}
                  <div>
                    <label className="block text-sm text-system-text-muted mb-1">
                      Minimum Level to Join
                    </label>
                    <input
                      type="number"
                      value={minLevel}
                      onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
                      min={1}
                      max={100}
                      className="w-full px-4 py-2 rounded border border-system-border bg-system-black text-system-text focus:border-system-blue focus:outline-none"
                    />
                  </div>

                  {/* Public/Private */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded border-system-border bg-system-black text-system-blue focus:ring-system-blue"
                    />
                    <label htmlFor="isPublic" className="text-sm text-system-text">
                      Public guild (anyone can join)
                    </label>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded bg-system-red/10 border border-system-red/50 text-system-red text-sm">
                      {error}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createGuild.isPending || !name.trim()}
                      className="flex-1 px-4 py-2 rounded bg-system-blue text-system-black font-medium hover:bg-system-blue/90 transition-colors disabled:opacity-50"
                    >
                      {createGuild.isPending ? 'Creating...' : 'Create Guild'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
