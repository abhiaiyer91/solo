/**
 * useScanHistory - Hook for managing barcode scan history
 * Persists recent scans using AsyncStorage with LRU eviction
 */

import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { BarcodeProduct } from './useBarcodeLookup'

const HISTORY_KEY = '@journey/barcode_scan_history'
const MAX_HISTORY = 20

export interface ScanHistoryItem {
  barcode: string
  product: BarcodeProduct
  scannedAt: string
}

export interface UseScanHistoryResult {
  history: ScanHistoryItem[]
  isLoading: boolean
  addToHistory: (item: ScanHistoryItem) => Promise<void>
  removeFromHistory: (barcode: string) => Promise<void>
  clearHistory: () => Promise<void>
  getProductByBarcode: (barcode: string) => BarcodeProduct | undefined
}

/**
 * Hook for managing scan history with persistence
 */
export function useScanHistory(): UseScanHistoryResult {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ScanHistoryItem[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Failed to load scan history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveHistory = async (items: ScanHistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save scan history:', error)
    }
  }

  // Add item to history (LRU - move to front if exists)
  const addToHistory = useCallback(async (item: ScanHistoryItem) => {
    setHistory((current) => {
      // Remove existing entry with same barcode
      const filtered = current.filter((h) => h.barcode !== item.barcode)

      // Add new item at front
      const updated = [item, ...filtered]

      // Limit to max history size
      const limited = updated.slice(0, MAX_HISTORY)

      // Persist async
      saveHistory(limited)

      return limited
    })
  }, [])

  // Remove item from history
  const removeFromHistory = useCallback(async (barcode: string) => {
    setHistory((current) => {
      const updated = current.filter((h) => h.barcode !== barcode)
      saveHistory(updated)
      return updated
    })
  }, [])

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY)
      setHistory([])
    } catch (error) {
      console.error('Failed to clear scan history:', error)
    }
  }, [])

  // Get product from history by barcode
  const getProductByBarcode = useCallback((barcode: string): BarcodeProduct | undefined => {
    const item = history.find((h) => h.barcode === barcode)
    return item?.product
  }, [history])

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getProductByBarcode,
  }
}

/**
 * Format relative time for display
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
