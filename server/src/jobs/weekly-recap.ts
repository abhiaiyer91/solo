/**
 * Weekly Recap Job
 *
 * Scheduled job to send weekly recap emails every Monday morning.
 *
 * Usage:
 *   - Run directly: npx tsx server/src/jobs/weekly-recap.ts
 *   - Via cron: 0 8 * * 1 npx tsx server/src/jobs/weekly-recap.ts
 *   - Via admin endpoint: POST /api/admin/emails/weekly-reports
 *
 * Recommended cron schedule: Every Monday at 8 AM
 *   0 8 * * 1 cd /path/to/project && npx tsx server/src/jobs/weekly-recap.ts
 */

import { sendWeeklyRecapsToAll } from '../services/weekly-recap'

async function runWeeklyRecapJob() {
  console.log('[JOB] Weekly recap job starting...')
  console.log(`[JOB] Timestamp: ${new Date().toISOString()}`)

  try {
    const result = await sendWeeklyRecapsToAll()

    console.log('[JOB] Weekly recap job completed')
    console.log(`[JOB] Results:`)
    console.log(`  - Total subscribers: ${result.total}`)
    console.log(`  - Emails sent: ${result.sent}`)
    console.log(`  - Failed: ${result.failed}`)

    // Exit with appropriate code
    if (result.failed > 0 && result.sent === 0) {
      process.exit(1) // All failed
    }
    process.exit(0) // Success (even if some failed)
  } catch (error) {
    console.error('[JOB] Weekly recap job failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runWeeklyRecapJob()
}

export { runWeeklyRecapJob }
