# G4: Set Up Database Migrations

## Overview

Configure Drizzle Kit for database migrations to enable safe schema changes and reproducible database setup across environments.

## Context

**Current State:**
- Schema defined in `server/src/db/schema/`
- No migration files exist
- Database changes require manual intervention
- drizzle-orm is installed but drizzle-kit may not be configured

**Why Migrations Matter:**
- Safe schema changes in production
- Reproducible database setup
- Track schema history in git
- Rollback capability

## Acceptance Criteria

- [ ] `drizzle-kit` installed and configured
- [ ] `drizzle.config.ts` created with correct settings
- [ ] Initial migration generated from current schema
- [ ] `bun db:generate` script generates migrations
- [ ] `bun db:migrate` script applies migrations
- [ ] `bun db:push` script for development (direct push)
- [ ] Migration workflow documented

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/drizzle.config.ts` | Create | Drizzle Kit configuration |
| `server/package.json` | Modify | Add migration scripts |
| `server/src/db/migrate.ts` | Create | Migration runner |
| `server/drizzle/` | Create | Migration files directory |

## Implementation Guide

### Step 1: Install Drizzle Kit

```bash
cd server
bun add -D drizzle-kit
```

### Step 2: Create Drizzle Config

Create `server/drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

### Step 3: Create Migration Runner

Create `server/src/db/migrate.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  console.log('[MIGRATION] Connecting to database...')

  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  console.log('[MIGRATION] Running migrations...')

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log('[MIGRATION] Migrations complete!')

  await client.end()
  process.exit(0)
}

runMigrations().catch((error) => {
  console.error('[MIGRATION ERROR]', error)
  process.exit(1)
})
```

### Step 4: Update Package.json Scripts

Add to `server/package.json`:

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run src/db/seed.ts"
  }
}
```

### Step 5: Generate Initial Migration

```bash
cd server

# Generate migration from current schema
bun db:generate

# This creates files in server/drizzle/ like:
# 0000_initial_schema.sql
```

### Step 6: Test Migration

```bash
# Apply migrations to database
bun db:migrate

# Or for development, push directly
bun db:push
```

### Step 7: Add .gitignore Entry

Ensure `server/.gitignore` does NOT ignore the drizzle folder:

```gitignore
# Don't ignore migrations - they should be committed
# drizzle/
```

## Migration Workflow

### Development

```bash
# Make schema changes in src/db/schema/
# Then generate migration:
bun db:generate

# Review the generated SQL in drizzle/
# Apply to local database:
bun db:migrate

# Or push directly without migration file:
bun db:push
```

### Production

```bash
# Migrations are committed to git
# On deploy, run:
bun db:migrate
```

### Adding a New Column Example

1. Edit schema file (e.g., add `lastLoginAt` to users):
```typescript
// In auth.ts
lastLoginAt: timestamp('last_login_at'),
```

2. Generate migration:
```bash
bun db:generate
# Creates: drizzle/0001_add_last_login.sql
```

3. Review generated SQL:
```sql
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;
```

4. Apply migration:
```bash
bun db:migrate
```

## Testing

1. **Fresh Setup:**
   ```bash
   # Drop and recreate database
   docker-compose down -v
   docker-compose up -d postgres

   # Run migrations
   bun db:migrate

   # Verify schema exists
   bun db:studio
   ```

2. **Schema Change:**
   - Add a test column to schema
   - Run `bun db:generate`
   - Verify migration file created
   - Run `bun db:migrate`
   - Verify column exists
   - Remove test column, generate again

3. **Seed After Migration:**
   ```bash
   bun db:migrate && bun db:seed
   ```

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] `bun db:generate` works
- [ ] `bun db:migrate` works
- [ ] Initial migration file committed
- [ ] drizzle/ folder in git
- [ ] Scripts documented in package.json
