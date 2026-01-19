/**
 * useSettings - Hook for user settings and preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface UserSettings {
  // Notification preferences
  notifications: {
    morningReminder: boolean
    morningTime: string // "07:00"
    eveningCheck: boolean
    eveningTime: string // "20:00"
    questCompletions: boolean
    levelUps: boolean
    streakReminders: boolean
    systemMessages: boolean
  }
  // Quiet hours
  quietHours: {
    enabled: boolean
    startTime: string // "22:00"
    endTime: string // "07:00"
  }
  // Display preferences
  display: {
    timezone: string
    use24HourTime: boolean
    weekStartsOn: 'sunday' | 'monday'
  }
  // Health sync
  healthSync: {
    enabled: boolean
    source: 'healthkit' | 'googlefit' | 'none'
    autoSync: boolean
    lastSyncTime: string | null
  }
  // Privacy
  privacy: {
    shareProgress: boolean
    showOnLeaderboard: boolean
    allowAccountabilityRequests: boolean
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    morningReminder: true,
    morningTime: '07:00',
    eveningCheck: true,
    eveningTime: '20:00',
    questCompletions: true,
    levelUps: true,
    streakReminders: true,
    systemMessages: true,
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
  display: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    use24HourTime: false,
    weekStartsOn: 'sunday',
  },
  healthSync: {
    enabled: false,
    source: 'none',
    autoSync: true,
    lastSyncTime: null,
  },
  privacy: {
    shareProgress: false,
    showOnLeaderboard: true,
    allowAccountabilityRequests: true,
  },
}

/**
 * Hook for fetching and updating settings
 */
export function useSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await api.get<{ settings: UserSettings }>('/api/player/settings')
        return response.settings
      } catch {
        return DEFAULT_SETTINGS
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      return api.put<{ settings: UserSettings }>('/api/player/settings', updates)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data.settings)
    },
  })

  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}

/**
 * Hook for notification preferences only
 */
export function useNotificationPrefs() {
  const { settings, updateSettings, isUpdating } = useSettings()

  const updateNotifications = (updates: Partial<UserSettings['notifications']>) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        ...updates,
      },
    })
  }

  return {
    notifications: settings.notifications,
    updateNotifications,
    isUpdating,
  }
}

/**
 * Hook for quiet hours only
 */
export function useQuietHours() {
  const { settings, updateSettings, isUpdating } = useSettings()

  const updateQuietHours = (updates: Partial<UserSettings['quietHours']>) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        ...updates,
      },
    })
  }

  return {
    quietHours: settings.quietHours,
    updateQuietHours,
    isUpdating,
  }
}

/**
 * Format time for display
 */
export function formatTime(time24: string, use24Hour: boolean = false): string {
  if (use24Hour) return time24
  
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours! >= 12 ? 'PM' : 'AM'
  const hour12 = hours! % 12 || 12
  return `${hour12}:${minutes!.toString().padStart(2, '0')} ${period}`
}
