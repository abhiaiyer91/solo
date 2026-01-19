/**
 * ProductResult - Display scanned product with nutrition info
 */

import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'
import { ServingSelector, type ServingSize } from './ServingSelector'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface ProductResultProps {
  product: BarcodeProduct
  onLog: (mealType: MealType, servings: number) => void
  onScanAnother: () => void
  onManualEntry: () => void
  isLogging?: boolean
}

/**
 * Display a scanned product with nutrition details
 */
export function ProductResult({
  product,
  onLog,
  onScanAnother,
  onManualEntry,
  isLogging = false,
}: ProductResultProps) {
  const [servings, setServings] = React.useState(1)
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>('breakfast')

  // Calculate nutrition for current serving
  const calculatedNutrition = {
    calories: Math.round(product.calories * servings),
    protein: Math.round(product.protein * servings * 10) / 10,
    carbs: Math.round(product.carbs * servings * 10) / 10,
    fat: Math.round(product.fat * servings * 10) / 10,
    fiber: product.fiber ? Math.round(product.fiber * servings * 10) / 10 : undefined,
  }

  const handleLog = () => {
    onLog(selectedMeal, servings)
  }

  // Determine time-appropriate default meal
  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 11) {
      setSelectedMeal('breakfast')
    } else if (hour < 15) {
      setSelectedMeal('lunch')
    } else if (hour < 20) {
      setSelectedMeal('dinner')
    } else {
      setSelectedMeal('snack')
    }
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Product Header */}
      <View style={styles.header}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          {product.brand && (
            <Text style={styles.brandName}>{product.brand}</Text>
          )}
          {product.nutritionGrade && (
            <View style={[styles.gradeBadge, getGradeStyle(product.nutritionGrade)]}>
              <Text style={styles.gradeText}>{product.nutritionGrade.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Per 100g Nutrition */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Per serving ({product.servingSize})</Text>
        <View style={styles.macroGrid}>
          <MacroItem label="Calories" value={product.calories} unit="kcal" />
          <MacroItem label="Protein" value={product.protein} unit="g" highlight />
          <MacroItem label="Carbs" value={product.carbs} unit="g" />
          <MacroItem label="Fat" value={product.fat} unit="g" />
          {product.fiber && <MacroItem label="Fiber" value={product.fiber} unit="g" />}
        </View>
      </View>

      {/* Serving Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servings</Text>
        <ServingSelector
          value={servings}
          onChange={setServings}
          servingSize={product.servingSize}
        />
      </View>

      {/* Calculated Nutrition */}
      <View style={styles.calculatedSection}>
        <Text style={styles.calculatedTitle}>This serving:</Text>
        <View style={styles.calculatedRow}>
          <Text style={styles.calculatedValue}>{calculatedNutrition.calories} cal</Text>
          <Text style={styles.calculatedDivider}>|</Text>
          <Text style={styles.calculatedValue}>{calculatedNutrition.protein}g protein</Text>
        </View>
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealSelector}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
          <Pressable
            key={meal}
            style={[styles.mealButton, selectedMeal === meal && styles.mealButtonSelected]}
            onPress={() => setSelectedMeal(meal)}
          >
            <Text style={[styles.mealButtonText, selectedMeal === meal && styles.mealButtonTextSelected]}>
              {getMealEmoji(meal)} {capitalize(meal)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Log Button */}
      <Pressable
        style={[styles.logButton, isLogging && styles.logButtonDisabled]}
        onPress={handleLog}
        disabled={isLogging}
      >
        <Text style={styles.logButtonText}>
          {isLogging ? 'Logging...' : `Log to ${capitalize(selectedMeal)}`}
        </Text>
      </Pressable>

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        <Pressable style={styles.secondaryButton} onPress={onScanAnother}>
          <Text style={styles.secondaryButtonText}>Scan Another</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onManualEntry}>
          <Text style={styles.secondaryButtonText}>Manual Entry</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

/**
 * Not Found display
 */
export function ProductNotFound({
  barcode,
  onScanAnother,
  onManualEntry,
}: {
  barcode: string
  onScanAnother: () => void
  onManualEntry: () => void
}) {
  return (
    <View style={styles.notFoundContainer}>
      <Text style={styles.notFoundIcon}>🔍</Text>
      <Text style={styles.notFoundTitle}>Product Not Found</Text>
      <Text style={styles.notFoundBarcode}>{barcode}</Text>
      <Text style={styles.notFoundText}>
        This product isn't in our database yet.
        You can enter the nutrition info manually.
      </Text>

      <Pressable style={styles.logButton} onPress={onManualEntry}>
        <Text style={styles.logButtonText}>Enter Manually</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onScanAnother}>
        <Text style={styles.secondaryButtonText}>Scan Another</Text>
      </Pressable>
    </View>
  )
}

// Helper component for macro display
function MacroItem({
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
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, highlight && styles.macroValueHighlight]}>
        {value}{unit}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  )
}

function getGradeStyle(grade: string) {
  const colors: Record<string, string> = {
    a: '#00AA00',
    b: '#88CC00',
    c: '#FFCC00',
    d: '#FF8800',
    e: '#FF0000',
  }
  return { backgroundColor: colors[grade.toLowerCase()] || '#888' }
}

function getMealEmoji(meal: MealType): string {
  const emojis: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }
  return emojis[meal]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 8,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroItem: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  macroValueHighlight: {
    color: '#00FF00',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
    textTransform: 'uppercase',
  },
  calculatedSection: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  calculatedTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 8,
  },
  calculatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calculatedValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  calculatedDivider: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#444',
    marginHorizontal: 12,
  },
  mealSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  mealButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealButtonSelected: {
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  mealButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  mealButtonTextSelected: {
    color: '#00FF00',
  },
  logButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  notFoundContainer: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  notFoundIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  notFoundBarcode: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 20,
  },
  notFoundText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
})
