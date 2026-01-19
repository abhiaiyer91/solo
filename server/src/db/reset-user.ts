import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ESM module directory resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root
config({ path: resolve(__dirname, '../../../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { users } from './schema/auth'
import { questLogs, xpEvents, dailyLogs } from './schema/game'
import { healthSnapshots } from './schema/health'
import { dungeonAttempts } from './schema/dungeons'
import { userTitles } from './schema/titles'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client)

async function resetUser() {
  console.log('[SYSTEM] Looking for users to reset...')

  // Get all users
  const allUsers = await db.select().from(users)

  if (allUsers.length === 0) {
    console.log('[SYSTEM] No users found in database.')
    await client.end()
    return
  }

  console.log(`[SYSTEM] Found ${allUsers.length} user(s):`)
  for (const user of allUsers) {
    console.log(`  - ${user.email} (Level ${user.level}, ${user.totalXP} XP, ${user.currentStreak} day streak)`)
  }

  // Reset each user
  for (const user of allUsers) {
    console.log(`\n[SYSTEM] Resetting user: ${user.email}...`)

    // Delete user's quest logs
    const deletedQuests = await db.delete(questLogs).where(eq(questLogs.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedQuests.length} quest logs`)

    // Delete user's XP events
    const deletedXP = await db.delete(xpEvents).where(eq(xpEvents.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedXP.length} XP events`)

    // Delete user's daily logs
    const deletedDailyLogs = await db.delete(dailyLogs).where(eq(dailyLogs.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedDailyLogs.length} daily logs`)

    // Delete user's health snapshots
    const deletedSnapshots = await db.delete(healthSnapshots).where(eq(healthSnapshots.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedSnapshots.length} health snapshots`)

    // Delete user's dungeon attempts
    const deletedDungeons = await db.delete(dungeonAttempts).where(eq(dungeonAttempts.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedDungeons.length} dungeon attempts`)

    // Delete user's titles (except default)
    const deletedTitles = await db.delete(userTitles).where(eq(userTitles.userId, user.id)).returning()
    console.log(`  ✓ Deleted ${deletedTitles.length} earned titles`)

    // Reset user stats to fresh state
    await db.update(users).set({
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectStreak: 0,
      str: 10,
      agi: 10,
      vit: 10,
      disc: 10,
      activeTitleId: null,
      onboardingCompleted: false,
      debuffActiveUntil: null,
      returnProtocolActive: false,
      returnProtocolDay: 0,
      returnProtocolStartedAt: null,
      lastActivityAt: null,
      hardModeEnabled: false,
      hardModeUnlockedAt: null,
      hardModeQuestsCompleted: 0,
      hardModeDungeonsCleared: 0,
      hardModePerfectDays: 0,
      // Reset createdAt to now for fresh "days since start"
      createdAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, user.id))

    console.log(`  ✓ Reset user stats to Level 1, 0 XP`)
  }

  console.log('\n[SYSTEM] User reset complete.')
  console.log('[SYSTEM] Users are ready for a fresh start.')

  await client.end()
}

resetUser().catch((error) => {
  console.error('[SYSTEM ERROR] Reset failed:', error)
  process.exit(1)
})
