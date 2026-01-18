import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { dbClient as db } from '../../db'
import { narrativeContents } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Narrative category type
 */
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

/**
 * Narrative template data
 */
export interface NarrativeTemplate {
  key: string
  content: string
  context: Record<string, unknown> | null
}

/**
 * Fetch narrative templates from database by category
 */
async function fetchNarrativeTemplates(
  category: NarrativeCategory
): Promise<NarrativeTemplate[]> {
  if (!db) {
    console.warn('[MASTRA] Database not available for narrative templates')
    return []
  }

  try {
    const templates = await db
      .select({
        key: narrativeContents.key,
        content: narrativeContents.content,
        context: narrativeContents.context,
      })
      .from(narrativeContents)
      .where(
        and(
          eq(narrativeContents.category, category),
          eq(narrativeContents.isActive, true)
        )
      )

    return templates.map((t) => ({
      key: t.key,
      content: t.content,
      context: t.context as Record<string, unknown> | null,
    }))
  } catch (error) {
    console.error('[MASTRA] Error fetching narrative templates:', error)
    return []
  }
}

/**
 * Fetch a specific narrative template by key
 */
async function fetchNarrativeTemplateByKey(
  key: string
): Promise<NarrativeTemplate | null> {
  if (!db) {
    console.warn('[MASTRA] Database not available for narrative templates')
    return null
  }

  try {
    const [template] = await db
      .select({
        key: narrativeContents.key,
        content: narrativeContents.content,
        context: narrativeContents.context,
      })
      .from(narrativeContents)
      .where(
        and(eq(narrativeContents.key, key), eq(narrativeContents.isActive, true))
      )
      .limit(1)

    if (!template) {
      return null
    }

    return {
      key: template.key,
      content: template.content,
      context: template.context as Record<string, unknown> | null,
    }
  } catch (error) {
    console.error('[MASTRA] Error fetching narrative template by key:', error)
    return null
  }
}

/**
 * Mastra tool for fetching narrative templates
 * Used by the narrator agent to maintain voice consistency
 */
export const getNarrativeTemplatesTool = createTool({
  id: 'getNarrativeTemplates',
  description:
    'Fetches narrative templates from the database for a specific category. Use these templates as reference to maintain the System voice consistency when generating new narrative content.',
  inputSchema: z.object({
    category: z
      .enum([
        'ONBOARDING',
        'SYSTEM_MESSAGE',
        'DAILY_QUEST',
        'DEBUFF',
        'DUNGEON',
        'BOSS',
        'TITLE',
        'SEASON',
        'LEVEL_UP',
        'DAILY_REMINDER',
      ])
      .describe('The category of narrative templates to fetch'),
    specificKey: z
      .string()
      .optional()
      .describe('Optional: fetch a specific template by key instead of all in category'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    templates: z.array(
      z.object({
        key: z.string(),
        content: z.string(),
      })
    ),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    // If a specific key is requested, fetch just that template
    if (context.specificKey) {
      const template = await fetchNarrativeTemplateByKey(context.specificKey)
      if (!template) {
        return {
          success: false,
          templates: [],
          error: `Template with key "${context.specificKey}" not found`,
        }
      }
      return {
        success: true,
        templates: [{ key: template.key, content: template.content }],
      }
    }

    // Fetch all templates for the category
    const templates = await fetchNarrativeTemplates(context.category)

    if (templates.length === 0) {
      return {
        success: true,
        templates: [],
        error: `No templates found for category "${context.category}"`,
      }
    }

    return {
      success: true,
      templates: templates.map((t) => ({ key: t.key, content: t.content })),
    }
  },
})

// Export fetch functions for direct use
export { fetchNarrativeTemplates, fetchNarrativeTemplateByKey }
