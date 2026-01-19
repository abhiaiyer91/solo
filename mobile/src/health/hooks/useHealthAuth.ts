/**
 * useHealthAuth - Hook for managing HealthKit authorization
 */

import { useState, useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import type { HealthAuthStatus } from '../types'
import { isHealthKitAvailable, requestHealthKitAuthorization } from '../providers/healthkit'

interface UseHealthAuthResult {
  status: HealthAuthStatus
  isLoading: boolean
  isAvailable: boolean
  isAuthorized: boolean
  isDenied: boolean
  needsRequest: boolean
  error: string | null
  requestAuth: () => Promise<void>
  checkStatus: () => Promise<void>
}

export function useHealthAuth(): UseHealthAuthResult {
  const [status, setStatus] = useState<HealthAuthStatus>('notDetermined')
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check availability and initial status on mount
  useEffect(() => {
    async function checkAvailability() {
      try {
        // Only available on iOS
        if (Platform.OS !== 'ios') {
          setIsAvailable(false)
          setIsLoading(false)
          return
        }

        const available = await isHealthKitAvailable()
        setIsAvailable(available)
        
        if (!available) {
          setError('HealthKit is not available on this device')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check HealthKit availability')
      } finally {
        setIsLoading(false)
      }
    }

    checkAvailability()
  }, [])

  // Request authorization
  const requestAuth = useCallback(async () => {
    if (!isAvailable) {
      setError('HealthKit is not available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await requestHealthKitAuthorization()
      setStatus(result.status)
      
      if (!result.granted) {
        setError('Health access was not granted. Please enable in Settings > Health.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request authorization')
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable])

  // Check current status
  const checkStatus = useCallback(async () => {
    if (!isAvailable) return

    setIsLoading(true)
    try {
      // In real implementation, this would query actual auth status
      // For now, we just re-check availability
      const available = await isHealthKitAvailable()
      setIsAvailable(available)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status')
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable])

  return {
    status,
    isLoading,
    isAvailable,
    isAuthorized: status === 'sharingAuthorized',
    isDenied: status === 'sharingDenied',
    needsRequest: status === 'notDetermined',
    error,
    requestAuth,
    checkStatus,
  }
}

/**
 * Hook to handle the initial health permission flow
 */
export function useHealthOnboarding() {
  const auth = useHealthAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  const completeOnboarding = useCallback(async () => {
    if (auth.needsRequest) {
      await auth.requestAuth()
    }
    setHasCompletedOnboarding(true)
  }, [auth])

  const skipOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true)
  }, [])

  return {
    ...auth,
    hasCompletedOnboarding,
    completeOnboarding,
    skipOnboarding,
  }
}
