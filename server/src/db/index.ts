import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

let db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDb() {
  if (db) {
    return db
  }

  if (connectionString) {
    try {
      const client = postgres(connectionString)
      db = drizzle(client, { schema })
      return db
    } catch (error) {
      console.warn('Database connection failed:', error)
    }
  }
  return db
}

export const dbClient = getDb()

export type Database = NonNullable<typeof db>
