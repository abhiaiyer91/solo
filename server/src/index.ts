import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { auth } from './lib/auth'
import { logger } from './lib/logger'
import { authMiddleware } from './middleware/auth'
import { securityHeaders, getSecureCorsConfig } from './middleware/security'
import { rateLimit } from './middleware/rate-limit'
import { requestId } from './middleware/request-id'
import { dbClient as db } from './db'

// Route modules
import playerRoutes from './routes/player'
import questRoutes from './routes/quests'
import healthRoutes from './routes/health'
import contentRoutes from './routes/content'
import seasonRoutes from './routes/seasons'
import guildRoutes from './routes/guilds'
import notificationRoutes from './routes/notifications'
import accountabilityRoutes from './routes/accountability'
import raidRoutes from './routes/raids'
import onboardingRoutes from './routes/onboarding'
import bodyRoutes from './routes/body'
import statsRoutes from './routes/stats'
import { nutritionRoutes } from './routes/nutrition'
import analyticsRoutes from './routes/analytics'
import adminRoutes from './routes/admin'
import exerciseRoutes from './routes/exercises'
import customQuestRoutes from './routes/custom-quests'
import profileCustomizationRoutes from './routes/profile'
import narrativeRoutes from './routes/narrative'
import fitnessTestRoutes from './routes/fitness-tests'

// Boss service imports
import {
  getAvailableBosses,
  getBossById,
  getCurrentBossAttempt,
  startBossEncounter,
  abandonBossEncounter,
  getBossAttemptStatus,
  formatBossResponse,
  formatAttemptResponse,
} from './services/boss'
import { requireAuth } from './middleware/auth'

const app = new Hono()

// ============================================================
// Global Middleware Stack
// ============================================================

// 1. Request ID for tracing
app.use('*', requestId)

// 2. Request logging
app.use('*', honoLogger())

// 3. Security headers (XSS, clickjacking, etc.)
app.use('*', securityHeaders)

// 4. CORS with secure configuration
app.use('*', cors(getSecureCorsConfig()))

// 5. Rate limiting (100/min per IP, 1000/min per user)
app.use('/api/*', rateLimit())

// 6. Auth middleware for all routes
app.use('*', authMiddleware)

// Better Auth handler - handles all /api/auth/* routes
app.all('/api/auth/*', (c) => {
  if (!auth) {
    logger.error('Auth is null - database not connected')
    return c.json({ error: 'Authentication not configured - database connection required' }, 503)
  }
  return auth.handler(c.req.raw)
})

// Debug: Check auth status
app.get('/api/auth-status', (c) => {
  return c.json({
    authConfigured: !!auth,
    dbConnected: !!db,
  })
})

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'SYSTEM ONLINE',
  })
})

// Register route modules
app.route('/api', playerRoutes)
app.route('/api', questRoutes)
app.route('/api', healthRoutes)
app.route('/api', contentRoutes)
app.route('/api', seasonRoutes)
app.route('/api', guildRoutes)
app.route('/api', notificationRoutes)
app.route('/api', accountabilityRoutes)
app.route('/api', raidRoutes)
app.route('/api', onboardingRoutes)
app.route('/api', bodyRoutes)
app.route('/api', statsRoutes)
app.route('/api', nutritionRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/exercises', exerciseRoutes)
app.route('/api/custom-quests', customQuestRoutes)
app.route('/api/profile', profileCustomizationRoutes)
app.route('/api/narrative', narrativeRoutes)
app.route('/api', fitnessTestRoutes)

// Boss routes
// GET /api/bosses - Get all available bosses for the user
app.get('/api/bosses', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const bosses = await getAvailableBosses(user.id)
    const currentAttempt = await getCurrentBossAttempt(user.id)

    return c.json({
      bosses: bosses.map(formatBossResponse),
      currentEncounter: currentAttempt ? {
        bossId: currentAttempt.bossId,
        status: currentAttempt.status,
        currentPhase: currentAttempt.currentPhase,
      } : null,
    })
  } catch (error) {
    logger.error('Get bosses error', { error })
    return c.json({ error: 'Failed to get bosses' }, 500)
  }
})

// GET /api/bosses/:id - Get boss details
app.get('/api/bosses/:id', requireAuth, async (c) => {
  const bossId = c.req.param('id')

  try {
    const boss = await getBossById(bossId)
    if (!boss) {
      return c.json({ error: 'Boss not found' }, 404)
    }

    return c.json(formatBossResponse(boss))
  } catch (error) {
    logger.error('Get boss error', { error })
    return c.json({ error: 'Failed to get boss' }, 500)
  }
})

// POST /api/bosses/:id/start - Begin a boss encounter
app.post('/api/bosses/:id/start', requireAuth, async (c) => {
  const user = c.get('user')!
  const bossId = c.req.param('id')

  try {
    const result = await startBossEncounter(user.id, bossId)

    return c.json({
      attempt: formatAttemptResponse(result.attempt),
      boss: formatBossResponse(result.boss),
      message: result.message,
      currentPhase: result.boss.phases[0],
    })
  } catch (error) {
    logger.error('Start boss encounter error', { error })
    const message = error instanceof Error ? error.message : 'Failed to start boss encounter'
    return c.json({ error: message }, 400)
  }
})

// GET /api/bosses/:id/attempt - Get current attempt status
app.get('/api/bosses/:id/attempt', requireAuth, async (c) => {
  const user = c.get('user')!
  const bossId = c.req.param('id')

  try {
    const status = await getBossAttemptStatus(user.id, bossId)

    if (!status || !status.attempt) {
      return c.json({ error: 'No active attempt for this boss' }, 404)
    }

    return c.json({
      attempt: formatAttemptResponse(status.attempt),
      boss: status.boss ? formatBossResponse(status.boss) : null,
      currentPhase: status.currentPhase,
      daysInPhase: status.daysInPhase,
      daysRemaining: status.daysRemaining,
      phaseProgress: status.phaseProgress,
      overallProgress: status.overallProgress,
    })
  } catch (error) {
    logger.error('Get boss attempt error', { error })
    return c.json({ error: 'Failed to get boss attempt status' }, 500)
  }
})

// POST /api/bosses/:id/abandon - Abandon the current encounter
app.post('/api/bosses/:id/abandon', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const result = await abandonBossEncounter(user.id)

    if (!result.abandoned) {
      return c.json({ error: result.message }, 400)
    }

    return c.json({
      abandoned: true,
      boss: result.boss ? formatBossResponse(result.boss) : null,
      message: result.message,
    })
  } catch (error) {
    logger.error('Abandon boss encounter error', { error })
    return c.json({ error: 'Failed to abandon boss encounter' }, 500)
  }
})

// === LEADERBOARD ENDPOINTS ===
// Leaderboard service - global, weekly, seasonal rankings
import {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getSeasonalLeaderboard,
  getPlayerRanks,
  updateLeaderboardPreferences,
  getLeaderboardPreferences,
} from './services/leaderboard'

// GET /api/leaderboards/global - Get global leaderboard (top by total XP)
app.get('/api/leaderboards/global', requireAuth, async (c) => {
  const user = c.get('user')!
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '100'), 100)

  try {
    const leaderboard = await getGlobalLeaderboard(user.id, page, pageSize)
    return c.json(leaderboard)
  } catch (error) {
    logger.error('Get global leaderboard error', { error })
    return c.json({ error: 'Failed to get global leaderboard' }, 500)
  }
})

// GET /api/leaderboards/weekly - Get weekly leaderboard (top by weekly XP)
app.get('/api/leaderboards/weekly', requireAuth, async (c) => {
  const user = c.get('user')!
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '100'), 100)

  try {
    const leaderboard = await getWeeklyLeaderboard(user.id, page, pageSize)
    return c.json(leaderboard)
  } catch (error) {
    logger.error('Get weekly leaderboard error', { error })
    return c.json({ error: 'Failed to get weekly leaderboard' }, 500)
  }
})

// GET /api/leaderboards/seasonal - Get seasonal leaderboard (top by seasonal XP)
app.get('/api/leaderboards/seasonal', requireAuth, async (c) => {
  const user = c.get('user')!
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '100'), 100)
  const seasonId = c.req.query('seasonId')

  try {
    const leaderboard = await getSeasonalLeaderboard(user.id, seasonId, page, pageSize)
    return c.json(leaderboard)
  } catch (error) {
    logger.error('Get seasonal leaderboard error', { error })
    return c.json({ error: 'Failed to get seasonal leaderboard' }, 500)
  }
})

// GET /api/leaderboards/me - Get player's rank in each leaderboard
app.get('/api/leaderboards/me', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const ranks = await getPlayerRanks(user.id)
    return c.json(ranks)
  } catch (error) {
    logger.error('Get player ranks error', { error })
    return c.json({ error: 'Failed to get player ranks' }, 500)
  }
})

// GET /api/leaderboards/preferences - Get user's leaderboard display preferences
app.get('/api/leaderboards/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const preferences = await getLeaderboardPreferences(user.id)
    return c.json(preferences)
  } catch (error) {
    logger.error('Get leaderboard preferences error', { error })
    return c.json({ error: 'Failed to get leaderboard preferences' }, 500)
  }
})

// PUT /api/leaderboards/preferences - Update user's leaderboard display preferences
app.put('/api/leaderboards/preferences', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json()

  const { optIn, displayName } = body as { optIn?: boolean; displayName?: string }

  if (optIn === undefined) {
    return c.json({ error: 'optIn is required' }, 400)
  }

  try {
    await updateLeaderboardPreferences(user.id, optIn, displayName)
    const preferences = await getLeaderboardPreferences(user.id)
    return c.json(preferences)
  } catch (error) {
    logger.error('Update leaderboard preferences error', { error })
    return c.json({ error: 'Failed to update leaderboard preferences' }, 500)
  }
})
// === END LEADERBOARD ENDPOINTS ===

// === SHADOW ENDPOINTS ===
// Shadow comparison service - anonymous aggregated player data
import {
  getDailyShadowObservation,
  getShadowAggregates,
} from './services/shadow'

// GET /api/shadows/today - Get today's shadow observation for the user
app.get('/api/shadows/today', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const observation = await getDailyShadowObservation(user.id)

    if (!observation) {
      return c.json({ error: 'No shadow observation available' }, 404)
    }

    return c.json(observation)
  } catch (error) {
    logger.error('Get shadow observation error', { error })
    return c.json({ error: 'Failed to get shadow observation' }, 500)
  }
})

// GET /api/shadows/aggregates - Get aggregate player statistics
app.get('/api/shadows/aggregates', requireAuth, async (c) => {
  try {
    const aggregates = await getShadowAggregates()
    return c.json(aggregates)
  } catch (error) {
    logger.error('Get shadow aggregates error', { error })
    return c.json({ error: 'Failed to get shadow aggregates' }, 500)
  }
})
// === END SHADOW ENDPOINTS ===

// === DUNGEON ENDPOINTS ===
// Dungeon encounter service - time-limited challenges with XP multipliers
import {
  getAvailableDungeons,
  getDungeonById,
  getCurrentDungeonAttempt,
  getDungeonAttemptHistory,
  getDungeonStats,
  isOnCooldown,
  enterDungeon,
  updateDungeonProgress,
  completeDungeon,
  failDungeon,
  checkExpiredDungeons,
  formatDungeonResponse,
  formatAttemptResponse as formatDungeonAttemptResponse,
} from './services/dungeon'

// GET /api/dungeons - Get all available dungeons for the user
app.get('/api/dungeons', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Check for expired dungeons first
    await checkExpiredDungeons(user.id)

    const dungeonList = await getAvailableDungeons(user.id)
    const currentAttempt = await getCurrentDungeonAttempt(user.id)
    const stats = await getDungeonStats(user.id)

    // Get cooldown status for each dungeon
    const dungeonsWithCooldown = await Promise.all(
      dungeonList.map(async (dungeon) => {
        const cooldown = await isOnCooldown(user.id, dungeon.id)
        return {
          ...formatDungeonResponse(dungeon),
          cooldownStatus: cooldown,
        }
      })
    )

    return c.json({
      dungeons: dungeonsWithCooldown,
      currentAttempt: currentAttempt
        ? formatDungeonAttemptResponse(currentAttempt)
        : null,
      stats: {
        cleared: stats.cleared,
        failed: stats.failed,
        timedOut: stats.timedOut,
        totalXpEarned: stats.totalXpEarned,
      },
    })
  } catch (error) {
    logger.error('Get dungeons error', { error })
    return c.json({ error: 'Failed to get dungeons' }, 500)
  }
})

// GET /api/dungeons/:id - Get dungeon details
app.get('/api/dungeons/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const dungeonId = c.req.param('id')

  try {
    const dungeon = await getDungeonById(dungeonId)
    if (!dungeon) {
      return c.json({ error: 'Dungeon not found' }, 404)
    }

    const cooldown = await isOnCooldown(user.id, dungeonId)
    const history = await getDungeonAttemptHistory(user.id, 5)
    const dungeonHistory = history.filter((a) => a.dungeonId === dungeonId)

    return c.json({
      ...formatDungeonResponse(dungeon),
      cooldownStatus: cooldown,
      recentAttempts: dungeonHistory.map(formatDungeonAttemptResponse),
    })
  } catch (error) {
    logger.error('Get dungeon error', { error })
    return c.json({ error: 'Failed to get dungeon' }, 500)
  }
})

// POST /api/dungeons/:id/enter - Start a dungeon attempt
app.post('/api/dungeons/:id/enter', requireAuth, async (c) => {
  const user = c.get('user')!
  const dungeonId = c.req.param('id')

  try {
    const result = await enterDungeon(user.id, dungeonId)

    return c.json({
      attempt: formatDungeonAttemptResponse(result.attempt),
      dungeon: formatDungeonResponse(result.dungeon),
      message: result.message,
      debuffWarning: result.debuffWarning,
    })
  } catch (error) {
    logger.error('Enter dungeon error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to enter dungeon'
    return c.json({ error: message }, 400)
  }
})

// POST /api/dungeons/:id/progress - Update progress on a dungeon challenge
app.post('/api/dungeons/:id/progress', requireAuth, async (c) => {
  const user = c.get('user')!
  const dungeonId = c.req.param('id')

  try {
    const body = await c.req.json()
    const { challengeIndex, completed } = body as {
      challengeIndex: number
      completed: boolean
    }

    if (typeof challengeIndex !== 'number' || typeof completed !== 'boolean') {
      return c.json(
        { error: 'challengeIndex (number) and completed (boolean) are required' },
        400
      )
    }

    const result = await updateDungeonProgress(
      user.id,
      dungeonId,
      challengeIndex,
      completed
    )

    // If all challenges are complete, auto-complete the dungeon
    if (result.allChallengesComplete && result.attempt.status === 'IN_PROGRESS') {
      const completionResult = await completeDungeon(user.id, dungeonId)
      return c.json({
        attempt: formatDungeonAttemptResponse(completionResult.attempt),
        xpAwarded: completionResult.xpAwarded,
        multiplierApplied: completionResult.multiplierApplied,
        message: completionResult.message,
        dungeonCleared: true,
      })
    }

    return c.json({
      attempt: formatDungeonAttemptResponse(result.attempt),
      challengeCompleted: result.challengeCompleted,
      allChallengesComplete: result.allChallengesComplete,
      message: result.message,
      dungeonCleared: false,
    })
  } catch (error) {
    logger.error('Update dungeon progress error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to update dungeon progress'
    return c.json({ error: message }, 400)
  }
})

// POST /api/dungeons/:id/complete - Manually complete a dungeon (all challenges done)
app.post('/api/dungeons/:id/complete', requireAuth, async (c) => {
  const user = c.get('user')!
  const dungeonId = c.req.param('id')

  try {
    const result = await completeDungeon(user.id, dungeonId)

    return c.json({
      attempt: formatDungeonAttemptResponse(result.attempt),
      xpAwarded: result.xpAwarded,
      multiplierApplied: result.multiplierApplied,
      message: result.message,
    })
  } catch (error) {
    logger.error('Complete dungeon error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to complete dungeon'
    return c.json({ error: message }, 400)
  }
})

// POST /api/dungeons/:id/fail - Abandon/fail a dungeon attempt
app.post('/api/dungeons/:id/fail', requireAuth, async (c) => {
  const user = c.get('user')!
  const dungeonId = c.req.param('id')

  try {
    const result = await failDungeon(user.id, dungeonId, 'manual')

    return c.json({
      attempt: formatDungeonAttemptResponse(result.attempt),
      message: result.message,
    })
  } catch (error) {
    logger.error('Fail dungeon error', { error })
    const message =
      error instanceof Error ? error.message : 'Failed to abandon dungeon'
    return c.json({ error: message }, 400)
  }
})

// GET /api/dungeons/stats/me - Get user's dungeon statistics
app.get('/api/dungeons/stats/me', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const stats = await getDungeonStats(user.id)

    return c.json({
      totalAttempts: stats.totalAttempts,
      cleared: stats.cleared,
      failed: stats.failed,
      timedOut: stats.timedOut,
      totalXpEarned: stats.totalXpEarned,
      currentAttempt: stats.currentAttempt
        ? formatDungeonAttemptResponse(stats.currentAttempt)
        : null,
    })
  } catch (error) {
    logger.error('Get dungeon stats error', { error })
    return c.json({ error: 'Failed to get dungeon stats' }, 500)
  }
})

// GET /api/dungeons/history - Get user's dungeon attempt history
app.get('/api/dungeons/history', requireAuth, async (c) => {
  const user = c.get('user')!
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)

  try {
    const history = await getDungeonAttemptHistory(user.id, limit)

    return c.json({
      attempts: history.map(formatDungeonAttemptResponse),
    })
  } catch (error) {
    logger.error('Get dungeon history error', { error })
    return c.json({ error: 'Failed to get dungeon history' }, 500)
  }
})
// === END DUNGEON ENDPOINTS ===

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

logger.info('Server starting', { port, url: `http://localhost:${port}` })

serve({
  fetch: app.fetch,
  port,
})
