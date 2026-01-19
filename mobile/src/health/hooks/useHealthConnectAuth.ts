/**
 * Health Connect Authorization Hook
 * 
 * Manages Android Health Connect permissions state and authorization flow.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  isHealthConnectAvailable,
  requestHealthConnectAuthorization,
  getHealthConnectAuthorizationStatus,
  openHealthConnectSettings,
  type HealthConnectPermission,
  HEALTH_CONNECT_PERMISSIONS,
} from '../providers/healthconnect'

export type HealthConnectAuthStatus = 'loading' | 'unavailable' | 'notDetermined' | 'authorized' | 'denied'

export interface UseHealthConnectAuthReturn {
  /** Current authorization status */
  status: HealthConnectAuthStatus
  
  /** Whether Health Connect is available on this device */
  isAvailable: boolean
  
  /** Whether we have authorization to read health data */
  isAuthorized: boolean
  
  /** Individual permission statuses */
  permissions: Record<HealthConnectPermission, boolean>
  
  /** Request authorization from the user */
  requestAuthorization: () => Promise<boolean>
  
  /** Open Health Connect settings */
  openSettings: () => Promise<void>
  
  /** Refresh authorization status */
  refresh: () => Promise<void>
  
  /** Whether a request is in progress */
  isLoading: boolean
  
  /** Error message if authorization failed */
  error: string | null
}

/**
 * Hook to manage Health Connect authorization
 */
export function useHealthConnectAuth(): UseHealthConnectAuthReturn {
  const [status, setStatus] = useState<HealthConnectAuthStatus>('loading')
  const [isAvailable, setIsAvailable] = useState(false)
  const [permissions, setPermissions] = useState<Record<HealthConnectPermission, boolean>>(
    HEALTH_CONNECT_PERMISSIONS.reduce((acc, p) => {
      acc[p] = false
      return acc
    }, {} as Record<HealthConnectPermission, boolean>)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check availability and status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if Health Connect is available
      const available = await isHealthConnectAvailable()
      setIsAvailable(available)
      
      if (!available) {
        setStatus('unavailable')
        setIsLoading(false)
        return
      }
      
      // Check authorization status
      const authStatus = await getHealthConnectAuthorizationStatus()
      setPermissions(authStatus.permissions)
      
      switch (authStatus.status) {
        case 'authorized':
          setStatus('authorized')
          break
        case 'denied':
          setStatus('denied')
          break
        default:
          setStatus('notDetermined')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check Health Connect status')
      setStatus('unavailable')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Health Connect is not available on this device')
      return false
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await requestHealthConnectAuthorization()
      setPermissions(result.permissions)
      
      if (result.granted) {
        setStatus('authorized')
        return true
      } else {
        setStatus('denied')
        return false
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request authorization')
      setStatus('denied')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable])

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await openHealthConnectSettings()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open Health Connect settings')
    }
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    await checkStatus()
  }, [checkStatus])

  return {
    status,
    isAvailable,
    isAuthorized: status === 'authorized',
    permissions,
    requestAuthorization,
    openSettings,
    refresh,
    isLoading,
    error,
  }
}
