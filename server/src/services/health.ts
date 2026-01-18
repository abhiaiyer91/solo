import { dbClient as db } from '../db'
import {
  healthSnapshots,
  workoutRecords,
  type RawHealthData,
  type HealthSnapshot,
  type HealthSyncRequest,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'

// Re-export types that are needed by API endpoints
export type { HealthSyncRequest, HealthSnapshot } from '../db/schema'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for health service')
  }
  return db
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * Determine verification level based on data source
 */
function getVerificationLevel(
  source: 'HEALTHKIT' | 'GOOGLE_FIT' | 'MANUAL',
  isAutomatic: boolean
): 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' {
  if (source === 'MANUAL') {
    return 'SELF_REPORTED'
  }

  // HealthKit and Google Fit data
  if (isAutomatic) {
    // Hardware-confirmed data (like steps from sensors)
    return 'VERIFIED'
  }

  // Imported from trusted source but not directly from sensors
  return 'IMPORTED'
}

/**
 * Sync health data from mobile app
 */
export async function syncHealthData(
  userId: string,
  request: HealthSyncRequest
): Promise<HealthSnapshot> {
  const snapshotDate = request.date || getTodayDate()
  const source = request.source
  const data = request.data

  // Determine verification levels based on source
  const stepsVerification = getVerificationLevel(source, true) // Steps are always sensor-based
  const exerciseVerification = getVerificationLevel(source, source !== 'MANUAL')
  const sleepVerification = getVerificationLevel(source, source !== 'MANUAL')
  const workoutVerification = getVerificationLevel(source, false) // Workouts need confirmation

  // Check if snapshot exists for this date
  const [existingSnapshot] = await requireDb()
    .select()
    .from(healthSnapshots)
    .where(and(eq(healthSnapshots.userId, userId), eq(healthSnapshots.snapshotDate, snapshotDate)))
    .limit(1)

  let workoutCount = 0
  let totalWorkoutMinutes = 0

  // Process workouts if provided
  if (data.workouts && data.workouts.length > 0) {
    for (const workout of data.workouts) {
      // Check for existing workout by external ID to avoid duplicates
      if (workout.externalId) {
        const [existingWorkout] = await requireDb()
          .select()
          .from(workoutRecords)
          .where(
            and(eq(workoutRecords.userId, userId), eq(workoutRecords.externalId, workout.externalId))
          )
          .limit(1)

        if (existingWorkout) {
          // Update workout minutes in case duration changed
          totalWorkoutMinutes += workout.durationMinutes
          workoutCount++
          continue
        }
      }

      // Insert new workout record
      await requireDb()
        .insert(workoutRecords)
        .values({
          userId,
          snapshotId: existingSnapshot?.id,
          workoutType: workout.type,
          startTime: new Date(workout.startTime),
          endTime: workout.endTime ? new Date(workout.endTime) : null,
          durationMinutes: workout.durationMinutes,
          calories: workout.calories,
          distance: workout.distance,
          source,
          verification: workoutVerification,
          externalId: workout.externalId,
        })

      totalWorkoutMinutes += workout.durationMinutes
      workoutCount++
    }
  }

  if (existingSnapshot) {
    // Update existing snapshot with new data (merge/accumulate)
    const updates: Partial<typeof healthSnapshots.$inferInsert> = {
      lastSyncedAt: new Date(),
      syncCount: (existingSnapshot.syncCount ?? 0) + 1,
      updatedAt: new Date(),
    }

    // Update steps (take higher value)
    if (data.steps !== undefined) {
      const currentSteps = existingSnapshot.steps ?? 0
      if (data.steps > currentSteps) {
        updates.steps = data.steps
        updates.stepsVerification = stepsVerification
      }
    }

    // Update exercise minutes (take higher value)
    if (data.exerciseMinutes !== undefined) {
      const currentExercise = existingSnapshot.exerciseMinutes ?? 0
      if (data.exerciseMinutes > currentExercise) {
        updates.exerciseMinutes = data.exerciseMinutes
        updates.exerciseMinutesVerification = exerciseVerification
      }
    }

    // Update sleep (replace if provided)
    if (data.sleepMinutes !== undefined) {
      updates.sleepMinutes = data.sleepMinutes
      updates.sleepVerification = sleepVerification
    }

    // Update workout totals
    if (workoutCount > 0 || data.workouts) {
      updates.workoutCount = (existingSnapshot.workoutCount ?? 0) + workoutCount
      updates.workoutMinutes = (existingSnapshot.workoutMinutes ?? 0) + totalWorkoutMinutes
      updates.workoutVerification = workoutVerification
    }

    // Update calories
    if (data.activeCalories !== undefined) {
      updates.activeCalories = data.activeCalories
      updates.caloriesVerification = getVerificationLevel(source, true)
    }

    // Update protein tracking
    if (data.proteinLogged !== undefined) {
      updates.proteinLogged = data.proteinLogged
      updates.proteinVerification = getVerificationLevel(source, false)
    }

    // Update primary source if this is a trusted source
    if (source !== 'MANUAL') {
      updates.primarySource = source
    }

    // Merge raw data if provided
    if (request.rawData) {
      const existingRaw = (existingSnapshot.rawHealthData as RawHealthData) || {}
      updates.rawHealthData = {
        ...existingRaw,
        ...request.rawData,
      }
    }

    const [updated] = await requireDb()
      .update(healthSnapshots)
      .set(updates)
      .where(eq(healthSnapshots.id, existingSnapshot.id))
      .returning()

    return formatSnapshot(updated!)
  }

  // Create new snapshot
  const [newSnapshot] = await requireDb()
    .insert(healthSnapshots)
    .values({
      userId,
      snapshotDate,
      steps: data.steps ?? 0,
      stepsVerification: data.steps !== undefined ? stepsVerification : 'SELF_REPORTED',
      exerciseMinutes: data.exerciseMinutes ?? 0,
      exerciseMinutesVerification:
        data.exerciseMinutes !== undefined ? exerciseVerification : 'SELF_REPORTED',
      sleepMinutes: data.sleepMinutes,
      sleepVerification: data.sleepMinutes !== undefined ? sleepVerification : null,
      workoutCount,
      workoutMinutes: totalWorkoutMinutes,
      workoutVerification: workoutCount > 0 ? workoutVerification : 'SELF_REPORTED',
      activeCalories: data.activeCalories,
      caloriesVerification:
        data.activeCalories !== undefined ? getVerificationLevel(source, true) : null,
      proteinLogged: data.proteinLogged ?? false,
      proteinVerification: data.proteinLogged !== undefined ? getVerificationLevel(source, false) : 'SELF_REPORTED',
      primarySource: source,
      rawHealthData: request.rawData,
      lastSyncedAt: new Date(),
      syncCount: 1,
    })
    .returning()

  // Update workout records with snapshot ID
  if (workoutCount > 0 && newSnapshot) {
    await requireDb()
      .update(workoutRecords)
      .set({ snapshotId: newSnapshot.id })
      .where(
        and(
          eq(workoutRecords.userId, userId),
          eq(workoutRecords.snapshotId, null as unknown as string)
        )
      )
  }

  return formatSnapshot(newSnapshot!)
}

/**
 * Get today's health snapshot for a user
 */
export async function getTodayHealthSnapshot(userId: string): Promise<HealthSnapshot | null> {
  const today = getTodayDate()

  const [snapshot] = await requireDb()
    .select()
    .from(healthSnapshots)
    .where(and(eq(healthSnapshots.userId, userId), eq(healthSnapshots.snapshotDate, today)))
    .limit(1)

  if (!snapshot) {
    return null
  }

  return formatSnapshot(snapshot)
}

/**
 * Get health snapshot for a specific date
 */
export async function getHealthSnapshot(
  userId: string,
  date: string
): Promise<HealthSnapshot | null> {
  const [snapshot] = await requireDb()
    .select()
    .from(healthSnapshots)
    .where(and(eq(healthSnapshots.userId, userId), eq(healthSnapshots.snapshotDate, date)))
    .limit(1)

  if (!snapshot) {
    return null
  }

  return formatSnapshot(snapshot)
}

/**
 * Get workouts for a specific date
 */
export async function getWorkoutsForDate(
  userId: string,
  date: string
): Promise<Array<typeof workoutRecords.$inferSelect>> {
  const startOfDay = new Date(`${date}T00:00:00Z`)
  const endOfDay = new Date(`${date}T23:59:59Z`)

  const workouts = await requireDb()
    .select()
    .from(workoutRecords)
    .where(eq(workoutRecords.userId, userId))

  // Filter by date in JS since drizzle between isn't clean for this
  return workouts.filter((w) => {
    const start = new Date(w.startTime)
    return start >= startOfDay && start <= endOfDay
  })
}

/**
 * Convert health data to quest evaluation format
 */
export function healthDataToQuestData(snapshot: HealthSnapshot): Record<string, number | boolean> {
  return {
    steps: snapshot.steps ?? 0,
    exercise_minutes: snapshot.exerciseMinutes ?? 0,
    workout_minutes: snapshot.workoutMinutes ?? 0,
    sleep_hours: snapshot.sleepMinutes ? snapshot.sleepMinutes / 60 : 0,
    sleep_minutes: snapshot.sleepMinutes ?? 0,
    workouts: snapshot.workoutCount ?? 0,
    workout_count: snapshot.workoutCount ?? 0,
    active_calories: snapshot.activeCalories ?? 0,
    protein_logged: snapshot.proteinLogged ?? false,
  }
}

/**
 * Format snapshot for API response
 */
function formatSnapshot(snapshot: typeof healthSnapshots.$inferSelect): HealthSnapshot {
  return {
    id: snapshot.id,
    userId: snapshot.userId,
    snapshotDate: snapshot.snapshotDate,
    steps: snapshot.steps,
    stepsVerification: snapshot.stepsVerification,
    exerciseMinutes: snapshot.exerciseMinutes,
    exerciseMinutesVerification: snapshot.exerciseMinutesVerification,
    sleepMinutes: snapshot.sleepMinutes,
    sleepVerification: snapshot.sleepVerification,
    workoutCount: snapshot.workoutCount,
    workoutMinutes: snapshot.workoutMinutes,
    workoutVerification: snapshot.workoutVerification,
    activeCalories: snapshot.activeCalories,
    caloriesVerification: snapshot.caloriesVerification,
    proteinLogged: snapshot.proteinLogged,
    proteinVerification: snapshot.proteinVerification,
    primarySource: snapshot.primarySource,
    lastSyncedAt: snapshot.lastSyncedAt,
    syncCount: snapshot.syncCount,
  }
}
