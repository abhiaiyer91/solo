/**
 * Pattern Analysis Service
 * Detects player patterns for System observations
 */

export type PatternType = 
  | 'day_pattern'
  | 'quest_pattern'
  | 'time_pattern'
  | 'streak_pattern'
  | 'correlation'

export interface PatternAnalysisResult {
  type: PatternType
  confidence: number // 0-1, only surface if > 0.7
  data: {
    pattern: string
    dataPoints: number
    details?: Record<string, unknown>
  }
}

export interface DayDistribution {
  Monday: number
  Tuesday: number
  Wednesday: number
  Thursday: number
  Friday: number
  Saturday: number
  Sunday: number
}

/**
 * Detect patterns where certain days show repeated failure
 */
export async function detectDayPatterns(
  failuresByDay: DayDistribution
): Promise<PatternAnalysisResult | null> {
  const days = Object.entries(failuresByDay)
  const total = days.reduce((sum, [_, count]) => sum + count, 0)
  const avgFailures = total / 7

  if (total < 3) return null // Need minimum data

  // Find the day with most failures
  const [weakestDay, weakestCount] = days.reduce(
    (max, [day, count]) => (count > max[1] ? [day, count] : max),
    ['', 0]
  )

  // Check if significantly higher than average
  if (weakestCount > avgFailures * 1.5 && weakestCount >= 3) {
    return {
      type: 'day_pattern',
      confidence: Math.min(0.9, 0.6 + (weakestCount / 10)),
      data: {
        pattern: `${weakestDay} has ${weakestCount} failures vs ${avgFailures.toFixed(1)} average`,
        dataPoints: weakestCount,
        details: { day: weakestDay, count: weakestCount, average: avgFailures },
      },
    }
  }

  return null
}

/**
 * Detect patterns in quest completion rates
 */
export async function detectQuestPatterns(
  questCompletionRates: Record<string, { completed: number; total: number }>
): Promise<PatternAnalysisResult | null> {
  const quests = Object.entries(questCompletionRates)
  if (quests.length < 2) return null

  // Calculate rates
  const rates = quests.map(([name, { completed, total }]) => ({
    name,
    rate: total > 0 ? completed / total : 0,
    total,
  }))

  // Need minimum data
  const withData = rates.filter((r) => r.total >= 5)
  if (withData.length < 2) return null

  // Find best and worst
  const sorted = [...withData].sort((a, b) => b.rate - a.rate)
  const best = sorted[0]!
  const worst = sorted[sorted.length - 1]!

  // Check if significant gap
  const gap = best.rate - worst.rate
  if (gap >= 0.25) {
    return {
      type: 'quest_pattern',
      confidence: Math.min(0.9, 0.5 + gap),
      data: {
        pattern: `${best.name}: ${(best.rate * 100).toFixed(0)}% vs ${worst.name}: ${(worst.rate * 100).toFixed(0)}%`,
        dataPoints: best.total + worst.total,
        details: { best, worst, gap },
      },
    }
  }

  return null
}

/**
 * Detect streak threshold patterns
 */
export async function detectStreakPatterns(
  longestStreak: number,
  currentStreak: number,
  streakBreaks: number[]
): Promise<PatternAnalysisResult | null> {
  if (longestStreak < 7) return null

  // Check if approaching personal record
  if (currentStreak >= longestStreak * 0.7 && currentStreak > 10) {
    return {
      type: 'streak_pattern',
      confidence: 0.85,
      data: {
        pattern: `Longest: ${longestStreak}. Current: ${currentStreak}. ${Math.round((currentStreak / longestStreak) * 100)}% of record.`,
        dataPoints: 2,
        details: { longest: longestStreak, current: currentStreak },
      },
    }
  }

  // Check for common break points
  if (streakBreaks.length >= 3) {
    const avgBreakPoint = streakBreaks.reduce((a, b) => a + b, 0) / streakBreaks.length
    const variance = streakBreaks.reduce((sum, b) => sum + Math.pow(b - avgBreakPoint, 2), 0) / streakBreaks.length
    const stdDev = Math.sqrt(variance)

    // If break points are clustered
    if (stdDev < 5 && avgBreakPoint > 5) {
      return {
        type: 'streak_pattern',
        confidence: 0.75,
        data: {
          pattern: `Streaks commonly break around day ${Math.round(avgBreakPoint)}.`,
          dataPoints: streakBreaks.length,
          details: { avgBreakPoint, breaks: streakBreaks },
        },
      }
    }
  }

  return null
}

/**
 * Detect correlations between behaviors
 */
export async function detectCorrelations(
  correlationData: { behavior1: string; behavior2: string; correlation: number }[]
): Promise<PatternAnalysisResult | null> {
  // Find strongest correlation
  const significant = correlationData
    .filter((c) => Math.abs(c.correlation) >= 0.4)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))

  if (significant.length === 0) return null

  const strongest = significant[0]!
  const direction = strongest.correlation > 0 ? 'correlate with' : 'inversely correlate with'
  const percentage = Math.round(Math.abs(strongest.correlation) * 100)

  return {
    type: 'correlation',
    confidence: Math.min(0.85, 0.5 + Math.abs(strongest.correlation) / 2),
    data: {
      pattern: `${strongest.behavior1} ${direction} ${strongest.behavior2} (${percentage}% correlation)`,
      dataPoints: 30, // Assuming 30-day window
      details: strongest,
    },
  }
}

/**
 * Run all pattern analyses for a player
 */
export async function analyzePlayerPatterns(
  data: {
    failuresByDay?: DayDistribution
    questCompletionRates?: Record<string, { completed: number; total: number }>
    longestStreak?: number
    currentStreak?: number
    streakBreaks?: number[]
    correlations?: { behavior1: string; behavior2: string; correlation: number }[]
  }
): Promise<PatternAnalysisResult[]> {
  const results: PatternAnalysisResult[] = []

  if (data.failuresByDay) {
    const dayPattern = await detectDayPatterns(data.failuresByDay)
    if (dayPattern) results.push(dayPattern)
  }

  if (data.questCompletionRates) {
    const questPattern = await detectQuestPatterns(data.questCompletionRates)
    if (questPattern) results.push(questPattern)
  }

  if (data.longestStreak !== undefined && data.currentStreak !== undefined) {
    const streakPattern = await detectStreakPatterns(
      data.longestStreak,
      data.currentStreak,
      data.streakBreaks ?? []
    )
    if (streakPattern) results.push(streakPattern)
  }

  if (data.correlations) {
    const correlationPattern = await detectCorrelations(data.correlations)
    if (correlationPattern) results.push(correlationPattern)
  }

  // Sort by confidence
  return results.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get the most relevant pattern for today's observation
 */
export function selectPatternForObservation(
  patterns: PatternAnalysisResult[],
  recentObservationTypes: PatternType[]
): PatternAnalysisResult | null {
  // Filter by confidence threshold
  const highConfidence = patterns.filter((p) => p.confidence >= 0.7)
  if (highConfidence.length === 0) return null

  // Prefer patterns not recently shown
  const fresh = highConfidence.filter((p) => !recentObservationTypes.includes(p.type))
  if (fresh.length > 0) return fresh[0]!

  return highConfidence[0]!
}
