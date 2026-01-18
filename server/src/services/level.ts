/**
 * Level Calculation Service
 *
 * XP thresholds follow a progressive curve:
 * Level 1→2: 100 XP
 * Level 2→3: 200 XP
 * ...scaling up with each level
 *
 * Formula: XP_needed = base * (level ^ exponent)
 * Where base = 100, exponent = 1.5
 */

const BASE_XP = 100
const SCALING_EXPONENT = 1.5

/**
 * Calculate the total XP required to reach a given level
 */
export function computeLevelThreshold(level: number): bigint {
  if (level <= 1) return 0n

  let totalXP = 0n
  for (let i = 1; i < level; i++) {
    totalXP += BigInt(Math.floor(BASE_XP * Math.pow(i, SCALING_EXPONENT)))
  }
  return totalXP
}

/**
 * Calculate what level a player is at given their total XP
 */
export function computeLevel(totalXP: bigint): number {
  let level = 1
  let threshold = computeLevelThreshold(level + 1)

  while (totalXP >= threshold) {
    level++
    threshold = computeLevelThreshold(level + 1)
  }

  return level
}

/**
 * Calculate XP needed to reach the next level
 */
export function xpToNextLevel(totalXP: bigint): {
  currentLevel: number
  xpForCurrentLevel: bigint
  xpForNextLevel: bigint
  xpProgress: bigint
  xpNeeded: bigint
  progressPercent: number
} {
  const currentLevel = computeLevel(totalXP)
  const xpForCurrentLevel = computeLevelThreshold(currentLevel)
  const xpForNextLevel = computeLevelThreshold(currentLevel + 1)

  const xpProgress = totalXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel

  const progressPercent =
    xpNeeded > 0n ? Number((xpProgress * 100n) / xpNeeded) : 100

  return {
    currentLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    xpNeeded,
    progressPercent,
  }
}

/**
 * Get level up thresholds for display (first 20 levels)
 */
export function getLevelThresholds(maxLevel = 20): Array<{
  level: number
  totalXP: bigint
  xpToNext: bigint
}> {
  const thresholds = []

  for (let level = 1; level <= maxLevel; level++) {
    const totalXP = computeLevelThreshold(level)
    const nextTotal = computeLevelThreshold(level + 1)
    thresholds.push({
      level,
      totalXP,
      xpToNext: nextTotal - totalXP,
    })
  }

  return thresholds
}
