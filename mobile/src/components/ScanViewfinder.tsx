/**
 * ScanViewfinder - Camera overlay with scanning guidelines
 * Animated viewfinder for barcode and photo scanning
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated'
import type { ScanMode } from './ScanModeToggle'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const VIEWFINDER_WIDTH = SCREEN_WIDTH * 0.75
const VIEWFINDER_HEIGHT_BARCODE = 180
const VIEWFINDER_HEIGHT_PHOTO = SCREEN_WIDTH * 0.75

interface ScanViewfinderProps {
  mode: ScanMode
  isScanning: boolean
  showSuccess?: boolean
  instruction?: string
}

/**
 * Animated viewfinder overlay for scanning
 */
export function ScanViewfinder({
  mode,
  isScanning,
  showSuccess = false,
  instruction,
}: ScanViewfinderProps) {
  const scanLinePosition = useSharedValue(0)
  const pulseScale = useSharedValue(1)

  // Animate scan line for barcode mode
  React.useEffect(() => {
    if (mode === 'barcode' && isScanning && !showSuccess) {
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    } else {
      scanLinePosition.value = withTiming(0.5, { duration: 200 })
    }
  }, [mode, isScanning, showSuccess, scanLinePosition])

  // Pulse animation for photo mode
  React.useEffect(() => {
    if (mode === 'photo' && isScanning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      )
    } else {
      pulseScale.value = withTiming(1, { duration: 200 })
    }
  }, [mode, isScanning, pulseScale])

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePosition.value * 100}%`,
  }))

  const photoFrameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const height = mode === 'barcode' ? VIEWFINDER_HEIGHT_BARCODE : VIEWFINDER_HEIGHT_PHOTO

  return (
    <View style={styles.container}>
      {/* Dark overlay with cutout */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={styles.overlaySection} />

        {/* Middle section with viewfinder */}
        <View style={styles.middleSection}>
          <View style={styles.sideOverlay} />

          {/* Viewfinder cutout */}
          <Animated.View
            style={[
              styles.viewfinder,
              { width: VIEWFINDER_WIDTH, height },
              mode === 'photo' && photoFrameStyle,
              showSuccess && styles.viewfinderSuccess,
            ]}
          >
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line for barcode mode */}
            {mode === 'barcode' && isScanning && !showSuccess && (
              <Animated.View style={[styles.scanLine, scanLineStyle]} />
            )}

            {/* Success checkmark */}
            {showSuccess && (
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            )}

            {/* Photo mode grid */}
            {mode === 'photo' && !showSuccess && (
              <View style={styles.photoGrid}>
                <View style={styles.gridLineH} />
                <View style={styles.gridLineH2} />
                <View style={styles.gridLineV} />
                <View style={styles.gridLineV2} />
              </View>
            )}
          </Animated.View>

          <View style={styles.sideOverlay} />
        </View>

        {/* Bottom overlay with instruction */}
        <View style={styles.overlaySection}>
          <Text style={styles.instruction}>
            {instruction || getDefaultInstruction(mode, showSuccess)}
          </Text>
        </View>
      </View>
    </View>
  )
}

function getDefaultInstruction(mode: ScanMode, showSuccess: boolean): string {
  if (showSuccess) return 'Product detected!'
  if (mode === 'barcode') return 'Position barcode within frame'
  return 'Center food in frame and take photo'
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  middleSection: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  viewfinder: {
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  viewfinderSuccess: {
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF00',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  successIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  successIconText: {
    fontSize: 60,
    color: '#00FF00',
  },
  photoGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  gridLineH: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFF',
  },
  gridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFF',
  },
  gridLineV: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFF',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFF',
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
})
