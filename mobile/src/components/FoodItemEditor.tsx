/**
 * FoodItemEditor - Edit detected food items before logging
 * Allows adjusting servings and viewing nutrition details
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Image,
} from 'react-native'
import Animated, {
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'
import { ServingAdjuster } from './ServingSelector'

interface FoodItemEditorProps {
  visible: boolean
  product: BarcodeProduct
  servings: number
  onServingsChange: (servings: number) => void
  onSave: () => void
  onCancel: () => void
}

/**
 * Modal editor for food item details
 */
export function FoodItemEditor({
  visible,
  product,
  servings,
  onServingsChange,
  onSave,
  onCancel,
}: FoodItemEditorProps) {
  // Calculate nutrition for current servings
  const nutrition = {
    calories: Math.round(product.calories * servings),
    protein: Math.round(product.protein * servings * 10) / 10,
    carbs: Math.round(product.carbs * servings * 10) / 10,
    fat: Math.round(product.fat * servings * 10) / 10,
    fiber: product.fiber ? Math.round(product.fiber * servings * 10) / 10 : undefined,
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Item</Text>
            <Pressable onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.productImageText}>📦</Text>
              </View>
            )}
            <View style={styles.productText}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              {product.brand && (
                <Text style={styles.productBrand}>{product.brand}</Text>
              )}
            </View>
          </View>

          {/* Serving Adjuster */}
          <View style={styles.servingSection}>
            <Text style={styles.sectionLabel}>Servings</Text>
            <View style={styles.servingRow}>
              <ServingAdjuster
                value={servings}
                onChange={onServingsChange}
                min={0.5}
                max={10}
                step={0.5}
              />
              <Text style={styles.servingSize}>× {product.servingSize}</Text>
            </View>
          </View>

          {/* Nutrition Details */}
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionLabel}>Nutrition (this serving)</Text>
            <View style={styles.nutritionGrid}>
              <NutritionItem label="Calories" value={nutrition.calories} unit="kcal" highlight />
              <NutritionItem label="Protein" value={nutrition.protein} unit="g" />
              <NutritionItem label="Carbs" value={nutrition.carbs} unit="g" />
              <NutritionItem label="Fat" value={nutrition.fat} unit="g" />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

/**
 * Nutrition item display
 */
function NutritionItem({
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
    <View style={styles.nutritionItem}>
      <Text style={[styles.nutritionValue, highlight && styles.nutritionValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.nutritionUnit}>{unit}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  )
}

/**
 * Inline editable food row
 */
export function FoodItemRow({
  product,
  servings,
  onPress,
  onRemove,
}: {
  product: BarcodeProduct
  servings: number
  onPress: () => void
  onRemove: () => void
}) {
  const calories = Math.round(product.calories * servings)

  return (
    <Pressable style={styles.rowContainer} onPress={onPress}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.rowMeta}>
          {servings} serving{servings !== 1 ? 's' : ''} • {calories} cal
        </Text>
      </View>

      <Pressable style={styles.rowRemove} onPress={onRemove}>
        <Text style={styles.rowRemoveText}>✕</Text>
      </Pressable>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#888',
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 32,
  },
  productText: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  servingSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  servingSize: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  nutritionSection: {
    marginBottom: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  nutritionValue: {
    fontSize: 20,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#00FF00',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 8,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
  },
  rowRemove: {
    padding: 8,
  },
  rowRemoveText: {
    fontSize: 16,
    color: '#FF4444',
  },
})
