import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  saveBaselineAssessment,
  getBaselineAssessment,
  formatAssessmentResponse,
  calculateInitialStats,
} from '../services/baseline'
import type { BaselineAssessmentInput } from '../db/schema'

const onboardingRoutes = new Hono()

// POST /api/onboarding/baseline - Save baseline assessment
onboardingRoutes.post('/onboarding/baseline', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<BaselineAssessmentInput>()

    // Validate fitness experience if provided
    if (
      body.fitnessExperience &&
      !['beginner', 'intermediate', 'advanced'].includes(body.fitnessExperience)
    ) {
      return c.json(
        { error: 'fitnessExperience must be beginner, intermediate, or advanced' },
        400
      )
    }

    // Validate weight unit if provided
    if (body.weightUnit && !['kg', 'lbs'].includes(body.weightUnit)) {
      return c.json({ error: 'weightUnit must be kg or lbs' }, 400)
    }

    // Validate numeric ranges
    if (body.pushUpsMax !== undefined && (body.pushUpsMax < 0 || body.pushUpsMax > 500)) {
      return c.json({ error: 'pushUpsMax must be between 0 and 500' }, 400)
    }

    if (
      body.plankHoldSeconds !== undefined &&
      (body.plankHoldSeconds < 0 || body.plankHoldSeconds > 3600)
    ) {
      return c.json({ error: 'plankHoldSeconds must be between 0 and 3600' }, 400)
    }

    if (
      body.mileTimeMinutes !== undefined &&
      (body.mileTimeMinutes < 3 || body.mileTimeMinutes > 60)
    ) {
      return c.json({ error: 'mileTimeMinutes must be between 3 and 60' }, 400)
    }

    if (
      body.workoutsPerWeek !== undefined &&
      (body.workoutsPerWeek < 0 || body.workoutsPerWeek > 21)
    ) {
      return c.json({ error: 'workoutsPerWeek must be between 0 and 21' }, 400)
    }

    if (
      body.sleepHoursBaseline !== undefined &&
      (body.sleepHoursBaseline < 0 || body.sleepHoursBaseline > 24)
    ) {
      return c.json({ error: 'sleepHoursBaseline must be between 0 and 24' }, 400)
    }

    const { assessment, stats } = await saveBaselineAssessment(user.id, body)

    return c.json({
      success: true,
      assessment: formatAssessmentResponse(assessment),
      stats,
      message: '[SYSTEM] Baseline assessment recorded. Initial stats calculated.',
    })
  } catch (error) {
    console.error('Save baseline assessment error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to save baseline assessment'
    return c.json({ error: message }, 500)
  }
})

// GET /api/player/baseline - Get user's baseline assessment
onboardingRoutes.get('/player/baseline', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const assessment = await getBaselineAssessment(user.id)

    if (!assessment) {
      return c.json({
        assessment: null,
        stats: null,
        message: 'No baseline assessment found. Complete onboarding to set your baseline.',
      })
    }

    const stats = calculateInitialStats(assessment)

    return c.json({
      assessment: formatAssessmentResponse(assessment),
      stats,
    })
  } catch (error) {
    console.error('Get baseline assessment error:', error)
    return c.json({ error: 'Failed to get baseline assessment' }, 500)
  }
})

export default onboardingRoutes
