import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  getTodayQuestsWithRotating,
  getQuestById,
  updateQuestProgress,
  resetQuest,
  removeQuest,
  deactivateQuestByTemplate,
  getAllQuestTemplates,
  activateQuest,
} from '../services/quest'
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
    console.error('Get quests error:', error)
    return c.json({ error: 'Failed to get quests' }, 500)
  }
})

// Get all quest templates
questRoutes.get('/quests/templates', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const templates = await getAllQuestTemplates(user.id)
    return c.json({ templates })
  } catch (error) {
    console.error('Get quest templates error:', error)
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
    console.error('Activate quest error:', error)
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
    console.error('Deactivate quest error:', error)
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
    console.error('Get quest error:', error)
    return c.json({ error: 'Failed to get quest' }, 500)
  }
})

// Complete quest
questRoutes.post('/quests/:id/complete', requireAuth, async (c) => {
  const user = c.get('user')!
  const questId = c.req.param('id')

  try {
    const body = await c.req.json<{ data: Record<string, number | boolean> }>()
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
    console.error('Complete quest error:', error)
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
    console.error('Reset quest error:', error)
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
    console.error('Remove quest error:', error)
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
    console.error('Get weekly quests error:', error)
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
    console.error('Get weekly quest error:', error)
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
    console.error('Get rotating quest status error:', error)
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
    console.error('Get rotating quest error:', error)
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
    console.error('Get bonus quest error:', error)
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
    console.error('Reroll bonus quest error:', error)
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
    console.error('Bonus quest status error:', error)
    return c.json({ error: 'Failed to get bonus quest status' }, 500)
  }
})

export default questRoutes
