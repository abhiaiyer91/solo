import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  syncHealthData,
  getTodayHealthSnapshot,
  getHealthSnapshot,
  getWorkoutsForDate,
  type HealthSyncRequest,
} from '../services/health'
import { autoEvaluateQuestsFromHealth } from '../services/quest'

const healthRoutes = new Hono()

// Sync health data from device/manual entry
healthRoutes.post('/health/sync', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<HealthSyncRequest>()

    // Validate request
    if (!body.source || !['HEALTHKIT', 'GOOGLE_FIT', 'MANUAL'].includes(body.source)) {
      return c.json({ error: 'Invalid data source. Must be HEALTHKIT, GOOGLE_FIT, or MANUAL' }, 400)
    }

    if (!body.data) {
      return c.json({ error: 'Health data is required' }, 400)
    }

    // Sync health data
    const snapshot = await syncHealthData(user.id, body)

    // Auto-evaluate quests based on new health data
    const questResults = await autoEvaluateQuestsFromHealth(user.id, user.timezone ?? 'UTC')

    return c.json({
      snapshot,
      questsEvaluated: questResults.evaluated,
      questsCompleted: questResults.completed,
      questResults: questResults.results,
      message:
        questResults.completed > 0
          ? `[SYSTEM] Health data synced. ${questResults.completed} quest(s) completed automatically!`
          : '[SYSTEM] Health data synced successfully.',
    })
  } catch (error) {
    console.error('Health sync error:', error)
    const message = error instanceof Error ? error.message : 'Failed to sync health data'
    return c.json({ error: message }, 500)
  }
})

// Get today's health snapshot
healthRoutes.get('/health/today', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const snapshot = await getTodayHealthSnapshot(user.id)

    if (!snapshot) {
      return c.json({
        snapshot: null,
        message: 'No health data synced for today yet.',
      })
    }

    // Get today's workouts
    const today = new Date().toISOString().split('T')[0]!
    const workouts = await getWorkoutsForDate(user.id, today)

    return c.json({
      snapshot,
      workouts: workouts.map((w) => ({
        id: w.id,
        type: w.workoutType,
        durationMinutes: w.durationMinutes,
        calories: w.calories,
        distance: w.distance,
        startTime: w.startTime.toISOString(),
        endTime: w.endTime?.toISOString(),
        source: w.source,
        verification: w.verification,
      })),
    })
  } catch (error) {
    console.error('Get today health error:', error)
    return c.json({ error: 'Failed to get health data' }, 500)
  }
})

// Get health snapshot for specific date
healthRoutes.get('/health/:date', requireAuth, async (c) => {
  const user = c.get('user')!
  const date = c.req.param('date')

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
  }

  try {
    const snapshot = await getHealthSnapshot(user.id, date)

    if (!snapshot) {
      return c.json({
        snapshot: null,
        message: `No health data found for ${date}.`,
      })
    }

    // Get workouts for this date
    const workouts = await getWorkoutsForDate(user.id, date)

    return c.json({
      snapshot,
      workouts: workouts.map((w) => ({
        id: w.id,
        type: w.workoutType,
        durationMinutes: w.durationMinutes,
        calories: w.calories,
        distance: w.distance,
        startTime: w.startTime.toISOString(),
        endTime: w.endTime?.toISOString(),
        source: w.source,
        verification: w.verification,
      })),
    })
  } catch (error) {
    console.error('Get health snapshot error:', error)
    return c.json({ error: 'Failed to get health data' }, 500)
  }
})

export default healthRoutes
