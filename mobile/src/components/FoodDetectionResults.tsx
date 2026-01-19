/**
 * FoodDetectionResults - Display AI detection results with editing
 * Shows detected foods, totals, and allows logging
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DetectedFoodItem } from './DetectedFoodItem'
import { MealTypeSelector, getDefaultMealType, type MealType } from './MealTypeSelector'
import type { DetectedFood } from '../hooks/useFoodRecognition'

interface FoodDetectionResultsProps {
  photoUri: string | null
  foods: DetectedFood[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  onPortionChange: (foodId: string, portion: number) => void
  onToggleInclude: (foodId: string) => void
  onRemove: (foodId: string) => void
  onAddManual: (food: Omit<DetectedFood, 'id' | 'portion' | 'included'>) => void
  onLogMeal: (mealType: MealType) => Promise<void>
  onRetake: () => void
  isLogging: boolean
}

/**
 * Main detection results display
 */
export function FoodDetectionResults({
  photoUri,
  foods,
  totals,
  onPortionChange,
  onToggleInclude,
  onRemove,
  onAddManual,
  onLogMeal,
  onRetake,
  isLogging,
}: FoodDetectionResultsProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>(getDefaultMealType())
  const [showAddManual, setShowAddManual] = useState(false)

  const includedCount = foods.filter(f => f.included).length

  const handleLogMeal = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await onLogMeal(selectedMealType)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo preview */}
        {photoUri && (
          <Animated.View entering={FadeIn} style={styles.photoSection}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Pressable style={styles.retakeButton} onPress={onRetake}>
              <Text style={styles.retakeText}>Retake Photo</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Detected foods header */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detected Foods</Text>
            <Text style={styles.sectionCount}>
              {includedCount} of {foods.length} selected
            </Text>
          </View>

          {/* Food list */}
          {foods.map((food, index) => (
            <DetectedFoodItem
              key={food.id}
              food={food}
              index={index}
              onPortionChange={(portion) => onPortionChange(food.id, portion)}
              onToggleInclude={() => onToggleInclude(food.id)}
              onRemove={() => onRemove(food.id)}
            />
          ))}

          {/* Add manual button */}
          <Pressable
            style={styles.addManualButton}
            onPress={() => setShowAddManual(true)}
          >
            <Text style={styles.addManualIcon}>+</Text>
            <Text style={styles.addManualText}>Add Missing Item</Text>
          </Pressable>
        </View>

        {/* Meal type selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log as</Text>
          <MealTypeSelector
            selected={selectedMealType}
            onSelect={setSelectedMealType}
            disabled={isLogging}
          />
        </View>

        {/* Spacer for bottom totals */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed bottom totals and log button */}
      <Animated.View
        entering={SlideInDown.springify()}
        style={styles.bottomBar}
      >
        {/* Nutrition totals */}
        <NutritionTotalsBar totals={totals} />

        {/* Log button */}
        <Pressable
          style={[styles.logButton, isLogging && styles.logButtonDisabled]}
          onPress={handleLogMeal}
          disabled={isLogging || includedCount === 0}
        >
          <Text style={styles.logButtonText}>
            {isLogging ? 'Logging...' : `Log ${includedCount} Item${includedCount !== 1 ? 's' : ''}`}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Manual add modal */}
      {showAddManual && (
        <ManualFoodEntry
          onAdd={(food) => {
            onAddManual(food)
            setShowAddManual(false)
          }}
          onClose={() => setShowAddManual(false)}
        />
      )}
    </KeyboardAvoidingView>
  )
}

/**
 * Nutrition totals bar component
 */
function NutritionTotalsBar({
  totals,
}: {
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}) {
  return (
    <View style={styles.totalsBar}>
      <View style={styles.totalItem}>
        <Text style={styles.totalValue}>{Math.round(totals.calories)}</Text>
        <Text style={styles.totalLabel}>cal</Text>
      </View>
      <View style={styles.totalDivider} />
      <View style={styles.totalItem}>
        <Text style={styles.totalValue}>{Math.round(totals.protein)}g</Text>
        <Text style={styles.totalLabel}>protein</Text>
      </View>
      <View style={styles.totalDivider} />
      <View style={styles.totalItem}>
        <Text style={styles.totalValue}>{Math.round(totals.carbs)}g</Text>
        <Text style={styles.totalLabel}>carbs</Text>
      </View>
      <View style={styles.totalDivider} />
      <View style={styles.totalItem}>
        <Text style={styles.totalValue}>{Math.round(totals.fat)}g</Text>
        <Text style={styles.totalLabel}>fat</Text>
      </View>
    </View>
  )
}

/**
 * Manual food entry form
 */
function ManualFoodEntry({
  onAdd,
  onClose,
}: {
  onAdd: (food: Omit<DetectedFood, 'id' | 'portion' | 'included'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const isValid = name.trim() && calories && protein

  const handleAdd = () => {
    if (!isValid) return

    onAdd({
      name: name.trim(),
      servingSize: '1 serving',
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      confidence: 1.0,
    })
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.modalOverlay}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <Animated.View
        entering={SlideInDown.springify()}
        style={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Food</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Food Name *</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Grilled Chicken"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formField, styles.formFieldHalf]}>
            <Text style={styles.fieldLabel}>Calories *</Text>
            <TextInput
              style={styles.textInput}
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formField, styles.formFieldHalf]}>
            <Text style={styles.fieldLabel}>Protein (g) *</Text>
            <TextInput
              style={styles.textInput}
              value={protein}
              onChangeText={setProtein}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formField, styles.formFieldHalf]}>
            <Text style={styles.fieldLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.textInput}
              value={carbs}
              onChangeText={setCarbs}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formField, styles.formFieldHalf]}>
            <Text style={styles.fieldLabel}>Fat (g)</Text>
            <TextInput
              style={styles.textInput}
              value={fat}
              onChangeText={setFat}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Pressable
          style={[styles.addButton, !isValid && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!isValid}
        >
          <Text style={styles.addButtonText}>Add Food</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

/**
 * Empty state when no foods detected
 */
export function NoFoodsDetected({
  onRetake,
  onManualEntry,
}: {
  onRetake: () => void
  onManualEntry: () => void
}) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤔</Text>
      <Text style={styles.emptyTitle}>No Foods Detected</Text>
      <Text style={styles.emptyText}>
        The AI couldn't identify any food in this photo. Try taking a clearer
        photo with better lighting, or add your food manually.
      </Text>

      <View style={styles.emptyActions}>
        <Pressable style={styles.retakeButtonLarge} onPress={onRetake}>
          <Text style={styles.retakeButtonLargeText}>Take New Photo</Text>
        </Pressable>
        <Pressable style={styles.manualButtonLarge} onPress={onManualEntry}>
          <Text style={styles.manualButtonLargeText}>Enter Manually</Text>
        </Pressable>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips for better detection:</Text>
        <Text style={styles.tipItem}>• Use good lighting</Text>
        <Text style={styles.tipItem}>• Center the food in frame</Text>
        <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
        <Text style={styles.tipItem}>• Include the whole plate</Text>
      </View>
    </View>
  )
}

/**
 * Loading state during analysis
 */
export function AnalyzingIndicator() {
  const rotation = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  // Animate rotation
  React.useEffect(() => {
    const interval = setInterval(() => {
      rotation.value = withSpring(rotation.value + 360, { duration: 1000 })
    }, 1000)
    return () => clearInterval(interval)
  }, [rotation])

  return (
    <View style={styles.analyzingContainer}>
      <Animated.Text style={[styles.analyzingIcon, animatedStyle]}>
        🔍
      </Animated.Text>
      <Text style={styles.analyzingTitle}>Analyzing Your Meal...</Text>
      <Text style={styles.analyzingText}>
        Our AI is identifying foods and calculating nutrition
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  retakeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  addManualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addManualIcon: {
    fontSize: 20,
    color: '#666',
  },
  addManualText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
  },
  bottomSpacer: {
    height: 180,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    padding: 16,
    paddingBottom: 32,
  },
  totalsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666',
    marginTop: 2,
  },
  totalDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  logButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalClose: {
    fontSize: 20,
    color: '#666',
  },
  formField: {
    marginBottom: 16,
  },
  formFieldHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActions: {
    gap: 12,
    width: '100%',
    marginBottom: 32,
  },
  retakeButtonLarge: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonLargeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  manualButtonLarge: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualButtonLargeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  tips: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginTop: 4,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  analyzingIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  analyzingTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  analyzingText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    textAlign: 'center',
  },
})
