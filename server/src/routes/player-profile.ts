import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { dbClient as db } from '../db'
import { logger } from '../lib/logger'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getDebuffStatus } from '../services/debuff'
import { getWeekendBonusStatus } from '../services/xp'

const VALID_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
]

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
profileRoutes.patch('/player', requireAuth, async (c) => {
  const user = c.get('user')!

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  try {
    const body = await c.req.json<{ timezone?: string; name?: string }>()

    const updates: Partial<{ timezone: string; name: string; updatedAt: Date }> = {
      updatedAt: new Date(),
    }

    if (body.timezone) {
      if (!VALID_TIMEZONES.includes(body.timezone)) {
        return c.json({ error: 'Invalid timezone' }, 400)
      }
      updates.timezone = body.timezone
    }

    if (body.name) {
      updates.name = body.name.trim().slice(0, 50)
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

export default profileRoutes
