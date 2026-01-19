/**
 * Email Notification Service
 *
 * Handles email notifications using Resend (or falls back to console logging).
 * All emails follow the system theme and narrative voice.
 */

import { dbClient as db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { NotificationType } from './notification'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for email service')
  }
  return db
}

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'system@journey.fitness'
const RESEND_API_URL = 'https://api.resend.com/emails'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using Resend API or log to console in development
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = options

  // In development without API key, log to console
  if (!RESEND_API_KEY) {
    console.log('[EMAIL] Development mode - would send:')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body: ${text || html.substring(0, 200)}...`)
    return { success: true, messageId: 'dev-' + Date.now() }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[EMAIL] Send failed:', error)
      return { success: false, error }
    }

    const data = await response.json() as { id: string }
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('[EMAIL] Send error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Check if user has email notifications enabled
 */
export async function isEmailEnabled(userId: string): Promise<boolean> {
  const [user] = await requireDb()
    .select({ emailNotifications: users.notifyEmailEnabled })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user?.emailNotifications ?? false
}

/**
 * Get user email address
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  const [user] = await requireDb()
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user?.email ?? null
}

/**
 * Send a notification email to a user
 */
export async function sendNotificationEmail(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>
): Promise<boolean> {
  // Check if email notifications are enabled
  const enabled = await isEmailEnabled(userId)
  if (!enabled) return false

  // Get user email
  const email = await getUserEmail(userId)
  if (!email) return false

  // Generate email content
  const content = generateEmailContent(type, data)

  // Send email
  const result = await sendEmail({
    to: email,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })

  return result.success
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

/**
 * Generate email content based on notification type
 */
function generateEmailContent(
  type: NotificationType,
  data: Record<string, unknown>
): EmailContent {
  const baseStyles = `
    body {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      background-color: #0a0a0a;
      color: #e0e0e0;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #111111;
      border: 1px solid #1a1a1a;
      padding: 24px;
    }
    .header {
      color: #3b82f6;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .content {
      color: #a0a0a0;
      font-size: 14px;
      line-height: 1.6;
    }
    .highlight {
      color: #00ff00;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #1a1a1a;
      font-size: 11px;
      color: #666666;
    }
  `

  const wrapHtml = (title: string, body: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">[SYSTEM] ${title}</div>
        <div class="content">${body}</div>
        <div class="footer">
          Journey Fitness Quest System<br>
          <a href="https://journey.fitness/profile" style="color: #3b82f6;">Manage notification preferences</a>
        </div>
      </div>
    </body>
    </html>
  `

  switch (type) {
    case 'morning_quests':
      return {
        subject: '[JOURNEY] Daily Objectives Assigned',
        html: wrapHtml(
          'Daily Objectives',
          `<p><span class="highlight">${data.questCount ?? 4}</span> quests have been assigned for today.</p>
           <p>The System is recording. Your daily objectives await.</p>`
        ),
        text: `[SYSTEM] Daily Objectives\n\n${data.questCount ?? 4} quests have been assigned for today.\n\nThe System is recording.`,
      }

    case 'milestone':
      return {
        subject: `[JOURNEY] Milestone: ${data.milestoneName}`,
        html: wrapHtml(
          'Milestone Achieved',
          `<p>Achievement unlocked: <span class="highlight">${data.milestoneName}</span></p>
           <p>Progress has been recorded in the System logs.</p>`
        ),
        text: `[SYSTEM] Milestone Achieved\n\n${data.milestoneName}\n\nProgress recorded.`,
      }

    case 'streak':
      return {
        subject: `[JOURNEY] Streak: ${data.streakDays} Days`,
        html: wrapHtml(
          'Streak Update',
          `<p>Current streak: <span class="highlight">${data.streakDays} days</span></p>
           <p>Consistency is the foundation of transformation.</p>`
        ),
        text: `[SYSTEM] Streak Update\n\nCurrent streak: ${data.streakDays} days`,
      }

    case 'level_up':
      return {
        subject: `[JOURNEY] Level ${data.newLevel} Achieved`,
        html: wrapHtml(
          'Level Increase Detected',
          `<p>You have reached <span class="highlight">Level ${data.newLevel}</span>.</p>
           <p>Growth has been recorded. Continue your ascent.</p>`
        ),
        text: `[SYSTEM] Level Increase\n\nLevel ${data.newLevel} achieved.\n\nGrowth recorded.`,
      }

    case 'boss':
      return {
        subject: `[JOURNEY] Boss Encounter: ${data.bossName}`,
        html: wrapHtml(
          'Boss Encounter',
          `<p><span class="highlight">${data.bossName}</span>: Day ${data.dayNumber ?? 1}</p>
           <p>Status: ${data.status ?? 'Active'}</p>
           <p>The battle continues. The System observes.</p>`
        ),
        text: `[SYSTEM] Boss Encounter\n\n${data.bossName}: Day ${data.dayNumber ?? 1}\nStatus: ${data.status ?? 'Active'}`,
      }

    case 'reconciliation':
      return {
        subject: '[JOURNEY] Day Closing - Confirmation Required',
        html: wrapHtml(
          'Day Closing',
          `<p><span class="highlight">${data.pendingCount ?? 0}</span> items pending confirmation.</p>
           <p>Review and confirm your daily activities before the day ends.</p>`
        ),
        text: `[SYSTEM] Day Closing\n\n${data.pendingCount ?? 0} items pending confirmation.`,
      }

    case 'afternoon_status':
      return {
        subject: '[JOURNEY] Afternoon Status Report',
        html: wrapHtml(
          'Status Report',
          `<p>Movement detected: <span class="highlight">${data.steps ?? 0}/10,000</span> steps</p>
           <p>The System continues to record your progress.</p>`
        ),
        text: `[SYSTEM] Status Report\n\nMovement: ${data.steps ?? 0}/10,000 steps`,
      }

    default:
      return {
        subject: '[JOURNEY] System Notification',
        html: wrapHtml('Notification', '<p>An update is available in the Journey system.</p>'),
        text: '[SYSTEM] An update is available.',
      }
  }
}

/**
 * Send a weekly summary email
 */
export async function sendWeeklySummaryEmail(
  userId: string,
  summary: {
    questsCompleted: number
    totalXP: number
    streakDays: number
    levelProgress: number
    statsGained: { str: number; agi: number; vit: number; disc: number }
  }
): Promise<boolean> {
  const enabled = await isEmailEnabled(userId)
  if (!enabled) return false

  const email = await getUserEmail(userId)
  if (!email) return false

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Monaco', monospace; background: #0a0a0a; color: #e0e0e0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #1a1a1a; padding: 24px; }
        .header { color: #3b82f6; font-size: 16px; font-weight: bold; margin-bottom: 24px; }
        .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a1a1a; }
        .stat-label { color: #888; }
        .stat-value { color: #00ff00; font-weight: bold; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
        .stat-box { background: #0a0a0a; padding: 12px; text-align: center; border: 1px solid #1a1a1a; }
        .stat-name { font-size: 10px; color: #666; }
        .stat-gain { font-size: 14px; color: #00ff00; }
        .footer { margin-top: 24px; font-size: 11px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">[SYSTEM] Weekly Progress Report</div>

        <div class="stat-row">
          <span class="stat-label">Quests Completed</span>
          <span class="stat-value">${summary.questsCompleted}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">XP Gained</span>
          <span class="stat-value">+${summary.totalXP}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Current Streak</span>
          <span class="stat-value">${summary.streakDays} days</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Level Progress</span>
          <span class="stat-value">${summary.levelProgress}%</span>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-name">STR</div>
            <div class="stat-gain">+${summary.statsGained.str.toFixed(1)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-name">AGI</div>
            <div class="stat-gain">+${summary.statsGained.agi.toFixed(1)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-name">VIT</div>
            <div class="stat-gain">+${summary.statsGained.vit.toFixed(1)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-name">DISC</div>
            <div class="stat-gain">+${summary.statsGained.disc.toFixed(1)}</div>
          </div>
        </div>

        <div class="footer">
          The System continues to record your progress.<br>
          <a href="https://journey.fitness" style="color: #3b82f6;">View full stats</a>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `[SYSTEM] Weekly Progress Report

Quests Completed: ${summary.questsCompleted}
XP Gained: +${summary.totalXP}
Current Streak: ${summary.streakDays} days
Level Progress: ${summary.levelProgress}%

Stats Gained:
STR: +${summary.statsGained.str.toFixed(1)}
AGI: +${summary.statsGained.agi.toFixed(1)}
VIT: +${summary.statsGained.vit.toFixed(1)}
DISC: +${summary.statsGained.disc.toFixed(1)}

The System continues to record your progress.`

  const result = await sendEmail({
    to: email,
    subject: '[JOURNEY] Your Weekly Progress Report',
    html,
    text,
  })

  return result.success
}

/**
 * Get users who have opted in to weekly email summaries
 */
export async function getWeeklyEmailSubscribers(): Promise<string[]> {
  const results = await requireDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.notifyEmailWeeklySummary, true))

  return results.map(r => r.id)
}

/**
 * Gather weekly stats for a user
 */
export async function gatherWeeklyStats(userId: string): Promise<{
  questsCompleted: number
  totalXP: number
  streakDays: number
  levelProgress: number
  statsGained: { str: number; agi: number; vit: number; disc: number }
}> {
  const db = requireDb()

  // Get current user data
  const [user] = await db
    .select({
      level: users.level,
      totalXP: users.totalXP,
      currentStreak: users.currentStreak,
      str: users.str,
      agi: users.agi,
      vit: users.vit,
      disc: users.disc,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return {
      questsCompleted: 0,
      totalXP: 0,
      streakDays: 0,
      levelProgress: 0,
      statsGained: { str: 0, agi: 0, vit: 0, disc: 0 },
    }
  }

  // Calculate date range for the past week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  // Import quest logs and xp events tables dynamically to avoid circular dependencies
  const { questLogs, xpEvents } = await import('../db/schema')
  const { and, gte } = await import('drizzle-orm')

  // Count completed quests this week
  const questResults = await db
    .select({ count: questLogs.id })
    .from(questLogs)
    .where(
      and(
        eq(questLogs.userId, userId),
        eq(questLogs.status, 'completed'),
        gte(questLogs.completedAt, weekAgo)
      )
    )

  const questsCompleted = questResults.length

  // Sum XP gained this week
  const xpResults = await db
    .select({ xp: xpEvents.amount })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        gte(xpEvents.createdAt, weekAgo)
      )
    )

  const totalXP = xpResults.reduce((sum, r) => sum + (r.xp ?? 0), 0)

  // Calculate level progress (simplified: XP needed for next level)
  const xpForNextLevel = user.level * 100 // Simple formula
  const currentLevelXP = user.totalXP % xpForNextLevel
  const levelProgress = Math.round((currentLevelXP / xpForNextLevel) * 100)

  // For stats gained, we'd need historical data. For now, estimate based on XP
  // In a real implementation, you'd track stat changes over time
  const avgStatGain = totalXP / 100 // Rough estimate
  const statsGained = {
    str: avgStatGain * 0.25,
    agi: avgStatGain * 0.25,
    vit: avgStatGain * 0.25,
    disc: avgStatGain * 0.25,
  }

  return {
    questsCompleted,
    totalXP,
    streakDays: user.currentStreak,
    levelProgress,
    statsGained,
  }
}

/**
 * Send weekly reports to all opted-in users
 * Returns the number of emails sent successfully
 */
export async function sendWeeklyReportsToAll(): Promise<{
  total: number
  sent: number
  failed: number
}> {
  const subscribers = await getWeeklyEmailSubscribers()

  let sent = 0
  let failed = 0

  for (const userId of subscribers) {
    try {
      const stats = await gatherWeeklyStats(userId)
      const success = await sendWeeklySummaryEmail(userId, stats)

      if (success) {
        sent++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`[EMAIL] Failed to send weekly report to ${userId}:`, error)
      failed++
    }
  }

  console.log(`[EMAIL] Weekly reports: ${sent} sent, ${failed} failed out of ${subscribers.length} subscribers`)

  return {
    total: subscribers.length,
    sent,
    failed,
  }
}
