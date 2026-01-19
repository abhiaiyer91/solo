/**
 * Camera hook for managing camera permissions and state
 * Uses expo-camera for barcode scanning and photo capture
 */

import { useState, useCallback, useRef } from 'react'
import { useCameraPermissions, CameraView, CameraType, FlashMode } from 'expo-camera'
import { formatPermissionStatus, isPermanentlyDenied, openSettings, PermissionStatus } from '../lib/permissions'

export interface CameraState {
  facing: CameraType
  flash: FlashMode
  isReady: boolean
}

export interface UseCameraResult {
  // Permission state
  permissionStatus: PermissionStatus
  isPermanentlyDenied: boolean
  requestPermission: () => Promise<void>
  openAppSettings: () => Promise<void>

  // Camera state
  facing: CameraType
  flash: FlashMode
  isReady: boolean

  // Camera controls
  toggleFacing: () => void
  toggleFlash: () => void
  setReady: (ready: boolean) => void

  // Camera ref
  cameraRef: React.RefObject<CameraView>

  // Photo capture
  takePicture: () => Promise<string | null>
}

export function useCamera(): UseCameraResult {
  const [permission, requestPermissionAsync] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<FlashMode>('off')
  const [isReady, setReady] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  // Format permission status
  const permissionStatus: PermissionStatus = permission
    ? formatPermissionStatus(permission.granted, permission.canAskAgain)
    : 'undetermined'

  const permanentlyDenied = permission
    ? isPermanentlyDenied(permission.canAskAgain, permission.granted)
    : false

  // Request permission
  const requestPermission = useCallback(async () => {
    await requestPermissionAsync()
  }, [requestPermissionAsync])

  // Open app settings
  const openAppSettings = useCallback(async () => {
    await openSettings()
  }, [])

  // Toggle camera facing
  const toggleFacing = useCallback(() => {
    setFacing(current => current === 'back' ? 'front' : 'back')
  }, [])

  // Toggle flash
  const toggleFlash = useCallback(() => {
    setFlash(current => current === 'off' ? 'on' : 'off')
  }, [])

  // Take a picture
  const takePicture = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || !isReady) {
      return null
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      })
      return photo?.uri ?? null
    } catch (error) {
      console.error('Failed to take picture:', error)
      return null
    }
  }, [isReady])

  return {
    permissionStatus,
    isPermanentlyDenied: permanentlyDenied,
    requestPermission,
    openAppSettings,
    facing,
    flash,
    isReady,
    toggleFacing,
    toggleFlash,
    setReady,
    cameraRef,
    takePicture,
  }
}

/**
 * Barcode types supported for food scanning
 */
export const FOOD_BARCODE_TYPES = [
  'ean13',    // Most common for food (EU/international)
  'ean8',     // Compact barcodes
  'upc_a',    // US products
  'upc_e',    // Compact US barcodes
  'qr',       // Some products use QR codes
] as const

export type FoodBarcodeType = typeof FOOD_BARCODE_TYPES[number]
