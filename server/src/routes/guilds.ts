import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  createGuild,
  getGuild,
  getUserGuild,
  joinGuild,
  leaveGuild,
  inviteToGuild,
  getPublicGuilds,
  getGuildLeaderboard,
} from '../services/guild'

const guildRoutes = new Hono()

// Get user's current guild
guildRoutes.get('/guilds/me', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const guild = await getUserGuild(user.id)
    if (!guild) {
      return c.json({ guild: null })
    }
    return c.json({ guild })
  } catch (error) {
    console.error('Get user guild error:', error)
    return c.json({ error: 'Failed to get guild' }, 500)
  }
})

// Get guild by ID
guildRoutes.get('/guilds/:id', requireAuth, async (c) => {
  const guildId = c.req.param('id')

  try {
    const guild = await getGuild(guildId)
    if (!guild) {
      return c.json({ error: 'Guild not found' }, 404)
    }
    return c.json({ guild })
  } catch (error) {
    console.error('Get guild error:', error)
    return c.json({ error: 'Failed to get guild' }, 500)
  }
})

// Create a new guild
guildRoutes.post('/guilds', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{
      name: string
      description?: string
      isPublic?: boolean
      minLevel?: number
    }>()

    if (!body.name || body.name.length < 3 || body.name.length > 30) {
      return c.json({ error: 'Guild name must be 3-30 characters' }, 400)
    }

    const guild = await createGuild(user.id, body)
    return c.json({
      guild,
      message: '[SYSTEM] Guild established. You are now the leader.',
    })
  } catch (error) {
    console.error('Create guild error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create guild'
    return c.json({ error: message }, 400)
  }
})

// Join a public guild
guildRoutes.post('/guilds/:id/join', requireAuth, async (c) => {
  const user = c.get('user')!
  const guildId = c.req.param('id')

  try {
    const member = await joinGuild(user.id, guildId)
    return c.json({
      member,
      message: '[SYSTEM] You have joined the guild.',
    })
  } catch (error) {
    console.error('Join guild error:', error)
    const message = error instanceof Error ? error.message : 'Failed to join guild'
    return c.json({ error: message }, 400)
  }
})

// Leave current guild
guildRoutes.post('/guilds/leave', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await leaveGuild(user.id)
    return c.json({
      message: '[SYSTEM] You have left the guild.',
    })
  } catch (error) {
    console.error('Leave guild error:', error)
    const message = error instanceof Error ? error.message : 'Failed to leave guild'
    return c.json({ error: message }, 400)
  }
})

// Invite a user to the guild
guildRoutes.post('/guilds/invite', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{ userId: string }>()

    if (!body.userId) {
      return c.json({ error: 'User ID required' }, 400)
    }

    const invite = await inviteToGuild(user.id, body.userId)
    return c.json({
      invite,
      message: '[SYSTEM] Invitation sent.',
    })
  } catch (error) {
    console.error('Invite to guild error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send invite'
    return c.json({ error: message }, 400)
  }
})

// Browse public guilds
guildRoutes.get('/guilds', requireAuth, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const guilds = await getPublicGuilds(Math.min(limit, 50))
    return c.json({ guilds })
  } catch (error) {
    console.error('Get public guilds error:', error)
    return c.json({ error: 'Failed to get guilds' }, 500)
  }
})

// Guild leaderboard
guildRoutes.get('/guilds/leaderboard', requireAuth, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const leaderboard = await getGuildLeaderboard(Math.min(limit, 50))
    return c.json({ leaderboard })
  } catch (error) {
    console.error('Get guild leaderboard error:', error)
    return c.json({ error: 'Failed to get leaderboard' }, 500)
  }
})

export default guildRoutes
