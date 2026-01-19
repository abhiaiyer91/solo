/**
 * ScanModeToggle - Toggle between Barcode and Photo scanning modes
 * Animated toggle with sliding indicator
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

export type ScanMode = 'barcode' | 'photo'

interface ScanModeToggleProps {
  mode: ScanMode
  onModeChange: (mode: ScanMode) => void
  disabled?: boolean
}

/**
 * Animated mode toggle for scanning
 */
export function ScanModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: ScanModeToggleProps) {
  const indicatorPosition = useSharedValue(mode === 'barcode' ? 0 : 1)

  // Update position when mode changes
  React.useEffect(() => {
    indicatorPosition.value = withSpring(mode === 'barcode' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    })
  }, [mode, indicatorPosition])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(indicatorPosition.value * 120, { duration: 200 }),
      },
    ],
  }))

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Sliding indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {/* Barcode option */}
      <Pressable
        style={styles.option}
        onPress={() => onModeChange('barcode')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Barcode scanning mode"
        accessibilityState={{ selected: mode === 'barcode' }}
      >
        <Text style={styles.optionIcon}>▮▯</Text>
        <Text style={[
          styles.optionText,
          mode === 'barcode' && styles.optionTextSelected,
        ]}>
          Barcode
        </Text>
      </Pressable>

      {/* Photo option */}
      <Pressable
        style={styles.option}
        onPress={() => onModeChange('photo')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Photo scanning mode"
        accessibilityState={{ selected: mode === 'photo' }}
      >
        <Text style={styles.optionIcon}>📷</Text>
        <Text style={[
          styles.optionText,
          mode === 'photo' && styles.optionTextSelected,
        ]}>
          Photo
        </Text>
      </Pressable>
    </View>
  )
}

/**
 * Compact inline toggle for tight spaces
 */
export function ScanModeToggleCompact({
  mode,
  onModeChange,
}: ScanModeToggleProps) {
  return (
    <View style={styles.compactContainer}>
      <Pressable
        style={[styles.compactOption, mode === 'barcode' && styles.compactOptionSelected]}
        onPress={() => onModeChange('barcode')}
      >
        <Text style={[styles.compactText, mode === 'barcode' && styles.compactTextSelected]}>
          ▮▯
        </Text>
      </Pressable>
      <Pressable
        style={[styles.compactOption, mode === 'photo' && styles.compactOptionSelected]}
        onPress={() => onModeChange('photo')}
      >
        <Text style={[styles.compactText, mode === 'photo' && styles.compactTextSelected]}>
          📷
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 120,
    height: 44,
    backgroundColor: '#00FF00',
    borderRadius: 10,
  },
  option: {
    width: 120,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
  },
  optionIcon: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#888',
  },
  optionTextSelected: {
    color: '#000',
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  compactOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactOptionSelected: {
    backgroundColor: '#00FF00',
  },
  compactText: {
    fontSize: 16,
  },
  compactTextSelected: {
    opacity: 1,
  },
})
