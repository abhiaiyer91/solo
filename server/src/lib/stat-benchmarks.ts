/**
 * Stat Benchmarks
 * Real-world benchmark thresholds for player stats
 */

export type StatType = 'STR' | 'AGI' | 'VIT' | 'DISC'

export interface StatBenchmark {
  value: number
  label: string
  description: string
  realWorld: string
}

export const STAT_BENCHMARKS: Record<string, StatBenchmark[]> = {
  STR: [
    { value: 15, label: 'Beginner', description: 'Basic strength established', realWorld: '10-15 push-ups' },
    { value: 25, label: 'Average', description: 'Average threshold crossed', realWorld: '20-30 push-ups' },
    { value: 40, label: 'Above Average', description: 'Exceeding median', realWorld: '40+ push-ups, basic pull-ups' },
    { value: 50, label: 'Advanced', description: 'Advanced strength', realWorld: '50+ push-ups, 10+ pull-ups' },
    { value: 75, label: 'Elite', description: 'Elite threshold', realWorld: 'Competitive fitness level' },
  ],
  AGI: [
    { value: 15, label: 'Beginner', description: 'Basic endurance', realWorld: '5K possible with walking' },
    { value: 20, label: 'Developing', description: 'Building endurance', realWorld: '5K in 40 minutes' },
    { value: 30, label: 'Average', description: 'Average cardio', realWorld: '5K in 35 minutes' },
    { value: 40, label: 'Above Average', description: 'Good endurance', realWorld: '5K in 30 minutes' },
    { value: 60, label: 'Advanced', description: 'Advanced cardio', realWorld: '5K in 25 minutes, 10K comfortable' },
    { value: 80, label: 'Elite', description: 'Elite endurance', realWorld: 'Half-marathon ready' },
  ],
  VIT: [
    { value: 20, label: 'Unstable', description: 'Recovery needs work', realWorld: 'Inconsistent sleep, high stress' },
    { value: 30, label: 'Average', description: 'Average recovery', realWorld: '7+ hours sleep, managing stress' },
    { value: 50, label: 'Good', description: 'Good recovery habits', realWorld: 'Consistent sleep, active recovery' },
    { value: 70, label: 'Optimal', description: 'Optimal recovery', realWorld: 'Quality sleep, low stress, proper nutrition' },
  ],
  DISC: [
    { value: 15, label: 'Emerging', description: 'Building habits', realWorld: '7+ day streaks occasionally' },
    { value: 30, label: 'Developing', description: 'Habit formation', realWorld: '14+ day streaks regularly' },
    { value: 50, label: 'Strong', description: 'Strong discipline', realWorld: '30+ day streaks, consistent routines' },
    { value: 60, label: 'Elite', description: 'Elite discipline', realWorld: '60+ day streaks, automatic habits' },
    { value: 80, label: 'Mastery', description: 'Discipline mastery', realWorld: '90+ day streaks, identity-level change' },
  ],
}

/**
 * Get benchmark for a stat at a given value
 */
export function getCurrentBenchmark(stat: string, value: number): StatBenchmark | null {
  const benchmarks = STAT_BENCHMARKS[stat]
  if (!benchmarks) return null

  // Find the highest benchmark crossed
  const crossed = benchmarks.filter((b) => value >= b.value)
  return crossed.length > 0 ? crossed[crossed.length - 1]! : null
}

/**
 * Get the next benchmark to achieve
 */
export function getNextBenchmark(stat: string, value: number): StatBenchmark | null {
  const benchmarks = STAT_BENCHMARKS[stat]
  if (!benchmarks) return null

  const next = benchmarks.find((b) => b.value > value)
  return next ?? null
}

/**
 * Check if a benchmark was just crossed
 */
export function checkBenchmarkCrossed(
  stat: string,
  oldValue: number,
  newValue: number
): StatBenchmark | null {
  const benchmarks = STAT_BENCHMARKS[stat]
  if (!benchmarks) return null

  // Find benchmark crossed between old and new
  const crossed = benchmarks.find((b) => oldValue < b.value && newValue >= b.value)
  return crossed ?? null
}

/**
 * Generate transformation text for benchmark crossing
 */
export function getTransformationText(
  stat: string,
  benchmark: StatBenchmark
): string {
  const transformations: Record<string, Record<number, string>> = {
    STR: {
      25: 'The average threshold has been crossed. You are now stronger than the median.',
      50: 'Advanced strength detected. You have surpassed 80% of the population.',
      75: 'Elite threshold reached. Military fitness standards exceeded.',
    },
    AGI: {
      30: 'Average cardiovascular capacity achieved. A 5K is no longer a challenge.',
      60: 'Advanced endurance detected. Half-marathon distance is now realistic.',
    },
    VIT: {
      50: 'Recovery optimization detected. The body now heals efficiently.',
    },
    DISC: {
      30: 'Habit formation confirmed. Consistency is becoming automatic.',
      60: 'Elite discipline detected. This is identity, not willpower.',
    },
  }

  return transformations[stat]?.[benchmark.value] ?? 
    `${stat} ${benchmark.label} benchmark achieved. ${benchmark.description}.`
}

/**
 * Generate initial vs current comparison text
 */
export function getComparisonText(
  stat: string,
  initialValue: number,
  currentValue: number
): string {
  const diff = currentValue - initialValue
  if (diff <= 0) return ''

  return `The body that arrived here had ${stat} ${initialValue}. This body has ${stat} ${currentValue}. A difference of ${diff} points. This is not motivation. This is evidence.`
}

/**
 * Level-up milestone messages
 */
export const LEVEL_MILESTONES: Record<number, { title: string; message: string }> = {
  5: {
    title: 'Level 5 achieved.',
    message: 'The first threshold. Many claim they will change. You have 5 levels of evidence that you did.\n\nBOSS FIGHTS: Now available',
  },
  10: {
    title: 'Level 10 achieved.',
    message: 'Double digits. The body and mind have adapted. This is no longer a project. This is becoming who you are.',
  },
  15: {
    title: 'Level 15 achieved.',
    message: 'You have outlasted 90% of those who start. The ones who quit never got this message.',
  },
  20: {
    title: 'Level 20 achieved.',
    message: 'This level corresponds to military fitness standards. Not weekend warrior. Not \'pretty fit.\' Operationally capable.\n\nThe System notes: you have exceeded initial projections.',
  },
  25: {
    title: 'Level 25 achieved.',
    message: 'Quarter-century mark. At this point, you are the example others point to.',
  },
  30: {
    title: 'Level 30 achieved.',
    message: 'The person who started this could not have imagined reaching here. Yet here you are. Evidence of transformation.',
  },
  50: {
    title: 'Level 50 achieved.',
    message: 'The halfway point to maximum. Few ever reach this threshold. You are now among the committed.',
  },
}

/**
 * Get level milestone if applicable
 */
export function getLevelMilestone(level: number): { title: string; message: string } | null {
  return LEVEL_MILESTONES[level] ?? null
}

/**
 * Get all benchmarks for a specific stat
 */
export function getBenchmarksForStat(stat: StatType): StatBenchmark[] {
  return STAT_BENCHMARKS[stat] ?? []
}

/**
 * Alias for getNextBenchmark - get next milestone to achieve
 */
export function getNextMilestone(stat: StatType, value: number): StatBenchmark | null {
  return getNextBenchmark(stat, value)
}

/**
 * Get improvement suggestions for a stat
 */
export function getImprovementSuggestions(stat: StatType, currentValue: number): string[] {
  const suggestions: Record<StatType, string[]> = {
    STR: [
      'Complete strength-focused quests',
      'Increase resistance training frequency',
      'Progress to harder exercises',
      'Add compound movements to routine',
    ],
    AGI: [
      'Complete cardio and mobility quests',
      'Increase weekly running distance',
      'Add interval training sessions',
      'Improve consistency in cardio workouts',
    ],
    VIT: [
      'Prioritize sleep quality and duration',
      'Complete recovery and rest quests',
      'Manage stress through meditation',
      'Focus on nutrition and hydration',
    ],
    DISC: [
      'Maintain daily quest completion streak',
      'Complete bonus quests consistently',
      'Avoid skipping scheduled workouts',
      'Build morning routine habits',
    ],
  }

  // Return first 2-3 suggestions based on current value
  const allSuggestions = suggestions[stat]
  const count = currentValue < 30 ? 3 : 2
  return allSuggestions.slice(0, count)
}
