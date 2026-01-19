import { Hono } from 'hono'
import type { Context } from 'hono'
import {
  generateNarrative,
  generateDailyHeader,
  generateQuestCompleteMessage,
  generateStreakMessage,
  generateDebuffMessage,
  generateLevelUpMessage,
  generateReturnMessage,
  getContent,
  getInterpolatedContent,
  type NarrativeCategory,
} from '../services/narrative'

/**
 * Narrative Tier System
 *
 * TIER 1 (Templates): High-frequency, must always work
 * - Quest completion ticker
 * - XP notifications
 * - Error states
 *
 * TIER 2 (AI-Enhanced): Personalized key moments
 * - Daily login greeting
 * - Streak milestones
 * - Return after absence
 * - Level-up reflections
 */

type NarrativeTier = 'template' | 'ai'

interface NarrativeRequest {
  type: string
  data?: Record<string, unknown>
}

// Define which narrative types use which tier
const NARRATIVE_TIERS: Record<string, NarrativeTier> = {
  // Tier 1: Templates (fast, reliable)
  'quest.complete': 'template',
  'xp.award': 'template',
  'quest.header': 'template',
  error: 'template',
  onboarding: 'template',
  'boss.intro': 'template',
  'boss.phase': 'template',
  'title.desc': 'template',
  'dungeon.entry': 'template',

  // Tier 2: AI-Enhanced (personalized)
  'daily.greeting': 'ai',
  'streak.milestone': 'ai',
  'player.return': 'ai',
  'level.up': 'ai',
  'debuff.warning': 'ai',
  'weekly.summary': 'ai',
  'system.observation': 'ai',
}

const narrativeRoutes = new Hono()

/**
 * Generate narrative content
 * POST /api/narrative/generate
 *
 * Body:
 * - type: string (e.g., 'daily.greeting', 'quest.complete')
 * - data: optional context data
 */
narrativeRoutes.post('/generate', async (c: Context) => {
  // Get user from auth context (if available)
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const body = await c.req.json<NarrativeRequest>()
    const { type, data } = body

    if (!type) {
      return c.json({ error: 'Narrative type required' }, 400)
    }

    // Determine tier for this narrative type
    const tier = NARRATIVE_TIERS[type] ?? 'template'

    // Route to appropriate handler
    if (tier === 'template') {
      return await handleTemplateNarrative(c, userId, type, data)
    } else {
      return await handleAINarrative(c, userId, type, data)
    }
  } catch (error) {
    console.error('[NARRATIVE] Generate error:', error)
    return c.json({ error: 'Failed to generate narrative' }, 500)
  }
})

/**
 * Get daily greeting (AI-enhanced)
 * GET /api/narrative/daily-greeting
 */
narrativeRoutes.get('/daily-greeting', async (c: Context) => {
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const result = await generateDailyHeader(userId)
    return c.json({
      content: result.content,
      aiGenerated: result.aiGenerated,
      tier: 'ai',
    })
  } catch (error) {
    console.error('[NARRATIVE] Daily greeting error:', error)
    return c.json({ error: 'Failed to generate greeting' }, 500)
  }
})

/**
 * Get streak milestone message (AI-enhanced)
 * POST /api/narrative/streak-milestone
 */
narrativeRoutes.post('/streak-milestone', async (c: Context) => {
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const body = await c.req.json<{ streakDays: number }>()
    const result = await generateStreakMessage(userId, body.streakDays)
    return c.json({
      content: result.content,
      aiGenerated: result.aiGenerated,
      tier: 'ai',
    })
  } catch (error) {
    console.error('[NARRATIVE] Streak milestone error:', error)
    return c.json({ error: 'Failed to generate message' }, 500)
  }
})

/**
 * Get level up message (AI-enhanced)
 * POST /api/narrative/level-up
 */
narrativeRoutes.post('/level-up', async (c: Context) => {
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const body = await c.req.json<{ newLevel: number; totalXP: number }>()
    const result = await generateLevelUpMessage(userId, body.newLevel, body.totalXP)
    return c.json({
      content: result.content,
      aiGenerated: result.aiGenerated,
      tier: 'ai',
    })
  } catch (error) {
    console.error('[NARRATIVE] Level up error:', error)
    return c.json({ error: 'Failed to generate message' }, 500)
  }
})

/**
 * Get return message (AI-enhanced)
 * POST /api/narrative/return
 */
narrativeRoutes.post('/return', async (c: Context) => {
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const body = await c.req.json<{ daysAbsent: number; previousLevel: number }>()
    const result = await generateReturnMessage(userId, body.daysAbsent, body.previousLevel)
    return c.json({
      content: result.content,
      aiGenerated: result.aiGenerated,
      tier: 'ai',
    })
  } catch (error) {
    console.error('[NARRATIVE] Return message error:', error)
    return c.json({ error: 'Failed to generate message' }, 500)
  }
})

/**
 * Get quest completion message (Template)
 * POST /api/narrative/quest-complete
 */
narrativeRoutes.post('/quest-complete', async (c: Context) => {
  const userId = c.get('userId') as string | undefined

  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const body = await c.req.json<{
      questName: string
      xpEarned: number
      targetValue: number
      actualValue: number
      isAllComplete?: boolean
    }>()

    // Quest completion uses templates for speed (high frequency)
    const result = await generateQuestCompleteMessage(userId, body)
    return c.json({
      content: result.content,
      aiGenerated: false, // Force template for quest complete
      tier: 'template',
      templateKey: result.templateKey,
    })
  } catch (error) {
    console.error('[NARRATIVE] Quest complete error:', error)
    return c.json({ error: 'Failed to generate message' }, 500)
  }
})

/**
 * Handle template-based narrative (Tier 1)
 */
async function handleTemplateNarrative(
  c: Context,
  userId: string,
  type: string,
  data?: Record<string, unknown>
) {
  // Map type to template key
  const templateKey = mapTypeToTemplateKey(type, data)

  // Get and interpolate content
  const variables = (data as Record<string, string | number>) ?? {}
  const content = await getInterpolatedContent(templateKey, variables)

  if (!content) {
    // Fallback to generic template
    const fallback = await getContent('system.unknown')
    return c.json({
      content: fallback ?? '[SYSTEM] Message unavailable.',
      aiGenerated: false,
      tier: 'template',
      error: 'Template not found',
    })
  }

  return c.json({
    content,
    aiGenerated: false,
    tier: 'template',
    templateKey,
  })
}

/**
 * Handle AI-enhanced narrative (Tier 2)
 */
async function handleAINarrative(
  c: Context,
  userId: string,
  type: string,
  data?: Record<string, unknown>
) {
  // Map type to category and fallback key
  const { category, fallbackKey } = mapTypeToCategory(type)

  const result = await generateNarrative({
    userId,
    category,
    context: {
      event: type,
      data,
    },
    variables: (data as Record<string, string | number>) ?? {},
    fallbackKey,
  })

  return c.json({
    content: result.content,
    aiGenerated: result.aiGenerated,
    tier: 'ai',
    templateKey: result.templateKey,
    error: result.error,
  })
}

/**
 * Map narrative type to template key
 */
function mapTypeToTemplateKey(type: string, data?: Record<string, unknown>): string {
  const typeKeyMap: Record<string, string> = {
    'quest.complete': 'quest.complete.default',
    'xp.award': 'quest.complete.default',
    'quest.header': 'daily.header.default',
    error: 'system.error',
    'boss.intro': `boss.${(data?.bossName as string) ?? 'inconsistent'}.intro`,
    'boss.phase': `boss.${(data?.bossName as string) ?? 'inconsistent'}.phase${(data?.phase as number) ?? 1}.intro`,
    'title.desc': `title.${(data?.titleKey as string) ?? 'beginner'}.desc`,
    'dungeon.entry': `dungeon.${(data?.rank as string) ?? 'e'}.${(data?.dungeonName as string) ?? 'morning'}.entry`,
  }

  return typeKeyMap[type] ?? type
}

/**
 * Map narrative type to category and fallback key
 */
function mapTypeToCategory(type: string): { category: NarrativeCategory; fallbackKey: string } {
  const categoryMap: Record<string, { category: NarrativeCategory; fallbackKey: string }> = {
    'daily.greeting': { category: 'DAILY_QUEST', fallbackKey: 'daily.streak_continue' },
    'streak.milestone': { category: 'SYSTEM_MESSAGE', fallbackKey: 'streak.milestone.7' },
    'player.return': { category: 'SYSTEM_MESSAGE', fallbackKey: 'return.short' },
    'level.up': { category: 'LEVEL_UP', fallbackKey: 'levelup.default' },
    'debuff.warning': { category: 'DEBUFF', fallbackKey: 'debuff.warning' },
    'weekly.summary': { category: 'SYSTEM_MESSAGE', fallbackKey: 'daily.header.default' },
    'system.observation': { category: 'SYSTEM_MESSAGE', fallbackKey: 'philosophy.observation' },
  }

  return categoryMap[type] ?? { category: 'SYSTEM_MESSAGE', fallbackKey: 'system.unknown' }
}

/**
 * Get narrative tier info
 * GET /api/narrative/tiers
 */
narrativeRoutes.get('/tiers', (c: Context) => {
  return c.json({
    tiers: {
      template: {
        description: 'Fast, reliable, always works. Used for high-frequency events.',
        types: Object.entries(NARRATIVE_TIERS)
          .filter(([, tier]) => tier === 'template')
          .map(([type]) => type),
      },
      ai: {
        description: 'Dynamic, personalized. Used for key moments.',
        types: Object.entries(NARRATIVE_TIERS)
          .filter(([, tier]) => tier === 'ai')
          .map(([type]) => type),
      },
    },
  })
})

export default narrativeRoutes
