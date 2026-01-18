import { eq } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  baselineAssessments,
  type BaselineAssessment,
  type BaselineAssessmentInput,
} from '../db/schema'

// Unit conversion helpers
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462
}

// Get user's baseline assessment
export async function getBaselineAssessment(
  userId: string
): Promise<BaselineAssessment | null> {
  const result = await db
    .select()
    .from(baselineAssessments)
    .where(eq(baselineAssessments.userId, userId))
    .limit(1)

  return result[0] ?? null
}

// Save or update baseline assessment
export async function saveBaselineAssessment(
  userId: string,
  input: BaselineAssessmentInput
): Promise<{ assessment: BaselineAssessment; stats: CalculatedStats }> {
  // Convert weight to kg if provided in lbs
  let startingWeight = input.startingWeight
  let targetWeight = input.targetWeight

  if (input.weightUnit === 'lbs') {
    if (startingWeight !== undefined) {
      startingWeight = lbsToKg(startingWeight)
    }
    if (targetWeight !== undefined) {
      targetWeight = lbsToKg(targetWeight)
    }
  }

  // Check if assessment already exists
  const existing = await getBaselineAssessment(userId)

  let assessment: BaselineAssessment

  if (existing) {
    // Update existing assessment
    const [updated] = await db
      .update(baselineAssessments)
      .set({
        startingWeight,
        targetWeight,
        height: input.height,
        pushUpsMax: input.pushUpsMax,
        plankHoldSeconds: input.plankHoldSeconds,
        mileTimeMinutes: input.mileTimeMinutes,
        dailyStepsBaseline: input.dailyStepsBaseline,
        workoutsPerWeek: input.workoutsPerWeek,
        sleepHoursBaseline: input.sleepHoursBaseline,
        proteinGramsBaseline: input.proteinGramsBaseline,
        alcoholDrinksPerWeek: input.alcoholDrinksPerWeek,
        fitnessExperience: input.fitnessExperience,
        hasGymAccess: input.hasGymAccess,
        hasHomeEquipment: input.hasHomeEquipment,
        updatedAt: new Date(),
      })
      .where(eq(baselineAssessments.userId, userId))
      .returning()

    assessment = updated!
  } else {
    // Create new assessment
    const [created] = await db
      .insert(baselineAssessments)
      .values({
        userId,
        startingWeight,
        targetWeight,
        height: input.height,
        pushUpsMax: input.pushUpsMax,
        plankHoldSeconds: input.plankHoldSeconds,
        mileTimeMinutes: input.mileTimeMinutes,
        dailyStepsBaseline: input.dailyStepsBaseline,
        workoutsPerWeek: input.workoutsPerWeek,
        sleepHoursBaseline: input.sleepHoursBaseline,
        proteinGramsBaseline: input.proteinGramsBaseline,
        alcoholDrinksPerWeek: input.alcoholDrinksPerWeek,
        fitnessExperience: input.fitnessExperience,
        hasGymAccess: input.hasGymAccess ?? false,
        hasHomeEquipment: input.hasHomeEquipment ?? false,
      })
      .returning()

    assessment = created!
  }

  // Calculate initial stats based on assessment
  const stats = calculateInitialStats(assessment)

  return { assessment, stats }
}

// Calculated stats based on baseline assessment
export interface CalculatedStats {
  str: number // Strength
  agi: number // Agility
  vit: number // Vitality
  disc: number // Discipline
}

// Calculate initial stats from baseline assessment
export function calculateInitialStats(
  assessment: BaselineAssessment
): CalculatedStats {
  // Base stats start at 10
  let str = 10
  let agi = 10
  let vit = 10
  let disc = 10

  // Adjust based on experience level
  const experienceBonus: Record<string, number> = {
    beginner: 0,
    intermediate: 2,
    advanced: 5,
  }
  const expBonus = experienceBonus[assessment.fitnessExperience ?? 'beginner'] ?? 0

  // Strength: Based on push-ups
  if (assessment.pushUpsMax !== null && assessment.pushUpsMax !== undefined) {
    if (assessment.pushUpsMax >= 50) str += 8
    else if (assessment.pushUpsMax >= 30) str += 5
    else if (assessment.pushUpsMax >= 15) str += 2
    else if (assessment.pushUpsMax >= 5) str += 1
  }

  // Agility: Based on mile time
  if (assessment.mileTimeMinutes !== null && assessment.mileTimeMinutes !== undefined) {
    if (assessment.mileTimeMinutes <= 6) agi += 8
    else if (assessment.mileTimeMinutes <= 8) agi += 5
    else if (assessment.mileTimeMinutes <= 10) agi += 2
    else if (assessment.mileTimeMinutes <= 12) agi += 1
  }

  // Vitality: Based on sleep and lifestyle
  if (assessment.sleepHoursBaseline !== null && assessment.sleepHoursBaseline !== undefined) {
    if (assessment.sleepHoursBaseline >= 7 && assessment.sleepHoursBaseline <= 9) {
      vit += 3
    } else if (assessment.sleepHoursBaseline >= 6) {
      vit += 1
    }
  }

  // Reduce vitality for alcohol consumption
  if (assessment.alcoholDrinksPerWeek !== null && assessment.alcoholDrinksPerWeek !== undefined) {
    if (assessment.alcoholDrinksPerWeek === 0) vit += 2
    else if (assessment.alcoholDrinksPerWeek <= 3) vit += 1
    else if (assessment.alcoholDrinksPerWeek > 10) vit -= 2
  }

  // Discipline: Based on workout frequency and plank hold
  if (assessment.workoutsPerWeek !== null && assessment.workoutsPerWeek !== undefined) {
    if (assessment.workoutsPerWeek >= 5) disc += 5
    else if (assessment.workoutsPerWeek >= 3) disc += 3
    else if (assessment.workoutsPerWeek >= 1) disc += 1
  }

  if (assessment.plankHoldSeconds !== null && assessment.plankHoldSeconds !== undefined) {
    if (assessment.plankHoldSeconds >= 120) disc += 3
    else if (assessment.plankHoldSeconds >= 60) disc += 2
    else if (assessment.plankHoldSeconds >= 30) disc += 1
  }

  // Daily steps contribute to both agility and vitality
  if (assessment.dailyStepsBaseline !== null && assessment.dailyStepsBaseline !== undefined) {
    if (assessment.dailyStepsBaseline >= 10000) {
      agi += 2
      vit += 2
    } else if (assessment.dailyStepsBaseline >= 7000) {
      agi += 1
      vit += 1
    }
  }

  // Apply experience bonus to all stats
  str += expBonus
  agi += expBonus
  vit += expBonus
  disc += expBonus

  // Cap stats at 25 for initial values
  const cap = 25
  return {
    str: Math.min(str, cap),
    agi: Math.min(agi, cap),
    vit: Math.min(vit, cap),
    disc: Math.min(disc, cap),
  }
}

// Format assessment for API response
export function formatAssessmentResponse(assessment: BaselineAssessment) {
  return {
    id: assessment.id,
    userId: assessment.userId,
    startingWeight: assessment.startingWeight,
    startingWeightLbs: assessment.startingWeight
      ? Math.round(kgToLbs(assessment.startingWeight) * 10) / 10
      : null,
    targetWeight: assessment.targetWeight,
    targetWeightLbs: assessment.targetWeight
      ? Math.round(kgToLbs(assessment.targetWeight) * 10) / 10
      : null,
    height: assessment.height,
    pushUpsMax: assessment.pushUpsMax,
    plankHoldSeconds: assessment.plankHoldSeconds,
    mileTimeMinutes: assessment.mileTimeMinutes,
    dailyStepsBaseline: assessment.dailyStepsBaseline,
    workoutsPerWeek: assessment.workoutsPerWeek,
    sleepHoursBaseline: assessment.sleepHoursBaseline,
    proteinGramsBaseline: assessment.proteinGramsBaseline,
    alcoholDrinksPerWeek: assessment.alcoholDrinksPerWeek,
    fitnessExperience: assessment.fitnessExperience,
    hasGymAccess: assessment.hasGymAccess,
    hasHomeEquipment: assessment.hasHomeEquipment,
    assessedAt: assessment.assessedAt?.toISOString(),
    updatedAt: assessment.updatedAt?.toISOString(),
  }
}
