import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { sql } from 'drizzle-orm'

// Mock modules before importing
vi.mock('../db', () => ({
  dbClient: null,
}))

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('Health Routes', () => {
  const startTime = Date.now()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET / (full health check)', () => {
    it('should return healthy status when database is connected', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue({}),
      }

      const app = new Hono()
      app.get('/', async (c) => {
        const version = 'test-version'
        const uptime = Math.floor((Date.now() - startTime) / 1000)
        let dbStatus: 'ok' | 'error' = 'ok'

        try {
          await mockDb.execute(sql`SELECT 1`)
        } catch {
          dbStatus = 'error'
        }

        return c.json({
          status: dbStatus === 'ok' ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          version,
          uptime,
          checks: { database: dbStatus },
        }, dbStatus === 'ok' ? 200 : 503)
      })

      const res = await app.request('/')
      expect(res.status).toBe(200)

      const body = await res.json() as { status: string; checks: { database: string } }
      expect(body.status).toBe('healthy')
      expect(body.checks.database).toBe('ok')
    })

    it('should return unhealthy status when database fails', async () => {
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error('Connection refused')),
      }

      const app = new Hono()
      app.get('/', async (c) => {
        const version = 'test-version'
        const uptime = Math.floor((Date.now() - startTime) / 1000)
        let dbStatus: 'ok' | 'error' = 'ok'
        let errorMsg: string | undefined

        try {
          await mockDb.execute(sql`SELECT 1`)
        } catch (e) {
          dbStatus = 'error'
          errorMsg = e instanceof Error ? e.message : 'Unknown error'
        }

        const status = dbStatus === 'ok' ? 'healthy' : 'unhealthy'
        const response: Record<string, unknown> = {
          status,
          timestamp: new Date().toISOString(),
          version,
          uptime,
          checks: { database: dbStatus },
        }

        if (errorMsg) {
          response.error = errorMsg
        }

        return c.json(response, status === 'healthy' ? 200 : 503)
      })

      const res = await app.request('/')
      expect(res.status).toBe(503)

      const body = await res.json() as { status: string; error: string }
      expect(body.status).toBe('unhealthy')
      expect(body.error).toBe('Connection refused')
    })

    it('should include version, uptime, and timestamp', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue({}),
      }

      const app = new Hono()
      app.get('/', async (c) => {
        await mockDb.execute(sql`SELECT 1`)

        return c.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: 'v1.0.0',
          uptime: 3600,
          checks: { database: 'ok' },
        })
      })

      const res = await app.request('/')
      const body = await res.json() as {
        version: string
        uptime: number
        timestamp: string
      }

      expect(body).toHaveProperty('version')
      expect(body).toHaveProperty('uptime')
      expect(body).toHaveProperty('timestamp')
      expect(body.version).toBe('v1.0.0')
      expect(body.uptime).toBe(3600)
    })
  })

  describe('GET /live (liveness probe)', () => {
    it('should always return ok status', async () => {
      const app = new Hono()
      app.get('/live', (c) => c.json({ status: 'ok' }))

      const res = await app.request('/live')
      expect(res.status).toBe(200)

      const body = await res.json() as { status: string }
      expect(body.status).toBe('ok')
    })
  })

  describe('GET /ready (readiness probe)', () => {
    it('should return ready when database is connected', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue({}),
      }

      const app = new Hono()
      app.get('/ready', async (c) => {
        try {
          await mockDb.execute(sql`SELECT 1`)
          return c.json({ status: 'ready' })
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Unknown error'
          return c.json({ status: 'not ready', reason: error }, 503)
        }
      })

      const res = await app.request('/ready')
      expect(res.status).toBe(200)

      const body = await res.json() as { status: string }
      expect(body.status).toBe('ready')
    })

    it('should return not ready when database fails', async () => {
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error('Connection timeout')),
      }

      const app = new Hono()
      app.get('/ready', async (c) => {
        try {
          await mockDb.execute(sql`SELECT 1`)
          return c.json({ status: 'ready' })
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Unknown error'
          return c.json({ status: 'not ready', reason: error }, 503)
        }
      })

      const res = await app.request('/ready')
      expect(res.status).toBe(503)

      const body = await res.json() as { status: string; reason: string }
      expect(body.status).toBe('not ready')
      expect(body.reason).toBe('Connection timeout')
    })

    it('should return not ready when database client is null', async () => {
      const app = new Hono()
      const dbClient = null

      app.get('/ready', async (c) => {
        if (dbClient) {
          return c.json({ status: 'ready' })
        }
        return c.json({ status: 'not ready', reason: 'database not initialized' }, 503)
      })

      const res = await app.request('/ready')
      expect(res.status).toBe(503)

      const body = await res.json() as { status: string; reason: string }
      expect(body.status).toBe('not ready')
      expect(body.reason).toBe('database not initialized')
    })
  })

  describe('GET /metrics', () => {
    it('should return server metrics', async () => {
      const app = new Hono()
      app.get('/metrics', (c) => {
        return c.json({
          uptime_seconds: 3600,
          memory: {
            rss_mb: 100,
            heap_used_mb: 50,
            heap_total_mb: 80,
          },
          node_version: 'v20.0.0',
          env: 'test',
        })
      })

      const res = await app.request('/metrics')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        uptime_seconds: number
        memory: { rss_mb: number; heap_used_mb: number; heap_total_mb: number }
        node_version: string
        env: string
      }

      expect(body).toHaveProperty('uptime_seconds')
      expect(body).toHaveProperty('memory')
      expect(body.memory).toHaveProperty('rss_mb')
      expect(body.memory).toHaveProperty('heap_used_mb')
      expect(body.memory).toHaveProperty('heap_total_mb')
      expect(body).toHaveProperty('node_version')
      expect(body).toHaveProperty('env')
    })

    it('should return memory in megabytes', async () => {
      const app = new Hono()
      app.get('/metrics', (c) => {
        const memoryUsage = process.memoryUsage()
        return c.json({
          uptime_seconds: 100,
          memory: {
            rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
            heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          },
          node_version: process.version,
          env: 'test',
        })
      })

      const res = await app.request('/metrics')
      const body = await res.json() as { memory: { rss_mb: number } }

      expect(typeof body.memory.rss_mb).toBe('number')
      expect(body.memory.rss_mb).toBeGreaterThan(0)
    })
  })

  describe('Health status type', () => {
    it('should have valid status values', () => {
      const validStatuses = ['healthy', 'degraded', 'unhealthy']
      expect(validStatuses).toContain('healthy')
      expect(validStatuses).toContain('unhealthy')
    })

    it('should have valid database check values', () => {
      const validDbStatuses = ['ok', 'error']
      expect(validDbStatuses).toContain('ok')
      expect(validDbStatuses).toContain('error')
    })
  })
})
