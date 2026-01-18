import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('[MIGRATION ERROR] DATABASE_URL is required')
    process.exit(1)
  }

  console.log('[MIGRATION] Connecting to database...')

  // Use a separate connection for migrations with max 1 connection
  const migrationClient = postgres(connectionString, { max: 1 })
  const db = drizzle(migrationClient)

  console.log('[MIGRATION] Running migrations...')

  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('[MIGRATION] Migrations complete!')
  } catch (error) {
    console.error('[MIGRATION ERROR]', error)
    await migrationClient.end()
    process.exit(1)
  }

  await migrationClient.end()
  process.exit(0)
}

runMigrations()
