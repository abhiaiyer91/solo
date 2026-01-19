/**
 * PhotoAnalysisScreen - Complete AI food photo analysis flow
 * Capture -> Analyze -> Review -> Log
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native'
import * as Haptics from 'expo-haptics'

import { PhotoCapture } from '../components/PhotoCapture'
import {
  FoodDetectionResults,
  NoFoodsDetected,
  AnalyzingIndicator,
} from '../components/FoodDetectionResults'
import { useFoodRecognition, type DetectedFood } from '../hooks/useFoodRecognition'
import type { MealType } from '../components/MealTypeSelector'

interface PhotoAnalysisScreenProps {
  onClose: () => void
  onLogSuccess?: () => void
  initialMealType?: MealType
}

type ScreenState = 'capture' | 'analyzing' | 'results' | 'no_foods' | 'error'

/**
 * Main photo analysis screen component
 */
export function PhotoAnalysisScreen({
  onClose,
  onLogSuccess,
  initialMealType,
}: PhotoAnalysisScreenProps) {
  const [screenState, setScreenState] = useState<ScreenState>('capture')
  const [showManualEntry, setShowManualEntry] = useState(false)

  const {
    status,
    photoUri,
    error,
    foods,
    totals,
    analyzePhoto,
    updateFoodPortion,
    toggleFoodIncluded,
    removeFood,
    addManualFood,
    reset,
    logMeal,
    isLogging,
  } = useFoodRecognition()

  // Handle photo capture
  const handleCapture = useCallback(async (uri: string) => {
    setScreenState('analyzing')

    const result = await analyzePhoto(uri, initialMealType)

    if (!result || result.foods.length === 0) {
      setScreenState('no_foods')
    } else {
      setScreenState('results')
    }
  }, [analyzePhoto, initialMealType])

  // Handle retake
  const handleRetake = useCallback(() => {
    reset()
    setScreenState('capture')
  }, [reset])

  // Handle meal logging
  const handleLogMeal = useCallback(async (mealType: MealType) => {
    try {
      await logMeal({ mealType })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onLogSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to log meal:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [logMeal, onLogSuccess, onClose])

  // Handle add manual food
  const handleAddManual = useCallback((food: Omit<DetectedFood, 'id' | 'portion' | 'included'>) => {
    addManualFood(food)
    setShowManualEntry(false)
    // If we were in no_foods state, move to results
    if (screenState === 'no_foods') {
      setScreenState('results')
    }
  }, [addManualFood, screenState])

  // Handle manual entry from no_foods state
  const handleManualEntry = useCallback(() => {
    setShowManualEntry(true)
    setScreenState('results')
  }, [])

  // Render based on state
  const renderContent = () => {
    switch (screenState) {
      case 'capture':
        return (
          <PhotoCapture
            onCapture={handleCapture}
            onClose={onClose}
            isAnalyzing={false}
          />
        )

      case 'analyzing':
        return (
          <SafeAreaView style={styles.container}>
            <AnalyzingIndicator />
          </SafeAreaView>
        )

      case 'no_foods':
        return (
          <SafeAreaView style={styles.container}>
            <NoFoodsDetected
              onRetake={handleRetake}
              onManualEntry={handleManualEntry}
            />
          </SafeAreaView>
        )

      case 'results':
        return (
          <SafeAreaView style={styles.container}>
            <FoodDetectionResults
              photoUri={photoUri}
              foods={foods}
              totals={totals}
              onPortionChange={updateFoodPortion}
              onToggleInclude={toggleFoodIncluded}
              onRemove={removeFood}
              onAddManual={handleAddManual}
              onLogMeal={handleLogMeal}
              onRetake={handleRetake}
              isLogging={isLogging}
            />
          </SafeAreaView>
        )

      case 'error':
        return (
          <SafeAreaView style={styles.container}>
            <NoFoodsDetected
              onRetake={handleRetake}
              onManualEntry={handleManualEntry}
            />
          </SafeAreaView>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderContent()}
    </View>
  )
}

/**
 * Quick photo button that opens the full analysis flow
 */
export function QuickPhotoButton({
  onPress,
  disabled = false,
}: {
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <View style={styles.quickButton}>
      {/* This would typically be an icon button that opens PhotoAnalysisScreen */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  quickButton: {
    // Quick button styles
  },
})
