/**
 * ServingSelector - Serving size picker for nutrition logging
 */

import React from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native'

export interface ServingSize {
  label: string
  multiplier: number
}

interface ServingSelectorProps {
  value: number
  onChange: (servings: number) => void
  servingSize: string
  presets?: ServingSize[]
}

const DEFAULT_PRESETS: ServingSize[] = [
  { label: '0.5', multiplier: 0.5 },
  { label: '1', multiplier: 1 },
  { label: '1.5', multiplier: 1.5 },
  { label: '2', multiplier: 2 },
]

/**
 * Serving size selector with presets and custom input
 */
export function ServingSelector({
  value,
  onChange,
  servingSize,
  presets = DEFAULT_PRESETS,
}: ServingSelectorProps) {
  const [isCustom, setIsCustom] = React.useState(false)
  const [customValue, setCustomValue] = React.useState('')

  const handlePresetSelect = (multiplier: number) => {
    setIsCustom(false)
    onChange(multiplier)
  }

  const handleCustomToggle = () => {
    setIsCustom(true)
    setCustomValue(value.toString())
  }

  const handleCustomChange = (text: string) => {
    setCustomValue(text)
    const parsed = parseFloat(text)
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed)
    }
  }

  const isPresetSelected = (multiplier: number) => {
    return !isCustom && Math.abs(value - multiplier) < 0.01
  }

  return (
    <View style={styles.container}>
      {/* Presets Row */}
      <View style={styles.presetsRow}>
        {presets.map((preset) => (
          <Pressable
            key={preset.label}
            style={[
              styles.presetButton,
              isPresetSelected(preset.multiplier) && styles.presetButtonSelected,
            ]}
            onPress={() => handlePresetSelect(preset.multiplier)}
          >
            <Text style={[
              styles.presetButtonText,
              isPresetSelected(preset.multiplier) && styles.presetButtonTextSelected,
            ]}>
              {preset.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.presetButton, isCustom && styles.presetButtonSelected]}
          onPress={handleCustomToggle}
        >
          <Text style={[styles.presetButtonText, isCustom && styles.presetButtonTextSelected]}>
            Custom
          </Text>
        </Pressable>
      </View>

      {/* Custom Input */}
      {isCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customValue}
            onChangeText={handleCustomChange}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor="#666"
            autoFocus
          />
          <Text style={styles.servingLabel}>x {servingSize}</Text>
        </View>
      )}

      {/* Current Selection Display */}
      <View style={styles.currentSelection}>
        <Text style={styles.currentValue}>
          {value} x {servingSize}
        </Text>
      </View>
    </View>
  )
}

/**
 * Compact serving adjuster with +/- buttons
 */
export function ServingAdjuster({
  value,
  onChange,
  min = 0.5,
  max = 10,
  step = 0.5,
}: {
  value: number
  onChange: (servings: number) => void
  min?: number
  max?: number
  step?: number
}) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(Math.round(newValue * 10) / 10)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(Math.round(newValue * 10) / 10)
  }

  return (
    <View style={styles.adjusterContainer}>
      <Pressable
        style={[styles.adjusterButton, value <= min && styles.adjusterButtonDisabled]}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Text style={styles.adjusterButtonText}>-</Text>
      </Pressable>

      <View style={styles.adjusterValue}>
        <Text style={styles.adjusterValueText}>{value}</Text>
      </View>

      <Pressable
        style={[styles.adjusterButton, value >= max && styles.adjusterButtonDisabled]}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Text style={styles.adjusterButtonText}>+</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  presetButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  presetButtonTextSelected: {
    color: '#00FF00',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInput: {
    flex: 0,
    width: 80,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
    textAlign: 'center',
  },
  servingLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  currentSelection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  currentValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
  },
  adjusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adjusterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjusterButtonDisabled: {
    opacity: 0.4,
  },
  adjusterButtonText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
  },
  adjusterValue: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  adjusterValueText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
})
