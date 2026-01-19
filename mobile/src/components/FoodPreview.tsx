/**
 * FoodPreview - Displays scanned food nutrition for logging
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface ScannedProduct {
  name: string
  brand?: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  imageUrl?: string
  barcode: string
  nutritionGrade?: string
}

interface FoodPreviewProps {
  product: ScannedProduct
  onAdd: (servings: number, mealType: MealType) => void
  onCancel: () => void
  onSaveAsPreset?: () => void
  isLoading?: boolean
}

export function FoodPreview({
  product,
  onAdd,
  onCancel,
  onSaveAsPreset,
  isLoading,
}: FoodPreviewProps) {
  const [servings, setServings] = useState(1)
  const [mealType, setMealType] = useState<MealType>('snack')

  const scaledNutrition = {
    calories: Math.round(product.calories * servings),
    protein: Math.round(product.protein * servings * 10) / 10,
    carbs: Math.round(product.carbs * servings * 10) / 10,
    fat: Math.round(product.fat * servings * 10) / 10,
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      {product.imageUrl && (
        <Image 
          source={{ uri: product.imageUrl }} 
          style={styles.image}
          resizeMode="contain"
        />
      )}

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        {product.brand && (
          <Text style={styles.brand}>{product.brand}</Text>
        )}
        <Text style={styles.serving}>Serving: {product.servingSize}</Text>
        {product.nutritionGrade && (
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>
              Nutri-Score: {product.nutritionGrade.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Macro Grid */}
      <View style={styles.macroGrid}>
        <MacroBox label="Calories" value={String(scaledNutrition.calories)} />
        <MacroBox label="Protein" value={`${scaledNutrition.protein}g`} highlight />
        <MacroBox label="Carbs" value={`${scaledNutrition.carbs}g`} />
        <MacroBox label="Fat" value={`${scaledNutrition.fat}g`} />
      </View>

      {/* Servings Selector */}
      <View style={styles.servingsRow}>
        <Text style={styles.label}>Servings:</Text>
        <View style={styles.servingsControl}>
          <Pressable 
            onPress={() => setServings(Math.max(0.5, servings - 0.5))}
            style={styles.stepButton}
          >
            <Text style={styles.stepButtonText}>−</Text>
          </Pressable>
          <Text style={styles.servingsValue}>{servings}</Text>
          <Pressable 
            onPress={() => setServings(servings + 0.5)}
            style={styles.stepButton}
          >
            <Text style={styles.stepButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealTypeContainer}>
        <Text style={styles.label}>Meal:</Text>
        <View style={styles.mealTypeRow}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setMealType(type)}
              style={[
                styles.mealTypeButton,
                mealType === type && styles.mealTypeActive,
              ]}
            >
              <Text style={[
                styles.mealTypeText,
                mealType === type && styles.mealTypeTextActive,
              ]}>
                {getMealEmoji(type)} {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Actions */}
      <Pressable 
        onPress={() => onAdd(servings, mealType)} 
        style={[styles.addButton, isLoading && styles.buttonDisabled]}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>
          {isLoading ? 'Adding...' : 'ADD TO LOG'}
        </Text>
      </Pressable>

      {onSaveAsPreset && (
        <Pressable onPress={onSaveAsPreset} style={styles.savePresetButton}>
          <Text style={styles.savePresetText}>⭐ Save as Quick-Add</Text>
        </Pressable>
      )}

      <Pressable onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Scan Different Item</Text>
      </Pressable>
    </ScrollView>
  )
}

function MacroBox({ 
  label, 
  value, 
  highlight 
}: { 
  label: string
  value: string
  highlight?: boolean 
}) {
  return (
    <View style={[styles.macroBox, highlight && styles.macroBoxHighlight]}>
      <Text style={[styles.macroValue, highlight && styles.macroValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  )
}

function getMealEmoji(type: MealType): string {
  switch (type) {
    case 'breakfast': return '🌅'
    case 'lunch': return '☀️'
    case 'dinner': return '🌙'
    case 'snack': return '🍎'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  info: {
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
    marginBottom: 4,
  },
  serving: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
  },
  gradeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#00FF00',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  macroBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  macroBoxHighlight: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  macroValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  macroValueHighlight: {
    color: '#00FF00',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  servingsValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    minWidth: 50,
    textAlign: 'center',
  },
  mealTypeContainer: {
    marginBottom: 24,
  },
  mealTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealTypeActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  mealTypeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    textTransform: 'capitalize',
  },
  mealTypeTextActive: {
    color: '#00FF00',
  },
  addButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000000',
  },
  savePresetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  savePresetText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFD700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666666',
    textDecorationLine: 'underline',
  },
})
