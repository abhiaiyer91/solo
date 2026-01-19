import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import { questProgressDataSchema } from '../lib/validation/schemas'
import { updateQuestProgress } from '../services/quest'
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
import { getUserCurrentSeason } from '../services/season'
import {
  checkArchiveOffer,
  performSoftReset,
  getUserArchives,
  getArchiveNarratives,
} from '../services/archive'
import {
  getDayStatus,
  getPendingReconciliationItems,
  closeDay,
  getDaySummaryPreview,
  isDayClosed,
} from '../services/daily-log'
import { exportUserData } from '../services/data-export'
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus,
} from '../services/account-deletion'

const featuresRoutes = new Hono()

// ==========================================
// Return Protocol Endpoints
// ==========================================

// Check if return protocol should be offered
featuresRoutes.get('/player/return-protocol/check', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const offer = await checkReturnProtocolOffer(user.id)
    return c.json(offer)
  } catch (error) {
    logger.error('Return protocol check error', { error })
    return c.json({ error: 'Failed to check return protocol' }, 500)
  }
})

// Get current return protocol status
featuresRoutes.get('/player/return-protocol', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getReturnProtocolStatus(user.id)
    return c.json(status)
  } catch (error) {
    logger.error('Return protocol status error', { error })
    return c.json({ error: 'Failed to get return protocol status' }, 500)
  }
})

// Accept return protocol
featuresRoutes.post('/player/return-protocol/accept', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await acceptReturnProtocol(user.id)
    return c.json({
      status,
      message: '[SYSTEM] Return Protocol activated. Day 1 of 3.',
    })
  } catch (error) {
    logger.error('Accept return protocol error', { error })
    return c.json({ error: 'Failed to accept return protocol' }, 500)
  }
})

// Decline return protocol
featuresRoutes.post('/player/return-protocol/decline', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await declineReturnProtocol(user.id)
    return c.json({
      message: '[SYSTEM] Return Protocol declined. Full intensity resumed.',
    })
  } catch (error) {
    logger.error('Decline return protocol error', { error })
    return c.json({ error: 'Failed to decline return protocol' }, 500)
  }
})

// Update last activity (called on any meaningful action)
featuresRoutes.post('/player/activity', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await updateLastActivity(user.id)
    return c.json({ recorded: true })
  } catch (error) {
    logger.error('Update activity error', { error })
    return c.json({ error: 'Failed to update activity' }, 500)
  }
})

// ==========================================
// Hard Mode Endpoints
// ==========================================

// Get hard mode status
featuresRoutes.get('/player/hard-mode', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const userSeason = await getUserCurrentSeason(user.id)
    const currentSeason = userSeason?.season.number ?? null
    const status = await getHardModeStatus(user.id, currentSeason)
    return c.json(status)
  } catch (error) {
    logger.error('Hard mode status error', { error })
    return c.json({ error: 'Failed to get hard mode status' }, 500)
  }
})

// Check hard mode unlock requirements
featuresRoutes.get('/player/hard-mode/requirements', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const userSeason = await getUserCurrentSeason(user.id)
    const currentSeason = userSeason?.season.number ?? null
    const requirements = await checkHardModeUnlock(user.id, currentSeason)
    return c.json(requirements)
  } catch (error) {
    logger.error('Hard mode requirements error', { error })
    return c.json({ error: 'Failed to check requirements' }, 500)
  }
})

// Enable hard mode
featuresRoutes.post('/player/hard-mode/enable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const userSeason = await getUserCurrentSeason(user.id)
    const currentSeason = userSeason?.season.number ?? null
    const status = await enableHardMode(user.id, currentSeason)
    return c.json({
      status,
      message: '[SYSTEM] Hard Mode activated. The System now observes.',
    })
  } catch (error) {
    logger.error('Enable hard mode error', { error })
    const message = error instanceof Error ? error.message : 'Failed to enable hard mode'
    return c.json({ error: message }, 400)
  }
})

// Disable hard mode
featuresRoutes.post('/player/hard-mode/disable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await disableHardMode(user.id)
    return c.json({
      status,
      message: '[SYSTEM] Hard Mode deactivated.',
    })
  } catch (error) {
    logger.error('Disable hard mode error', { error })
    return c.json({ error: 'Failed to disable hard mode' }, 500)
  }
})

// ==========================================
// Daily Reconciliation Endpoints
// ==========================================

// Get current day status (phase, timing, reconciliation status)
featuresRoutes.get('/day/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getDayStatus(user.id, user.timezone ?? 'UTC')
    return c.json(status)
  } catch (error) {
    logger.error('Day status error', { error })
    return c.json({ error: 'Failed to get day status' }, 500)
  }
})

// Get items pending reconciliation
featuresRoutes.get('/day/reconciliation', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const items = await getPendingReconciliationItems(user.id, user.timezone ?? 'UTC')
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')

    return c.json({
      items,
      isDayClosed: dayClosed,
    })
  } catch (error) {
    logger.error('Reconciliation items error', { error })
    return c.json({ error: 'Failed to get reconciliation items' }, 500)
  }
})

// Submit reconciliation for a quest item
featuresRoutes.post('/day/reconciliation/:questId', requireAuth, zValidator('json', questProgressDataSchema), async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('questId')
  const body = c.req.valid('json')

  try {
    // Check if day is already closed
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')
    if (dayClosed) {
      return c.json({ error: 'Day is already closed' }, 400)
    }

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
    logger.error('Reconciliation submit error', { error })
    const message = error instanceof Error ? error.message : 'Failed to submit reconciliation'
    return c.json({ error: message }, 400)
  }
})

// Close the day and get summary
featuresRoutes.post('/day/close', requireAuth, async (c) => {
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
    logger.error('Close day error', { error })
    return c.json({ error: 'Failed to close day' }, 500)
  }
})

// Get day summary (preview without closing, or view closed day)
featuresRoutes.get('/day/summary', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const summary = await getDaySummaryPreview(user.id, user.timezone ?? 'UTC')
    const dayClosed = await isDayClosed(user.id, user.timezone ?? 'UTC')

    return c.json({
      summary: summary ?? {
        dayNumber: 1,
        coreQuestsTotal: 0,
        coreQuestsCompleted: 0,
        bonusQuestsCompleted: 0,
        xpEarned: 0,
        isPerfectDay: false,
        streakMaintained: false,
        currentStreak: 0,
      },
      isDayClosed: dayClosed,
    })
  } catch (error) {
    logger.error('Day summary error', { error })
    return c.json({ error: 'Failed to get day summary' }, 500)
  }
})

// ==========================================
// Archive & Soft Reset Endpoints
// ==========================================

// Check if archive option should be offered
featuresRoutes.get('/player/archive/check', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const offer = await checkArchiveOffer(user.id)
    const narratives = getArchiveNarratives()

    return c.json({
      ...offer,
      narrative: offer.shouldOffer ? narratives.offer : null,
    })
  } catch (error) {
    logger.error('Archive check error', { error })
    return c.json({ error: 'Failed to check archive status' }, 500)
  }
})

// Get user's archives
featuresRoutes.get('/player/archives', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const archives = await getUserArchives(user.id)

    return c.json({
      archives,
      totalArchives: archives.length,
    })
  } catch (error) {
    logger.error('Get archives error', { error })
    return c.json({ error: 'Failed to get archives' }, 500)
  }
})

// Perform soft reset (archive and restart)
featuresRoutes.post('/player/archive/reset', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const archive = await performSoftReset(user.id)
    const narratives = getArchiveNarratives()

    return c.json({
      archive,
      message: narratives.complete,
    })
  } catch (error) {
    logger.error('Soft reset error', { error })
    return c.json({ error: 'Failed to perform soft reset' }, 500)
  }
})

// Decline archive (continue with current progress)
featuresRoutes.post('/player/archive/decline', requireAuth, async (c) => {
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
    logger.error('Archive decline error', { error })
    return c.json({ error: 'Failed to continue' }, 500)
  }
})

// ============================================================
// DATA PRIVACY ENDPOINTS
// ============================================================

/**
 * GET /player/export
 * Export all user data for GDPR compliance
 */
featuresRoutes.get('/player/export', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const exportData = await exportUserData(user.id)

    // Set headers for JSON download
    c.header('Content-Type', 'application/json')
    c.header('Content-Disposition', `attachment; filename="solo-data-export-${new Date().toISOString().split('T')[0]}.json"`)

    return c.json(exportData)
  } catch (error) {
    logger.error('Data export error', { error })
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

/**
 * GET /player/deletion-status
 * Get current account deletion status
 */
featuresRoutes.get('/player/deletion-status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getDeletionStatus(user.id)
    return c.json({
      ...status,
      message: status.deletionRequested
        ? `[SYSTEM] Account scheduled for deletion in ${status.daysRemaining} days.`
        : '[SYSTEM] No deletion request pending.',
    })
  } catch (error) {
    logger.error('Get deletion status error', { error })
    return c.json({ error: 'Failed to get deletion status' }, 500)
  }
})

/**
 * POST /player/request-deletion
 * Request account deletion (starts 30-day grace period)
 */
featuresRoutes.post('/player/request-deletion', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await requestAccountDeletion(user.id)

    return c.json({
      ...status,
      message: '[SYSTEM] Account deletion requested. You have 30 days to cancel. After that, all data will be permanently deleted.',
    })
  } catch (error) {
    logger.error('Request deletion error', { error })
    return c.json({ error: 'Failed to request deletion' }, 500)
  }
})

/**
 * POST /player/cancel-deletion
 * Cancel a pending account deletion
 */
featuresRoutes.post('/player/cancel-deletion', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const result = await cancelAccountDeletion(user.id)

    if (!result.success) {
      return c.json({
        success: false,
        message: `[SYSTEM] ${result.message}`,
      }, 400)
    }

    return c.json({
      success: true,
      message: '[SYSTEM] Account deletion cancelled. Welcome back, Hunter.',
    })
  } catch (error) {
    logger.error('Cancel deletion error', { error })
    return c.json({ error: 'Failed to cancel deletion' }, 500)
  }
})

export default featuresRoutes
