/**
 * MealCard - Individual meal log display
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { MealLog } from '../hooks/useNutrition'

interface MealCardProps {
  meal: MealLog
  onDelete?: () => void
  onEdit?: () => void
}

export function MealCard({ meal, onDelete, onEdit }: MealCardProps) {
  const mealTime = formatTime(meal.createdAt)
  const mealTypeLabel = getMealTypeLabel(meal.mealType)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.emoji}>{getMealEmoji(meal.mealType)}</Text>
          <View>
            <Text style={styles.mealType}>{mealTypeLabel}</Text>
            <Text style={styles.time}>{mealTime}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.actionButton}>
              <Text style={styles.actionIcon}>✏️</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.actionIcon}>🗑️</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Macros */}
      <View style={styles.macroRow}>
        <MacroItem label="Protein" value={`${Math.round(meal.protein)}g`} highlight />
        <MacroItem label="Cals" value={String(meal.calories)} />
        <MacroItem label="Carbs" value={`${Math.round(meal.carbs)}g`} />
        <MacroItem label="Fat" value={`${Math.round(meal.fat)}g`} />
      </View>

      {/* Foods List */}
      {meal.foods && meal.foods.length > 0 && (
        <Text style={styles.foods} numberOfLines={2}>
          {meal.foods.map(f => f.name).join(', ')}
        </Text>
      )}
    </View>
  )
}

function MacroItem({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, highlight && styles.macroHighlight]}>
        {value}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getMealTypeLabel(type?: string): string {
  if (!type) return 'Snack'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function getMealEmoji(type?: string): string {
  switch (type) {
    case 'breakfast': return '🌅'
    case 'lunch': return '☀️'
    case 'dinner': return '🌙'
    case 'snack': return '🍎'
    default: return '🍽️'
  }
}

/**
 * Compact meal row for lists
 */
export function MealRow({
  meal,
  onPress,
}: {
  meal: MealLog
  onPress?: () => void
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.rowContainer,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.rowEmoji}>{getMealEmoji(meal.mealType)}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowTime}>{formatTime(meal.createdAt)}</Text>
        <Text style={styles.rowFoods} numberOfLines={1}>
          {meal.foods?.map(f => f.name).join(', ') || 'Meal'}
        </Text>
      </View>
      <View style={styles.rowMacros}>
        <Text style={styles.rowProtein}>{Math.round(meal.protein)}g</Text>
        <Text style={styles.rowCalories}>{meal.calories} cal</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  mealType: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  time: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  macroHighlight: {
    color: '#00FF00',
  },
  macroLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  foods: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
    fontStyle: 'italic',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 10,
    gap: 10,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowEmoji: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
  },
  rowTime: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  rowFoods: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  rowMacros: {
    alignItems: 'flex-end',
  },
  rowProtein: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  rowCalories: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
})
