/**
 * Custom Quest API Routes
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import {
  getCustomQuestTemplates,
  getActiveCustomQuests,
  getCustomQuestTemplate,
  createCustomQuestTemplate,
  updateCustomQuestTemplate,
  activateCustomQuest,
  deactivateCustomQuest,
  archiveCustomQuest,
  deleteCustomQuestTemplate,
  getCustomQuestLogs,
  updateCustomQuestProgress,
  getCustomQuestStats,
  createDailyCustomQuestLogs,
} from '../services/custom-quest'
import { CUSTOM_QUEST_METRICS, MAX_ACTIVE_CUSTOM_QUESTS } from '../db/schema/custom-quests'
import { logger } from '../lib/logger'

const customQuestRoutes = new Hono()

const CATEGORIES = ['MOVEMENT', 'STRENGTH', 'RECOVERY', 'NUTRITION', 'DISCIPLINE'] as const
const STAT_TYPES = ['STR', 'AGI', 'VIT', 'DISC'] as const

/**
 * GET /custom-quests - Get all custom quest templates
 */
customQuestRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')!
  const includeArchived = c.req.query('includeArchived') === 'true'

  try {
    const templates = await getCustomQuestTemplates(user.id, includeArchived)
    const stats = await getCustomQuestStats(user.id)

    return c.json({
      templates,
      stats,
      maxActive: MAX_ACTIVE_CUSTOM_QUESTS,
    })
  } catch (error) {
    logger.error('Error fetching custom quests', { error, userId: user.id })
    return c.json({ error: 'Failed to fetch custom quests' }, 500)
  }
})

/**
 * GET /custom-quests/active - Get active custom quests only
 */
customQuestRoutes.get('/active', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const templates = await getActiveCustomQuests(user.id)
    return c.json({ templates })
  } catch (error) {
    logger.error('Error fetching active custom quests', { error, userId: user.id })
    return c.json({ error: 'Failed to fetch active custom quests' }, 500)
  }
})

/**
 * GET /custom-quests/metrics - Get available metrics for custom quests
 */
customQuestRoutes.get('/metrics', (c) => {
  return c.json({
    metrics: CUSTOM_QUEST_METRICS,
    categories: CATEGORIES,
    statTypes: STAT_TYPES,
    maxActive: MAX_ACTIVE_CUSTOM_QUESTS,
  })
})

/**
 * GET /custom-quests/logs/:date - Get custom quest logs for a date
 */
customQuestRoutes.get('/logs/:date', requireAuth, async (c) => {
  const user = c.get('user')!
  const date = c.req.param('date')

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
  }

  try {
    const logs = await getCustomQuestLogs(user.id, date)
    return c.json({ logs, date })
  } catch (error) {
    logger.error('Error fetching custom quest logs', { error, userId: user.id, date })
    return c.json({ error: 'Failed to fetch custom quest logs' }, 500)
  }
})

/**
 * POST /custom-quests/logs/:date/init - Initialize daily custom quest logs
 */
customQuestRoutes.post('/logs/:date/init', requireAuth, async (c) => {
  const user = c.get('user')!
  const date = c.req.param('date')

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
  }

  try {
    const logs = await createDailyCustomQuestLogs(user.id, date)
    return c.json({ logs, created: logs.length })
  } catch (error) {
    logger.error('Error initializing custom quest logs', { error, userId: user.id, date })
    return c.json({ error: 'Failed to initialize custom quest logs' }, 500)
  }
})

/**
 * GET /custom-quests/:id - Get single custom quest template
 */
customQuestRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('id')

  try {
    const template = await getCustomQuestTemplate(user.id, templateId)
    if (!template) {
      return c.json({ error: 'Custom quest not found' }, 404)
    }
    return c.json({ template })
  } catch (error) {
    logger.error('Error fetching custom quest', { error, userId: user.id, templateId })
    return c.json({ error: 'Failed to fetch custom quest' }, 500)
  }
})

/**
 * POST /custom-quests - Create a new custom quest template
 */
customQuestRoutes.post(
  '/',
  requireAuth,
  zValidator(
    'json',
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      category: z.enum(CATEGORIES),
      metric: z.string().min(1),
      targetValue: z.number().positive().max(100000),
      statType: z.enum(STAT_TYPES),
      icon: z.string().max(10).optional(),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      isDaily: z.boolean().optional(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const data = c.req.valid('json')

    try {
      const template = await createCustomQuestTemplate(user.id, data)
      return c.json({ template }, 201)
    } catch (error) {
      logger.error('Error creating custom quest', { error, userId: user.id })
      return c.json({ error: 'Failed to create custom quest' }, 500)
    }
  }
)

/**
 * PATCH /custom-quests/:id - Update a custom quest template
 */
customQuestRoutes.patch(
  '/:id',
  requireAuth,
  zValidator(
    'json',
    z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().min(1).max(500).optional(),
      category: z.enum(CATEGORIES).optional(),
      metric: z.string().min(1).optional(),
      targetValue: z.number().positive().max(100000).optional(),
      statType: z.enum(STAT_TYPES).optional(),
      icon: z.string().max(10).optional(),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      isDaily: z.boolean().optional(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const templateId = c.req.param('id')
    const updates = c.req.valid('json')

    try {
      const template = await updateCustomQuestTemplate(user.id, templateId, updates)
      if (!template) {
        return c.json({ error: 'Custom quest not found' }, 404)
      }
      return c.json({ template })
    } catch (error) {
      logger.error('Error updating custom quest', { error, userId: user.id, templateId })
      return c.json({ error: 'Failed to update custom quest' }, 500)
    }
  }
)

/**
 * POST /custom-quests/:id/activate - Activate a custom quest
 */
customQuestRoutes.post('/:id/activate', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('id')

  try {
    const result = await activateCustomQuest(user.id, templateId)
    if (!result.success) {
      return c.json({ error: result.message }, 400)
    }
    return c.json({ template: result.template, message: result.message })
  } catch (error) {
    logger.error('Error activating custom quest', { error, userId: user.id, templateId })
    return c.json({ error: 'Failed to activate custom quest' }, 500)
  }
})

/**
 * POST /custom-quests/:id/deactivate - Deactivate a custom quest
 */
customQuestRoutes.post('/:id/deactivate', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('id')

  try {
    const template = await deactivateCustomQuest(user.id, templateId)
    if (!template) {
      return c.json({ error: 'Custom quest not found' }, 404)
    }
    return c.json({ template, message: 'Quest deactivated' })
  } catch (error) {
    logger.error('Error deactivating custom quest', { error, userId: user.id, templateId })
    return c.json({ error: 'Failed to deactivate custom quest' }, 500)
  }
})

/**
 * POST /custom-quests/:id/archive - Archive a custom quest
 */
customQuestRoutes.post('/:id/archive', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('id')

  try {
    const template = await archiveCustomQuest(user.id, templateId)
    if (!template) {
      return c.json({ error: 'Custom quest not found' }, 404)
    }
    return c.json({ template, message: 'Quest archived' })
  } catch (error) {
    logger.error('Error archiving custom quest', { error, userId: user.id, templateId })
    return c.json({ error: 'Failed to archive custom quest' }, 500)
  }
})

/**
 * DELETE /custom-quests/:id - Delete a custom quest template
 */
customQuestRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('id')

  try {
    const deleted = await deleteCustomQuestTemplate(user.id, templateId)
    if (!deleted) {
      return c.json({ error: 'Custom quest not found' }, 404)
    }
    return c.json({ deleted: true, message: 'Quest deleted' })
  } catch (error) {
    logger.error('Error deleting custom quest', { error, userId: user.id, templateId })
    return c.json({ error: 'Failed to delete custom quest' }, 500)
  }
})

/**
 * POST /custom-quests/:id/progress - Update progress on a custom quest
 */
customQuestRoutes.post(
  '/:id/progress',
  requireAuth,
  zValidator(
    'json',
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      currentValue: z.number().min(0),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const templateId = c.req.param('id')
    const { date, currentValue } = c.req.valid('json')

    try {
      const result = await updateCustomQuestProgress(
        user.id,
        templateId,
        date,
        currentValue
      )

      return c.json({
        log: result.log,
        justCompleted: result.justCompleted,
        xpAwarded: result.xpAwarded,
      })
    } catch (error) {
      logger.error('Error updating custom quest progress', {
        error,
        userId: user.id,
        templateId,
      })
      return c.json({ error: 'Failed to update progress' }, 500)
    }
  }
)

export default customQuestRoutes
