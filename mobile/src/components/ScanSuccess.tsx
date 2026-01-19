/**
 * ScanSuccess - Success animation for barcode detection
 * Animated checkmark with haptic feedback
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface ScanSuccessProps {
  visible: boolean
  productName?: string
  onAnimationComplete?: () => void
}

/**
 * Animated success indicator
 */
export function ScanSuccess({
  visible,
  productName,
  onAnimationComplete,
}: ScanSuccessProps) {
  const scale = useSharedValue(0)
  const checkOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  React.useEffect(() => {
    if (visible) {
      // Trigger haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Animate in
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      })

      checkOpacity.value = withDelay(
        200,
        withSpring(1, { damping: 15 })
      )

      textOpacity.value = withDelay(
        400,
        withSpring(1, { damping: 15 }, () => {
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)()
          }
        })
      )
    } else {
      scale.value = withSpring(0)
      checkOpacity.value = withSpring(0)
      textOpacity.value = withSpring(0)
    }
  }, [visible, scale, checkOpacity, textOpacity, onAnimationComplete])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }))

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [
      { scale: withSpring(checkOpacity.value) },
    ],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: withSpring((1 - textOpacity.value) * 10) },
    ],
  }))

  if (!visible) return null

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.successCircle, containerStyle]}>
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.successText}>Product Found!</Text>
        {productName && (
          <Text style={styles.productText} numberOfLines={1}>
            {productName}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}

/**
 * Inline success indicator for compact spaces
 */
export function ScanSuccessInline({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0)

  React.useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      opacity.value = withSpring(1)
    } else {
      opacity.value = withSpring(0)
    }
  }, [visible, opacity])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.inlineContainer, style]}>
      <Text style={styles.inlineCheck}>✓</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#000',
    fontWeight: 'bold',
  },
  textContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  productText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#00FF00',
    maxWidth: 250,
    textAlign: 'center',
  },
  inlineContainer: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inlineCheck: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
})
