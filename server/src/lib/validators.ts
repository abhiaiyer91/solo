/**
 * Zod Validators for API Endpoints
 * 
 * Centralized validation schemas for request bodies.
 */

import { z } from 'zod'

// ============================================================
// Common Validators
// ============================================================

export const idSchema = z.string().min(1).max(100)

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')

export const timezoneSchema = z.string().min(1).max(100)

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

// ============================================================
// Quest Validators
// ============================================================

export const completeQuestSchema = z.object({
  data: z.record(z.union([z.number(), z.boolean()])),
})

export const activateQuestSchema = z.object({
  templateId: z.string().min(1),
})

// ============================================================
// Health Sync Validators
// ============================================================

export const healthSyncSchema = z.object({
  date: dateSchema.optional(),
  steps: z.number().min(0).max(100000).optional(),
  workoutMinutes: z.number().min(0).max(1440).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  weight: z.number().min(20).max(500).optional(),
  activeCalories: z.number().min(0).max(10000).optional(),
})

// ============================================================
// Player Validators
// ============================================================

export const updatePlayerSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  timezone: timezoneSchema.optional(),
})

export const updateSettingsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  dailyReminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

// ============================================================
// Guild Validators
// ============================================================

export const createGuildSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
})

export const joinGuildSchema = z.object({
  inviteCode: z.string().min(6).max(20).optional(),
})

// ============================================================
// Accountability Validators
// ============================================================

export const sendPartnerRequestSchema = z.object({
  targetUserId: z.string().min(1),
})

export const respondPartnerRequestSchema = z.object({
  accept: z.boolean(),
})

// ============================================================
// Notification Validators
// ============================================================

export const registerPushSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// ============================================================
// Onboarding/Assessment Validators
// ============================================================

export const baselineAssessmentSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  currentActivity: z.object({
    workoutsPerWeek: z.number().min(0).max(14),
    averageSteps: z.number().min(0).max(50000),
    sleepHours: z.number().min(4).max(12),
  }),
  goals: z.array(z.string()).min(1).max(5),
  challenges: z.array(z.string()).max(5).optional(),
  preferredWorkoutTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
})

// ============================================================
// Dungeon Validators
// ============================================================

export const startDungeonSchema = z.object({
  dungeonId: z.string().min(1),
})

export const completeDungeonChallengeSchema = z.object({
  challengeIndex: z.number().min(0),
  value: z.union([z.number(), z.boolean()]),
})

// ============================================================
// Validation Error Helper
// ============================================================

export interface ValidationError {
  field: string
  message: string
}

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}
