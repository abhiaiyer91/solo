import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import {
  saveBaselineAssessment,
  getBaselineAssessment,
  formatAssessmentResponse,
  calculateInitialStats,
} from '../services/baseline'
import {
  startPsychologyAssessment,
  respondToPsychologyAssessment,
  completePsychologyAssessment,
  getPsychologyProfile,
  formatPsychologyResponse,
} from '../services/psychology'
import type { BaselineAssessmentInput, PsychologyTraits } from '../db/schema'

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
    logger.error('Save baseline assessment error', { error })
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
    logger.error('Get baseline assessment error', { error })
    return c.json({ error: 'Failed to get baseline assessment' }, 500)
  }
})

// ============================================================
// Psychology Assessment Endpoints
// ============================================================

// POST /api/onboarding/psychology/start - Start psychology assessment
onboardingRoutes.post('/onboarding/psychology/start', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const { profile, initialMessage } = await startPsychologyAssessment(user.id)

    return c.json({
      success: true,
      profile: formatPsychologyResponse(profile),
      message: initialMessage,
    })
  } catch (error) {
    logger.error('Start psychology assessment error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to start psychology assessment'
    return c.json({ error: message }, 500)
  }
})

// POST /api/onboarding/psychology/respond - Send user message, get AI response
onboardingRoutes.post('/onboarding/psychology/respond', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{ message: string }>()

    if (!body.message || typeof body.message !== 'string') {
      return c.json({ error: 'message is required' }, 400)
    }

    if (body.message.length > 2000) {
      return c.json({ error: 'message must be under 2000 characters' }, 400)
    }

    const result = await respondToPsychologyAssessment(user.id, body.message)

    return c.json({
      success: true,
      profile: formatPsychologyResponse(result.profile),
      response: result.response,
      isComplete: result.isComplete,
      traits: result.traits,
    })
  } catch (error) {
    logger.error('Psychology respond error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to process response'
    return c.json({ error: message }, 500)
  }
})

// POST /api/onboarding/psychology/complete - Finalize assessment (manual or skip)
onboardingRoutes.post('/onboarding/psychology/complete', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{ traits?: Partial<PsychologyTraits> }>()

    const profile = await completePsychologyAssessment(user.id, body.traits)

    return c.json({
      success: true,
      profile: formatPsychologyResponse(profile),
      message: '[SYSTEM] Psychology assessment finalized.',
    })
  } catch (error) {
    logger.error('Complete psychology assessment error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to complete assessment'
    return c.json({ error: message }, 500)
  }
})

// GET /api/player/psychology - Get user's psychology profile
onboardingRoutes.get('/player/psychology', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const profile = await getPsychologyProfile(user.id)

    if (!profile) {
      return c.json({
        profile: null,
        message: 'No psychology profile found. Complete the assessment during onboarding.',
      })
    }

    return c.json({
      profile: formatPsychologyResponse(profile),
    })
  } catch (error) {
    logger.error('Get psychology profile error', { error })
    return c.json({ error: 'Failed to get psychology profile' }, 500)
  }
})

export default onboardingRoutes
