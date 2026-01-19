/**
 * ScanScreen - Full barcode scanning screen
 * Combines camera, product result, and history into a complete flow
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { ProductResult, ProductNotFound } from '../components/ProductResult'
import { ScanHistory, RecentScansBar } from '../components/ScanHistory'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface ScanScreenProps {
  onClose: () => void
  onLogSuccess?: () => void
}

/**
 * Complete barcode scanning screen
 */
export function ScanScreen({ onClose, onLogSuccess }: ScanScreenProps) {
  const {
    state,
    handleBarcodeScan,
    logProduct,
    resetScanner,
    isLogging,
  } = useBarcodeScanner()

  const [showHistory, setShowHistory] = useState(false)

  // Handle barcode scan result
  const onScan = useCallback((barcode: string) => {
    handleBarcodeScan(barcode)
  }, [handleBarcodeScan])

  // Handle logging product
  const handleLog = useCallback(async (mealType: MealType, servings: number) => {
    await logProduct(mealType, servings)
    onLogSuccess?.()

    // Show success and reset after delay
    Alert.alert(
      'Logged!',
      'Food added to your nutrition log.',
      [
        {
          text: 'Scan Another',
          onPress: resetScanner,
        },
        {
          text: 'Done',
          onPress: onClose,
          style: 'cancel',
        },
      ]
    )
  }, [logProduct, onLogSuccess, resetScanner, onClose])

  // Handle scan another
  const handleScanAnother = useCallback(() => {
    resetScanner()
  }, [resetScanner])

  // Handle manual entry (would navigate to manual entry form)
  const handleManualEntry = useCallback(() => {
    Alert.alert(
      'Manual Entry',
      'Manual nutrition entry coming soon!',
      [{ text: 'OK' }]
    )
  }, [])

  // Handle selecting from history
  const handleSelectFromHistory = useCallback((product: BarcodeProduct) => {
    setShowHistory(false)
    // Simulate finding the product
    handleBarcodeScan(product.barcode)
  }, [handleBarcodeScan])

  // Render based on scanner state
  const renderContent = () => {
    switch (state.status) {
      case 'scanning':
      case 'loading':
        return (
          <View style={styles.container}>
            {/* Recent scans bar */}
            <RecentScansBar onSelectProduct={handleSelectFromHistory} />

            {/* Camera */}
            <BarcodeScanner
              onScan={onScan}
              onClose={onClose}
            />
          </View>
        )

      case 'found':
        return (
          <ProductResult
            product={state.product}
            onLog={handleLog}
            onScanAnother={handleScanAnother}
            onManualEntry={handleManualEntry}
            isLogging={isLogging}
          />
        )

      case 'not_found':
        return (
          <ProductNotFound
            barcode={state.barcode}
            onScanAnother={handleScanAnother}
            onManualEntry={handleManualEntry}
          />
        )

      case 'error':
        return (
          <ProductNotFound
            barcode={state.barcode}
            onScanAnother={handleScanAnother}
            onManualEntry={handleManualEntry}
          />
        )

      case 'logged':
        // This state is brief - we show alert and transition
        return (
          <ProductResult
            product={state.product}
            onLog={handleLog}
            onScanAnother={handleScanAnother}
            onManualEntry={handleManualEntry}
            isLogging={false}
          />
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      {renderContent()}

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <ScanHistory
          onSelectProduct={handleSelectFromHistory}
        />
      </Modal>
    </View>
  )
}

/**
 * Compact scanner modal for embedding
 */
export function ScanModal({
  visible,
  onClose,
  onLogSuccess,
}: {
  visible: boolean
  onClose: () => void
  onLogSuccess?: () => void
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <ScanScreen
        onClose={onClose}
        onLogSuccess={onLogSuccess}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
})
