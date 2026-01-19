/**
 * ManualFoodEntryScreen - Manual food entry form
 * 
 * Allows users to manually enter food nutritional data when
 * barcode/photo scanning isn't available.
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'

import { SystemWindow } from '@/components/SystemWindow'
import { useFoodSearch, type FoodSearchResult } from '@/hooks/useFoodSearch'
import { useRecentFoods, type RecentFood } from '@/hooks/useRecentFoods'
import { useLogFood } from '@/hooks/useNutrition'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const SERVING_UNITS = [
  { label: 'g', multiplier: 1 },
  { label: 'oz', multiplier: 28.35 },
  { label: 'cup', multiplier: 240 },
  { label: 'tbsp', multiplier: 15 },
  { label: 'tsp', multiplier: 5 },
  { label: 'portion', multiplier: 100 },
]

const QUICK_PRESETS = [
  { name: 'Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7 },
  { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Egg (large)', calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 1 },
  { name: 'Banana (medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3 },
]

interface ManualFoodEntryScreenProps {
  onClose?: () => void
  onLogSuccess?: () => void
  initialMealType?: MealType
}

export function ManualFoodEntryScreen({ 
  onClose, 
  onLogSuccess,
  initialMealType = 'lunch'
}: ManualFoodEntryScreenProps) {
  const router = useRouter()
  const logFoodMutation = useLogFood()
  const { query, results, isSearching, updateQuery, clearSearch } = useFoodSearch()
  const { recentFoods, addRecentFood } = useRecentFoods()
  
  const isLogging = logFoodMutation.isPending

  // Form state
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [servingSize, setServingSize] = useState('100')
  const [servingUnit, setServingUnit] = useState('g')
  const [mealType, setMealType] = useState<MealType>(initialMealType)
  const [showSearch, setShowSearch] = useState(true)
  const [saveAsCustom, setSaveAsCustom] = useState(false)

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [onClose, router])

  // Fill form from search result
  const handleSelectFood = useCallback((food: FoodSearchResult | RecentFood) => {
    setName(food.name)
    setBrand(food.brand ?? '')
    setCalories(food.calories.toString())
    setProtein(food.protein.toString())
    setCarbs(food.carbs.toString())
    setFat(food.fat.toString())
    setServingSize(food.servingSize.toString())
    setServingUnit(food.servingUnit)
    setShowSearch(false)
    clearSearch()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [clearSearch])

  // Fill from preset
  const handleSelectPreset = useCallback((preset: typeof QUICK_PRESETS[0]) => {
    setName(preset.name)
    setBrand('')
    setCalories(preset.calories.toString())
    setProtein(preset.protein.toString())
    setCarbs(preset.carbs.toString())
    setFat(preset.fat.toString())
    setServingSize('1')
    setServingUnit('portion')
    setShowSearch(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  // Validate form
  const isValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      parseFloat(calories) >= 0 &&
      parseFloat(protein) >= 0 &&
      parseFloat(carbs) >= 0 &&
      parseFloat(fat) >= 0
    )
  }, [name, calories, protein, carbs, fat])

  // Log food
  const handleLogFood = useCallback(async () => {
    if (!isValid || isLogging) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      await logFoodMutation.mutateAsync({
        mealType,
        foods: [{
          name: name.trim(),
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          servings: 1,
        }],
        manual: true,
      })

      // Save to recent foods if requested
      if (saveAsCustom) {
        await addRecentFood({
          name: name.trim(),
          brand: brand.trim() || undefined,
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          servingSize: parseFloat(servingSize) || 100,
          servingUnit,
        })
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onLogSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Failed to log food:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [isValid, isLogging, name, brand, calories, protein, carbs, fat, servingSize, servingUnit, mealType, saveAsCustom, logFoodMutation, addRecentFood, onLogSuccess, handleClose])

  // Render search result item
  const renderSearchResult = useCallback(({ item }: { item: FoodSearchResult }) => (
    <Pressable
      style={styles.searchResultItem}
      onPress={() => handleSelectFood(item)}
    >
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand && (
          <Text style={styles.searchResultBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
      </View>
      <View style={styles.searchResultMacros}>
        <Text style={styles.searchResultCalories}>{item.calories} cal</Text>
        <Text style={styles.searchResultMacroText}>
          P:{item.protein}g C:{item.carbs}g F:{item.fat}g
        </Text>
      </View>
    </Pressable>
  ), [handleSelectFood])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#E2E8F0" />
          </Pressable>
          <Text style={styles.headerTitle}>{'>'} MANUAL ENTRY</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Section */}
          {showSearch && (
            <SystemWindow title="SEARCH FOODS" style={styles.section}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Open Food Facts..."
                  placeholderTextColor="#64748B"
                  value={query}
                  onChangeText={updateQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <Pressable onPress={clearSearch}>
                    <Ionicons name="close-circle" size={18} color="#64748B" />
                  </Pressable>
                )}
              </View>

              {/* Search Results */}
              {isSearching && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#60A5FA" />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}

              {results.length > 0 && (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSearchResult}
                  style={styles.searchResults}
                  scrollEnabled={false}
                />
              )}

              {/* Recent Foods */}
              {query.length === 0 && recentFoods.length > 0 && (
                <View style={styles.recentSection}>
                  <Text style={styles.recentTitle}>Recent</Text>
                  {recentFoods.slice(0, 5).map((food) => (
                    <Pressable
                      key={food.id}
                      style={styles.recentItem}
                      onPress={() => handleSelectFood(food)}
                    >
                      <Text style={styles.recentItemName} numberOfLines={1}>
                        {food.name}
                      </Text>
                      <Text style={styles.recentItemCalories}>
                        {food.calories} cal
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Quick Presets */}
              {query.length === 0 && (
                <View style={styles.presetsSection}>
                  <Text style={styles.recentTitle}>Quick Add</Text>
                  <View style={styles.presetsGrid}>
                    {QUICK_PRESETS.map((preset, index) => (
                      <Pressable
                        key={index}
                        style={styles.presetButton}
                        onPress={() => handleSelectPreset(preset)}
                      >
                        <Text style={styles.presetName} numberOfLines={1}>
                          {preset.name}
                        </Text>
                        <Text style={styles.presetCalories}>
                          {preset.calories} cal
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </SystemWindow>
          )}

          {/* Manual Entry Form */}
          <SystemWindow title="FOOD DETAILS" style={styles.section}>
            {/* Name & Brand */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Grilled Chicken"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Tyson"
                placeholderTextColor="#64748B"
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            {/* Macros */}
            <View style={styles.macroRow}>
              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Calories *</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Serving Size */}
            <View style={styles.servingRow}>
              <View style={styles.servingSizeInput}>
                <Text style={styles.inputLabel}>Serving Size</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="100"
                  placeholderTextColor="#64748B"
                  value={servingSize}
                  onChangeText={setServingSize}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.servingUnitPicker}>
                <Text style={styles.inputLabel}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {SERVING_UNITS.map((unit) => (
                    <Pressable
                      key={unit.label}
                      style={[
                        styles.unitButton,
                        servingUnit === unit.label && styles.unitButtonActive,
                      ]}
                      onPress={() => setServingUnit(unit.label)}
                    >
                      <Text
                        style={[
                          styles.unitButtonText,
                          servingUnit === unit.label && styles.unitButtonTextActive,
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </SystemWindow>

          {/* Meal Type */}
          <SystemWindow title="MEAL TYPE" style={styles.section}>
            <View style={styles.mealTypeRow}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    mealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text style={styles.mealTypeIcon}>
                    {type === 'breakfast' ? '🌅' :
                     type === 'lunch' ? '☀️' :
                     type === 'dinner' ? '🌙' : '🍎'}
                  </Text>
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === type && styles.mealTypeTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SystemWindow>

          {/* Save as Custom */}
          <Pressable
            style={styles.saveCustomRow}
            onPress={() => setSaveAsCustom(!saveAsCustom)}
          >
            <Ionicons
              name={saveAsCustom ? 'checkbox' : 'square-outline'}
              size={22}
              color={saveAsCustom ? '#4ADE80' : '#64748B'}
            />
            <Text style={styles.saveCustomText}>
              Save to My Foods for quick access
            </Text>
          </Pressable>

          {/* Log Button */}
          <Pressable
            style={[styles.logButton, !isValid && styles.logButtonDisabled]}
            onPress={handleLogFood}
            disabled={!isValid || isLogging}
          >
            {isLogging ? (
              <ActivityIndicator size="small" color="#0A0A0F" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#0A0A0F" />
                <Text style={styles.logButtonText}>Log Food</Text>
              </>
            )}
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#E2E8F0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  searchResultName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  searchResultBrand: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  searchResultMacros: {
    alignItems: 'flex-end',
  },
  searchResultCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  searchResultMacroText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  recentSection: {
    marginTop: 8,
  },
  recentTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(96, 165, 250, 0.3)',
    marginBottom: 4,
  },
  recentItemName: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },
  recentItemCalories: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  presetsSection: {
    marginTop: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '48%',
  },
  presetName: {
    fontSize: 11,
    color: '#4ADE80',
    marginBottom: 2,
  },
  presetCalories: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  macroInput: {
    flex: 1,
  },
  numberInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  servingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servingSizeInput: {
    width: 100,
  },
  servingUnitPicker: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitButtonActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60A5FA',
  },
  unitButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  unitButtonTextActive: {
    color: '#60A5FA',
  },
  mealTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealTypeButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#A855F7',
  },
  mealTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  mealTypeTextActive: {
    color: '#A855F7',
    fontWeight: 'bold',
  },
  saveCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 16,
  },
  saveCustomText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ADE80',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logButtonDisabled: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  bottomSpacer: {
    height: 40,
  },
})
