/**
 * Custom Quests Hook
 * Manage user-created quest templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

// Types
export interface CustomQuestMetric {
  id: string
  label: string
  unit: string
  icon: string
}

export interface CustomQuestTemplate {
  id: string
  userId: string
  name: string
  description: string
  category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
  requirement: {
    type: 'numeric'
    metric: string
    operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
    value: number
    unit?: string
  }
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  icon: string
  color: string
  isDaily: boolean
  targetValue: number
  isActive: boolean
  isArchived: boolean
  isShared: boolean
  timesCompleted: number
  timesActivated: number
  createdAt: string
  updatedAt: string
}

export interface CustomQuestLog {
  id: string
  userId: string
  templateId: string
  questDate: string
  currentValue: number
  targetValue: number
  isCompleted: boolean
  completedAt: string | null
  xpAwarded: number | null
  createdAt: string
  template: CustomQuestTemplate
}

export interface CustomQuestStats {
  totalTemplates: number
  activeTemplates: number
  totalCompletions: number
  totalXpEarned: number
}

export interface CreateCustomQuestInput {
  name: string
  description: string
  category: CustomQuestTemplate['category']
  metric: string
  targetValue: number
  statType: CustomQuestTemplate['statType']
  icon?: string
  color?: string
  isDaily?: boolean
}

export interface UpdateCustomQuestInput {
  name?: string
  description?: string
  category?: CustomQuestTemplate['category']
  metric?: string
  targetValue?: number
  statType?: CustomQuestTemplate['statType']
  icon?: string
  color?: string
  isDaily?: boolean
}

/**
 * Fetch all custom quest templates
 */
export function useCustomQuests(includeArchived = false) {
  return useQuery({
    queryKey: ['customQuests', { includeArchived }],
    queryFn: async () => {
      const res = await api.get(`/api/custom-quests?includeArchived=${includeArchived}`)
      return res.data as {
        templates: CustomQuestTemplate[]
        stats: CustomQuestStats
        maxActive: number
      }
    },
  })
}

/**
 * Fetch only active custom quests
 */
export function useActiveCustomQuests() {
  return useQuery({
    queryKey: ['customQuests', 'active'],
    queryFn: async () => {
      const res = await api.get('/api/custom-quests/active')
      return res.data as { templates: CustomQuestTemplate[] }
    },
  })
}

/**
 * Fetch available metrics for custom quests
 */
export function useCustomQuestMetrics() {
  return useQuery({
    queryKey: ['customQuests', 'metrics'],
    queryFn: async () => {
      const res = await api.get('/api/custom-quests/metrics')
      return res.data as {
        metrics: CustomQuestMetric[]
        categories: string[]
        statTypes: string[]
        maxActive: number
      }
    },
    staleTime: Infinity, // This data is static
  })
}

/**
 * Fetch custom quest logs for a specific date
 */
export function useCustomQuestLogs(date: string) {
  return useQuery({
    queryKey: ['customQuestLogs', date],
    queryFn: async () => {
      const res = await api.get(`/api/custom-quests/logs/${date}`)
      return res.data as { logs: CustomQuestLog[]; date: string }
    },
    enabled: !!date && /^\d{4}-\d{2}-\d{2}$/.test(date),
  })
}

/**
 * Fetch a single custom quest template
 */
export function useCustomQuest(templateId: string | null) {
  return useQuery({
    queryKey: ['customQuest', templateId],
    queryFn: async () => {
      const res = await api.get(`/api/custom-quests/${templateId}`)
      return res.data as { template: CustomQuestTemplate }
    },
    enabled: !!templateId,
  })
}

/**
 * Create a new custom quest template
 */
export function useCreateCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCustomQuestInput) => {
      const res = await api.post('/api/custom-quests', input)
      return res.data as { template: CustomQuestTemplate }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
    },
  })
}

/**
 * Update a custom quest template
 */
export function useUpdateCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      templateId,
      updates,
    }: {
      templateId: string
      updates: UpdateCustomQuestInput
    }) => {
      const res = await api.patch(`/api/custom-quests/${templateId}`, updates)
      return res.data as { template: CustomQuestTemplate }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
      queryClient.invalidateQueries({
        queryKey: ['customQuest', variables.templateId],
      })
    },
  })
}

/**
 * Activate a custom quest
 */
export function useActivateCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.post(`/api/custom-quests/${templateId}/activate`)
      return res.data as { template: CustomQuestTemplate; message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
    },
  })
}

/**
 * Deactivate a custom quest
 */
export function useDeactivateCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.post(`/api/custom-quests/${templateId}/deactivate`)
      return res.data as { template: CustomQuestTemplate; message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
    },
  })
}

/**
 * Archive a custom quest
 */
export function useArchiveCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.post(`/api/custom-quests/${templateId}/archive`)
      return res.data as { template: CustomQuestTemplate; message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
    },
  })
}

/**
 * Delete a custom quest
 */
export function useDeleteCustomQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.delete(`/api/custom-quests/${templateId}`)
      return res.data as { deleted: boolean; message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
    },
  })
}

/**
 * Update progress on a custom quest
 */
export function useUpdateCustomQuestProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      templateId,
      date,
      currentValue,
    }: {
      templateId: string
      date: string
      currentValue: number
    }) => {
      const res = await api.post(`/api/custom-quests/${templateId}/progress`, {
        date,
        currentValue,
      })
      return res.data as {
        log: CustomQuestLog
        justCompleted: boolean
        xpAwarded?: number
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['customQuestLogs', variables.date],
      })
      queryClient.invalidateQueries({ queryKey: ['customQuests'] })
      // Also invalidate player data if XP was awarded
      queryClient.invalidateQueries({ queryKey: ['player'] })
    },
  })
}

/**
 * Initialize daily custom quest logs for a date
 */
export function useInitCustomQuestLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (date: string) => {
      const res = await api.post(`/api/custom-quests/logs/${date}/init`)
      return res.data as { logs: CustomQuestLog[]; created: number }
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: ['customQuestLogs', date] })
    },
  })
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}
