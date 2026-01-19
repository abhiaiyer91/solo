/**
 * Recent Foods Hook
 * 
 * Tracks recently logged foods for quick re-entry.
 * Persists to AsyncStorage for cross-session access.
 */

import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'recent_foods'
const MAX_RECENT_FOODS = 20

export interface RecentFood {
  id: string
  name: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
  lastUsedAt: string
  useCount: number
}

export function useRecentFoods() {
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load recent foods from storage
  useEffect(() => {
    loadRecentFoods()
  }, [])

  const loadRecentFoods = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        const foods = JSON.parse(stored) as RecentFood[]
        // Sort by last used (most recent first)
        foods.sort((a, b) => 
          new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
        )
        setRecentFoods(foods)
      }
    } catch (error) {
      console.error('Failed to load recent foods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveRecentFoods = async (foods: RecentFood[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(foods))
    } catch (error) {
      console.error('Failed to save recent foods:', error)
    }
  }

  /**
   * Add or update a food in the recent list
   */
  const addRecentFood = useCallback(async (food: Omit<RecentFood, 'id' | 'lastUsedAt' | 'useCount'>) => {
    setRecentFoods((current) => {
      // Check if food already exists (by name + brand)
      const existingIndex = current.findIndex(
        (f) => f.name.toLowerCase() === food.name.toLowerCase() && 
               f.brand?.toLowerCase() === food.brand?.toLowerCase()
      )

      let updated: RecentFood[]

      if (existingIndex >= 0) {
        // Update existing food
        updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...food,
          lastUsedAt: new Date().toISOString(),
          useCount: updated[existingIndex].useCount + 1,
        }
      } else {
        // Add new food
        const newFood: RecentFood = {
          ...food,
          id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lastUsedAt: new Date().toISOString(),
          useCount: 1,
        }
        updated = [newFood, ...current]
      }

      // Keep only the most recent foods
      updated = updated
        .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
        .slice(0, MAX_RECENT_FOODS)

      // Persist to storage
      saveRecentFoods(updated)

      return updated
    })
  }, [])

  /**
   * Remove a food from the recent list
   */
  const removeRecentFood = useCallback(async (foodId: string) => {
    setRecentFoods((current) => {
      const updated = current.filter((f) => f.id !== foodId)
      saveRecentFoods(updated)
      return updated
    })
  }, [])

  /**
   * Clear all recent foods
   */
  const clearRecentFoods = useCallback(async () => {
    setRecentFoods([])
    await AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  /**
   * Get frequently used foods (sorted by use count)
   */
  const frequentFoods = [...recentFoods]
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 10)

  return {
    recentFoods,
    frequentFoods,
    isLoading,
    addRecentFood,
    removeRecentFood,
    clearRecentFoods,
    refetch: loadRecentFoods,
  }
}
