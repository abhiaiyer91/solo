import { Mastra } from '@mastra/core'
import { createAnthropic } from '@ai-sdk/anthropic'
import { narratorAgent } from './agents/narrator'

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

// Create Mastra instance with agents
// Only include narrator if it's properly initialized (not null)
export const mastra = new Mastra({
  agents: anthropicApiKey && narratorAgent ? { narrator: narratorAgent } : {},
})

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
