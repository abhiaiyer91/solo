/**
 * Shared Zod validation schemas
 * Reusable schemas for common API input patterns
 */

import { z } from 'zod'

// ============================================================
// Primitive Schemas
// ============================================================

/**
 * UUID v4 string
 */
export const uuidSchema = z.string().uuid()

/**
 * Non-empty string
 */
export const nonEmptyString = z.string().min(1)

/**
 * Date string in YYYY-MM-DD format
 */
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

/**
 * ISO 8601 datetime string
 */
export const isoDatetime = z.string().datetime()

/**
 * Time string in HH:mm format
 */
export const timeString = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:mm format')

/**
 * Positive integer
 */
export const positiveInt = z.coerce.number().int().positive()

/**
 * Non-negative integer
 */
export const nonNegativeInt = z.coerce.number().int().nonnegative()

/**
 * Percentage (0-100)
 */
export const percentage = z.coerce.number().min(0).max(100)

// ============================================================
// Pagination Schemas
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

// ============================================================
// Date Range Schemas
// ============================================================

export const dateRangeSchema = z.object({
  startDate: dateString,
  endDate: dateString,
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: 'startDate must be before or equal to endDate' }
)

export const daysBackSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

// ============================================================
// ID Param Schemas
// ============================================================

export const idParamSchema = z.object({
  id: uuidSchema,
})

export const optionalIdParamSchema = z.object({
  id: uuidSchema.optional(),
})

// ============================================================
// Game Domain Schemas
// ============================================================

export const questCategorySchema = z.enum([
  'STEPS',
  'WORKOUT',
  'NUTRITION',
  'MINDSET',
  'RECOVERY',
  'HYDRATION',
])

export const questStatusSchema = z.enum([
  'ACTIVE',
  'COMPLETED',
  'FAILED',
  'SKIPPED',
])

export const questTypeSchema = z.enum([
  'CORE',
  'ROTATING',
  'BONUS',
  'WEEKLY',
  'SEASONAL',
])

export const mealTypeSchema = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack',
])

export const statTypeSchema = z.enum(['STR', 'AGI', 'VIT', 'DISC'])

// ============================================================
// User Settings Schemas
// ============================================================

export const notificationPrefsSchema = z.object({
  morningReminder: z.boolean().optional(),
  morningTime: timeString.optional(),
  eveningCheck: z.boolean().optional(),
  eveningTime: timeString.optional(),
  questCompletions: z.boolean().optional(),
  levelUps: z.boolean().optional(),
  streakReminders: z.boolean().optional(),
  systemMessages: z.boolean().optional(),
})

export const quietHoursSchema = z.object({
  enabled: z.boolean().optional(),
  startTime: timeString.optional(),
  endTime: timeString.optional(),
})

export const displayPrefsSchema = z.object({
  timezone: z.string().optional(),
  use24HourTime: z.boolean().optional(),
  weekStartsOn: z.enum(['sunday', 'monday']).optional(),
})

export const userSettingsUpdateSchema = z.object({
  notifications: notificationPrefsSchema.optional(),
  quietHours: quietHoursSchema.optional(),
  display: displayPrefsSchema.optional(),
})

// ============================================================
// Health Sync Schemas
// ============================================================

export const healthSourceSchema = z.enum(['HEALTHKIT', 'GOOGLE_FIT', 'MANUAL'])

export const workoutSchema = z.object({
  type: z.string(),
  durationMinutes: positiveInt,
  calories: nonNegativeInt.optional(),
  distance: z.number().optional(),
  startTime: isoDatetime,
  endTime: isoDatetime.optional(),
  externalId: z.string().optional(),
})

export const healthSyncRequestSchema = z.object({
  source: healthSourceSchema,
  data: z.object({
    steps: nonNegativeInt,
    exerciseMinutes: nonNegativeInt,
    activeCalories: nonNegativeInt,
    sleepMinutes: nonNegativeInt.optional(),
    workouts: z.array(workoutSchema).optional(),
  }),
  rawData: z.record(z.any()).optional(),
})

// ============================================================
// Guild Schemas
// ============================================================

export const guildRoleSchema = z.enum(['LEADER', 'OFFICER', 'MEMBER'])

export const createGuildSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  maxMembers: z.number().int().min(2).max(50).default(10),
})

export const updateGuildSchema = createGuildSchema.partial()

// ============================================================
// Accountability Schemas
// ============================================================

export const accountabilityRequestSchema = z.object({
  partnerId: uuidSchema,
  message: z.string().max(500).optional(),
})

export const accountabilityResponseSchema = z.object({
  requestId: uuidSchema,
  accept: z.boolean(),
})

// ============================================================
// Nutrition Schemas
// ============================================================

export const logMealSchema = z.object({
  date: dateString.optional(),
  mealType: mealTypeSchema.optional(),
  manual: z.boolean().optional(),
  calories: nonNegativeInt.optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})

export const nutritionTargetsSchema = z.object({
  calories: z.number().min(0).max(10000).optional(),
  protein: z.number().min(0).max(500).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(500).optional(),
})

// ============================================================
// Quest Completion Schemas
// ============================================================

export const completeQuestSchema = z.object({
  questId: uuidSchema,
  progress: nonNegativeInt.optional(),
  notes: z.string().max(500).optional(),
  source: healthSourceSchema.optional(),
})

// ============================================================
// Type exports
// ============================================================

export type QuestCategory = z.infer<typeof questCategorySchema>
export type QuestStatus = z.infer<typeof questStatusSchema>
export type QuestType = z.infer<typeof questTypeSchema>
export type MealType = z.infer<typeof mealTypeSchema>
export type StatType = z.infer<typeof statTypeSchema>
export type HealthSource = z.infer<typeof healthSourceSchema>
export type GuildRole = z.infer<typeof guildRoleSchema>
export type HealthSyncRequest = z.infer<typeof healthSyncRequestSchema>
export type LogMealInput = z.infer<typeof logMealSchema>
export type CompleteQuestInput = z.infer<typeof completeQuestSchema>

// ============================================================
// Quest Progress Schemas
// ============================================================

export const questProgressDataSchema = z.object({
  data: z.record(z.union([z.number(), z.boolean()])),
})

export const setTargetSchema = z.object({
  target: positiveInt,
})

export const challengeCompleteSchema = z.object({
  challengeId: uuidSchema,
})

export const questHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().nonnegative().default(0),
  daysBack: z.coerce.number().int().min(1).max(365).default(30),
  status: z.enum(['COMPLETED', 'FAILED', 'ACTIVE']).optional(),
  type: z.enum(['DAILY', 'WEEKLY']).optional(),
})

// ============================================================
// Notification Schemas
// ============================================================

export const updateNotificationPrefsSchema = z.object({
  morningQuests: z.boolean().optional(),
  milestones: z.boolean().optional(),
  afternoonStatus: z.boolean().optional(),
  reconciliation: z.boolean().optional(),
  streaks: z.boolean().optional(),
  levelUp: z.boolean().optional(),
  boss: z.boolean().optional(),
  quietHoursStart: z.coerce.number().int().min(0).max(23).optional(),
  quietHoursEnd: z.coerce.number().int().min(0).max(23).optional(),
})

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  expirationTime: z.number().nullable().optional(),
})

export const emailPrefsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
})

// ============================================================
// Body Composition Schemas
// ============================================================

export const bodySettingsSchema = z.object({
  enabled: z.boolean(),
  targetWeight: z.number().positive().max(1000).optional(),
  targetCalories: z.number().int().positive().max(10000).optional(),
})

export const logBodyCompositionSchema = z.object({
  date: dateString.optional(),
  weight: z.number().positive().max(1000).optional(),
  caloriesConsumed: nonNegativeInt.max(20000).optional(),
  caloriesBurned: nonNegativeInt.max(10000).optional(),
  basalMetabolicRate: positiveInt.max(5000).optional(),
  bodyFatPercent: percentage.optional(),
  muscleMass: z.number().positive().max(500).optional(),
  waterPercent: percentage.optional(),
  boneMass: z.number().positive().max(50).optional(),
  notes: z.string().max(500).optional(),
})

// ============================================================
// Onboarding Schemas
// ============================================================

export const baselineAssessmentSchema = z.object({
  fitnessExperience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  pushUpsMax: z.coerce.number().int().min(0).max(500).optional(),
  plankHoldSeconds: z.coerce.number().int().min(0).max(3600).optional(),
  mileTimeMinutes: z.coerce.number().min(3).max(60).optional(),
  workoutsPerWeek: z.coerce.number().int().min(0).max(21).optional(),
  sleepHoursBaseline: z.coerce.number().min(0).max(24).optional(),
  currentWeight: z.coerce.number().positive().max(1000).optional(),
  targetWeight: z.coerce.number().positive().max(1000).optional(),
  height: z.coerce.number().positive().max(300).optional(),
  age: z.coerce.number().int().min(13).max(120).optional(),
})

export const psychologyResponseSchema = z.object({
  message: z.string().min(1).max(2000),
})

export const psychologyCompleteSchema = z.object({
  traits: z.object({
    motivationStyle: z.enum(['intrinsic', 'extrinsic', 'balanced']).optional(),
    responseToFailure: z.enum(['resilient', 'sensitive', 'avoidant']).optional(),
    preferredPacing: z.enum(['aggressive', 'steady', 'cautious']).optional(),
    socialOrientation: z.enum(['competitive', 'collaborative', 'independent']).optional(),
  }).optional(),
})

// ============================================================
// Player Profile Schemas
// ============================================================

export const VALID_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
] as const

export const updatePlayerSchema = z.object({
  timezone: z.enum(VALID_TIMEZONES).optional(),
  name: z.string().min(1).max(50).transform(s => s.trim()).optional(),
})
