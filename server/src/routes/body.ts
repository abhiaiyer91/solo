/**
 * Body Composition API Routes
 * 
 * Endpoints for tracking weight, calories, and body composition.
 */

import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import {
  logBodyComposition,
  getBodyCompositionProgress,
  getTodayLog,
  processWeeklyDeficit,
  getWeightHistory,
  isBodyTrackingEnabled,
  setBodyTrackingEnabled,
} from '../services/body-composition'

const bodyRoutes = new Hono()

/**
 * GET /body-composition/settings
 * Get user's body tracking settings
 */
bodyRoutes.get('/body-composition/settings', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const enabled = await isBodyTrackingEnabled(user.id)
    
    return c.json({
      trackBodyComposition: enabled,
      message: enabled
        ? '[SYSTEM] Body composition tracking is active.'
        : '[SYSTEM] Body composition tracking is disabled.',
    })
  } catch (error) {
    logger.error('Get body settings error', { error })
    return c.json({ error: 'Failed to get body tracking settings' }, 500)
  }
})

/**
 * POST /body-composition/settings
 * Enable/disable body tracking
 */
bodyRoutes.post('/body-composition/settings', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const body = await c.req.json<{
      enabled: boolean
      targetWeight?: number
      targetCalories?: number
    }>()
    
    await setBodyTrackingEnabled(
      user.id,
      body.enabled,
      body.targetWeight,
      body.targetCalories
    )
    
    return c.json({
      trackBodyComposition: body.enabled,
      message: body.enabled
        ? '[SYSTEM] Body composition tracking enabled. Your progress will now be monitored.'
        : '[SYSTEM] Body composition tracking disabled.',
    })
  } catch (error) {
    logger.error('Update body settings error', { error })
    return c.json({ error: 'Failed to update body tracking settings' }, 500)
  }
})

/**
 * POST /body-composition
 * Log a body composition entry
 */
bodyRoutes.post('/body-composition', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    // Check if tracking is enabled
    const enabled = await isBodyTrackingEnabled(user.id)
    if (!enabled) {
      return c.json({
        error: 'Body composition tracking not enabled',
        message: '[SYSTEM] Enable body tracking in settings to log entries.',
      }, 400)
    }
    
    const body = await c.req.json<{
      date?: string
      weight?: number
      caloriesConsumed?: number
      caloriesBurned?: number
      basalMetabolicRate?: number
      bodyFatPercent?: number
      muscleMass?: number
      waterPercent?: number
      boneMass?: number
      notes?: string
    }>()
    
    // Validate at least one field is provided
    if (
      body.weight === undefined &&
      body.caloriesConsumed === undefined &&
      body.caloriesBurned === undefined &&
      body.bodyFatPercent === undefined
    ) {
      return c.json({
        error: 'At least one measurement required',
        message: '[SYSTEM] Provide weight, calories, or body composition data.',
      }, 400)
    }
    
    const log = await logBodyComposition(user.id, body)
    
    return c.json({
      log,
      message: '[SYSTEM] Body composition logged.',
    })
  } catch (error) {
    logger.error('Log body composition error', { error })
    return c.json({ error: 'Failed to log body composition' }, 500)
  }
})

/**
 * GET /body-composition/today
 * Get today's log
 */
bodyRoutes.get('/body-composition/today', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const log = await getTodayLog(user.id)
    
    return c.json({
      log,
      message: log
        ? '[SYSTEM] Today\'s log retrieved.'
        : '[SYSTEM] No log for today yet.',
    })
  } catch (error) {
    logger.error('Get today log error', { error })
    return c.json({ error: 'Failed to get today\'s log' }, 500)
  }
})

/**
 * GET /body-composition/progress
 * Get body composition progress summary
 */
bodyRoutes.get('/body-composition/progress', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const daysParam = c.req.query('days')
    const days = daysParam ? parseInt(daysParam, 10) : 30
    
    const progress = await getBodyCompositionProgress(user.id, days)
    
    return c.json({
      ...progress,
      message: `[SYSTEM] ${days}-day progress retrieved.`,
    })
  } catch (error) {
    logger.error('Get progress error', { error })
    return c.json({ error: 'Failed to get progress' }, 500)
  }
})

/**
 * GET /body-composition/weight-history
 * Get weight history for charting
 */
bodyRoutes.get('/body-composition/weight-history', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const daysParam = c.req.query('days')
    const days = daysParam ? parseInt(daysParam, 10) : 90
    
    const history = await getWeightHistory(user.id, days)
    
    return c.json({
      history,
      message: '[SYSTEM] Weight history retrieved.',
    })
  } catch (error) {
    logger.error('Get weight history error', { error })
    return c.json({ error: 'Failed to get weight history' }, 500)
  }
})

/**
 * POST /body-composition/process-weekly
 * Manually trigger weekly deficit processing
 * (Normally runs automatically during reconciliation)
 */
bodyRoutes.post('/body-composition/process-weekly', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const result = await processWeeklyDeficit(user.id)
    
    if (!result.processed) {
      return c.json({
        ...result,
        message: result.xpAwarded > 0
          ? '[SYSTEM] Weekly deficit already processed.'
          : '[SYSTEM] No deficit to process.',
      })
    }
    
    return c.json({
      ...result,
      message: result.xpAwarded > 0
        ? `[SYSTEM] Weekly deficit processed! +${result.xpAwarded} XP for ${result.poundsLost.toFixed(1)} lb deficit.`
        : '[SYSTEM] Weekly deficit processed. Keep logging to earn XP!',
    })
  } catch (error) {
    logger.error('Process weekly error', { error })
    return c.json({ error: 'Failed to process weekly deficit' }, 500)
  }
})

export default bodyRoutes
