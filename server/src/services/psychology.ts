import { eq } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  psychologyProfiles,
  type PsychologyProfile,
  type PsychologyMessage,
  type PsychologyTraits,
} from '../db/schema'
import { psychologyAgent } from '../mastra/agents/psychology'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for psychology service')
  }
  return db
}

/**
 * Start a psychology assessment conversation
 * Creates or retrieves an in-progress profile
 */
export async function startPsychologyAssessment(userId: string): Promise<{
  profile: PsychologyProfile
  initialMessage: string
}> {
  // Check for existing profile
  const existing = await requireDb().query.psychologyProfiles.findFirst({
    where: eq(psychologyProfiles.userId, userId),
  })

  // If completed, return it with a message
  if (existing?.status === 'completed') {
    return {
      profile: existing,
      initialMessage: 'Assessment already completed. The System has your profile.',
    }
  }

  // If in-progress, continue
  if (existing?.status === 'in_progress') {
    const conversationLog = parseConversationLog(existing.conversationLog)
    const lastAssistantMsg = conversationLog
      .filter((m) => m.role === 'assistant')
      .pop()

    return {
      profile: existing,
      initialMessage:
        lastAssistantMsg?.content ||
        "Let's continue. What made you start thinking about fitness recently.",
    }
  }

  // Create new profile
  const initialMessage =
    "Before we begin, the System needs to understand you. What have your past attempts at fitness looked like. Be specific."

  const conversationLog: PsychologyMessage[] = [
    {
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date().toISOString(),
    },
  ]

  const [newProfile] = await requireDb()
    .insert(psychologyProfiles)
    .values({
      userId,
      conversationLog: JSON.stringify(conversationLog),
      status: 'in_progress',
    })
    .returning()

  if (!newProfile) {
    throw new Error('Failed to create psychology profile')
  }
  return {
    profile: newProfile,
    initialMessage,
  }
}

/**
 * Process a user response and get AI response
 */
export async function respondToPsychologyAssessment(
  userId: string,
  userMessage: string
): Promise<{
  profile: PsychologyProfile
  response: string
  isComplete: boolean
  traits?: PsychologyTraits
}> {
  // Get current profile
  const profile = await requireDb().query.psychologyProfiles.findFirst({
    where: eq(psychologyProfiles.userId, userId),
  })

  if (!profile) {
    throw new Error('No psychology assessment in progress. Start one first.')
  }

  if (profile.status === 'completed') {
    throw new Error('Assessment already completed.')
  }

  // Parse existing conversation
  const conversationLog = parseConversationLog(profile.conversationLog)

  // Add user message
  conversationLog.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  })

  // Get AI response
  let aiResponse: string
  let isComplete = false
  let traits: PsychologyTraits | undefined

  if (psychologyAgent) {
    try {
      // Build message history for the agent
      const messages = conversationLog
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      // Generate response
      const result = await psychologyAgent.generate(messages.map(m => m.content))
      aiResponse = result.text || 'The System processes your response.'

      // Check if assessment is complete
      if (aiResponse.includes('[ASSESSMENT_COMPLETE]')) {
        isComplete = true
        traits = extractTraits(aiResponse, conversationLog)
        // Clean the response for the user
        aiResponse = aiResponse.replace('[ASSESSMENT_COMPLETE]', '').trim()
      }
    } catch (error) {
      console.error('[PSYCHOLOGY] AI generation error:', error)
      aiResponse = generateFallbackResponse(conversationLog)
    }
  } else {
    // Fallback when AI is not available
    aiResponse = generateFallbackResponse(conversationLog)
    if (conversationLog.filter((m) => m.role === 'user').length >= 4) {
      isComplete = true
      traits = generateFallbackTraits()
      aiResponse =
        "Assessment complete. The System has analyzed your patterns. Your profile has been recorded."
    }
  }

  // Add AI response to log
  conversationLog.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString(),
  })

  // Update profile
  const updateData: Partial<typeof psychologyProfiles.$inferInsert> = {
    conversationLog: JSON.stringify(conversationLog),
    updatedAt: new Date(),
  }

  if (isComplete && traits) {
    updateData.status = 'completed'
    updateData.motivationType = traits.motivationType
    updateData.primaryBarrier = traits.primaryBarrier
    updateData.consistencyRisk = traits.consistencyRisk
    updateData.pressureResponse = traits.pressureResponse
    updateData.accountabilityPreference = traits.accountabilityPreference
    updateData.insights = JSON.stringify(traits.insights)
    updateData.recommendedApproach = traits.recommendedApproach
  }

  const [updatedProfile] = await requireDb()
    .update(psychologyProfiles)
    .set(updateData)
    .where(eq(psychologyProfiles.userId, userId))
    .returning()

  if (!updatedProfile) {
    throw new Error('Failed to update psychology profile')
  }

  return {
    profile: updatedProfile,
    response: aiResponse,
    isComplete,
    traits: isComplete ? traits : undefined,
  }
}

/**
 * Complete the psychology assessment manually
 */
export async function completePsychologyAssessment(
  userId: string,
  manualTraits?: Partial<PsychologyTraits>
): Promise<PsychologyProfile> {
  const profile = await requireDb().query.psychologyProfiles.findFirst({
    where: eq(psychologyProfiles.userId, userId),
  })

  if (!profile) {
    throw new Error('No psychology assessment found.')
  }

  // Use provided traits or extract/generate
  const traits: PsychologyTraits = {
    motivationType: manualTraits?.motivationType || 'achievement',
    primaryBarrier: manualTraits?.primaryBarrier || 'motivation',
    consistencyRisk: manualTraits?.consistencyRisk || 'medium',
    pressureResponse: manualTraits?.pressureResponse || 'neutral',
    accountabilityPreference: manualTraits?.accountabilityPreference || 'solo',
    insights: manualTraits?.insights || ['Assessment completed with limited data.'],
    recommendedApproach:
      manualTraits?.recommendedApproach ||
      'Standard progression with focus on building consistency.',
  }

  const [updatedProfile] = await requireDb()
    .update(psychologyProfiles)
    .set({
      status: 'completed',
      motivationType: traits.motivationType,
      primaryBarrier: traits.primaryBarrier,
      consistencyRisk: traits.consistencyRisk,
      pressureResponse: traits.pressureResponse,
      accountabilityPreference: traits.accountabilityPreference,
      insights: JSON.stringify(traits.insights),
      recommendedApproach: traits.recommendedApproach,
      updatedAt: new Date(),
    })
    .where(eq(psychologyProfiles.userId, userId))
    .returning()

  if (!updatedProfile) {
    throw new Error('Failed to complete psychology profile')
  }

  return updatedProfile
}

/**
 * Get a user's psychology profile
 */
export async function getPsychologyProfile(
  userId: string
): Promise<PsychologyProfile | null> {
  const profile = await requireDb().query.psychologyProfiles.findFirst({
    where: eq(psychologyProfiles.userId, userId),
  })

  return profile || null
}

/**
 * Format profile for API response
 */
export function formatPsychologyResponse(profile: PsychologyProfile) {
  return {
    id: profile.id,
    status: profile.status,
    motivationType: profile.motivationType,
    primaryBarrier: profile.primaryBarrier,
    consistencyRisk: profile.consistencyRisk,
    pressureResponse: profile.pressureResponse,
    accountabilityPreference: profile.accountabilityPreference,
    insights: profile.insights ? JSON.parse(profile.insights) : [],
    recommendedApproach: profile.recommendedApproach,
    conversationLength: parseConversationLog(profile.conversationLog).length,
    assessedAt: profile.assessedAt,
  }
}

// ============================================================
// Helper Functions
// ============================================================

function parseConversationLog(log: string | null): PsychologyMessage[] {
  if (!log) return []
  try {
    return JSON.parse(log) as PsychologyMessage[]
  } catch {
    return []
  }
}

function generateFallbackResponse(conversationLog: PsychologyMessage[]): string {
  const userMessageCount = conversationLog.filter((m) => m.role === 'user').length

  const fallbackQuestions = [
    'What specifically has been your biggest obstacle in the past.',
    'How do you handle other commitments when life gets busy.',
    'Do deadlines and external pressure help you or hurt you.',
    'Do you prefer to work toward goals alone or with others.',
  ]

  const idx = Math.min(userMessageCount, fallbackQuestions.length - 1)
  return fallbackQuestions[idx] ?? fallbackQuestions[0]!
}

function generateFallbackTraits(): PsychologyTraits {
  return {
    motivationType: 'achievement',
    primaryBarrier: 'motivation',
    consistencyRisk: 'medium',
    pressureResponse: 'neutral',
    accountabilityPreference: 'solo',
    insights: [
      'Limited AI analysis available.',
      'Default profile applied based on common patterns.',
    ],
    recommendedApproach: 'Focus on building consistent daily habits before increasing intensity.',
  }
}

function extractTraits(
  aiResponse: string,
  _conversationLog: PsychologyMessage[]
): PsychologyTraits {
  // Try to extract traits from the AI response
  const lowerResponse = aiResponse.toLowerCase()

  // Motivation type
  let motivationType: PsychologyTraits['motivationType'] = 'achievement'
  if (lowerResponse.includes('social') || lowerResponse.includes('community')) {
    motivationType = 'social'
  } else if (lowerResponse.includes('mastery') || lowerResponse.includes('skill')) {
    motivationType = 'mastery'
  } else if (lowerResponse.includes('health') || lowerResponse.includes('longevity')) {
    motivationType = 'health'
  }

  // Primary barrier
  let primaryBarrier: PsychologyTraits['primaryBarrier'] = 'motivation'
  if (lowerResponse.includes('time') || lowerResponse.includes('busy')) {
    primaryBarrier = 'time'
  } else if (lowerResponse.includes('knowledge') || lowerResponse.includes('unsure')) {
    primaryBarrier = 'knowledge'
  } else if (lowerResponse.includes('injury') || lowerResponse.includes('physical')) {
    primaryBarrier = 'injury'
  }

  // Consistency risk
  let consistencyRisk: PsychologyTraits['consistencyRisk'] = 'medium'
  if (
    lowerResponse.includes('low risk') ||
    lowerResponse.includes('strong history')
  ) {
    consistencyRisk = 'low'
  } else if (
    lowerResponse.includes('high risk') ||
    lowerResponse.includes('struggles')
  ) {
    consistencyRisk = 'high'
  }

  // Pressure response
  let pressureResponse: PsychologyTraits['pressureResponse'] = 'neutral'
  if (
    lowerResponse.includes('respond well') ||
    lowerResponse.includes('thrive')
  ) {
    pressureResponse = 'positive'
  } else if (
    lowerResponse.includes('respond poorly') ||
    lowerResponse.includes('anxiety')
  ) {
    pressureResponse = 'negative'
  }

  // Accountability preference
  let accountabilityPreference: PsychologyTraits['accountabilityPreference'] = 'solo'
  if (lowerResponse.includes('partner')) {
    accountabilityPreference = 'partner'
  } else if (lowerResponse.includes('group') || lowerResponse.includes('team')) {
    accountabilityPreference = 'group'
  }

  // Extract insights from the response
  const insights: string[] = []
  const lines = aiResponse.split('\n').filter((line) => line.trim().startsWith('-'))
  for (const line of lines.slice(0, 3)) {
    insights.push(line.replace('-', '').trim())
  }
  if (insights.length === 0) {
    insights.push('Profile extracted from conversation.')
  }

  return {
    motivationType,
    primaryBarrier,
    consistencyRisk,
    pressureResponse,
    accountabilityPreference,
    insights,
    recommendedApproach:
      'Calibrated approach based on your psychology profile. Focus on building systems that work with your natural tendencies.',
  }
}
