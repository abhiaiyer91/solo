import { Mastra } from '@mastra/core'
import { createAnthropic } from '@ai-sdk/anthropic'
import { narratorAgent } from './agents/narrator'
import { psychologyAgent } from './agents/psychology'

// Check for Anthropic API key
const anthropicApiKey = process.env.ANTHROPIC_API_KEY

// Create Anthropic provider
export const anthropic = anthropicApiKey
  ? createAnthropic({
      apiKey: anthropicApiKey,
    })
  : null

// Default model for narrative generation
export const model = anthropic?.('claude-sonnet-4-20250514') ?? null

// Build agents object - use 'any' to avoid strict type conflicts between different agent types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agents: Record<string, any> = {}
if (anthropicApiKey && narratorAgent) {
  agents.narrator = narratorAgent
}
if (anthropicApiKey && psychologyAgent) {
  agents.psychology = psychologyAgent
}

// Create Mastra instance with agents
export const mastra = new Mastra({ agents })

/**
 * Get the narrator agent instance
 * Returns null if Anthropic is not configured
 */
export function getNarratorAgent() {
  if (!anthropicApiKey) {
    console.warn('[MASTRA] Narrator agent unavailable: ANTHROPIC_API_KEY not configured')
    return null
  }
  return mastra.getAgent('narrator')
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  return !!anthropicApiKey && !!model
}

/**
 * Get the psychology agent instance
 * Returns null if Anthropic is not configured
 */
export function getPsychologyAgent() {
  if (!anthropicApiKey) {
    console.warn('[MASTRA] Psychology agent unavailable: ANTHROPIC_API_KEY not configured')
    return null
  }
  return mastra.getAgent('psychology')
}
