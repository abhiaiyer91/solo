import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { dbClient as db } from '../db'
import { logger } from '../lib/logger'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getDebuffStatus } from '../services/debuff'
import { getWeekendBonusStatus } from '../services/xp'
import { exportUserData } from '../services/data-export'
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus,
} from '../services/account-deletion'
import { updatePlayerSchema, VALID_TIMEZONES } from '../lib/validation/schemas'

const profileRoutes = new Hono()

// Get player profile
profileRoutes.get('/player', requireAuth, async (c) => {
  const sessionUser = c.get('user')!

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  // Fetch fresh user data to get all fields including onboardingCompleted
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const debuffStatus = await getDebuffStatus(user.id)
  const weekendBonus = getWeekendBonusStatus(user.timezone ?? 'UTC')

  return c.json({
    id: user.id,
    name: user.name || 'Hunter',
    email: user.email,
    level: user.level ?? 1,
    totalXP: user.totalXP ?? 0,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    perfectStreak: user.perfectStreak ?? 0,
    str: user.str ?? 10,
    agi: user.agi ?? 10,
    vit: user.vit ?? 10,
    disc: user.disc ?? 10,
    timezone: user.timezone ?? 'UTC',
    onboardingCompleted: user.onboardingCompleted ?? false,
    debuffActive: debuffStatus.isActive,
    debuffActiveUntil: debuffStatus.expiresAt?.toISOString() ?? null,
    weekendBonusActive: weekendBonus.isWeekend,
    weekendBonusPercent: weekendBonus.bonusPercent,
  })
})

// Update player settings
profileRoutes.patch('/player', requireAuth, zValidator('json', updatePlayerSchema), async (c) => {
  const user = c.get('user')!
  const body = c.req.valid('json')

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  try {
    const updates: Partial<{ timezone: string; name: string; updatedAt: Date }> = {
      updatedAt: new Date(),
    }

    if (body.timezone) {
      updates.timezone = body.timezone
    }

    if (body.name) {
      updates.name = body.name
    }

    await db.update(users).set(updates).where(eq(users.id, user.id))

    return c.json({
      message: 'Profile updated',
      timezone: updates.timezone || user.timezone,
      name: updates.name || user.name,
    })
  } catch (error) {
    logger.error('Update player error', { error })
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Complete onboarding
profileRoutes.post('/player/onboarding/complete', requireAuth, async (c) => {
  const user = c.get('user')!

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  try {
    await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    return c.json({
      message: 'Onboarding completed',
      onboardingCompleted: true,
    })
  } catch (error) {
    logger.error('Complete onboarding error', { error })
    return c.json({ error: 'Failed to complete onboarding' }, 500)
  }
})

// Check auth status (public)
profileRoutes.get('/player/me', (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ authenticated: false })
  }
  return c.json({
    authenticated: true,
    id: user.id,
    name: user.name || 'Hunter',
    email: user.email,
    level: user.level ?? 1,
  })
})

// Export user data (GDPR compliance)
profileRoutes.get('/player/export', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const data = await exportUserData(user.id)

    c.header('Content-Type', 'application/json')
    c.header(
      'Content-Disposition',
      `attachment; filename="journey-data-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json"`
    )

    return c.json(data)
  } catch (error) {
    logger.error('Export user data error', { error, userId: user.id })
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

// Get deletion status
profileRoutes.get('/player/account/deletion-status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getDeletionStatus(user.id)
    return c.json(status)
  } catch (error) {
    logger.error('Get deletion status error', { error, userId: user.id })
    return c.json({ error: 'Failed to get deletion status' }, 500)
  }
})

// Request account deletion
profileRoutes.delete('/player/account', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await requestAccountDeletion(user.id)
    return c.json({
      message: 'Account deletion requested. You have 30 days to cancel.',
      ...status,
    })
  } catch (error) {
    logger.error('Request account deletion error', { error, userId: user.id })
    return c.json({ error: 'Failed to request account deletion' }, 500)
  }
})

// Cancel account deletion
profileRoutes.post('/player/account/cancel-deletion', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const result = await cancelAccountDeletion(user.id)
    return c.json(result)
  } catch (error) {
    logger.error('Cancel account deletion error', { error, userId: user.id })
    return c.json({ error: 'Failed to cancel account deletion' }, 500)
  }
})

export default profileRoutes
