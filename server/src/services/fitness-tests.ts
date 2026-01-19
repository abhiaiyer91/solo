/**
 * Fitness Tests Service
 * Manages mandatory fitness tests and fitness test records
 */

import { dbClient as db } from '../db'
import {
  mandatoryFitnessTests,
  fitnessTestRecords,
  type FitnessTestType,
  type MandatoryFitnessTest,
  type FitnessTestRecord,
  FITNESS_TEST_METADATA,
  MANDATORY_FITNESS_TESTS,
  formatMileTime,
} from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { createXPEvent } from './xp'
import { getTodayDateForTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'
import { logger } from '../lib/logger'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for fitness tests service')
  }
  return db
}

/**
 * Initialize mandatory fitness tests for a new user
 * Creates PENDING test entries for all required tests
 */
export async function initializeMandatoryFitnessTests(userId: string): Promise<MandatoryFitnessTest[]> {
  const existingTests = await requireDb()
    .select()
    .from(mandatoryFitnessTests)
    .where(eq(mandatoryFitnessTests.userId, userId))

  // Only create tests that don't exist
  const existingTypes = new Set(existingTests.map(t => t.testType))
  const testsToCreate = MANDATORY_FITNESS_TESTS.filter(type => !existingTypes.has(type))

  if (testsToCreate.length === 0) {
    return existingTests
  }

  const newTests = await requireDb()
    .insert(mandatoryFitnessTests)
    .values(
      testsToCreate.map(testType => ({
        userId,
        testType,
        status: 'PENDING' as const,
      }))
    )
    .returning()

  return [...existingTests, ...newTests]
}

/**
 * Get all mandatory fitness tests for a user
 */
export async function getMandatoryFitnessTests(userId: string): Promise<Array<MandatoryFitnessTest & {
  metadata: typeof FITNESS_TEST_METADATA[FitnessTestType]
  latestRecord: FitnessTestRecord | null
}>> {
  // Ensure tests exist
  await initializeMandatoryFitnessTests(userId)

  const tests = await requireDb()
    .select()
    .from(mandatoryFitnessTests)
    .where(eq(mandatoryFitnessTests.userId, userId))

  // Get latest record for each test type
  const latestRecords = await Promise.all(
    tests.map(async (test) => {
      const [record] = await requireDb()
        .select()
        .from(fitnessTestRecords)
        .where(
          and(
            eq(fitnessTestRecords.userId, userId),
            eq(fitnessTestRecords.testType, test.testType)
          )
        )
        .orderBy(desc(fitnessTestRecords.createdAt))
        .limit(1)
      return { testType: test.testType, record: record || null }
    })
  )

  const recordMap = new Map(latestRecords.map(r => [r.testType, r.record]))

  return tests.map(test => ({
    ...test,
    metadata: FITNESS_TEST_METADATA[test.testType as FitnessTestType],
    latestRecord: recordMap.get(test.testType) || null,
  }))
}

/**
 * Get mandatory fitness tests completion status
 */
export async function getMandatoryTestsStatus(userId: string): Promise<{
  total: number
  completed: number
  pending: number
  skipped: number
  allCompleted: boolean
  tests: Array<{
    testType: FitnessTestType
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
    name: string
    description: string
    xpReward: number
  }>
}> {
  const tests = await getMandatoryFitnessTests(userId)

  const completed = tests.filter(t => t.status === 'COMPLETED').length
  const skipped = tests.filter(t => t.status === 'SKIPPED').length
  const pending = tests.filter(t => t.status === 'PENDING').length

  return {
    total: tests.length,
    completed,
    pending,
    skipped,
    allCompleted: pending === 0,
    tests: tests.map(t => ({
      testType: t.testType as FitnessTestType,
      status: t.status as 'PENDING' | 'COMPLETED' | 'SKIPPED',
      name: t.metadata.name,
      description: t.metadata.description,
      xpReward: t.metadata.xpReward,
    })),
  }
}

/**
 * Record a fitness test result
 */
export async function recordFitnessTest(
  userId: string,
  testType: FitnessTestType,
  value: number,
  options: {
    unit?: string
    notes?: string
    testDate?: string // YYYY-MM-DD
    timezone?: Timezone
  } = {}
): Promise<{
  record: FitnessTestRecord
  mandatoryTest: MandatoryFitnessTest | null
  xpAwarded: number
  isPersonalRecord: boolean
  leveledUp: boolean
  newLevel: number
}> {
  const timezone = getSafeTimezone(options.timezone || 'UTC')
  const testDate = options.testDate || getTodayDateForTimezone(timezone)
  const metadata = FITNESS_TEST_METADATA[testType]

  // Validate value
  if (value <= 0) {
    throw new Error('Value must be positive')
  }

  // Check for personal record
  const [previousBest] = await requireDb()
    .select()
    .from(fitnessTestRecords)
    .where(
      and(
        eq(fitnessTestRecords.userId, userId),
        eq(fitnessTestRecords.testType, testType),
        eq(fitnessTestRecords.isPersonalRecord, true)
      )
    )
    .orderBy(desc(fitnessTestRecords.createdAt))
    .limit(1)

  // Determine if this is a personal record
  // For MILE_TIME, lower is better
  // For lifts, higher is better
  let isPersonalRecord = false
  if (!previousBest) {
    isPersonalRecord = true // First record is always a PR
  } else if (testType === 'MILE_TIME') {
    isPersonalRecord = value < previousBest.value
  } else {
    isPersonalRecord = value > previousBest.value
  }

  // Check if this completes a mandatory test
  const [mandatoryTest] = await requireDb()
    .select()
    .from(mandatoryFitnessTests)
    .where(
      and(
        eq(mandatoryFitnessTests.userId, userId),
        eq(mandatoryFitnessTests.testType, testType),
        eq(mandatoryFitnessTests.status, 'PENDING')
      )
    )
    .limit(1)

  let xpAwarded = 0
  let leveledUp = false
  let newLevel = 0

  // Create the record
  const [record] = await requireDb()
    .insert(fitnessTestRecords)
    .values({
      userId,
      testType,
      value,
      unit: options.unit || metadata.unit,
      isPersonalRecord,
      notes: options.notes,
      testDate,
      mandatoryTestId: mandatoryTest?.id,
    })
    .returning()

  // Update mandatory test if applicable
  let updatedMandatoryTest: MandatoryFitnessTest | null = null
  if (mandatoryTest) {
    const [updated] = await requireDb()
      .update(mandatoryFitnessTests)
      .set({
        status: 'COMPLETED',
        xpAwarded: metadata.xpReward,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mandatoryFitnessTests.id, mandatoryTest.id))
      .returning()

    updatedMandatoryTest = updated!

    // Award XP for completing mandatory test
    const xpResult = await createXPEvent({
      userId,
      source: 'FITNESS_TEST',
      sourceId: record!.id,
      baseAmount: metadata.xpReward,
      description: `Completed mandatory fitness test: ${metadata.name}`,
    })

    xpAwarded = xpResult.event.finalAmount
    leveledUp = xpResult.leveledUp
    newLevel = xpResult.newLevel
  }

  // If previous record was a PR and we have a new PR, update the old one
  if (isPersonalRecord && previousBest) {
    await requireDb()
      .update(fitnessTestRecords)
      .set({ isPersonalRecord: false })
      .where(eq(fitnessTestRecords.id, previousBest.id))
  }

  logger.info('Fitness test recorded', {
    userId,
    testType,
    value,
    isPersonalRecord,
    mandatoryTestCompleted: !!mandatoryTest,
    xpAwarded,
  })

  return {
    record: record!,
    mandatoryTest: updatedMandatoryTest,
    xpAwarded,
    isPersonalRecord,
    leveledUp,
    newLevel,
  }
}

/**
 * Skip a mandatory fitness test
 */
export async function skipMandatoryTest(
  userId: string,
  testType: FitnessTestType
): Promise<MandatoryFitnessTest> {
  const [mandatoryTest] = await requireDb()
    .select()
    .from(mandatoryFitnessTests)
    .where(
      and(
        eq(mandatoryFitnessTests.userId, userId),
        eq(mandatoryFitnessTests.testType, testType),
        eq(mandatoryFitnessTests.status, 'PENDING')
      )
    )
    .limit(1)

  if (!mandatoryTest) {
    throw new Error('Mandatory test not found or already completed/skipped')
  }

  const [updated] = await requireDb()
    .update(mandatoryFitnessTests)
    .set({
      status: 'SKIPPED',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mandatoryFitnessTests.id, mandatoryTest.id))
    .returning()

  logger.info('Mandatory fitness test skipped', { userId, testType })

  return updated!
}

/**
 * Get all fitness test records for a user
 */
export async function getFitnessTestHistory(
  userId: string,
  options: {
    testType?: FitnessTestType
    limit?: number
    offset?: number
  } = {}
): Promise<{
  records: FitnessTestRecord[]
  total: number
}> {
  const { testType, limit = 50, offset = 0 } = options

  let query = requireDb()
    .select()
    .from(fitnessTestRecords)
    .where(eq(fitnessTestRecords.userId, userId))

  if (testType) {
    query = requireDb()
      .select()
      .from(fitnessTestRecords)
      .where(
        and(
          eq(fitnessTestRecords.userId, userId),
          eq(fitnessTestRecords.testType, testType)
        )
      )
  }

  const records = await query
    .orderBy(desc(fitnessTestRecords.createdAt))
    .limit(limit)
    .offset(offset)

  // Get total count
  const allRecords = testType
    ? await requireDb()
        .select()
        .from(fitnessTestRecords)
        .where(
          and(
            eq(fitnessTestRecords.userId, userId),
            eq(fitnessTestRecords.testType, testType)
          )
        )
    : await requireDb()
        .select()
        .from(fitnessTestRecords)
        .where(eq(fitnessTestRecords.userId, userId))

  return {
    records,
    total: allRecords.length,
  }
}

/**
 * Get personal records for all fitness tests
 */
export async function getPersonalRecords(userId: string): Promise<Record<FitnessTestType, FitnessTestRecord | null>> {
  const result: Record<FitnessTestType, FitnessTestRecord | null> = {
    MILE_TIME: null,
    BENCH_PRESS: null,
    SQUAT: null,
    DEADLIFT: null,
  }

  for (const testType of MANDATORY_FITNESS_TESTS) {
    const [record] = await requireDb()
      .select()
      .from(fitnessTestRecords)
      .where(
        and(
          eq(fitnessTestRecords.userId, userId),
          eq(fitnessTestRecords.testType, testType),
          eq(fitnessTestRecords.isPersonalRecord, true)
        )
      )
      .limit(1)

    result[testType] = record || null
  }

  return result
}

/**
 * Get fitness test statistics for a user
 */
export async function getFitnessTestStats(userId: string): Promise<{
  totalRecords: number
  personalRecords: Record<FitnessTestType, FitnessTestRecord | null>
  mandatoryTestsStatus: Awaited<ReturnType<typeof getMandatoryTestsStatus>>
  estimatedTotal: number // Total estimated 1RM across all lifts
}> {
  const [totalRecords, personalRecords, mandatoryTestsStatus] = await Promise.all([
    requireDb()
      .select()
      .from(fitnessTestRecords)
      .where(eq(fitnessTestRecords.userId, userId))
      .then(r => r.length),
    getPersonalRecords(userId),
    getMandatoryTestsStatus(userId),
  ])

  // Calculate estimated total (sum of all lift PRs)
  const estimatedTotal = 
    (personalRecords.BENCH_PRESS?.value || 0) +
    (personalRecords.SQUAT?.value || 0) +
    (personalRecords.DEADLIFT?.value || 0)

  return {
    totalRecords,
    personalRecords,
    mandatoryTestsStatus,
    estimatedTotal,
  }
}

/**
 * Format a fitness test value for display
 */
export function formatFitnessTestValue(testType: FitnessTestType, value: number): string {
  if (testType === 'MILE_TIME') {
    return formatMileTime(value)
  }
  return `${Math.round(value)} lbs`
}

/**
 * Get the next pending mandatory test for a user
 */
export async function getNextPendingTest(userId: string): Promise<{
  test: MandatoryFitnessTest
  metadata: typeof FITNESS_TEST_METADATA[FitnessTestType]
} | null> {
  const tests = await getMandatoryFitnessTests(userId)
  const pendingTest = tests.find(t => t.status === 'PENDING')
  
  if (!pendingTest) {
    return null
  }

  return {
    test: pendingTest,
    metadata: pendingTest.metadata,
  }
}
