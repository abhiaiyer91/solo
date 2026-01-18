import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SystemMessage, TypewriterText } from '@/components/system'
import { toast } from '@/components/ui/toast'

interface QuestTemplate {
  id: string
  name: string
  description: string
  type: 'DAILY' | 'WEEKLY' | 'DUNGEON' | 'BOSS'
  category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  isCore: boolean
  isActive: boolean
}

async function fetchQuestTemplates(): Promise<{ templates: QuestTemplate[] }> {
  const res = await fetch('/api/quests/templates', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch quest templates')
  }

  return res.json()
}

async function activateQuest(templateId: string): Promise<{ quest: unknown; message: string }> {
  const res = await fetch(`/api/quests/activate/${templateId}`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to activate quest')
  }

  return res.json()
}

async function deactivateQuest(templateId: string): Promise<{ deactivated: boolean; message: string }> {
  const res = await fetch(`/api/quests/deactivate/${templateId}`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to deactivate quest')
  }

  return res.json()
}

export function Quests() {
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ['quest-templates'],
    queryFn: fetchQuestTemplates,
  })

  const queryClient = useQueryClient()
  const [actionTemplateId, setActionTemplateId] = useState<string | null>(null)

  const activateMutation = useMutation({
    mutationFn: activateQuest,
    onSuccess: () => {
      toast.success('Quest activated', {
        description: 'Quest has been added to your daily log.',
      })
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
    onError: (error) => {
      toast.error('Failed to activate quest', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    },
    onSettled: () => {
      setActionTemplateId(null)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateQuest,
    onSuccess: () => {
      toast.success('Quest removed', {
        description: 'Quest has been removed from your daily log.',
      })
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
    onError: (error) => {
      toast.error('Failed to remove quest', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    },
    onSettled: () => {
      setActionTemplateId(null)
    },
  })

  const handleActivate = (templateId: string) => {
    setActionTemplateId(templateId)
    activateMutation.mutate(templateId)
  }

  const handleDeactivate = (templateId: string) => {
    setActionTemplateId(templateId)
    deactivateMutation.mutate(templateId)
  }

  const templates = templatesData?.templates ?? []

  // Group by type
  const coreQuests = templates.filter((t) => t.isCore)
  const bonusDaily = templates.filter((t) => t.type === 'DAILY' && !t.isCore)
  const weeklyQuests = templates.filter((t) => t.type === 'WEEKLY')
  const otherQuests = templates.filter((t) => !['DAILY', 'WEEKLY'].includes(t.type))

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SystemMessage>
          <TypewriterText text="ACCESSING QUEST ARCHIVE..." speed={25} />
        </SystemMessage>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <SystemMessage variant="error">
          <span className="block">QUEST ARCHIVE ACCESS DENIED</span>
          <span className="block mt-2 text-system-text-muted">
            Failed to load quest templates. Please try again.
          </span>
        </SystemMessage>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SystemMessage>
        <span className="block">QUEST ARCHIVE ACCESS GRANTED</span>
        <span className="block mt-1">Select additional objectives to enhance your progression.</span>
      </SystemMessage>

      {/* Core Quests */}
      {coreQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-gold rounded-full" />
            CORE QUESTS
          </h2>
          <p className="text-system-text-muted text-sm mb-4">
            These fundamental quests are always active and form the foundation of your training.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreQuests.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 border border-system-gold/50 rounded bg-system-gold/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-system-text font-medium">{template.name}</span>
                  <span className="px-2 py-0.5 text-xs bg-system-gold/20 text-system-gold rounded">
                    CORE
                  </span>
                </div>
                <p className="text-system-text-muted text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-system-text-muted">
                    {template.category} • {template.baseXP} XP
                  </span>
                  <span className="text-system-green">ALWAYS ACTIVE</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bonus Daily Quests */}
      {bonusDaily.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-blue rounded-full" />
            BONUS DAILY QUESTS
          </h2>
          <p className="text-system-text-muted text-sm mb-4">
            Optional daily challenges to accelerate your growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonusDaily.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 border rounded ${
                  template.isActive
                    ? 'border-system-green/50 bg-system-green/5'
                    : 'border-system-border hover:border-system-blue/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-system-text font-medium">{template.name}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      template.isActive
                        ? 'bg-system-green/20 text-system-green'
                        : 'bg-system-border text-system-text-muted'
                    }`}
                  >
                    {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-system-text-muted text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-system-text-muted text-xs">
                    {template.category} • {template.baseXP} XP
                  </span>
                  {template.isActive ? (
                    <button
                      onClick={() => handleDeactivate(template.id)}
                      disabled={actionTemplateId === template.id}
                      className="text-xs px-3 py-1 border border-system-border rounded
                                 text-system-text-muted hover:border-system-red hover:text-system-red
                                 transition-colors disabled:opacity-50"
                    >
                      {actionTemplateId === template.id && deactivateMutation.isPending ? 'REMOVING...' : 'REMOVE'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(template.id)}
                      disabled={actionTemplateId === template.id}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      {actionTemplateId === template.id && activateMutation.isPending ? 'ACTIVATING...' : 'ACTIVATE'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Quests */}
      {weeklyQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-purple rounded-full" />
            WEEKLY QUESTS
          </h2>
          <p className="text-system-text-muted text-sm mb-4">
            Sustained challenges that span the week. Progress is tracked automatically based on your daily quest completions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyQuests.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 border border-system-purple/30 rounded bg-system-purple/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-system-text font-medium">{template.name}</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-system-purple/20 text-system-purple">
                    WEEKLY
                  </span>
                </div>
                <p className="text-system-text-muted text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-system-text-muted text-xs">
                    {template.category} • {template.baseXP} XP
                  </span>
                  <span className="text-xs text-system-purple/70">
                    AUTO-TRACKED
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Other Quests (Dungeons, Bosses) */}
      {otherQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-red rounded-full" />
            SPECIAL QUESTS
          </h2>
          <p className="text-system-text-muted text-sm mb-4">High-risk, high-reward challenges.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherQuests.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 border rounded ${
                  template.isActive
                    ? 'border-system-red/50 bg-system-red/5'
                    : 'border-system-border hover:border-system-red/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-system-text font-medium">{template.name}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      template.isActive
                        ? 'bg-system-red/20 text-system-red'
                        : 'bg-system-border text-system-text-muted'
                    }`}
                  >
                    {template.type}
                  </span>
                </div>
                <p className="text-system-text-muted text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-system-text-muted text-xs">
                    {template.category} • {template.baseXP} XP
                  </span>
                  {template.isActive ? (
                    <button
                      onClick={() => handleDeactivate(template.id)}
                      disabled={actionTemplateId === template.id}
                      className="text-xs px-3 py-1 border border-system-border rounded
                                 text-system-text-muted hover:border-system-red hover:text-system-red
                                 transition-colors disabled:opacity-50"
                    >
                      {actionTemplateId === template.id && deactivateMutation.isPending ? 'REMOVING...' : 'REMOVE'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(template.id)}
                      disabled={actionTemplateId === template.id}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      {actionTemplateId === template.id && activateMutation.isPending ? 'ACTIVATING...' : 'ACTIVATE'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  )
}
