import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import { cacheResponse, CACHE_PRESETS } from '../lib/cache'
import {
  questProgressDataSchema,
  setTargetSchema,
  challengeCompleteSchema,
  questHistoryQuerySchema,
  daysBackSchema,
} from '../lib/validation/schemas'
import {
  getTodayQuestsWithRotating,
  getQuestById,
  updateQuestProgress,
  resetQuest,
  removeQuest,
  deactivateQuestByTemplate,
  getAllQuestTemplates,
  activateQuest,
  getQuestHistory,
} from '../services/quest'
import {
  getAdaptedTarget,
  getAllAdaptedTargets,
  setManualTarget,
  clearManualOverride,
  adaptTarget,
} from '../services/quest-adaptation'
import { getWeeklyQuests, getWeeklyQuestById } from '../services/weekly-quest'
import {
  getRotatingQuestUnlockStatus,
  getTodayRotatingQuest,
  getRotatingQuestUnlockNarrative,
  getRotatingQuestNarrative,
  ROTATING_QUEST_UNLOCK_DAY,
} from '../services/rotating-quest'
import {
  getDailyBonusQuest,
  rerollBonusQuest,
  getBonusQuestUnlockStatus,
} from '../services/bonus-quest'
import {
  getTodayChallenge,
  getChallengeHistory,
  getChallengeProgress,
  completeChallenge,
  getChallengeStats,
  isTodayChallengeCompleted,
} from '../services/daily-challenge'

const questRoutes = new Hono()

// Get today's quests (includes rotating quest if unlocked)
questRoutes.get('/quests', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const { coreQuests, allQuests, rotatingQuest, rotatingUnlockStatus } = await getTodayQuestsWithRotating(
      user.id,
      user.timezone ?? 'UTC'
    )

    return c.json({
      quests: allQuests,  // All quests: core + bonus + rotating (deduplicated)
      coreQuests,
      rotatingQuest,
      rotatingUnlockStatus,
      date: new Date().toISOString().split('T')[0],
    })
  } catch (error) {
    logger.error('Get quests error', { error })
    return c.json({ error: 'Failed to get quests' }, 500)
  }
})

// Get quest history
questRoutes.get('/quests/history', requireAuth, zValidator('query', questHistoryQuerySchema), async (c) => {
  const user = c.get('user')!
  const query = c.req.valid('query')

  try {
    const result = await getQuestHistory(user.id, {
      limit: query.limit,
      offset: query.offset,
      daysBack: query.daysBack,
      status: query.status,
      type: query.type,
    })

    return c.json(result)
  } catch (error) {
    logger.error('Get quest history error', { error })
    return c.json({ error: 'Failed to get quest history' }, 500)
  }
})

// Get all quest templates
questRoutes.get('/quests/templates', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const templates = await getAllQuestTemplates(user.id)
    return c.json({ templates })
  } catch (error) {
    logger.error('Get quest templates error', { error })
    return c.json({ error: 'Failed to get quest templates' }, 500)
  }
})

// Activate a quest
questRoutes.post('/quests/activate/:templateId', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')

  try {
    const quest = await activateQuest(user.id, templateId)
    return c.json({
      quest,
      message: `[SYSTEM] Quest activated: ${quest.name}`,
    })
  } catch (error) {
    logger.error('Activate quest error', { error })
    const message = error instanceof Error ? error.message : 'Failed to activate quest'
    return c.json({ error: message }, 400)
  }
})

// Deactivate a quest by template ID
questRoutes.post('/quests/deactivate/:templateId', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')

  try {
    const result = await deactivateQuestByTemplate(templateId, user.id, user.timezone ?? 'UTC')
    return c.json({
      deactivated: result.deactivated,
      message: `[SYSTEM] ${result.message}`,
    })
  } catch (error) {
    logger.error('Deactivate quest error', { error })
    const message = error instanceof Error ? error.message : 'Failed to deactivate quest'
    return c.json({ error: message }, 400)
  }
})

// Get specific quest
questRoutes.get('/quests/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')

  try {
    const quest = await getQuestById(questId, user.id)
    if (!quest) {
      return c.json({ error: 'Quest not found' }, 404)
    }
    return c.json(quest)
  } catch (error) {
    logger.error('Get quest error', { error })
    return c.json({ error: 'Failed to get quest' }, 500)
  }
})

// Complete quest
questRoutes.post('/quests/:id/complete', requireAuth, zValidator('json', questProgressDataSchema), async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')
  const body = c.req.valid('json')

  try {
    const result = await updateQuestProgress(questId, user.id, body.data)

    return c.json({
      quest: result.quest,
      xpAwarded: result.xpAwarded,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      message:
        result.xpAwarded > 0
          ? `[SYSTEM] Quest complete! +${result.xpAwarded} XP${result.leveledUp ? ` Level up! You are now level ${result.newLevel}!` : ''}`
          : '[SYSTEM] Quest progress updated.',
    })
  } catch (error) {
    logger.error('Complete quest error', { error })
    const message = error instanceof Error ? error.message : 'Failed to complete quest'
    return c.json({ error: message }, 400)
  }
})

// Reset quest
questRoutes.post('/quests/:id/reset', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')

  try {
    const result = await resetQuest(questId, user.id)

    return c.json({
      quest: result.quest,
      xpRemoved: result.xpRemoved,
      message:
        result.xpRemoved > 0
          ? `[SYSTEM] Quest reset. -${result.xpRemoved} XP removed.`
          : '[SYSTEM] Quest reset.',
    })
  } catch (error) {
    logger.error('Reset quest error', { error })
    const message = error instanceof Error ? error.message : 'Failed to reset quest'
    return c.json({ error: message }, 400)
  }
})

// Remove quest from active log (only non-core quests)
questRoutes.delete('/quests/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')

  try {
    const result = await removeQuest(questId, user.id)

    return c.json({
      removed: result.removed,
      message: `[SYSTEM] ${result.message}`,
    })
  } catch (error) {
    logger.error('Remove quest error', { error })
    const message = error instanceof Error ? error.message : 'Failed to remove quest'
    return c.json({ error: message }, 400)
  }
})

// Weekly quests
questRoutes.get('/quests/weekly', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const weeklyQuests = await getWeeklyQuests(user.id)
    return c.json({
      quests: weeklyQuests,
      weekStart: weeklyQuests[0]?.weekStart ?? null,
      weekEnd: weeklyQuests[0]?.weekEnd ?? null,
    })
  } catch (error) {
    logger.error('Get weekly quests error', { error })
    return c.json({ error: 'Failed to get weekly quests' }, 500)
  }
})

// Get specific weekly quest
questRoutes.get('/quests/weekly/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')

  try {
    const quest = await getWeeklyQuestById(questId, user.id)
    if (!quest) {
      return c.json({ error: 'Weekly quest not found' }, 404)
    }
    return c.json(quest)
  } catch (error) {
    logger.error('Get weekly quest error', { error })
    return c.json({ error: 'Failed to get weekly quest' }, 500)
  }
})

// ============================================================
// Rotating Quest Endpoints
// ============================================================

// Get rotating quest unlock status
questRoutes.get('/quests/rotating/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getRotatingQuestUnlockStatus(user.id)

    return c.json({
      ...status,
      unlockNarrative: status.unlocked ? null : getRotatingQuestUnlockNarrative(),
      message: status.unlocked
        ? '[SYSTEM] Rotating quest slot active.'
        : `[SYSTEM] Rotating quest slot locked. ${status.daysRemaining} days remaining until unlock.`,
    })
  } catch (error) {
    logger.error('Get rotating quest status error', { error })
    return c.json({ error: 'Failed to get rotating quest status' }, 500)
  }
})

// Get today's rotating quest
questRoutes.get('/quests/rotating/today', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getRotatingQuestUnlockStatus(user.id)

    if (!status.unlocked) {
      return c.json({
        quest: null,
        locked: true,
        unlockDay: ROTATING_QUEST_UNLOCK_DAY,
        currentDay: status.currentDay,
        daysRemaining: status.daysRemaining,
        message: `[SYSTEM] Rotating quest slot locked. Complete ${status.daysRemaining} more day(s) to unlock.`,
      })
    }

    const rotatingQuest = await getTodayRotatingQuest(user.id, user.timezone ?? 'UTC')

    if (!rotatingQuest) {
      return c.json({
        quest: null,
        locked: false,
        message: '[SYSTEM] No rotating quest available today.',
      })
    }

    // Get the narrative for this rotating quest
    const requirement = rotatingQuest.requirement as {
      type: string
      value?: number
      metric?: string
    }
    const target =
      requirement.type === 'numeric'
        ? `${requirement.value} ${requirement.metric?.replace(/_/g, ' ')}`
        : rotatingQuest.description

    const narrative = getRotatingQuestNarrative(
      rotatingQuest.templateId,
      rotatingQuest.name,
      target,
      rotatingQuest.baseXP
    )

    return c.json({
      quest: rotatingQuest,
      locked: false,
      narrative,
      message: `[SYSTEM] Today's rotating quest: ${rotatingQuest.name}`,
    })
  } catch (error) {
    logger.error('Get rotating quest error', { error })
    return c.json({ error: 'Failed to get rotating quest' }, 500)
  }
})

// ==========================================
// Bonus Quest Endpoints
// ==========================================

// Get today's bonus quest
questRoutes.get('/quests/bonus', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const unlockStatus = await getBonusQuestUnlockStatus(user.id)

    if (!unlockStatus.isUnlocked) {
      return c.json({
        quest: null,
        locked: true,
        unlockLevel: unlockStatus.requiredLevel,
        currentLevel: unlockStatus.currentLevel,
        message: `[SYSTEM] Bonus quest slot locked. Reach Level ${unlockStatus.requiredLevel} to unlock.`,
      })
    }

    const bonusQuest = await getDailyBonusQuest(user.id, user.timezone ?? 'UTC')

    return c.json({
      quest: bonusQuest,
      locked: false,
      message: bonusQuest
        ? `[SYSTEM] Bonus quest available: ${bonusQuest.name}`
        : '[SYSTEM] No bonus quest available.',
    })
  } catch (error) {
    logger.error('Get bonus quest error', { error })
    return c.json({ error: 'Failed to get bonus quest' }, 500)
  }
})

// Reroll bonus quest (once per day)
questRoutes.post('/quests/bonus/reroll', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const newQuest = await rerollBonusQuest(user.id, user.timezone ?? 'UTC')

    if (!newQuest) {
      return c.json({ error: 'Cannot reroll - not unlocked or already rerolled' }, 400)
    }

    return c.json({
      quest: newQuest,
      message: '[SYSTEM] New bonus quest assigned.',
    })
  } catch (error) {
    logger.error('Reroll bonus quest error', { error })
    return c.json({ error: 'Failed to reroll bonus quest' }, 500)
  }
})

// Get bonus quest unlock status
questRoutes.get('/quests/bonus/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getBonusQuestUnlockStatus(user.id)
    return c.json(status)
  } catch (error) {
    logger.error('Bonus quest status error', { error })
    return c.json({ error: 'Failed to get bonus quest status' }, 500)
  }
})

// ============================================================
// Adapted Targets Endpoints
// ============================================================

// GET /api/quests/targets - Get all adapted targets for user
questRoutes.get('/quests/targets', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const targets = await getAllAdaptedTargets(user.id)
    return c.json({
      targets: targets.map((t) => ({
        id: t.id,
        questTemplateId: t.questTemplateId,
        baseTarget: t.baseTarget,
        adaptedTarget: t.adaptedTarget,
        manualOverride: t.manualOverride,
        completionRate: t.completionRate,
        averageAchievement: t.averageAchievement,
        lastAdaptedAt: t.lastAdaptedAt,
      })),
    })
  } catch (error) {
    logger.error('Get adapted targets error', { error })
    return c.json({ error: 'Failed to get adapted targets' }, 500)
  }
})

// GET /api/quests/targets/:templateId - Get adapted target for specific quest
questRoutes.get('/quests/targets/:templateId', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')

  try {
    const target = await getAdaptedTarget(user.id, templateId)

    if (!target) {
      return c.json({ error: 'No target found for this quest' }, 404)
    }

    return c.json({
      target: {
        id: target.id,
        questTemplateId: target.questTemplateId,
        baseTarget: target.baseTarget,
        adaptedTarget: target.adaptedTarget,
        manualOverride: target.manualOverride,
        completionRate: target.completionRate,
        averageAchievement: target.averageAchievement,
        lastAdaptedAt: target.lastAdaptedAt,
      },
    })
  } catch (error) {
    logger.error('Get adapted target error', { error })
    return c.json({ error: 'Failed to get adapted target' }, 500)
  }
})

// PUT /api/quests/targets/:templateId - Set manual target override
questRoutes.put('/quests/targets/:templateId', requireAuth, zValidator('json', setTargetSchema), async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')
  const body = c.req.valid('json')

  try {
    const updated = await setManualTarget(user.id, templateId, body.target)

    return c.json({
      success: true,
      target: {
        id: updated.id,
        questTemplateId: updated.questTemplateId,
        baseTarget: updated.baseTarget,
        adaptedTarget: updated.adaptedTarget,
        manualOverride: updated.manualOverride,
      },
      message: '[SYSTEM] Target manually set. Automatic adaptation paused.',
    })
  } catch (error) {
    logger.error('Set manual target error', { error })
    const message = error instanceof Error ? error.message : 'Failed to set target'
    return c.json({ error: message }, 400)
  }
})

// DELETE /api/quests/targets/:templateId/override - Clear manual override
questRoutes.delete('/quests/targets/:templateId/override', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')

  try {
    const updated = await clearManualOverride(user.id, templateId)

    return c.json({
      success: true,
      target: {
        id: updated.id,
        questTemplateId: updated.questTemplateId,
        baseTarget: updated.baseTarget,
        adaptedTarget: updated.adaptedTarget,
        manualOverride: updated.manualOverride,
      },
      message: '[SYSTEM] Manual override cleared. Automatic adaptation resumed.',
    })
  } catch (error) {
    logger.error('Clear manual override error', { error })
    return c.json({ error: 'Failed to clear override' }, 500)
  }
})

// POST /api/quests/targets/:templateId/adapt - Force adaptation (for testing)
questRoutes.post('/quests/targets/:templateId/adapt', requireAuth, async (c) => {
  const user = c.get('user')!
  const templateId = c.req.param('templateId')

  try {
    const result = await adaptTarget(user.id, templateId)

    return c.json({
      ...result,
      message:
        result.oldTarget !== result.newTarget
          ? `[SYSTEM] Target adapted: ${result.oldTarget} → ${result.newTarget}`
          : '[SYSTEM] Target unchanged.',
    })
  } catch (error) {
    logger.error('Adapt target error', { error })
    return c.json({ error: 'Failed to adapt target' }, 500)
  }
})

// ============================================================
// Daily Challenge Endpoints
// ============================================================

// Get today's daily challenge
questRoutes.get('/quests/challenge', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const challenge = await getTodayChallenge(user.id, user.level ?? 1)

    if (!challenge) {
      return c.json({
        challenge: null,
        message: '[SYSTEM] No daily challenge available.',
      })
    }

    return c.json({
      challenge,
      message: `[SYSTEM] Daily Challenge: ${challenge.name}`,
    })
  } catch (error) {
    logger.error('Get daily challenge error', { error })
    return c.json({ error: 'Failed to get daily challenge' }, 500)
  }
})

// Get challenge progress
questRoutes.get('/quests/challenge/progress', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const progress = await getChallengeProgress(user.id)

    return c.json({
      progress,
      message: progress?.completed
        ? '[SYSTEM] Challenge completed!'
        : '[SYSTEM] Challenge in progress.',
    })
  } catch (error) {
    logger.error('Get challenge progress error', { error })
    return c.json({ error: 'Failed to get challenge progress' }, 500)
  }
})

// Complete today's challenge
questRoutes.post('/quests/challenge/complete', requireAuth, zValidator('json', challengeCompleteSchema), async (c) => {
  const user = c.get('user')!
  const body = c.req.valid('json')

  try {
    const result = await completeChallenge(user.id, body.challengeId)

    return c.json({
      xpAwarded: result.xpAwarded,
      challenge: result.challenge,
      message: `[SYSTEM] Daily Challenge complete! +${result.xpAwarded} bonus XP!`,
    })
  } catch (error) {
    logger.error('Complete challenge error', { error })
    const message = error instanceof Error ? error.message : 'Failed to complete challenge'
    return c.json({ error: message }, 400)
  }
})

// Get challenge history
questRoutes.get('/quests/challenge/history', requireAuth, zValidator('query', daysBackSchema), async (c) => {
  const user = c.get('user')!
  const query = c.req.valid('query')
  const limit = query.days

  try {
    const history = await getChallengeHistory(user.id, limit)

    return c.json({
      history,
      message: `[SYSTEM] Challenge history retrieved (last ${limit} days).`,
    })
  } catch (error) {
    logger.error('Get challenge history error', { error })
    return c.json({ error: 'Failed to get challenge history' }, 500)
  }
})

// Get challenge stats
questRoutes.get('/quests/challenge/stats', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const stats = await getChallengeStats(user.id)

    return c.json({
      stats,
      message: '[SYSTEM] Challenge statistics retrieved.',
    })
  } catch (error) {
    logger.error('Get challenge stats error', { error })
    return c.json({ error: 'Failed to get challenge stats' }, 500)
  }
})

export default questRoutes
