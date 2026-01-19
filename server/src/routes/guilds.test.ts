import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import {
  createMockAuthMiddleware,
  mockRequireAuth,
  mockUser,
  jsonRequest,
} from '../test/helpers/request'
import { mockGuild, mockGuildMember, mockGuildList } from '../test/fixtures/routes'

// Mock modules before importing
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock guild service
const mockCreateGuild = vi.fn()
const mockGetGuild = vi.fn()
const mockGetUserGuild = vi.fn()
const mockJoinGuild = vi.fn()
const mockLeaveGuild = vi.fn()
const mockInviteToGuild = vi.fn()
const mockGetPublicGuilds = vi.fn()
const mockGetGuildLeaderboard = vi.fn()

vi.mock('../services/guild', () => ({
  createGuild: (...args: unknown[]) => mockCreateGuild(...args),
  getGuild: (...args: unknown[]) => mockGetGuild(...args),
  getUserGuild: (...args: unknown[]) => mockGetUserGuild(...args),
  joinGuild: (...args: unknown[]) => mockJoinGuild(...args),
  leaveGuild: (...args: unknown[]) => mockLeaveGuild(...args),
  inviteToGuild: (...args: unknown[]) => mockInviteToGuild(...args),
  getPublicGuilds: (...args: unknown[]) => mockGetPublicGuilds(...args),
  getGuildLeaderboard: (...args: unknown[]) => mockGetGuildLeaderboard(...args),
}))

describe('Guild Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /guilds/me', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/guilds/me', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/guilds/me')
      expect(res.status).toBe(401)
    })

    it('should return null when user has no guild', async () => {
      mockGetUserGuild.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds/me', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const guild = await mockGetUserGuild(user.id)
        if (!guild) {
          return c.json({ guild: null })
        }
        return c.json({ guild })
      })

      const res = await app.request('/guilds/me')
      expect(res.status).toBe(200)

      const body = await res.json() as { guild: null }
      expect(body.guild).toBeNull()
    })

    it('should return user guild when member of one', async () => {
      mockGetUserGuild.mockResolvedValue(mockGuild)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds/me', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const guild = await mockGetUserGuild(user.id)
        if (!guild) {
          return c.json({ guild: null })
        }
        return c.json({ guild })
      })

      const res = await app.request('/guilds/me')
      expect(res.status).toBe(200)

      const body = await res.json() as { guild: typeof mockGuild }
      expect(body.guild.id).toBe(mockGuild.id)
      expect(body.guild.name).toBe(mockGuild.name)
    })
  })

  describe('GET /guilds/:id', () => {
    it('should return 404 when guild not found', async () => {
      mockGetGuild.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds/:id', mockRequireAuth, async (c) => {
        const guildId = c.req.param('id')
        const guild = await mockGetGuild(guildId)
        if (!guild) {
          return c.json({ error: 'Guild not found' }, 404)
        }
        return c.json({ guild })
      })

      const res = await app.request('/guilds/nonexistent')
      expect(res.status).toBe(404)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Guild not found')
    })

    it('should return guild when found', async () => {
      mockGetGuild.mockResolvedValue(mockGuild)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds/:id', mockRequireAuth, async (c) => {
        const guildId = c.req.param('id')
        const guild = await mockGetGuild(guildId)
        if (!guild) {
          return c.json({ error: 'Guild not found' }, 404)
        }
        return c.json({ guild })
      })

      const res = await app.request('/guilds/guild-123')
      expect(res.status).toBe(200)

      const body = await res.json() as { guild: typeof mockGuild }
      expect(body.guild.id).toBe('guild-123')
    })
  })

  describe('POST /guilds', () => {
    it('should return 400 when name is too short', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ name: string }>()
        if (!body.name || body.name.length < 3 || body.name.length > 30) {
          return c.json({ error: 'Guild name must be 3-30 characters' }, 400)
        }
        return c.json({})
      })

      const res = await app.request('/guilds', jsonRequest({ name: 'ab' }))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('3-30 characters')
    })

    it('should return 400 when name is too long', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ name: string }>()
        if (!body.name || body.name.length < 3 || body.name.length > 30) {
          return c.json({ error: 'Guild name must be 3-30 characters' }, 400)
        }
        return c.json({})
      })

      const longName = 'a'.repeat(31)
      const res = await app.request('/guilds', jsonRequest({ name: longName }))
      expect(res.status).toBe(400)
    })

    it('should create guild with valid name', async () => {
      mockCreateGuild.mockResolvedValue(mockGuild)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ name: string; description?: string }>()

        if (!body.name || body.name.length < 3 || body.name.length > 30) {
          return c.json({ error: 'Guild name must be 3-30 characters' }, 400)
        }

        const guild = await mockCreateGuild(user.id, body)
        return c.json({
          guild,
          message: '[SYSTEM] Guild established. You are now the leader.',
        })
      })

      const res = await app.request('/guilds', jsonRequest({
        name: 'Shadow Hunters',
        description: 'Elite hunters only',
      }))

      expect(res.status).toBe(200)

      const body = await res.json() as { guild: typeof mockGuild; message: string }
      expect(body.guild.name).toBe('Shadow Hunters')
      expect(body.message).toContain('Guild established')
    })

    it('should handle creation errors', async () => {
      mockCreateGuild.mockRejectedValue(new Error('Already in a guild'))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ name: string }>()

        if (!body.name || body.name.length < 3 || body.name.length > 30) {
          return c.json({ error: 'Guild name must be 3-30 characters' }, 400)
        }

        try {
          const guild = await mockCreateGuild(user.id, body)
          return c.json({ guild })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create guild'
          return c.json({ error: message }, 400)
        }
      })

      const res = await app.request('/guilds', jsonRequest({ name: 'Test Guild' }))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Already in a guild')
    })
  })

  describe('POST /guilds/:id/join', () => {
    it('should join guild successfully', async () => {
      mockJoinGuild.mockResolvedValue(mockGuildMember)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/:id/join', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const guildId = c.req.param('id')
        const member = await mockJoinGuild(user.id, guildId)
        return c.json({
          member,
          message: '[SYSTEM] You have joined the guild.',
        })
      })

      const res = await app.request('/guilds/guild-123/join', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { member: typeof mockGuildMember; message: string }
      expect(body.member.guildId).toBe('guild-123')
      expect(body.message).toContain('joined')
    })

    it('should handle join errors', async () => {
      mockJoinGuild.mockRejectedValue(new Error('Guild is full'))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/:id/join', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const guildId = c.req.param('id')
        try {
          const member = await mockJoinGuild(user.id, guildId)
          return c.json({ member })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to join guild'
          return c.json({ error: message }, 400)
        }
      })

      const res = await app.request('/guilds/guild-123/join', { method: 'POST' })
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Guild is full')
    })
  })

  describe('POST /guilds/leave', () => {
    it('should leave guild successfully', async () => {
      mockLeaveGuild.mockResolvedValue(undefined)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/leave', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        await mockLeaveGuild(user.id)
        return c.json({
          message: '[SYSTEM] You have left the guild.',
        })
      })

      const res = await app.request('/guilds/leave', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { message: string }
      expect(body.message).toContain('left the guild')
    })

    it('should handle leave errors', async () => {
      mockLeaveGuild.mockRejectedValue(new Error('You are not in a guild'))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/leave', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        try {
          await mockLeaveGuild(user.id)
          return c.json({ message: 'Left guild' })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to leave guild'
          return c.json({ error: message }, 400)
        }
      })

      const res = await app.request('/guilds/leave', { method: 'POST' })
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('You are not in a guild')
    })
  })

  describe('POST /guilds/invite', () => {
    it('should return 400 when userId is missing', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/invite', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ userId?: string }>()
        if (!body.userId) {
          return c.json({ error: 'User ID required' }, 400)
        }
        return c.json({})
      })

      const res = await app.request('/guilds/invite', jsonRequest({}))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('User ID required')
    })

    it('should send invite successfully', async () => {
      mockInviteToGuild.mockResolvedValue({ id: 'invite-1', status: 'pending' })

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/guilds/invite', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ userId: string }>()

        if (!body.userId) {
          return c.json({ error: 'User ID required' }, 400)
        }

        const invite = await mockInviteToGuild(user.id, body.userId)
        return c.json({
          invite,
          message: '[SYSTEM] Invitation sent.',
        })
      })

      const res = await app.request('/guilds/invite', jsonRequest({ userId: 'user-456' }))
      expect(res.status).toBe(200)

      const body = await res.json() as { invite: { id: string }; message: string }
      expect(body.invite.id).toBe('invite-1')
      expect(body.message).toContain('Invitation sent')
    })
  })

  describe('GET /guilds', () => {
    it('should return public guilds', async () => {
      mockGetPublicGuilds.mockResolvedValue(mockGuildList)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds', mockRequireAuth, async (c) => {
        const limit = parseInt(c.req.query('limit') || '20')
        const guilds = await mockGetPublicGuilds(Math.min(limit, 50))
        return c.json({ guilds })
      })

      const res = await app.request('/guilds')
      expect(res.status).toBe(200)

      const body = await res.json() as { guilds: typeof mockGuildList }
      expect(body.guilds).toHaveLength(3)
    })

    it('should respect limit parameter', async () => {
      mockGetPublicGuilds.mockResolvedValue(mockGuildList.slice(0, 2))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds', mockRequireAuth, async (c) => {
        const limit = parseInt(c.req.query('limit') || '20')
        const guilds = await mockGetPublicGuilds(Math.min(limit, 50))
        return c.json({ guilds })
      })

      const res = await app.request('/guilds?limit=2')
      expect(res.status).toBe(200)

      expect(mockGetPublicGuilds).toHaveBeenCalledWith(2)
    })

    it('should cap limit at 50', async () => {
      mockGetPublicGuilds.mockResolvedValue([])

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds', mockRequireAuth, async (c) => {
        const limit = parseInt(c.req.query('limit') || '20')
        const guilds = await mockGetPublicGuilds(Math.min(limit, 50))
        return c.json({ guilds })
      })

      await app.request('/guilds?limit=100')
      expect(mockGetPublicGuilds).toHaveBeenCalledWith(50)
    })
  })

  describe('GET /guilds/leaderboard', () => {
    it('should return guild leaderboard', async () => {
      const leaderboard = [
        { rank: 1, guildId: 'guild-1', name: 'Top Guild', weeklyXP: 5000 },
        { rank: 2, guildId: 'guild-2', name: 'Second Guild', weeklyXP: 4500 },
      ]
      mockGetGuildLeaderboard.mockResolvedValue(leaderboard)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/guilds/leaderboard', mockRequireAuth, async (c) => {
        const limit = parseInt(c.req.query('limit') || '10')
        const lb = await mockGetGuildLeaderboard(Math.min(limit, 50))
        return c.json({ leaderboard: lb })
      })

      const res = await app.request('/guilds/leaderboard')
      expect(res.status).toBe(200)

      const body = await res.json() as { leaderboard: typeof leaderboard }
      expect(body.leaderboard).toHaveLength(2)
      expect(body.leaderboard[0].rank).toBe(1)
    })
  })

  describe('Guild response structure', () => {
    it('should include required guild fields', () => {
      const requiredFields = ['id', 'name', 'description', 'leaderId', 'memberCount']
      for (const field of requiredFields) {
        expect(mockGuild).toHaveProperty(field)
      }
    })

    it('should have valid member roles', () => {
      const validRoles = ['leader', 'officer', 'member']
      expect(validRoles).toContain(mockGuildMember.role)
    })
  })
})
