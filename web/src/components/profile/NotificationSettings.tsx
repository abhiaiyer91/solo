import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
} from '@/lib/push'

interface NotificationPreferences {
  morningQuests: boolean
  milestones: boolean
  afternoonStatus: boolean
  reconciliation: boolean
  streaks: boolean
  levelUp: boolean
  boss: boolean
  quietHoursStart: number
  quietHoursEnd: number
}

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-system-border last:border-0">
      <div>
        <div className="text-system-text text-sm font-medium">{label}</div>
        <div className="text-system-text-muted text-xs">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`
          w-12 h-6 rounded-full transition-colors relative
          ${checked ? 'bg-system-blue' : 'bg-system-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

export function NotificationSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ preferences: NotificationPreferences }>({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const res = await api.get('/api/notifications/preferences') as Response
      if (!res.ok) throw new Error('Failed to fetch preferences')
      return res.json() as Promise<{ preferences: NotificationPreferences }>
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const res = await api.patch('/api/notifications/preferences', updates) as Response
      if (!res.ok) throw new Error('Failed to update preferences')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
      toast.success('Preferences updated')
    },
    onError: () => {
      toast.error('Failed to update preferences')
    },
  })

  const enableAllMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/notifications/enable-all') as Response
      if (!res.ok) throw new Error('Failed to enable notifications')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
      toast.success('All notifications enabled')
    },
  })

  const disableAllMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/notifications/disable-all') as Response
      if (!res.ok) throw new Error('Failed to disable notifications')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
      toast.success('All notifications disabled')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-system-text-muted text-sm">Loading preferences...</span>
      </div>
    )
  }

  const prefs = data?.preferences

  const handleUpdate = (key: keyof NotificationPreferences, value: boolean | number) => {
    updateMutation.mutate({ [key]: value })
  }

  const isUpdating = updateMutation.isPending || enableAllMutation.isPending || disableAllMutation.isPending

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => enableAllMutation.mutate()}
          disabled={isUpdating}
          className="flex-1 py-2 text-sm border border-system-blue/50 rounded text-system-blue
                     hover:bg-system-blue/10 transition-colors disabled:opacity-50"
        >
          Enable All
        </button>
        <button
          type="button"
          onClick={() => disableAllMutation.mutate()}
          disabled={isUpdating}
          className="flex-1 py-2 text-sm border border-system-border rounded text-system-text-muted
                     hover:bg-system-panel transition-colors disabled:opacity-50"
        >
          Disable All
        </button>
      </div>

      {/* Individual toggles */}
      <div className="border border-system-border rounded p-4">
        <Toggle
          label="Morning Quests"
          description="Daily objectives reminder"
          checked={prefs?.morningQuests ?? false}
          onChange={(v) => handleUpdate('morningQuests', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Milestones"
          description="Achievement and title unlocks"
          checked={prefs?.milestones ?? false}
          onChange={(v) => handleUpdate('milestones', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Afternoon Status"
          description="Progress check mid-day"
          checked={prefs?.afternoonStatus ?? false}
          onChange={(v) => handleUpdate('afternoonStatus', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Day Reconciliation"
          description="End-of-day confirmation reminder"
          checked={prefs?.reconciliation ?? false}
          onChange={(v) => handleUpdate('reconciliation', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Streak Updates"
          description="Streak milestone notifications"
          checked={prefs?.streaks ?? false}
          onChange={(v) => handleUpdate('streaks', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Level Up"
          description="Level increase notifications"
          checked={prefs?.levelUp ?? false}
          onChange={(v) => handleUpdate('levelUp', v)}
          disabled={isUpdating}
        />
        <Toggle
          label="Boss Encounters"
          description="Boss fight progress updates"
          checked={prefs?.boss ?? false}
          onChange={(v) => handleUpdate('boss', v)}
          disabled={isUpdating}
        />
      </div>

      {/* Quiet hours */}
      <div className="border border-system-border rounded p-4">
        <div className="text-system-text font-medium mb-2">Quiet Hours</div>
        <p className="text-system-text-muted text-xs mb-3">
          No notifications during these hours.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-system-text-muted text-sm">From</span>
            <select
              value={prefs?.quietHoursStart ?? 22}
              onChange={(e) => handleUpdate('quietHoursStart', parseInt(e.target.value))}
              disabled={isUpdating}
              className="bg-system-black border border-system-border rounded px-2 py-1 text-sm text-system-text"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-system-text-muted text-sm">to</span>
            <select
              value={prefs?.quietHoursEnd ?? 7}
              onChange={(e) => handleUpdate('quietHoursEnd', parseInt(e.target.value))}
              disabled={isUpdating}
              className="bg-system-black border border-system-border rounded px-2 py-1 text-sm text-system-text"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <PushNotificationSection />

      {/* Info note */}
      <p className="text-system-text-muted text-xs text-center">
        Notifications are data-only and never motivational.
      </p>
    </div>
  )
}

function PushNotificationSection() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      setIsSupported(isPushSupported())
      setPermission(getNotificationPermission())

      if (isPushSupported()) {
        const subscribed = await isPushSubscribed()
        setIsSubscribed(subscribed)
      }

      setIsLoading(false)
    }

    checkStatus()
  }, [])

  const handleSubscribe = async () => {
    setIsProcessing(true)

    try {
      const success = await subscribeToPush()

      if (success) {
        setIsSubscribed(true)
        setPermission(getNotificationPermission())
        toast.success('Push notifications enabled')
      } else {
        toast.error('Failed to enable push notifications')
      }
    } catch (error) {
      toast.error('Push notification error')
    }

    setIsProcessing(false)
  }

  const handleUnsubscribe = async () => {
    setIsProcessing(true)

    try {
      const success = await unsubscribeFromPush()

      if (success) {
        setIsSubscribed(false)
        toast.system('Push notifications disabled')
      } else {
        toast.error('Failed to disable push notifications')
      }
    } catch (error) {
      toast.error('Push notification error')
    }

    setIsProcessing(false)
  }

  if (isLoading) {
    return null
  }

  if (!isSupported) {
    return (
      <div className="border border-system-border rounded p-4">
        <div className="text-system-text font-medium mb-2">Push Notifications</div>
        <p className="text-system-text-muted text-xs">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="border border-system-border rounded p-4">
        <div className="text-system-text font-medium mb-2">Push Notifications</div>
        <p className="text-system-text-muted text-xs">
          Notification permission was denied. Enable in browser settings to receive push notifications.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-system-border rounded p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-system-text font-medium">Push Notifications</div>
          <p className="text-system-text-muted text-xs mt-1">
            {isSubscribed
              ? 'Receive notifications even when the app is closed.'
              : 'Enable browser push notifications for reminders.'}
          </p>
        </div>

        <button
          type="button"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isProcessing}
          className={`
            px-4 py-2 text-sm rounded transition-colors
            ${isSubscribed
              ? 'border border-system-border text-system-text-muted hover:bg-system-panel'
              : 'border border-system-blue/50 text-system-blue hover:bg-system-blue/10'
            }
            disabled:opacity-50
          `}
        >
          {isProcessing ? '...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>

      {isSubscribed && (
        <div className="mt-3 flex items-center gap-2 text-xs text-system-green">
          <span className="w-2 h-2 bg-system-green rounded-full" />
          Push notifications active
        </div>
      )}
    </div>
  )
}
