import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'

export type NarrativeCategory =
  | 'ONBOARDING'
  | 'SYSTEM_MESSAGE'
  | 'DAILY_QUEST'
  | 'DEBUFF'
  | 'DUNGEON'
  | 'BOSS'
  | 'TITLE'
  | 'SEASON'
  | 'LEVEL_UP'
  | 'DAILY_REMINDER'

export interface NarrativeContent {
  id: string
  key: string
  category: NarrativeCategory
  content: string
  context?: Record<string, unknown>
  isActive: boolean
}

export interface InterpolateResponse {
  key: string
  content: string
}

interface ContentResponse {
  category: string
  contents: NarrativeContent[]
}

/**
 * Fetch a single narrative content by key
 */
export function useNarrativeContent(key: string) {
  return useQuery({
    queryKey: queryKeys.content(key),
    queryFn: () => api.get<NarrativeContent>(`/api/content/${key}`),
    enabled: !!key,
    staleTime: 1000 * 60 * 5, // 5 minutes - content doesn't change often
  })
}

/**
 * Fetch all narrative content for a category
 */
export function useNarrativeCategory(category: NarrativeCategory) {
  return useQuery({
    queryKey: queryKeys.contentCategory(category),
    queryFn: () => api.get<ContentResponse>(`/api/content/category/${category.toLowerCase()}`),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Interpolate narrative content with player variables
 */
export function useInterpolateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      key,
      variables,
    }: {
      key: string
      variables: Record<string, string | number>
    }) => api.post<InterpolateResponse>(`/api/content/${key}/interpolate`, { variables }),
    onSuccess: (data) => {
      // Cache the interpolated content
      queryClient.setQueryData(queryKeys.content(`${data.key}_interpolated`), data)
    },
  })
}

/**
 * Get random content from a category (client-side selection)
 */
export function useRandomNarrativeContent(category: NarrativeCategory) {
  const { data, isLoading, error } = useNarrativeCategory(category)

  const randomContent = data?.contents?.length
    ? data.contents[Math.floor(Math.random() * data.contents.length)]
    : null

  return {
    data: randomContent,
    isLoading,
    error,
  }
}

/**
 * Helper to interpolate content locally without API call
 * Useful for simple variable replacement
 */
export function interpolateLocally(
  content: string,
  variables: Record<string, string | number>
): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, String(value))
  }
  return result
}

/**
 * Hook to get contextual daily greeting based on player state
 */
export function useDailyGreeting(playerData: {
  currentStreak: number
  level: number
  name: string
  debuffActive?: boolean
}) {
  const { data: categoryData, isLoading } = useNarrativeCategory('DAILY_QUEST')

  // Select appropriate greeting based on player state
  let selectedKey: string | undefined

  if (playerData.debuffActive) {
    selectedKey = 'daily.debuff_active'
  } else if (playerData.currentStreak >= 30) {
    selectedKey = 'daily.streak_30_plus'
  } else if (playerData.currentStreak >= 14) {
    selectedKey = 'daily.streak_14_plus'
  } else if (playerData.currentStreak >= 7) {
    selectedKey = 'daily.streak_7_plus'
  } else if (playerData.currentStreak >= 3) {
    selectedKey = 'daily.streak_3_plus'
  } else if (playerData.currentStreak > 0) {
    selectedKey = 'daily.streak_continue'
  } else {
    selectedKey = 'daily.streak_zero'
  }

  // Find the content
  const content = categoryData?.contents?.find((c) => c.key === selectedKey)

  // Interpolate with player data
  const interpolated = content
    ? interpolateLocally(content.content, {
        streak: playerData.currentStreak,
        level: playerData.level,
        name: playerData.name,
      })
    : null

  return {
    content: interpolated,
    key: selectedKey,
    isLoading,
  }
}

/**
 * Hook to get quest completion message
 */
export function useQuestCompletionMessage(questName: string, xpAwarded: number) {
  const { data: categoryData, isLoading } = useNarrativeCategory('DAILY_QUEST')

  // Find a completion message
  const completionMessages = categoryData?.contents?.filter((c) =>
    c.key.startsWith('quest.completion')
  )

  const randomMessage = completionMessages?.length
    ? completionMessages[Math.floor(Math.random() * completionMessages.length)]
    : null

  const interpolated = randomMessage
    ? interpolateLocally(randomMessage.content, {
        questName,
        xpAwarded,
      })
    : null

  return {
    content: interpolated,
    isLoading,
  }
}

/**
 * Hook to get streak milestone message
 */
export function useStreakMilestoneMessage(streak: number) {
  const { data: categoryData, isLoading } = useNarrativeCategory('DAILY_QUEST')

  // Find milestone message for this streak
  const milestoneKey = `streak.milestone_${streak}`
  const milestone = categoryData?.contents?.find((c) => c.key === milestoneKey)

  return {
    content: milestone?.content ?? null,
    isLoading,
    hasMilestone: !!milestone,
  }
}
