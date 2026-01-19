/**
 * useBarcodeScanner - Hook for managing barcode scanner state
 * Handles scanning flow, product lookup, and logging
 */

import { useState, useCallback, useRef } from 'react'
import { useBarcodeLookup, useLogScannedFood, type BarcodeProduct } from './useBarcodeLookup'
import { useScanHistory } from './useScanHistory'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type ScannerState =
  | { status: 'scanning' }
  | { status: 'loading'; barcode: string }
  | { status: 'found'; product: BarcodeProduct; barcode: string }
  | { status: 'not_found'; barcode: string }
  | { status: 'error'; error: string; barcode: string }
  | { status: 'logged'; product: BarcodeProduct }

export interface UseBarcodesScannerResult {
  state: ScannerState
  isScanning: boolean
  isLoading: boolean
  lastScannedBarcode: string | null

  // Actions
  handleBarcodeScan: (barcode: string) => Promise<void>
  logProduct: (mealType: MealType, servings: number) => Promise<void>
  resetScanner: () => void

  // Logging state
  isLogging: boolean
}

/**
 * Hook for managing the complete barcode scanning flow
 */
export function useBarcodeScanner(): UseBarcodesScannerResult {
  const [state, setState] = useState<ScannerState>({ status: 'scanning' })
  const [isLogging, setIsLogging] = useState(false)
  const lastScannedRef = useRef<string | null>(null)
  const scanCooldownRef = useRef<boolean>(false)

  const barcodeLookup = useBarcodeLookup()
  const logScannedFood = useLogScannedFood()
  const { addToHistory } = useScanHistory()

  // Handle barcode detection
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    // Prevent duplicate scans
    if (scanCooldownRef.current) return
    if (lastScannedRef.current === barcode) return

    lastScannedRef.current = barcode
    scanCooldownRef.current = true

    // Reset cooldown after delay
    setTimeout(() => {
      scanCooldownRef.current = false
    }, 2000)

    setState({ status: 'loading', barcode })

    try {
      const result = await barcodeLookup.mutateAsync(barcode)

      if (result.found && result.product) {
        setState({ status: 'found', product: result.product, barcode })

        // Add to scan history
        addToHistory({
          barcode,
          product: result.product,
          scannedAt: new Date().toISOString(),
        })
      } else {
        setState({ status: 'not_found', barcode })
      }
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to lookup product',
        barcode,
      })
    }
  }, [barcodeLookup, addToHistory])

  // Log the current product
  const logProduct = useCallback(async (mealType: MealType, servings: number) => {
    if (state.status !== 'found') return

    setIsLogging(true)

    try {
      await logScannedFood.mutateAsync({
        mealType,
        product: state.product,
        servings,
      })

      setState({ status: 'logged', product: state.product })
    } catch (error) {
      console.error('Failed to log product:', error)
    } finally {
      setIsLogging(false)
    }
  }, [state, logScannedFood])

  // Reset to scanning state
  const resetScanner = useCallback(() => {
    lastScannedRef.current = null
    setState({ status: 'scanning' })
  }, [])

  return {
    state,
    isScanning: state.status === 'scanning',
    isLoading: state.status === 'loading',
    lastScannedBarcode: lastScannedRef.current,
    handleBarcodeScan,
    logProduct,
    resetScanner,
    isLogging,
  }
}

/**
 * Get time-appropriate default meal type
 */
export function getDefaultMealType(): MealType {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 20) return 'dinner'
  return 'snack'
}
