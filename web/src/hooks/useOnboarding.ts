/**
 * Onboarding hooks for baseline assessment and psychology profile
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type OnboardingPhase = 'narrative' | 'baseline' | 'psychology' | 'complete'

export interface BaselineAssessmentInput {
  // Physical
  startingWeight?: number
  targetWeight?: number
  height?: number
  weightUnit: 'kg' | 'lbs'
  pushUpsMax?: number
  plankHoldSeconds?: number
  mileTimeMinutes?: number
  
  // Activity
  dailyStepsBaseline?: number
  workoutsPerWeek?: number
  
  // Lifestyle
  sleepHoursBaseline?: number
  proteinGramsBaseline?: number
  alcoholDrinksPerWeek?: number
  
  // Experience
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced'
  hasGymAccess: boolean
  hasHomeEquipment: boolean
}

export interface PsychologyMessage {
  role: 'assistant' | 'user'
  content: string
  timestamp?: string
}

export interface PsychologyProfile {
  status: 'pending' | 'in_progress' | 'completed'
  motivationType?: string
  primaryBarrier?: string
  consistencyRisk?: string
  pressureResponse?: string
  accountabilityPreference?: string
  insights?: string[]
  recommendedApproach?: string
}

/**
 * Submit baseline assessment
 */
export function useSubmitBaseline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BaselineAssessmentInput) => {
      return api.post<{ assessment: object; stats: object }>('/onboarding/baseline', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

/**
 * Start psychology assessment
 */
export function useStartPsychology() {
  return useMutation({
    mutationFn: async () => {
      return api.post<{ profile: PsychologyProfile; initialMessage: string }>('/onboarding/psychology/start')
    },
  })
}

/**
 * Send message in psychology chat
 */
export function usePsychologyRespond() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (message: string) => {
      return api.post<{
        profile: PsychologyProfile
        response: string
        isComplete: boolean
      }>('/onboarding/psychology/respond', { message })
    },
    onSuccess: (data) => {
      if (data.isComplete) {
        queryClient.invalidateQueries({ queryKey: ['player'] })
        queryClient.invalidateQueries({ queryKey: ['onboarding'] })
      }
    },
  })
}

/**
 * Skip baseline assessment
 */
export function useSkipBaseline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return api.post<{ skipped: boolean }>('/onboarding/baseline/skip')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

/**
 * Skip psychology assessment
 */
export function useSkipPsychology() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return api.post<{ skipped: boolean }>('/onboarding/psychology/skip')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

/**
 * Complete onboarding
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return api.post<{ completed: boolean }>('/onboarding/complete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'] })
    },
  })
}

/**
 * Get onboarding status
 */
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      return api.get<{
        phase: OnboardingPhase
        baselineCompleted: boolean
        psychologyCompleted: boolean
        narrativeCompleted: boolean
      }>('/onboarding/status')
    },
    staleTime: 30 * 1000,
  })
}
