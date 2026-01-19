/**
 * Manifest Validation Script
 *
 * Validates the task manifest against the JSON Schema.
 * Run with: npx tsx scripts/validate-manifest.ts
 *
 * Flags:
 *   --quiet    Only output errors
 *   --fix      Attempt to fix common issues (future)
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Read files
const manifestPath = join(projectRoot, 'docs/planning/tasks/manifest.json')
const schemaPath = join(projectRoot, 'docs/planning/tasks/manifest.schema.json')

interface Task {
  id: string
  title: string
  file: string
  priority: string
  status: string
  complexity?: string
  estimatedFiles?: number
  dependencies?: string[]
  blockedBy?: string[]
  tags?: string[]
  source?: string
  claimedBy?: string | null
  claimedAt?: string | null
  completedAt?: string | null
  createdAt?: string
}

interface Manifest {
  $schema?: string
  version: string
  lastUpdated?: string
  tasks: Task[]
  statusValues?: string[]
  priorityOrder?: string[]
}

interface ValidationError {
  path: string
  message: string
  value?: unknown
}

const VALID_STATUSES = ['available', 'claimed', 'in_progress', 'completed', 'blocked', 'abandoned']
const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const VALID_COMPLEXITIES = ['low', 'medium', 'high']
const TASK_ID_PATTERN = /^G\d+-[a-z0-9-]+$/
const FILE_PATTERN = /^G\d+-[a-z0-9-]+\.md$/

function validateManifest(manifest: Manifest): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate root properties
  if (!manifest.version) {
    errors.push({ path: 'version', message: 'Missing required field' })
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push({ path: 'version', message: 'Invalid version format. Expected: X.Y.Z', value: manifest.version })
  }

  if (!manifest.tasks) {
    errors.push({ path: 'tasks', message: 'Missing required field' })
    return errors
  }

  if (!Array.isArray(manifest.tasks)) {
    errors.push({ path: 'tasks', message: 'Must be an array' })
    return errors
  }

  // Collect all task IDs for dependency validation
  const taskIds = new Set(manifest.tasks.map((t) => t.id))

  // Validate each task
  manifest.tasks.forEach((task, index) => {
    const path = `tasks[${index}]`

    // Required fields
    if (!task.id) {
      errors.push({ path: `${path}.id`, message: 'Missing required field' })
    } else if (!TASK_ID_PATTERN.test(task.id)) {
      errors.push({
        path: `${path}.id`,
        message: 'Invalid format. Expected: G{number}-{slug}',
        value: task.id,
      })
    }

    if (!task.title) {
      errors.push({ path: `${path}.title`, message: 'Missing required field' })
    } else if (task.title.length < 3 || task.title.length > 150) {
      errors.push({
        path: `${path}.title`,
        message: 'Title must be 3-150 characters',
        value: task.title.length,
      })
    }

    if (!task.file) {
      errors.push({ path: `${path}.file`, message: 'Missing required field' })
    } else if (!FILE_PATTERN.test(task.file)) {
      errors.push({
        path: `${path}.file`,
        message: 'Invalid format. Expected: G{number}-{slug}.md',
        value: task.file,
      })
    }

    if (!task.priority) {
      errors.push({ path: `${path}.priority`, message: 'Missing required field' })
    } else if (!VALID_PRIORITIES.includes(task.priority)) {
      errors.push({
        path: `${path}.priority`,
        message: `Invalid priority. Expected one of: ${VALID_PRIORITIES.join(', ')}`,
        value: task.priority,
      })
    }

    if (!task.status) {
      errors.push({ path: `${path}.status`, message: 'Missing required field' })
    } else if (!VALID_STATUSES.includes(task.status)) {
      errors.push({
        path: `${path}.status`,
        message: `Invalid status. Expected one of: ${VALID_STATUSES.join(', ')}`,
        value: task.status,
      })
    }

    // Optional fields
    if (task.complexity && !VALID_COMPLEXITIES.includes(task.complexity)) {
      errors.push({
        path: `${path}.complexity`,
        message: `Invalid complexity. Expected one of: ${VALID_COMPLEXITIES.join(', ')}`,
        value: task.complexity,
      })
    }

    if (task.estimatedFiles !== undefined) {
      if (typeof task.estimatedFiles !== 'number' || task.estimatedFiles < 1 || task.estimatedFiles > 50) {
        errors.push({
          path: `${path}.estimatedFiles`,
          message: 'Must be a number between 1 and 50',
          value: task.estimatedFiles,
        })
      }
    }

    // Validate dependencies exist
    if (task.dependencies && Array.isArray(task.dependencies)) {
      task.dependencies.forEach((dep, depIndex) => {
        if (!taskIds.has(dep)) {
          errors.push({
            path: `${path}.dependencies[${depIndex}]`,
            message: `Dependency not found in manifest`,
            value: dep,
          })
        }
      })
    }

    // Validate file matches ID
    if (task.id && task.file) {
      const expectedFile = `${task.id}.md`
      if (task.file !== expectedFile) {
        errors.push({
          path: `${path}.file`,
          message: `File should match ID. Expected: ${expectedFile}`,
          value: task.file,
        })
      }
    }

    // Validate claimed tasks have claimedBy
    if (task.status === 'claimed' || task.status === 'in_progress') {
      if (!task.claimedBy) {
        errors.push({
          path: `${path}.claimedBy`,
          message: `Task is ${task.status} but claimedBy is empty`,
        })
      }
    }

    // Validate completed tasks have completedAt
    if (task.status === 'completed' && !task.completedAt) {
      errors.push({
        path: `${path}.completedAt`,
        message: 'Completed task should have completedAt timestamp',
      })
    }
  })

  // Check for duplicate IDs
  const seenIds = new Set<string>()
  manifest.tasks.forEach((task, index) => {
    if (task.id) {
      if (seenIds.has(task.id)) {
        errors.push({
          path: `tasks[${index}].id`,
          message: 'Duplicate task ID',
          value: task.id,
        })
      }
      seenIds.add(task.id)
    }
  })

  return errors
}

function main() {
  const args = process.argv.slice(2)
  const quiet = args.includes('--quiet')

  try {
    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const manifest: Manifest = JSON.parse(manifestContent)

    const errors = validateManifest(manifest)

    if (errors.length > 0) {
      console.error('\n❌ Manifest validation failed\n')
      console.error('Errors found:')
      errors.forEach((err) => {
        const valueStr = err.value !== undefined ? ` (got: ${JSON.stringify(err.value)})` : ''
        console.error(`  • ${err.path}: ${err.message}${valueStr}`)
      })
      console.error(`\nTotal: ${errors.length} error(s)\n`)
      process.exit(1)
    }

    if (!quiet) {
      const completed = manifest.tasks.filter((t) => t.status === 'completed').length
      const available = manifest.tasks.filter((t) => t.status === 'available').length
      const inProgress = manifest.tasks.filter((t) => t.status === 'in_progress' || t.status === 'claimed').length

      console.log('\n✅ Manifest is valid\n')
      console.log('Summary:')
      console.log(`  Total tasks: ${manifest.tasks.length}`)
      console.log(`  Completed: ${completed}`)
      console.log(`  Available: ${available}`)
      console.log(`  In Progress: ${inProgress}`)
      console.log('')
    }

    process.exit(0)
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('\n❌ Failed to parse manifest.json')
      console.error(`  JSON syntax error: ${error.message}\n`)
    } else if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('\n❌ File not found')
      console.error(`  Could not find: ${manifestPath}\n`)
    } else {
      console.error('\n❌ Unexpected error')
      console.error(`  ${error}\n`)
    }
    process.exit(1)
  }
}

main()
