/**
 * Fitness Tests Routes
 * API endpoints for mandatory fitness tests and fitness test records
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
import {
  recordFitnessTestSchema,
  skipFitnessTestSchema,
  fitnessTestHistoryQuerySchema,
  fitnessTestTypeSchema,
} from '../lib/validation/schemas'
import {
  getMandatoryFitnessTests,
  getMandatoryTestsStatus,
  recordFitnessTest,
  skipMandatoryTest,
  getFitnessTestHistory,
  getPersonalRecords,
  getFitnessTestStats,
  getNextPendingTest,
  formatFitnessTestValue,
} from '../services/fitness-tests'
import { FITNESS_TEST_METADATA, type FitnessTestType } from '../db/schema'

const fitnessTestRoutes = new Hono()

// ============================================================
// Mandatory Fitness Tests Endpoints
// ============================================================

/**
 * GET /api/fitness-tests/mandatory
 * Get all mandatory fitness tests for the user
 */
fitnessTestRoutes.get('/fitness-tests/mandatory', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const tests = await getMandatoryFitnessTests(user.id)

    return c.json({
      tests: tests.map(t => ({
        id: t.id,
        testType: t.testType,
        status: t.status,
        xpAwarded: t.xpAwarded,
        completedAt: t.completedAt?.toISOString(),
        metadata: t.metadata,
        latestRecord: t.latestRecord ? {
          id: t.latestRecord.id,
          value: t.latestRecord.value,
          displayValue: formatFitnessTestValue(t.testType as FitnessTestType, t.latestRecord.value),
          isPersonalRecord: t.latestRecord.isPersonalRecord,
          testDate: t.latestRecord.testDate,
        } : null,
      })),
      message: '[SYSTEM] Mandatory fitness tests retrieved.',
    })
  } catch (error) {
    logger.error('Get mandatory fitness tests error', { error })
    return c.json({ error: 'Failed to get mandatory fitness tests' }, 500)
  }
})

/**
 * GET /api/fitness-tests/mandatory/status
 * Get completion status of mandatory fitness tests
 */
fitnessTestRoutes.get('/fitness-tests/mandatory/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const status = await getMandatoryTestsStatus(user.id)

    return c.json({
      ...status,
      message: status.allCompleted
        ? '[SYSTEM] All mandatory fitness tests completed!'
        : `[SYSTEM] ${status.pending} mandatory fitness test(s) remaining.`,
    })
  } catch (error) {
    logger.error('Get mandatory tests status error', { error })
    return c.json({ error: 'Failed to get mandatory tests status' }, 500)
  }
})

/**
 * GET /api/fitness-tests/mandatory/next
 * Get the next pending mandatory test
 */
fitnessTestRoutes.get('/fitness-tests/mandatory/next', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const next = await getNextPendingTest(user.id)

    if (!next) {
      return c.json({
        test: null,
        allCompleted: true,
        message: '[SYSTEM] All mandatory fitness tests completed!',
      })
    }

    return c.json({
      test: {
        id: next.test.id,
        testType: next.test.testType,
        status: next.test.status,
      },
      metadata: next.metadata,
      allCompleted: false,
      message: `[SYSTEM] Next test: ${next.metadata.name}`,
    })
  } catch (error) {
    logger.error('Get next pending test error', { error })
    return c.json({ error: 'Failed to get next pending test' }, 500)
  }
})

// ============================================================
// Record & Skip Endpoints
// ============================================================

/**
 * POST /api/fitness-tests/record
 * Record a fitness test result
 */
fitnessTestRoutes.post('/fitness-tests/record', requireAuth, zValidator('json', recordFitnessTestSchema), async (c) => {
  const user = c.get('user')!
  const body = c.req.valid('json')

  try {
    const result = await recordFitnessTest(user.id, body.testType as FitnessTestType, body.value, {
      unit: body.unit,
      notes: body.notes,
      testDate: body.testDate,
      timezone: user.timezone ?? 'UTC',
    })

    const metadata = FITNESS_TEST_METADATA[body.testType as FitnessTestType]
    const displayValue = formatFitnessTestValue(body.testType as FitnessTestType, body.value)

    return c.json({
      record: {
        id: result.record.id,
        testType: result.record.testType,
        value: result.record.value,
        displayValue,
        unit: result.record.unit,
        isPersonalRecord: result.isPersonalRecord,
        testDate: result.record.testDate,
      },
      mandatoryTestCompleted: !!result.mandatoryTest,
      xpAwarded: result.xpAwarded,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      message: result.mandatoryTest
        ? `[SYSTEM] ${metadata.name} recorded: ${displayValue}! +${result.xpAwarded} XP${result.leveledUp ? ` Level up! You are now level ${result.newLevel}!` : ''}`
        : `[SYSTEM] ${metadata.name} recorded: ${displayValue}${result.isPersonalRecord ? ' 🏆 New Personal Record!' : ''}`,
    })
  } catch (error) {
    logger.error('Record fitness test error', { error })
    const message = error instanceof Error ? error.message : 'Failed to record fitness test'
    return c.json({ error: message }, 400)
  }
})

/**
 * POST /api/fitness-tests/skip
 * Skip a mandatory fitness test
 */
fitnessTestRoutes.post('/fitness-tests/skip', requireAuth, zValidator('json', skipFitnessTestSchema), async (c) => {
  const user = c.get('user')!
  const body = c.req.valid('json')

  try {
    const test = await skipMandatoryTest(user.id, body.testType as FitnessTestType)
    const metadata = FITNESS_TEST_METADATA[body.testType as FitnessTestType]

    return c.json({
      test: {
        id: test.id,
        testType: test.testType,
        status: test.status,
      },
      message: `[SYSTEM] ${metadata.name} skipped. You can record it later.`,
    })
  } catch (error) {
    logger.error('Skip fitness test error', { error })
    const message = error instanceof Error ? error.message : 'Failed to skip fitness test'
    return c.json({ error: message }, 400)
  }
})

// ============================================================
// History & Stats Endpoints
// ============================================================

/**
 * GET /api/fitness-tests/history
 * Get fitness test history
 */
fitnessTestRoutes.get('/fitness-tests/history', requireAuth, zValidator('query', fitnessTestHistoryQuerySchema), async (c) => {
  const user = c.get('user')!
  const query = c.req.valid('query')

  try {
    const result = await getFitnessTestHistory(user.id, {
      testType: query.testType as FitnessTestType | undefined,
      limit: query.limit,
      offset: query.offset,
    })

    return c.json({
      records: result.records.map(r => ({
        id: r.id,
        testType: r.testType,
        value: r.value,
        displayValue: formatFitnessTestValue(r.testType as FitnessTestType, r.value),
        unit: r.unit,
        isPersonalRecord: r.isPersonalRecord,
        notes: r.notes,
        testDate: r.testDate,
        createdAt: r.createdAt.toISOString(),
      })),
      total: result.total,
      message: `[SYSTEM] Retrieved ${result.records.length} fitness test record(s).`,
    })
  } catch (error) {
    logger.error('Get fitness test history error', { error })
    return c.json({ error: 'Failed to get fitness test history' }, 500)
  }
})

/**
 * GET /api/fitness-tests/personal-records
 * Get personal records for all fitness tests
 */
fitnessTestRoutes.get('/fitness-tests/personal-records', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const records = await getPersonalRecords(user.id)

    const formattedRecords: Record<string, {
      value: number
      displayValue: string
      testDate: string
      recordedAt: string
    } | null> = {}

    for (const [testType, record] of Object.entries(records)) {
      if (record) {
        formattedRecords[testType] = {
          value: record.value,
          displayValue: formatFitnessTestValue(testType as FitnessTestType, record.value),
          testDate: record.testDate,
          recordedAt: record.createdAt.toISOString(),
        }
      } else {
        formattedRecords[testType] = null
      }
    }

    return c.json({
      personalRecords: formattedRecords,
      message: '[SYSTEM] Personal records retrieved.',
    })
  } catch (error) {
    logger.error('Get personal records error', { error })
    return c.json({ error: 'Failed to get personal records' }, 500)
  }
})

/**
 * GET /api/fitness-tests/stats
 * Get fitness test statistics
 */
fitnessTestRoutes.get('/fitness-tests/stats', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const stats = await getFitnessTestStats(user.id)

    const formattedPersonalRecords: Record<string, {
      value: number
      displayValue: string
      testDate: string
    } | null> = {}

    for (const [testType, record] of Object.entries(stats.personalRecords)) {
      if (record) {
        formattedPersonalRecords[testType] = {
          value: record.value,
          displayValue: formatFitnessTestValue(testType as FitnessTestType, record.value),
          testDate: record.testDate,
        }
      } else {
        formattedPersonalRecords[testType] = null
      }
    }

    return c.json({
      totalRecords: stats.totalRecords,
      personalRecords: formattedPersonalRecords,
      estimatedTotal: stats.estimatedTotal,
      mandatoryTests: stats.mandatoryTestsStatus,
      message: '[SYSTEM] Fitness test statistics retrieved.',
    })
  } catch (error) {
    logger.error('Get fitness test stats error', { error })
    return c.json({ error: 'Failed to get fitness test stats' }, 500)
  }
})

/**
 * GET /api/fitness-tests/metadata
 * Get metadata for all fitness test types
 */
fitnessTestRoutes.get('/fitness-tests/metadata', requireAuth, async (c) => {
  return c.json({
    metadata: FITNESS_TEST_METADATA,
    testTypes: Object.keys(FITNESS_TEST_METADATA),
    message: '[SYSTEM] Fitness test metadata retrieved.',
  })
})

export default fitnessTestRoutes
