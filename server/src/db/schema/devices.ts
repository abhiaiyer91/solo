/**
 * Device Tokens Schema
 * 
 * Stores push notification tokens for user devices.
 */

import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { relations } from 'drizzle-orm'

export const deviceTokens = pgTable(
  'device_tokens',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    // Push token from Expo or Firebase
    pushToken: text('push_token').notNull(),
    
    // Device info for targeting
    platform: text('platform').notNull().$type<'ios' | 'android' | 'web'>(),
    deviceId: text('device_id'), // Unique device identifier
    deviceName: text('device_name'), // User-friendly name (e.g., "iPhone 15")
    appVersion: text('app_version'),
    
    // Token status
    isActive: boolean('is_active').notNull().default(true),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    failedAttempts: text('failed_attempts').default('0'), // Count of failed push attempts
    lastFailure: timestamp('last_failure', { withTimezone: true }),
    lastFailureReason: text('last_failure_reason'),
    
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('device_tokens_user_id_idx').on(table.userId),
    pushTokenIdx: index('device_tokens_push_token_idx').on(table.pushToken),
    platformIdx: index('device_tokens_platform_idx').on(table.platform),
  })
)

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(users, {
    fields: [deviceTokens.userId],
    references: [users.id],
  }),
}))

export type DeviceToken = typeof deviceTokens.$inferSelect
export type NewDeviceToken = typeof deviceTokens.$inferInsert
