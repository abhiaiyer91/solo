import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { dbClient as db } from '../db'
import * as schema from '../db/schema'

// Create auth instance - db may be null if DATABASE_URL is not set
function createAuth() {
  if (!db) {
    console.warn('[AUTH] Database not connected - auth will not work')
    return null
  }

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    basePath: '/api/auth',
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    user: {
      additionalFields: {
        level: {
          type: 'number',
          defaultValue: 1,
        },
        totalXP: {
          type: 'number',
          defaultValue: 0,
        },
        currentStreak: {
          type: 'number',
          defaultValue: 0,
        },
        longestStreak: {
          type: 'number',
          defaultValue: 0,
        },
        perfectStreak: {
          type: 'number',
          defaultValue: 0,
        },
        str: {
          type: 'number',
          defaultValue: 10,
        },
        agi: {
          type: 'number',
          defaultValue: 10,
        },
        vit: {
          type: 'number',
          defaultValue: 10,
        },
        disc: {
          type: 'number',
          defaultValue: 10,
        },
        timezone: {
          type: 'string',
          defaultValue: 'UTC',
        },
      },
    },
  })
}

export const auth = createAuth()

// Type exports - these will be any if auth is null
export type Session = NonNullable<typeof auth> extends { $Infer: { Session: infer S } } ? S : {
  user: {
    id: string
    email: string
    name: string | null
    level?: number
    totalXP?: number
    currentStreak?: number
    longestStreak?: number
    perfectStreak?: number
    str?: number
    agi?: number
    vit?: number
    disc?: number
    timezone?: string
  }
  session: {
    id: string
    userId: string
    token: string
    expiresAt: Date
  }
}

export type User = Session['user']
