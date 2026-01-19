/**
 * PortionAdjuster - Portion size control for detected foods
 * Quick presets and fine-grained adjustment
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
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface PortionAdjusterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

/**
 * Preset portion options
 */
const PORTION_PRESETS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
]

/**
 * Main portion adjuster with presets and stepper
 */
export function PortionAdjuster({
  value,
  onChange,
  min = 0.25,
  max = 5,
  step = 0.25,
  disabled = false,
}: PortionAdjusterProps) {
  const handlePreset = (presetValue: number) => {
    if (disabled) return
    Haptics.selectionAsync()
    onChange(presetValue)
  }

  const handleIncrement = () => {
    if (disabled) return
    const newValue = Math.min(max, value + step)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(newValue)
  }

  const handleDecrement = () => {
    if (disabled) return
    const newValue = Math.max(min, value - step)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(newValue)
  }

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Preset buttons */}
      <View style={styles.presets}>
        {PORTION_PRESETS.map(preset => (
          <Pressable
            key={preset.value}
            style={[
              styles.presetButton,
              value === preset.value && styles.presetButtonActive,
            ]}
            onPress={() => handlePreset(preset.value)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.presetText,
                value === preset.value && styles.presetTextActive,
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Fine-grained stepper */}
      <View style={styles.stepper}>
        <Pressable
          style={[styles.stepButton, value <= min && styles.stepButtonDisabled]}
          onPress={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value.toFixed(2)}x</Text>
        </View>

        <Pressable
          style={[styles.stepButton, value >= max && styles.stepButtonDisabled]}
          onPress={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Compact portion control for inline use
 */
export function PortionAdjusterCompact({
  value,
  onChange,
  min = 0.25,
  max = 5,
  step = 0.5,
  disabled = false,
}: PortionAdjusterProps) {
  const scale = useSharedValue(1)

  const handleIncrement = () => {
    if (disabled || value >= max) return
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1)
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(Math.min(max, value + step))
  }

  const handleDecrement = () => {
    if (disabled || value <= min) return
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1)
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(Math.max(min, value - step))
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View style={[styles.compactContainer, disabled && styles.containerDisabled]}>
      <Pressable
        style={[styles.compactButton, value <= min && styles.stepButtonDisabled]}
        onPress={handleDecrement}
        disabled={disabled || value <= min}
      >
        <Text style={styles.compactButtonText}>−</Text>
      </Pressable>

      <Animated.View style={[styles.compactValue, animatedStyle]}>
        <Text style={styles.compactValueText}>
          {value === 1 ? '1' : value.toFixed(1)}
        </Text>
      </Animated.View>

      <Pressable
        style={[styles.compactButton, value >= max && styles.stepButtonDisabled]}
        onPress={handleIncrement}
        disabled={disabled || value >= max}
      >
        <Text style={styles.compactButtonText}>+</Text>
      </Pressable>
    </View>
  )
}

/**
 * Simple serving label dropdown placeholder
 */
export function PortionLabel({
  value,
  servingSize,
  onPress,
}: {
  value: number
  servingSize: string
  onPress?: () => void
}) {
  const displayValue = value === 1 ? '1 serving' : `${value} servings`

  return (
    <Pressable
      style={styles.labelContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.labelText}>{displayValue}</Text>
      <Text style={styles.labelSubtext}>{servingSize}</Text>
      {onPress && <Text style={styles.labelArrow}>▼</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  presetText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  presetTextActive: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  stepButtonText: {
    fontSize: 24,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  valueContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  compactValue: {
    minWidth: 40,
    alignItems: 'center',
  },
  compactValueText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  labelText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  labelSubtext: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  labelArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 'auto',
  },
})
