/**
 * Onboarding Screen - Full onboarding flow with API integration
 */

import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { MobileOnboarding, type OnboardingData } from '@/components/Onboarding';
import { useAuthStore } from '@/stores/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function OnboardingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [showSkip, setShowSkip] = useState(false);

  // Mutation to complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/player/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to complete onboarding');
      }
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['player'] });
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    },
  });

  // Handle onboarding completion
  const handleComplete = useCallback(
    async (data: OnboardingData) => {
      completeOnboarding.mutate();
    },
    [completeOnboarding]
  );

  // Handle skip
  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Onboarding?',
      'You can always view the System introduction later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => completeOnboarding.mutate(),
        },
      ]
    );
  }, [completeOnboarding]);

  // Show skip button after a delay
  setTimeout(() => setShowSkip(true), 5000);

  return (
    <View style={styles.container}>
      <MobileOnboarding onComplete={handleComplete} />

      {/* Skip button */}
      {showSkip && !completeOnboarding.isPending && (
        <View style={styles.skipContainer}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip to Dashboard</Text>
          </Pressable>
        </View>
      )}

      {/* Loading overlay */}
      {completeOnboarding.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>INITIALIZING HUNTER PROTOCOL...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
