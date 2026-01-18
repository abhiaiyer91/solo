import { dbClient as db } from '../db'
import { narrativeContents } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getNarratorAgent, isAIAvailable } from '../mastra'
import { fetchPlayerContext } from '../mastra/tools/playerContext'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for narrative service')
  }
  return db
}

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
  context: Record<string, unknown> | null
  isActive: boolean
}

// Default fallback content for missing keys
const FALLBACK_CONTENT: Record<string, string> = {
  'system.error': '[SYSTEM] An error has occurred.',
  'system.loading': '[SYSTEM] Loading...',
  'system.unknown': '[SYSTEM] Unknown content requested.',
}

/**
 * Get content by key
 */
export async function getContent(key: string): Promise<string | null> {
  const [content] = await requireDb()
    .select()
    .from(narrativeContents)
    .where(and(eq(narrativeContents.key, key), eq(narrativeContents.isActive, true)))
    .limit(1)

  return content?.content ?? FALLBACK_CONTENT[key] ?? null
}

/**
 * Get full content record by key
 */
export async function getContentRecord(key: string): Promise<NarrativeContent | null> {
  const [content] = await requireDb()
    .select()
    .from(narrativeContents)
    .where(and(eq(narrativeContents.key, key), eq(narrativeContents.isActive, true)))
    .limit(1)

  if (!content) return null

  return {
    id: content.id,
    key: content.key,
    category: content.category as NarrativeCategory,
    content: content.content,
    context: content.context as Record<string, unknown> | null,
    isActive: content.isActive,
  }
}

/**
 * Get all content for a category
 */
export async function getContentByCategory(
  category: NarrativeCategory
): Promise<Record<string, string>> {
  const contents = await requireDb()
    .select()
    .from(narrativeContents)
    .where(
      and(eq(narrativeContents.category, category), eq(narrativeContents.isActive, true))
    )

  return Object.fromEntries(contents.map((c) => [c.key, c.content]))
}

/**
 * Get all content records for a category
 */
export async function getContentRecordsByCategory(
  category: NarrativeCategory
): Promise<NarrativeContent[]> {
  const contents = await requireDb()
    .select()
    .from(narrativeContents)
    .where(
      and(eq(narrativeContents.category, category), eq(narrativeContents.isActive, true))
    )

  return contents.map((c) => ({
    id: c.id,
    key: c.key,
    category: c.category as NarrativeCategory,
    content: c.content,
    context: c.context as Record<string, unknown> | null,
    isActive: c.isActive,
  }))
}

/**
 * Interpolate variables in content
 * Variables are in the format {{variable_name}}
 */
export function interpolate(
  content: string,
  variables: Record<string, string | number>
): string {
  let result = content

  for (const [varName, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g')
    result = result.replace(regex, String(value))
  }

  return result
}

/**
 * Get content by key and interpolate variables
 */
export async function getInterpolatedContent(
  key: string,
  variables: Record<string, string | number>
): Promise<string | null> {
  const content = await getContent(key)
  if (!content) return null

  return interpolate(content, variables)
}

/**
 * Get random content from a category
 * Useful for varied system messages
 */
export async function getRandomContent(category: NarrativeCategory): Promise<string | null> {
  const contents = await requireDb()
    .select()
    .from(narrativeContents)
    .where(
      and(eq(narrativeContents.category, category), eq(narrativeContents.isActive, true))
    )

  if (contents.length === 0) return null

  const randomIndex = Math.floor(Math.random() * contents.length)
  return contents[randomIndex]!.content
}

/**
 * Get random content from a category and interpolate
 */
export async function getRandomInterpolatedContent(
  category: NarrativeCategory,
  variables: Record<string, string | number>
): Promise<string | null> {
  const content = await getRandomContent(category)
  if (!content) return null

  return interpolate(content, variables)
}

// ============================================================================
// AI-Powered Narrative Generation
// ============================================================================

/**
 * Narrative generation options
 */
export interface GenerateNarrativeOptions {
  /** User ID for personalization */
  userId: string
  /** The type of narrative to generate */
  category: NarrativeCategory
  /** Specific context for the narrative */
  context?: {
    /** Event type (e.g., 'quest_complete', 'level_up', 'streak_milestone') */
    event?: string
    /** Additional data for the narrative */
    data?: Record<string, unknown>
  }
  /** Variables to interpolate in fallback content */
  variables?: Record<string, string | number>
  /** Fallback template key if AI is unavailable */
  fallbackKey?: string
}

/**
 * Narrative generation result
 */
export interface GenerateNarrativeResult {
  /** The generated narrative content */
  content: string
  /** Whether AI was used for generation */
  aiGenerated: boolean
  /** The template key used (if fallback) */
  templateKey?: string
  /** Error message if generation failed */
  error?: string
}

/**
 * Generate dynamic, personalized narrative content using AI
 *
 * Uses the Mastra narrator agent to generate contextual messages in the System voice.
 * Falls back to static templates if AI is unavailable or fails.
 *
 * @example
 * ```typescript
 * const result = await generateNarrative({
 *   userId: 'user123',
 *   category: 'DAILY_QUEST',
 *   context: {
 *     event: 'quest_complete',
 *     data: { questName: 'Daily Steps', xpEarned: 50 }
 *   },
 *   fallbackKey: 'quest.complete.default'
 * })
 * ```
 */
export async function generateNarrative(
  options: GenerateNarrativeOptions
): Promise<GenerateNarrativeResult> {
  const { userId, category, context, variables, fallbackKey } = options

  // Check if AI is available
  if (!isAIAvailable()) {
    return await getFallbackNarrative(category, variables, fallbackKey)
  }

  try {
    const agent = getNarratorAgent()
    if (!agent) {
      return await getFallbackNarrative(category, variables, fallbackKey)
    }

    // Fetch player context for personalization
    const playerContext = await fetchPlayerContext(userId)

    // Build the prompt for the narrator agent
    const prompt = buildNarrativePrompt(category, context, playerContext)

    // Generate narrative using the agent
    const response = await agent.generate(prompt)

    // Extract the text content from the response
    const content = response.text?.trim()

    if (!content) {
      console.warn('[NARRATIVE] AI returned empty content, using fallback')
      return await getFallbackNarrative(category, variables, fallbackKey)
    }

    return {
      content,
      aiGenerated: true,
    }
  } catch (error) {
    console.error('[NARRATIVE] AI generation failed:', error)
    return await getFallbackNarrative(category, variables, fallbackKey)
  }
}

/**
 * Build the prompt for narrative generation
 */
function buildNarrativePrompt(
  category: NarrativeCategory,
  context?: GenerateNarrativeOptions['context'],
  playerContext?: Awaited<ReturnType<typeof fetchPlayerContext>>
): string {
  const parts: string[] = []

  // Add category context
  parts.push(`Generate a ${category.toLowerCase().replace('_', ' ')} message.`)

  // Add player context if available
  if (playerContext) {
    parts.push('\nPlayer context:')
    parts.push(`- Level: ${playerContext.level}`)
    parts.push(`- Current streak: ${playerContext.currentStreak} days`)
    if (playerContext.hasDebuff) {
      parts.push('- Status: Performance degradation active')
    }
    if (playerContext.activeTitle) {
      parts.push(`- Title: ${playerContext.activeTitle.name}`)
    }
    if (playerContext.todayProgress) {
      parts.push(
        `- Today: ${playerContext.todayProgress.coreQuestsCompleted}/${playerContext.todayProgress.coreQuestsTotal} core quests`
      )
    }
  }

  // Add specific event context
  if (context?.event) {
    parts.push(`\nEvent: ${context.event}`)
    if (context.data) {
      parts.push('Event data:')
      for (const [key, value] of Object.entries(context.data)) {
        parts.push(`- ${key}: ${value}`)
      }
    }
  }

  // Add generation instructions
  parts.push('\nGenerate a short message (2-5 sentences) in the System voice.')
  parts.push('Remember: No exclamation marks. No encouragement. Only observation.')

  return parts.join('\n')
}

/**
 * Get fallback narrative from static templates
 */
async function getFallbackNarrative(
  category: NarrativeCategory,
  variables?: Record<string, string | number>,
  fallbackKey?: string
): Promise<GenerateNarrativeResult> {
  try {
    // Try specific fallback key first
    if (fallbackKey) {
      const content = await getContent(fallbackKey)
      if (content) {
        return {
          content: variables ? interpolate(content, variables) : content,
          aiGenerated: false,
          templateKey: fallbackKey,
        }
      }
    }

    // Fall back to random content from category
    const content = await getRandomContent(category)
    if (content) {
      return {
        content: variables ? interpolate(content, variables) : content,
        aiGenerated: false,
      }
    }

    // Ultimate fallback
    return {
      content: FALLBACK_CONTENT['system.unknown'] ?? '[SYSTEM] Message unavailable.',
      aiGenerated: false,
      error: 'No templates available for category',
    }
  } catch (error) {
    console.error('[NARRATIVE] Fallback retrieval failed:', error)
    return {
      content: FALLBACK_CONTENT['system.error'] ?? '[SYSTEM] An error has occurred.',
      aiGenerated: false,
      error: 'Failed to retrieve fallback content',
    }
  }
}

/**
 * Generate a contextual daily header message
 */
export async function generateDailyHeader(userId: string): Promise<GenerateNarrativeResult> {
  const playerContext = await fetchPlayerContext(userId)

  // Determine which fallback key to use based on context
  let fallbackKey = 'daily.header.default'
  const variables: Record<string, string | number> = {}

  if (playerContext) {
    if (playerContext.hasDebuff) {
      fallbackKey = 'daily.header.debuff'
    } else if (playerContext.currentStreak >= 30) {
      fallbackKey = 'daily.header.streak_30'
      variables['streak_days'] = playerContext.currentStreak
    } else if (playerContext.currentStreak >= 7) {
      fallbackKey = 'daily.header.streak_7'
      variables['streak_days'] = playerContext.currentStreak
    }

    // Check for weekend
    const dayOfWeek = new Date().getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      fallbackKey = 'daily.header.weekend'
    }

    // Check for Monday
    if (dayOfWeek === 1) {
      fallbackKey = 'daily.header.monday'
      variables['week_number'] = Math.ceil(
        (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    }
  }

  return generateNarrative({
    userId,
    category: 'DAILY_QUEST',
    context: {
      event: 'daily_start',
      data: playerContext
        ? {
            streak: playerContext.currentStreak,
            level: playerContext.level,
            hasDebuff: playerContext.hasDebuff,
          }
        : undefined,
    },
    variables,
    fallbackKey,
  })
}

/**
 * Generate a quest completion message
 */
export async function generateQuestCompleteMessage(
  userId: string,
  questData: {
    questName: string
    xpEarned: number
    targetValue: number
    actualValue: number
    isAllComplete?: boolean
  }
): Promise<GenerateNarrativeResult> {
  const { questName, xpEarned, targetValue, actualValue, isAllComplete } = questData

  // Determine fallback key based on completion type
  let fallbackKey = 'quest.complete.default'
  if (isAllComplete) {
    fallbackKey = 'quest.complete.all'
  } else if (actualValue > targetValue * 1.1) {
    fallbackKey = 'quest.complete.exceeded'
  } else if (actualValue <= targetValue * 1.05) {
    fallbackKey = 'quest.complete.barely'
  }

  const variables: Record<string, string | number> = {
    xp_amount: xpEarned,
    target_value: targetValue,
    actual_value: actualValue,
    total_xp: xpEarned,
  }

  return generateNarrative({
    userId,
    category: 'DAILY_QUEST',
    context: {
      event: 'quest_complete',
      data: {
        questName,
        xpEarned,
        targetValue,
        actualValue,
        exceededBy: actualValue > targetValue ? actualValue - targetValue : 0,
      },
    },
    variables,
    fallbackKey,
  })
}

/**
 * Generate a streak milestone message
 */
export async function generateStreakMessage(
  userId: string,
  streakDays: number
): Promise<GenerateNarrativeResult> {
  // Determine milestone tier
  let fallbackKey = 'streak.milestone.3'
  if (streakDays >= 30) {
    fallbackKey = 'streak.milestone.30'
  } else if (streakDays >= 21) {
    fallbackKey = 'streak.milestone.21'
  } else if (streakDays >= 14) {
    fallbackKey = 'streak.milestone.14'
  } else if (streakDays >= 7) {
    fallbackKey = 'streak.milestone.7'
  }

  return generateNarrative({
    userId,
    category: 'SYSTEM_MESSAGE',
    context: {
      event: 'streak_milestone',
      data: { streakDays },
    },
    variables: { streak_days: streakDays },
    fallbackKey,
  })
}

/**
 * Generate a debuff notification message
 */
export async function generateDebuffMessage(
  userId: string,
  type: 'warning' | 'applied' | 'reminder' | 'cleared',
  data?: {
    incompleteCount?: number
    missedCount?: number
    hoursRemaining?: number
  }
): Promise<GenerateNarrativeResult> {
  const keyMap: Record<string, string> = {
    warning: 'debuff.warning',
    applied: 'debuff.applied',
    reminder: 'debuff.active.reminder',
    cleared: 'debuff.cleared',
  }

  const variables: Record<string, string | number> = {}
  if (data?.incompleteCount) variables['incomplete_count'] = data.incompleteCount
  if (data?.missedCount) variables['missed_count'] = data.missedCount
  if (data?.hoursRemaining) variables['hours_remaining'] = data.hoursRemaining

  return generateNarrative({
    userId,
    category: 'DEBUFF',
    context: {
      event: `debuff_${type}`,
      data,
    },
    variables,
    fallbackKey: keyMap[type],
  })
}

/**
 * Generate a level up message
 */
export async function generateLevelUpMessage(
  userId: string,
  newLevel: number,
  totalXP: number
): Promise<GenerateNarrativeResult> {
  return generateNarrative({
    userId,
    category: 'LEVEL_UP',
    context: {
      event: 'level_up',
      data: { newLevel, totalXP },
    },
    variables: {
      level: newLevel,
      total_xp: totalXP,
    },
    fallbackKey: 'level.achieved',
  })
}

/**
 * Generate a return/welcome back message
 */
export async function generateReturnMessage(
  userId: string,
  daysAbsent: number,
  previousLevel: number
): Promise<GenerateNarrativeResult> {
  let fallbackKey = 'return.short'
  if (daysAbsent >= 7) {
    fallbackKey = 'return.medium'
  }

  return generateNarrative({
    userId,
    category: 'SYSTEM_MESSAGE',
    context: {
      event: 'player_return',
      data: { daysAbsent, previousLevel },
    },
    variables: {
      days_absent: daysAbsent,
      level: previousLevel,
    },
    fallbackKey,
  })
}
