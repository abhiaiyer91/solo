import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  getRaidBossTemplates,
  createRaid,
  getRaid,
  getUserActiveRaid,
  joinRaid,
  leaveRaid,
  startRaid,
  getOpenRaids,
} from '../services/raid'

const raidRoutes = new Hono()

// Get raid boss templates
raidRoutes.get('/raids/bosses', requireAuth, async (c) => {
  try {
    const bosses = getRaidBossTemplates()
    return c.json({ bosses })
  } catch (error) {
    console.error('Get raid bosses error:', error)
    return c.json({ error: 'Failed to get raid bosses' }, 500)
  }
})

// Get open raids
raidRoutes.get('/raids/open', requireAuth, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const raids = await getOpenRaids(Math.min(limit, 20))
    return c.json({ raids })
  } catch (error) {
    console.error('Get open raids error:', error)
    return c.json({ error: 'Failed to get open raids' }, 500)
  }
})

// Get user's active raid
raidRoutes.get('/raids/me', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const raid = await getUserActiveRaid(user.id)
    return c.json({ raid })
  } catch (error) {
    console.error('Get user raid error:', error)
    return c.json({ error: 'Failed to get raid' }, 500)
  }
})

// Get raid by ID
raidRoutes.get('/raids/:id', requireAuth, async (c) => {
  const raidId = c.req.param('id')

  try {
    const raid = await getRaid(raidId)
    if (!raid) {
      return c.json({ error: 'Raid not found' }, 404)
    }
    return c.json({ raid })
  } catch (error) {
    console.error('Get raid error:', error)
    return c.json({ error: 'Failed to get raid' }, 500)
  }
})

// Create a new raid
raidRoutes.post('/raids', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const { bossId } = await c.req.json<{ bossId: string }>()

    if (!bossId) {
      return c.json({ error: 'Boss ID required' }, 400)
    }

    const raid = await createRaid(user.id, bossId)
    return c.json({
      raid,
      message: '[SYSTEM] Raid formed. Awaiting allies.',
    })
  } catch (error) {
    console.error('Create raid error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create raid'
    return c.json({ error: message }, 400)
  }
})

// Join a raid
raidRoutes.post('/raids/:id/join', requireAuth, async (c) => {
  const user = c.get('user')!
  const raidId = c.req.param('id')

  try {
    const member = await joinRaid(user.id, raidId)
    return c.json({
      member,
      message: '[SYSTEM] You have joined the raid.',
    })
  } catch (error) {
    console.error('Join raid error:', error)
    const message = error instanceof Error ? error.message : 'Failed to join raid'
    return c.json({ error: message }, 400)
  }
})

// Leave a raid
raidRoutes.post('/raids/:id/leave', requireAuth, async (c) => {
  const user = c.get('user')!
  const raidId = c.req.param('id')

  try {
    await leaveRaid(user.id, raidId)
    return c.json({
      message: '[SYSTEM] You have left the raid.',
    })
  } catch (error) {
    console.error('Leave raid error:', error)
    const message = error instanceof Error ? error.message : 'Failed to leave raid'
    return c.json({ error: message }, 400)
  }
})

// Start a raid (leader only)
raidRoutes.post('/raids/:id/start', requireAuth, async (c) => {
  const user = c.get('user')!
  const raidId = c.req.param('id')

  try {
    const raid = await startRaid(user.id, raidId)
    return c.json({
      raid,
      message: '[SYSTEM] Raid commenced. Phase 1: Coordination.',
    })
  } catch (error) {
    console.error('Start raid error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start raid'
    return c.json({ error: message }, 400)
  }
})

export default raidRoutes
