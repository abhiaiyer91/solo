/**
 * Health store - Manages health permission and sync state
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { HealthAuthStatus, HealthData, HealthSyncResult } from '../health/types'

interface HealthState {
  // Permission state
  authStatus: HealthAuthStatus
  hasRequestedPermission: boolean
  isSkippedManualMode: boolean
  
  // Sync state
  lastSyncTime: Date | null
  syncStatus: 'idle' | 'syncing' | 'error'
  syncError: string | null
  
  // Current data
  currentData: HealthData | null
  lastSyncResult: HealthSyncResult | null
  
  // Actions
  setAuthStatus: (status: HealthAuthStatus) => void
  setPermissionRequested: () => void
  skipToManualMode: () => void
  setSyncing: () => void
  setSyncSuccess: (data: HealthData, result: HealthSyncResult) => void
  setSyncError: (error: string) => void
  clearSyncError: () => void
  reset: () => void
}

const initialState = {
  authStatus: 'notDetermined' as HealthAuthStatus,
  hasRequestedPermission: false,
  isSkippedManualMode: false,
  lastSyncTime: null,
  syncStatus: 'idle' as const,
  syncError: null,
  currentData: null,
  lastSyncResult: null,
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuthStatus: (status) =>
        set({ authStatus: status }),

      setPermissionRequested: () =>
        set({ hasRequestedPermission: true }),

      skipToManualMode: () =>
        set({ isSkippedManualMode: true, hasRequestedPermission: true }),

      setSyncing: () =>
        set({ syncStatus: 'syncing', syncError: null }),

      setSyncSuccess: (data, result) =>
        set({
          syncStatus: 'idle',
          currentData: data,
          lastSyncResult: result,
          lastSyncTime: new Date(),
          syncError: null,
        }),

      setSyncError: (error) =>
        set({ syncStatus: 'error', syncError: error }),

      clearSyncError: () =>
        set({ syncError: null, syncStatus: 'idle' }),

      reset: () => set(initialState),
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authStatus: state.authStatus,
        hasRequestedPermission: state.hasRequestedPermission,
        isSkippedManualMode: state.isSkippedManualMode,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
)

/**
 * Selectors
 */
export const selectIsHealthEnabled = (state: HealthState) =>
  state.authStatus === 'sharingAuthorized' && !state.isSkippedManualMode

export const selectNeedsPermissionRequest = (state: HealthState) =>
  !state.hasRequestedPermission && state.authStatus === 'notDetermined'

export const selectIsManualMode = (state: HealthState) =>
  state.isSkippedManualMode || state.authStatus === 'sharingDenied'
