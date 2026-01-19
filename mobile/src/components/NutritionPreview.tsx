/**
 * NutritionPreview - Pre-log nutrition summary
 * Shows detected items and total macros before confirming
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface FoodItem {
  id: string
  product: BarcodeProduct
  servings: number
}

interface NutritionPreviewProps {
  items: FoodItem[]
  mealType: MealType
  onMealTypeChange: (type: MealType) => void
  onEditItem: (id: string) => void
  onRemoveItem: (id: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLogging?: boolean
}

/**
 * Nutrition preview before logging
 */
export function NutritionPreview({
  items,
  mealType,
  onMealTypeChange,
  onEditItem,
  onRemoveItem,
  onConfirm,
  onCancel,
  isLogging = false,
}: NutritionPreviewProps) {
  // Calculate totals
  const totals = React.useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + Math.round(item.product.calories * item.servings),
        protein: acc.protein + item.product.protein * item.servings,
        carbs: acc.carbs + item.product.carbs * item.servings,
        fat: acc.fat + item.product.fat * item.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [items])

  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={SlideOutDown.springify()}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Add to Nutrition Log</Text>
        <Pressable onPress={onCancel}>
          <Text style={styles.cancelButton}>✕</Text>
        </Pressable>
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealTypeRow}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
          <Pressable
            key={type}
            style={[styles.mealTypeButton, mealType === type && styles.mealTypeButtonSelected]}
            onPress={() => onMealTypeChange(type)}
          >
            <Text style={styles.mealTypeEmoji}>{getMealEmoji(type)}</Text>
            <Text style={[
              styles.mealTypeText,
              mealType === type && styles.mealTypeTextSelected,
            ]}>
              {capitalize(type)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Items List */}
      <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsContent}>
        {items.map((item) => (
          <FoodItemRow
            key={item.id}
            item={item}
            onEdit={() => onEditItem(item.id)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </ScrollView>

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <Text style={styles.totalsTitle}>Total</Text>
        <View style={styles.totalsGrid}>
          <TotalItem label="Calories" value={totals.calories} unit="kcal" highlight />
          <TotalItem label="Protein" value={totals.protein} unit="g" />
          <TotalItem label="Carbs" value={totals.carbs} unit="g" />
          <TotalItem label="Fat" value={totals.fat} unit="g" />
        </View>
      </View>

      {/* Confirm Button */}
      <Pressable
        style={[styles.confirmButton, isLogging && styles.confirmButtonDisabled]}
        onPress={onConfirm}
        disabled={isLogging || items.length === 0}
      >
        <Text style={styles.confirmButtonText}>
          {isLogging ? 'Logging...' : `Log to ${capitalize(mealType)}`}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

/**
 * Single food item row
 */
function FoodItemRow({
  item,
  onEdit,
  onRemove,
}: {
  item: FoodItem
  onEdit: () => void
  onRemove: () => void
}) {
  const { product, servings } = item
  const calories = Math.round(product.calories * servings)

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.itemMeta}>
          {servings} × {product.servingSize} • {calories} cal
        </Text>
      </View>

      <View style={styles.itemActions}>
        <Pressable style={styles.itemAction} onPress={onEdit}>
          <Text style={styles.itemActionText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.itemAction} onPress={onRemove}>
          <Text style={[styles.itemActionText, styles.itemActionRemove]}>✕</Text>
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Total item display
 */
function TotalItem({
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
  const displayValue = unit === 'kcal' ? value : Math.round(value * 10) / 10

  return (
    <View style={styles.totalItem}>
      <Text style={[styles.totalValue, highlight && styles.totalValueHighlight]}>
        {displayValue}
      </Text>
      <Text style={styles.totalUnit}>{unit}</Text>
      <Text style={styles.totalLabel}>{label}</Text>
    </View>
  )
}

function getMealEmoji(type: MealType): string {
  const emojis: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }
  return emojis[type]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelButton: {
    fontSize: 20,
    color: '#888',
    padding: 4,
  },
  mealTypeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    gap: 4,
  },
  mealTypeButtonSelected: {
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  mealTypeEmoji: {
    fontSize: 20,
  },
  mealTypeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888',
  },
  mealTypeTextSelected: {
    color: '#00FF00',
  },
  itemsList: {
    maxHeight: 200,
  },
  itemsContent: {
    paddingHorizontal: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  itemAction: {
    padding: 8,
  },
  itemActionText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#00FF00',
  },
  itemActionRemove: {
    color: '#FF4444',
  },
  totalsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  totalsTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalValueHighlight: {
    color: '#00FF00',
  },
  totalUnit: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
    marginTop: 4,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
})
