/**
 * Weekly Recap Service
 * Enhanced weekly summary with personalized observations and achievements
 */

import { dbClient as db } from '../db'
import { users, dailyLogs, questLogs, xpEvents } from '../db/schema'
import { titles, playerTitles } from '../db/schema/titles'
import { eq, and, gte, desc, sql, count } from 'drizzle-orm'
import { sendEmail, getUserEmail, isEmailEnabled } from './email'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface WeeklyRecapData {
  user: {
    name: string
    level: number
    currentStreak: number
  }
  stats: {
    questsCompleted: number
    totalQuests: number
    completionRate: number
    xpEarned: number
    perfectDays: number
    activeDays: number
  }
  comparison: {
    questsTrend: number // % change from previous week
    xpTrend: number
  }
  achievements: string[]
  observation: string
  tipOfTheWeek: string
}

// ═══════════════════════════════════════════════════════════
// OBSERVATION GENERATOR
// ═══════════════════════════════════════════════════════════

function generateObservation(data: WeeklyRecapData): string {
  const observations: string[] = []

  // Streak-based observations
  if (data.user.currentStreak >= 30) {
    observations.push(
      "A month of consistent effort. The System recognizes your dedication.",
      "30+ days of discipline. This is no longer a habit—it's identity.",
      "The streak reflects what you've become, not just what you've done."
    )
  } else if (data.user.currentStreak >= 14) {
    observations.push(
      "Two weeks of consistency. Patterns are forming.",
      "The foundation is being laid. Continue the process.",
      "Your dedication has not gone unnoticed."
    )
  } else if (data.user.currentStreak >= 7) {
    observations.push(
      "A full week maintained. Momentum is building.",
      "Seven days of progress. The path forward is clear.",
      "Consistency breeds capability. You're proving this daily."
    )
  }

  // Performance-based observations
  if (data.stats.completionRate >= 90) {
    observations.push(
      "Near-perfect execution. The System is impressed.",
      "Excellence is becoming your standard.",
      "You're operating at peak efficiency."
    )
  } else if (data.stats.completionRate >= 70) {
    observations.push(
      "Strong performance this week. Room exists for refinement.",
      "Solid progress. The remaining margin represents your next challenge."
    )
  } else if (data.stats.completionRate >= 50) {
    observations.push(
      "Half the objectives met. The other half awaits your return.",
      "Progress is progress. Each completed quest matters."
    )
  } else if (data.stats.completionRate > 0) {
    observations.push(
      "Every step forward counts. The System records all progress.",
      "Return stronger. The quests will be waiting."
    )
  }

  // Trend-based observations
  if (data.comparison.xpTrend > 20) {
    observations.push(
      "Significant acceleration detected. Your trajectory has shifted upward.",
      "The System notes a marked improvement in output."
    )
  } else if (data.comparison.xpTrend < -20) {
    observations.push(
      "A quieter week recorded. Recovery periods have their place.",
      "Lower activity noted. Return when ready."
    )
  }

  // Perfect days observations
  if (data.stats.perfectDays >= 5) {
    observations.push(
      "Multiple perfect days achieved. This level of consistency is rare.",
      "Five or more flawless days. You're operating at an elite level."
    )
  }

  // Pick a random observation or return default
  if (observations.length === 0) {
    return "The System continues to record your journey. Each day is data. Each quest, a step forward."
  }

  return observations[Math.floor(Math.random() * observations.length)]
}

function generateTipOfTheWeek(data: WeeklyRecapData): string {
  const tips: string[] = []

  // Based on completion rate
  if (data.stats.completionRate < 70) {
    tips.push(
      "Consider focusing on 2-3 core quests rather than all at once.",
      "Morning completions tend to have higher success rates.",
      "Break larger goals into smaller, daily actions."
    )
  }

  // Based on activity patterns
  if (data.stats.activeDays < 5) {
    tips.push(
      "Consistency beats intensity. Show up daily, even briefly.",
      "Missing one day is a mistake. Missing two is a pattern.",
      "Set a minimum daily action, no matter how small."
    )
  }

  // Based on streak
  if (data.user.currentStreak < 3) {
    tips.push(
      "Focus on building a 3-day streak first. Small wins compound.",
      "Your next goal: three consecutive days. Everything starts there."
    )
  } else if (data.user.currentStreak >= 7 && data.user.currentStreak < 14) {
    tips.push(
      "You've built momentum. Now aim for two weeks.",
      "The hardest part is behind you. Keep pushing."
    )
  }

  // General tips if nothing specific
  if (tips.length === 0) {
    tips.push(
      "Track your peak performance hours. Work with your biology.",
      "Recovery is part of the process. Rest intentionally.",
      "Review your stats weekly. Awareness drives improvement.",
      "Share your progress. Accountability accelerates results."
    )
  }

  return tips[Math.floor(Math.random() * tips.length)]
}

// ═══════════════════════════════════════════════════════════
// DATA GATHERING
// ═══════════════════════════════════════════════════════════

async function gatherWeeklyRecapData(userId: string): Promise<WeeklyRecapData | null> {
  if (!db) return null

  // Get user info
  const [user] = await db
    .select({
      name: users.name,
      level: users.level,
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  // Calculate date ranges
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

  // Get this week's daily logs
  const thisWeekLogs = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.logDate, weekAgoStr)))

  // Get previous week's daily logs for comparison
  const lastWeekLogs = await db
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.logDate, twoWeeksAgoStr),
        sql`${dailyLogs.logDate} < ${weekAgoStr}`
      )
    )

  // Calculate this week's stats
  const questsCompleted = thisWeekLogs.reduce((sum, log) => sum + log.coreQuestsCompleted + log.bonusQuestsCompleted, 0)
  const totalQuests = thisWeekLogs.reduce((sum, log) => sum + log.coreQuestsTotal, 0)
  const xpEarned = thisWeekLogs.reduce((sum, log) => sum + log.xpEarned, 0)
  const perfectDays = thisWeekLogs.filter((log) => log.isPerfectDay).length
  const activeDays = thisWeekLogs.filter((log) => log.coreQuestsCompleted > 0).length

  // Calculate last week's stats for comparison
  const lastWeekQuests = lastWeekLogs.reduce((sum, log) => sum + log.coreQuestsCompleted + log.bonusQuestsCompleted, 0)
  const lastWeekXP = lastWeekLogs.reduce((sum, log) => sum + log.xpEarned, 0)

  // Calculate trends
  const questsTrend = lastWeekQuests > 0 ? Math.round(((questsCompleted - lastWeekQuests) / lastWeekQuests) * 100) : 0
  const xpTrend = lastWeekXP > 0 ? Math.round(((xpEarned - lastWeekXP) / lastWeekXP) * 100) : 0

  // Get achievements earned this week
  const achievements: string[] = []

  // Check for new titles earned this week
  try {
    const newTitles = await db
      .select({ name: titles.name })
      .from(playerTitles)
      .innerJoin(titles, eq(playerTitles.titleId, titles.id))
      .where(and(eq(playerTitles.userId, userId), gte(playerTitles.earnedAt, weekAgo)))

    for (const title of newTitles) {
      achievements.push(`Earned title: "${title.name}"`)
    }
  } catch {
    // Titles table might not exist
  }

  // Add milestone achievements
  if (user.currentStreak === 7) achievements.push('7-day streak achieved')
  if (user.currentStreak === 14) achievements.push('2-week streak milestone')
  if (user.currentStreak === 30) achievements.push('30-day streak - legendary')
  if (perfectDays === 7) achievements.push('Perfect week - all days flawless')
  if (xpEarned >= 1000) achievements.push(`Earned ${xpEarned} XP in one week`)

  const recapData: WeeklyRecapData = {
    user: {
      name: user.name || 'Hunter',
      level: user.level,
      currentStreak: user.currentStreak,
    },
    stats: {
      questsCompleted,
      totalQuests,
      completionRate: totalQuests > 0 ? Math.round((questsCompleted / totalQuests) * 100) : 0,
      xpEarned,
      perfectDays,
      activeDays,
    },
    comparison: {
      questsTrend,
      xpTrend,
    },
    achievements,
    observation: '',
    tipOfTheWeek: '',
  }

  // Generate personalized content
  recapData.observation = generateObservation(recapData)
  recapData.tipOfTheWeek = generateTipOfTheWeek(recapData)

  return recapData
}

// ═══════════════════════════════════════════════════════════
// EMAIL GENERATION
// ═══════════════════════════════════════════════════════════

function generateWeeklyRecapEmail(data: WeeklyRecapData): { subject: string; html: string; text: string } {
  const trendIcon = (trend: number) => (trend > 5 ? '↑' : trend < -5 ? '↓' : '→')
  const trendColor = (trend: number) => (trend > 5 ? '#22c55e' : trend < -5 ? '#ef4444' : '#9ca3af')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Monaco', 'Menlo', 'Consolas', monospace; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #1a1a1a; }
    .header { background: #0f0f1e; padding: 24px; border-bottom: 1px solid #2a2a4e; }
    .header-title { color: #3b82f6; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .header-name { color: #fff; font-size: 24px; font-weight: bold; }
    .content { padding: 24px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: #0a0a0a; padding: 16px; border: 1px solid #1a1a1a; }
    .stat-label { color: #666; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
    .stat-value { color: #fff; font-size: 28px; font-weight: bold; }
    .stat-trend { font-size: 12px; margin-top: 4px; }
    .highlight { color: #3b82f6; }
    .success { color: #22c55e; }
    .section { margin-bottom: 24px; }
    .section-title { color: #3b82f6; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #2a2a4e; padding-bottom: 8px; }
    .observation { background: #0f0f1e; padding: 16px; border-left: 3px solid #3b82f6; margin-bottom: 16px; font-style: italic; color: #9ca3af; line-height: 1.6; }
    .achievement { background: #22c55e10; border: 1px solid #22c55e40; padding: 12px; margin-bottom: 8px; color: #22c55e; }
    .tip { background: #f59e0b10; border: 1px solid #f59e0b40; padding: 12px; color: #f59e0b; }
    .footer { padding: 24px; border-top: 1px solid #1a1a1a; text-align: center; }
    .footer-text { color: #666; font-size: 11px; line-height: 1.6; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .unsubscribe { margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">[System] Weekly Progress Report</div>
      <div class="header-name">${data.user.name}</div>
    </div>

    <div class="content">
      <div class="observation">"${data.observation}"</div>

      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-label">Quests Completed</div>
          <div class="stat-value">${data.stats.questsCompleted}</div>
          <div class="stat-trend" style="color: ${trendColor(data.comparison.questsTrend)}">
            ${trendIcon(data.comparison.questsTrend)} ${Math.abs(data.comparison.questsTrend)}% vs last week
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">XP Earned</div>
          <div class="stat-value highlight">+${data.stats.xpEarned}</div>
          <div class="stat-trend" style="color: ${trendColor(data.comparison.xpTrend)}">
            ${trendIcon(data.comparison.xpTrend)} ${Math.abs(data.comparison.xpTrend)}% vs last week
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Current Streak</div>
          <div class="stat-value" style="color: #f59e0b">${data.user.currentStreak}</div>
          <div class="stat-trend" style="color: #9ca3af">days</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Perfect Days</div>
          <div class="stat-value success">${data.stats.perfectDays}</div>
          <div class="stat-trend" style="color: #9ca3af">of 7 days</div>
        </div>
      </div>

      ${data.achievements.length > 0 ? `
      <div class="section">
        <div class="section-title">Achievements Unlocked</div>
        ${data.achievements.map(a => `<div class="achievement">🏆 ${a}</div>`).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">System Recommendation</div>
        <div class="tip">💡 ${data.tipOfTheWeek}</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        Level ${data.user.level} • ${data.stats.completionRate}% completion rate this week
        <br><br>
        <a href="https://journey.fitness">View Full Stats</a>
        <div class="unsubscribe">
          <a href="https://journey.fitness/profile?unsubscribe=weekly">Unsubscribe from weekly emails</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`

  const text = `
[SYSTEM] Weekly Progress Report
${data.user.name}

"${data.observation}"

STATS THIS WEEK
─────────────────
Quests Completed: ${data.stats.questsCompleted} (${data.comparison.questsTrend > 0 ? '+' : ''}${data.comparison.questsTrend}% vs last week)
XP Earned: +${data.stats.xpEarned}
Current Streak: ${data.user.currentStreak} days
Perfect Days: ${data.stats.perfectDays}/7

${data.achievements.length > 0 ? `ACHIEVEMENTS\n${data.achievements.map(a => `🏆 ${a}`).join('\n')}\n` : ''}

SYSTEM RECOMMENDATION
💡 ${data.tipOfTheWeek}

───
Level ${data.user.level} • ${data.stats.completionRate}% completion rate
Visit journey.fitness to view full stats

To unsubscribe: journey.fitness/profile?unsubscribe=weekly
`

  return {
    subject: `[JOURNEY] Week in Review: ${data.stats.xpEarned} XP earned`,
    html,
    text,
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════

export async function sendWeeklyRecap(userId: string): Promise<boolean> {
  // Check if email notifications are enabled
  const enabled = await isEmailEnabled(userId)
  if (!enabled) return false

  // Get user email
  const email = await getUserEmail(userId)
  if (!email) return false

  // Gather recap data
  const data = await gatherWeeklyRecapData(userId)
  if (!data) return false

  // Generate and send email
  const emailContent = generateWeeklyRecapEmail(data)
  const result = await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  })

  return result.success
}

export async function sendWeeklyRecapsToAll(): Promise<{
  total: number
  sent: number
  failed: number
}> {
  if (!db) {
    return { total: 0, sent: 0, failed: 0 }
  }

  // Get all users with weekly email enabled
  const subscribers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.notifyEmailWeeklySummary, true))

  let sent = 0
  let failed = 0

  for (const { id } of subscribers) {
    try {
      const success = await sendWeeklyRecap(id)
      if (success) {
        sent++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`[WEEKLY-RECAP] Failed to send recap to ${id}:`, error)
      failed++
    }
  }

  console.log(`[WEEKLY-RECAP] Sent ${sent}/${subscribers.length} recaps (${failed} failed)`)

  return {
    total: subscribers.length,
    sent,
    failed,
  }
}
