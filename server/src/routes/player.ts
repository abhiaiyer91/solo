import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { dbClient as db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { xpToNextLevel } from '../services/level'
import { getStreakInfo } from '../services/streak'
import { getDebuffStatus } from '../services/debuff'
import {
  getUserTitles,
  getActiveTitle,
  setActiveTitle,
  getActiveTitleBonus,
} from '../services/title'
import { getXPTimeline, getXPEventBreakdown, getWeekendBonusStatus } from '../services/xp'
import {
  getDayStatus,
  getPendingReconciliationItems,
  closeDay,
  getDaySummaryPreview,
  isDayClosed,
} from '../services/daily-log'
import { updateQuestProgress } from '../services/quest'
import { getProgressionSummary } from '../services/progression'
import {
  checkReturnProtocolOffer,
  getReturnProtocolStatus,
  acceptReturnProtocol,
  declineReturnProtocol,
  updateLastActivity,
} from '../services/return-protocol'
import {
  getHardModeStatus,
  enableHardMode,
  disableHardMode,
  checkHardModeUnlock,
} from '../services/hard-mode'
import {
  checkArchiveOffer,
  performSoftReset,
  getUserArchives,
  getArchiveNarratives,
} from '../services/archive'

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

const playerRoutes = new Hono()

// Get player profile
playerRoutes.get('/player', requireAuth, async (c) => {
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
playerRoutes.patch('/player', requireAuth, async (c) => {
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
    console.error('Update player error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Complete onboarding
playerRoutes.post('/player/onboarding/complete', requireAuth, async (c) => {
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
    console.error('Complete onboarding error:', error)
    return c.json({ error: 'Failed to complete onboarding' }, 500)
  }
})

// Check auth status (public)
playerRoutes.get('/player/me', (c) => {
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

// Level progress
playerRoutes.get('/player/level-progress', requireAuth, async (c) => {
  const user = c.get('user')!

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
    if (!dbUser) {
      return c.json({ error: 'User not found' }, 404)
    }

    const totalXP = typeof dbUser.totalXP === 'bigint' ? dbUser.totalXP : BigInt(dbUser.totalXP)
    const progress = xpToNextLevel(totalXP)
    return c.json({
      currentLevel: progress.currentLevel,
      xpProgress: Number(progress.xpProgress),
      xpNeeded: Number(progress.xpNeeded),
      progressPercent: progress.progressPercent,
      totalXP: Number(totalXP),
    })
  } catch (error) {
    console.error('Level progress error:', error)
    return c.json({ error: 'Failed to get level progress' }, 500)
  }
})

// Streak info
playerRoutes.get('/player/streak', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const streakInfo = await getStreakInfo(user.id)
    return c.json(streakInfo)
  } catch (error) {
    console.error('Streak info error:', error)
    return c.json({ error: 'Failed to get streak info' }, 500)
  }
})

// Debuff status
playerRoutes.get('/player/debuff', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const debuffStatus = await getDebuffStatus(user.id)
    return c.json(debuffStatus)
  } catch (error) {
    console.error('Debuff status error:', error)
    return c.json({ error: 'Failed to get debuff status' }, 500)
  }
})

// Unlock progression status
playerRoutes.get('/player/unlocks', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Get lastSeenUnlocks from query params (comma-separated)
    const lastSeenParam = c.req.query('lastSeen') ?? ''
    const lastSeenUnlockIds = lastSeenParam ? lastSeenParam.split(',') : []

    const summary = await getProgressionSummary(user.id, lastSeenUnlockIds)
    return c.json(summary)
  } catch (error) {
    console.error('Unlock progression error:', error)
    return c.json({ error: 'Failed to get unlock progression' }, 500)
  }
})

// ==========================================
// Return Protocol Endpoints
// ==========================================

// Check if return protocol should be offered
playerRoutes.get('/player/return-protocol/check', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const offer = await checkReturnProtocolOffer(user.id)
    return c.json(offer)
  } catch (error) {
    console.error('Return protocol check error:', error)
    return c.json({ error: 'Failed to check return protocol' }, 500)
  }
})

// Get current return protocol status
playerRoutes.get('/player/return-protocol', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getReturnProtocolStatus(user.id)
    return c.json(status)
  } catch (error) {
    console.error('Return protocol status error:', error)
    return c.json({ error: 'Failed to get return protocol status' }, 500)
  }
})

// Accept return protocol
playerRoutes.post('/player/return-protocol/accept', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await acceptReturnProtocol(user.id)
    return c.json({
      status,
      message: '[SYSTEM] Return Protocol activated. Day 1 of 3.',
    })
  } catch (error) {
    console.error('Accept return protocol error:', error)
    return c.json({ error: 'Failed to accept return protocol' }, 500)
  }
})

// Decline return protocol
playerRoutes.post('/player/return-protocol/decline', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await declineReturnProtocol(user.id)
    return c.json({
      message: '[SYSTEM] Return Protocol declined. Full intensity resumed.',
    })
  } catch (error) {
    console.error('Decline return protocol error:', error)
    return c.json({ error: 'Failed to decline return protocol' }, 500)
  }
})

// Update last activity (called on any meaningful action)
playerRoutes.post('/player/activity', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await updateLastActivity(user.id)
    return c.json({ recorded: true })
  } catch (error) {
    console.error('Update activity error:', error)
    return c.json({ error: 'Failed to update activity' }, 500)
  }
})

// ==========================================
// Hard Mode Endpoints
// ==========================================

// Get hard mode status
playerRoutes.get('/player/hard-mode', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // TODO: Get current season from season service
    const currentSeason = null
    const status = await getHardModeStatus(user.id, currentSeason)
    return c.json(status)
  } catch (error) {
    console.error('Hard mode status error:', error)
    return c.json({ error: 'Failed to get hard mode status' }, 500)
  }
})

// Check hard mode unlock requirements
playerRoutes.get('/player/hard-mode/requirements', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const currentSeason = null
    const requirements = await checkHardModeUnlock(user.id, currentSeason)
    return c.json(requirements)
  } catch (error) {
    console.error('Hard mode requirements error:', error)
    return c.json({ error: 'Failed to check requirements' }, 500)
  }
})

// Enable hard mode
playerRoutes.post('/player/hard-mode/enable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const currentSeason = null
    const status = await enableHardMode(user.id, currentSeason)
    return c.json({
      status,
      message: '[SYSTEM] Hard Mode activated. The System now observes.',
    })
  } catch (error) {
    console.error('Enable hard mode error:', error)
    const message = error instanceof Error ? error.message : 'Failed to enable hard mode'
    return c.json({ error: message }, 400)
  }
})

// Disable hard mode
playerRoutes.post('/player/hard-mode/disable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await disableHardMode(user.id)
    return c.json({
      status,
      message: '[SYSTEM] Hard Mode deactivated.',
    })
  } catch (error) {
    console.error('Disable hard mode error:', error)
    return c.json({ error: 'Failed to disable hard mode' }, 500)
  }
})

// Player titles
playerRoutes.get('/player/titles', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const userTitleList = await getUserTitles(user.id)
    const activeTitle = await getActiveTitle(user.id)
    const activeBonus = await getActiveTitleBonus(user.id)

    return c.json({
      titles: userTitleList,
      activeTitle,
      activeBonus,
    })
  } catch (error) {
    console.error('Get user titles error:', error)
    return c.json({ error: 'Failed to get user titles' }, 500)
  }
})

// Set active title
playerRoutes.put('/player/title/active', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{ titleId: string | null }>()
    await setActiveTitle(user.id, body.titleId)

    const activeTitle = body.titleId ? await getActiveTitle(user.id) : null
    return c.json({
      message: body.titleId ? 'Title equipped' : 'Title unequipped',
      activeTitle,
    })
  } catch (error) {
    console.error('Set active title error:', error)
    const message = error instanceof Error ? error.message : 'Failed to set active title'
    return c.json({ error: message }, 400)
  }
})

// XP timeline
playerRoutes.get('/xp/timeline', requireAuth, async (c) => {
  const user = c.get('user')!
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  try {
    const events = await getXPTimeline(user.id, limit, offset)
    return c.json({
      events: events.map((e) => ({
        ...e,
        totalXPBefore: Number(e.totalXPBefore),
        totalXPAfter: Number(e.totalXPAfter),
      })),
    })
  } catch (error) {
    console.error('XP timeline error:', error)
    return c.json({ error: 'Failed to get XP timeline' }, 500)
  }
})

// XP event breakdown
playerRoutes.get('/xp/:eventId/breakdown', requireAuth, async (c) => {
  const eventId = c.req.param('eventId')

  try {
    const result = await getXPEventBreakdown(eventId)
    if (!result) {
      return c.json({ error: 'Event not found' }, 404)
    }
    return c.json({
      event: {
        ...result.event,
        totalXPBefore: Number(result.event.totalXPBefore),
        totalXPAfter: Number(result.event.totalXPAfter),
      },
      modifiers: result.modifiers,
    })
  } catch (error) {
    console.error('XP breakdown error:', error)
    return c.json({ error: 'Failed to get XP breakdown' }, 500)
  }
})

// ==========================================
// Daily Reconciliation Endpoints
// ==========================================

// Get current day status (phase, timing, reconciliation status)
playerRoutes.get('/day/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getDayStatus(user.id, user.timezone ?? 'UTC')
    return c.json(status)
  } catch (error) {
    console.error('Day status error:', error)
    return c.json({ error: 'Failed to get day status' }, 500)
  }
})

// Get items pending reconciliation
playerRoutes.get('/day/reconciliation', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const items = await getPendingReconciliationItems(user.id, user.timezone ?? 'UTC')
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')

    return c.json({
      items,
      isDayClosed: dayClosed,
    })
  } catch (error) {
    console.error('Reconciliation items error:', error)
    return c.json({ error: 'Failed to get reconciliation items' }, 500)
  }
})

// Submit reconciliation for a quest item
playerRoutes.post('/day/reconciliation/:questId', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('questId')

  try {
    // Check if day is already closed
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')
    if (dayClosed) {
      return c.json({ error: 'Day is already closed' }, 400)
    }

    const body = await c.req.json<{ data: Record<string, number | boolean> }>()
    const result = await updateQuestProgress(questId, user.id, body.data)

    return c.json({
      quest: result.quest,
      xpAwarded: result.xpAwarded,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      message:
        result.xpAwarded > 0
          ? `[SYSTEM] Reconciliation recorded. +${result.xpAwarded} XP`
          : '[SYSTEM] Reconciliation recorded.',
    })
  } catch (error) {
    console.error('Reconciliation submit error:', error)
    const message = error instanceof Error ? error.message : 'Failed to submit reconciliation'
    return c.json({ error: message }, 400)
  }
})

// Close the day and get summary
playerRoutes.post('/day/close', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Check if day is already closed
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')
    if (dayClosed) {
      return c.json({ error: 'Day is already closed' }, 400)
    }

    const summary = await closeDay(user.id, user.timezone ?? 'UTC')

    return c.json({
      summary,
      message: `[SYSTEM] Day ${summary.dayNumber} closed. ${summary.xpEarned} XP earned.`,
    })
  } catch (error) {
    console.error('Close day error:', error)
    return c.json({ error: 'Failed to close day' }, 500)
  }
})

// Get day summary (preview without closing, or view closed day)
playerRoutes.get('/day/summary', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const summary = await getDaySummaryPreview(user.id, user.timezone ?? 'UTC')
    if (!summary) {
      return c.json({ error: 'No daily log found for today' }, 404)
    }

    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')

    return c.json({
      summary,
      isDayClosed: dayClosed,
    })
  } catch (error) {
    console.error('Day summary error:', error)
    return c.json({ error: 'Failed to get day summary' }, 500)
  }
})

// ==========================================
// Archive & Soft Reset Endpoints
// ==========================================

// Check if archive option should be offered
playerRoutes.get('/player/archive/check', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const offer = await checkArchiveOffer(user.id)
    const narratives = getArchiveNarratives()

    return c.json({
      ...offer,
      narrative: offer.shouldOffer ? narratives.offer : null,
    })
  } catch (error) {
    console.error('Archive check error:', error)
    return c.json({ error: 'Failed to check archive status' }, 500)
  }
})

// Get user's archives
playerRoutes.get('/player/archives', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const archives = await getUserArchives(user.id)

    return c.json({
      archives,
      totalArchives: archives.length,
    })
  } catch (error) {
    console.error('Get archives error:', error)
    return c.json({ error: 'Failed to get archives' }, 500)
  }
})

// Perform soft reset (archive and restart)
playerRoutes.post('/player/archive/reset', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const archive = await performSoftReset(user.id)
    const narratives = getArchiveNarratives()

    return c.json({
      archive,
      message: narratives.complete,
    })
  } catch (error) {
    console.error('Soft reset error:', error)
    return c.json({ error: 'Failed to perform soft reset' }, 500)
  }
})

// Decline archive (continue with current progress)
playerRoutes.post('/player/archive/decline', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Just update last activity to mark them as active
    await updateLastActivity(user.id)
    const narratives = getArchiveNarratives()

    return c.json({
      continued: true,
      message: narratives.decline,
    })
  } catch (error) {
    console.error('Archive decline error:', error)
    return c.json({ error: 'Failed to continue' }, 500)
  }
})

export default playerRoutes
