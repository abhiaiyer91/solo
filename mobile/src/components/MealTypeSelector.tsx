/**
 * MealTypeSelector - Quick meal type picker
 * Animated selection with time-based defaults
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface MealTypeSelectorProps {
  selected: MealType
  onSelect: (type: MealType) => void
  disabled?: boolean
}

const MEAL_CONFIG: Record<MealType, { emoji: string; label: string; hours: [number, number] }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast', hours: [5, 11] },
  lunch: { emoji: '☀️', label: 'Lunch', hours: [11, 15] },
  dinner: { emoji: '🌙', label: 'Dinner', hours: [15, 21] },
  snack: { emoji: '🍎', label: 'Snack', hours: [0, 24] },
}

/**
 * Full meal type selector with all options
 */
export function MealTypeSelector({
  selected,
  onSelect,
  disabled = false,
}: MealTypeSelectorProps) {
  const handleSelect = (type: MealType) => {
    if (disabled) return
    Haptics.selectionAsync()
    onSelect(type)
  }

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {Object.entries(MEAL_CONFIG).map(([type, config]) => (
        <MealTypeButton
          key={type}
          type={type as MealType}
          config={config}
          isSelected={selected === type}
          onPress={() => handleSelect(type as MealType)}
        />
      ))}
    </View>
  )
}

/**
 * Individual meal type button
 */
function MealTypeButton({
  type,
  config,
  isSelected,
  onPress,
}: {
  type: MealType
  config: typeof MEAL_CONFIG[MealType]
  isSelected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.button,
          isSelected && styles.buttonSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

/**
 * Compact horizontal selector
 */
export function MealTypeSelectorCompact({
  selected,
  onSelect,
}: MealTypeSelectorProps) {
  return (
    <View style={styles.compactContainer}>
      {Object.entries(MEAL_CONFIG).map(([type, config]) => (
        <Pressable
          key={type}
          style={[
            styles.compactButton,
            selected === type && styles.compactButtonSelected,
          ]}
          onPress={() => {
            Haptics.selectionAsync()
            onSelect(type as MealType)
          }}
        >
          <Text style={styles.compactEmoji}>{config.emoji}</Text>
        </Pressable>
      ))}
    </View>
  )
}

/**
 * Quick add button - single button for most likely meal
 */
export function QuickAddMealButton({
  onPress,
  mealType,
  isLoading = false,
}: {
  onPress: () => void
  mealType: MealType
  isLoading?: boolean
}) {
  const config = MEAL_CONFIG[mealType]

  return (
    <Pressable
      style={[styles.quickAddButton, isLoading && styles.quickAddButtonDisabled]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Text style={styles.quickAddEmoji}>{config.emoji}</Text>
      <Text style={styles.quickAddText}>
        {isLoading ? 'Adding...' : `Add to ${config.label}`}
      </Text>
    </Pressable>
  )
}

/**
 * Get default meal type based on current time
 */
export function getDefaultMealType(): MealType {
  const hour = new Date().getHours()

  for (const [type, config] of Object.entries(MEAL_CONFIG)) {
    if (type === 'snack') continue // Skip snack as default
    const [start, end] = config.hours
    if (hour >= start && hour < end) {
      return type as MealType
    }
  }

  return 'snack'
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    gap: 4,
  },
  buttonSelected: {
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
  },
  labelSelected: {
    color: '#00FF00',
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonSelected: {
    backgroundColor: '#00FF00',
  },
  compactEmoji: {
    fontSize: 24,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  quickAddButtonDisabled: {
    opacity: 0.6,
  },
  quickAddEmoji: {
    fontSize: 20,
  },
  quickAddText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
})
