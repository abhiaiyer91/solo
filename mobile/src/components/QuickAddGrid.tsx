/**
 * QuickAddGrid - Quick add food buttons
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { usePresets, type FoodPreset } from '../hooks/usePresets'

export interface QuickAddFood {
  id: string
  name: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface QuickAddGridProps {
  onQuickAdd: (food: QuickAddFood) => void
  onManagePresets?: () => void
  isAdding?: boolean
  addingFoodId?: string | null
}

export function QuickAddGrid({
  onQuickAdd,
  onManagePresets,
  isAdding,
  addingFoodId,
}: QuickAddGridProps) {
  const { presets, isLoading } = usePresets()

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{'>'} QUICK ADD</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00FF00" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{'>'} QUICK ADD</Text>
        {onManagePresets && (
          <Pressable onPress={onManagePresets}>
            <Text style={styles.manageLink}>Manage</Text>
          </Pressable>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {presets.map((preset) => (
          <QuickAddButton
            key={preset.id}
            food={preset}
            onPress={() => onQuickAdd(preset)}
            isLoading={isAdding && addingFoodId === preset.id}
          />
        ))}

        {/* Add Custom Button */}
        <Pressable 
          style={styles.addCustomButton}
          onPress={onManagePresets}
        >
          <Text style={styles.addCustomIcon}>+</Text>
          <Text style={styles.addCustomText}>Custom</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

function QuickAddButton({
  food,
  onPress,
  isLoading,
}: {
  food: FoodPreset | QuickAddFood
  onPress: () => void
  isLoading?: boolean
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAddButton,
        pressed && styles.quickAddButtonPressed,
        isLoading && styles.quickAddButtonLoading,
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#00FF00" />
      ) : (
        <>
          <Text style={styles.emoji}>{food.emoji}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {food.name}
          </Text>
          <Text style={styles.protein}>+{food.protein}g</Text>
        </>
      )}
    </Pressable>
  )
}

/**
 * Compact quick add row for inline use
 */
export function QuickAddRow({
  onQuickAdd,
}: {
  onQuickAdd: (food: QuickAddFood) => void
}) {
  const { presets } = usePresets()
  const topPresets = presets.slice(0, 4)

  return (
    <View style={styles.rowContainer}>
      {topPresets.map((preset) => (
        <Pressable
          key={preset.id}
          style={styles.rowButton}
          onPress={() => onQuickAdd(preset)}
        >
          <Text style={styles.rowEmoji}>{preset.emoji}</Text>
          <Text style={styles.rowProtein}>+{preset.protein}g</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingLeft: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  manageLink: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  quickAddButton: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickAddButtonPressed: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  quickAddButtonLoading: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
  },
  name: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  protein: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  addCustomButton: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addCustomIcon: {
    fontSize: 24,
    color: '#666666',
  },
  addCustomText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  rowEmoji: {
    fontSize: 16,
  },
  rowProtein: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#00FF00',
  },
})
