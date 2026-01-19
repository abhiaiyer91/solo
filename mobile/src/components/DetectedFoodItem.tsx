/**
 * DetectedFoodItem - Individual detected food card with controls
 * Shows nutrition, confidence, and allows adjustment
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native'
import Animated, {
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { ConfidenceIndicator, ConfidenceDot, getConfidenceColor } from './ConfidenceIndicator'
import { PortionAdjusterCompact } from './PortionAdjuster'
import type { DetectedFood } from '../hooks/useFoodRecognition'

interface DetectedFoodItemProps {
  food: DetectedFood
  onPortionChange: (portion: number) => void
  onRemove: () => void
  onToggleInclude: () => void
  index?: number
}

/**
 * Main detected food card component
 */
export function DetectedFoodItem({
  food,
  onPortionChange,
  onRemove,
  onToggleInclude,
  index = 0,
}: DetectedFoodItemProps) {
  const [expanded, setExpanded] = useState(false)
  const scale = useSharedValue(1)

  // Calculate adjusted nutrition
  const adjustedCalories = Math.round(food.calories * food.portion)
  const adjustedProtein = Math.round(food.protein * food.portion * 10) / 10
  const adjustedCarbs = Math.round(food.carbs * food.portion * 10) / 10
  const adjustedFat = Math.round(food.fat * food.portion * 10) / 10

  const confidenceColor = getConfidenceColor(food.confidence)

  const handlePress = () => {
    Haptics.selectionAsync()
    setExpanded(!expanded)
  }

  const handleRemove = () => {
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1)
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onRemove()
  }

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleInclude()
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      exiting={SlideOutLeft.springify()}
      style={[
        styles.container,
        !food.included && styles.containerExcluded,
        animatedStyle,
      ]}
    >
      {/* Main card */}
      <Pressable onPress={handlePress} style={styles.mainContent}>
        {/* Left: Food info */}
        <View style={styles.foodInfo}>
          <View style={styles.headerRow}>
            <ConfidenceDot confidence={food.confidence} />
            <Text
              style={[styles.foodName, !food.included && styles.textExcluded]}
              numberOfLines={1}
            >
              {food.name}
            </Text>
          </View>

          <Text style={[styles.servingText, !food.included && styles.textExcluded]}>
            {food.servingSize}
          </Text>

          {/* Quick nutrition */}
          <View style={styles.quickNutrition}>
            <Text style={[styles.calorieText, !food.included && styles.textExcluded]}>
              {adjustedCalories} cal
            </Text>
            <Text style={[styles.macroText, !food.included && styles.textExcluded]}>
              {adjustedProtein}g P
            </Text>
          </View>
        </View>

        {/* Right: Controls */}
        <View style={styles.controls}>
          {/* Portion adjuster */}
          <PortionAdjusterCompact
            value={food.portion}
            onChange={onPortionChange}
            disabled={!food.included}
          />

          {/* Toggle/remove buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, !food.included && styles.actionButtonActive]}
              onPress={handleToggle}
            >
              <Text style={styles.actionIcon}>
                {food.included ? '✓' : '○'}
              </Text>
            </Pressable>

            <Pressable style={styles.removeButton} onPress={handleRemove}>
              <Text style={styles.removeIcon}>✕</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>

      {/* Expanded details */}
      {expanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.expandedContent}
        >
          {/* Confidence bar */}
          <View style={styles.confidenceSection}>
            <Text style={styles.sectionLabel}>Detection Confidence</Text>
            <ConfidenceIndicator confidence={food.confidence} />
          </View>

          {/* Full nutrition breakdown */}
          <View style={styles.nutritionGrid}>
            <NutritionCell
              label="Calories"
              value={adjustedCalories}
              unit="kcal"
              highlight
            />
            <NutritionCell
              label="Protein"
              value={adjustedProtein}
              unit="g"
            />
            <NutritionCell
              label="Carbs"
              value={adjustedCarbs}
              unit="g"
            />
            <NutritionCell
              label="Fat"
              value={adjustedFat}
              unit="g"
            />
          </View>
        </Animated.View>
      )}

      {/* Confidence indicator line */}
      <View
        style={[
          styles.confidenceLine,
          { backgroundColor: confidenceColor, width: `${food.confidence * 100}%` },
        ]}
      />
    </Animated.View>
  )
}

/**
 * Nutrition value cell
 */
function NutritionCell({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string
  value: number
  unit: string
  highlight?: boolean
}) {
  return (
    <View style={styles.nutritionCell}>
      <Text style={[styles.nutritionValue, highlight && styles.nutritionValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.nutritionUnit}>{unit}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  )
}

/**
 * Compact food row for lists
 */
export function DetectedFoodRow({
  food,
  onPress,
  onRemove,
}: {
  food: DetectedFood
  onPress: () => void
  onRemove: () => void
}) {
  const adjustedCalories = Math.round(food.calories * food.portion)

  return (
    <Pressable style={styles.rowContainer} onPress={onPress}>
      <View style={styles.rowInfo}>
        <View style={styles.rowHeader}>
          <ConfidenceDot confidence={food.confidence} size={6} />
          <Text style={styles.rowName} numberOfLines={1}>
            {food.name}
          </Text>
        </View>
        <Text style={styles.rowMeta}>
          {food.portion !== 1 ? `${food.portion}x • ` : ''}
          {adjustedCalories} cal | {Math.round(food.protein * food.portion)}g protein
        </Text>
      </View>

      <Pressable style={styles.rowRemove} onPress={onRemove}>
        <Text style={styles.rowRemoveText}>✕</Text>
      </Pressable>
    </Pressable>
  )
}

/**
 * Low confidence warning card
 */
export function LowConfidenceWarning({
  food,
  onConfirm,
  onReject,
}: {
  food: DetectedFood
  onConfirm: () => void
  onReject: () => void
}) {
  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningHeader}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>Low Confidence Detection</Text>
      </View>

      <Text style={styles.warningFood}>{food.name}</Text>
      <ConfidenceIndicator confidence={food.confidence} />

      <Text style={styles.warningText}>
        The AI is unsure about this item. Please confirm or remove it.
      </Text>

      <View style={styles.warningActions}>
        <Pressable style={styles.rejectButton} onPress={onReject}>
          <Text style={styles.rejectText}>Remove</Text>
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmText}>Keep It</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  containerExcluded: {
    opacity: 0.5,
  },
  mainContent: {
    flexDirection: 'row',
    padding: 12,
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  textExcluded: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  servingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginLeft: 16,
  },
  quickNutrition: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
    marginTop: 4,
  },
  calorieText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  macroText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
  },
  controls: {
    alignItems: 'flex-end',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#333',
  },
  actionIcon: {
    fontSize: 14,
    color: '#00FF00',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 14,
    color: '#FF4444',
  },
  expandedContent: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  confidenceSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionCell: {
    alignItems: 'center',
    minWidth: 60,
  },
  nutritionValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  nutritionValueHighlight: {
    color: '#00FF00',
  },
  nutritionUnit: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666',
    marginTop: 2,
  },
  nutritionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
    marginTop: 4,
  },
  confidenceLine: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 6,
  },
  rowInfo: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowName: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  rowMeta: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
    marginTop: 2,
    marginLeft: 12,
  },
  rowRemove: {
    padding: 6,
  },
  rowRemoveText: {
    fontSize: 14,
    color: '#FF4444',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    gap: 12,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFB800',
  },
  warningFood: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
  },
  warningActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFB800',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
})
