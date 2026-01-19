/**
 * Voice Engine Service
 * 
 * Manages System voice variety and tone selection.
 */

import { dbClient as db } from '../db'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for voice service')
  }
  return db
}

/**
 * Voice modes - different tones the System can use
 */
export type VoiceMode = 
  | 'cold'        // Default clinical tone
  | 'observant'   // Noticing patterns
  | 'cryptic'     // Mysterious hints
  | 'encouraging' // Rare warmth
  | 'stern'       // After failures
  | 'reverent'    // For big achievements

/**
 * Context that affects voice selection
 */
export interface VoiceContext {
  playerLevel: number
  currentStreak: number
  recentFailures: number  // Consecutive missed days
  perfectDaysThisWeek: number
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  event: string  // What triggered this message
  bossActive?: boolean
  inDungeon?: boolean
}

/**
 * Voice variant - different ways to say the same thing
 */
export interface VoiceVariant {
  id: string
  mode: VoiceMode
  text: string
  weight: number  // Higher = more likely to be chosen
  minLevel?: number
  maxLevel?: number
  requiresStreak?: number
}

/**
 * Track which messages a player has seen
 */
interface SeenMessages {
  messageIds: string[]
  lastCleared: string
}

// In-memory tracking (would use database in production)
const seenMessagesCache = new Map<string, SeenMessages>()

/**
 * Select appropriate voice mode based on context
 */
export function selectVoiceMode(context: VoiceContext): VoiceMode {
  // After failures - stern mode
  if (context.recentFailures >= 2) {
    return 'stern'
  }
  
  // Perfect week - rare encouragement
  if (context.perfectDaysThisWeek >= 5) {
    return 'encouraging'
  }
  
  // High level achievements
  if (context.playerLevel >= 20 && context.currentStreak >= 14) {
    return 'reverent'
  }
  
  // In special content
  if (context.bossActive) {
    return 'stern'
  }
  
  if (context.inDungeon) {
    return 'cryptic'
  }
  
  // Night time - more cryptic
  if (context.timeOfDay === 'night') {
    return 'cryptic'
  }
  
  // Morning - observant
  if (context.timeOfDay === 'morning') {
    return 'observant'
  }
  
  // Default - cold
  return 'cold'
}

/**
 * Get voice variants for a message category
 */
export function getVoiceVariants(
  category: string,
  mode: VoiceMode
): VoiceVariant[] {
  return VOICE_VARIANTS.filter(v => 
    v.id.startsWith(`${category}.`) && v.mode === mode
  )
}

/**
 * Select a message variant, avoiding recently seen ones
 */
export function selectVariant(
  playerId: string,
  category: string,
  context: VoiceContext
): VoiceVariant | null {
  const mode = selectVoiceMode(context)
  const variants = getVoiceVariants(category, mode)
  
  if (variants.length === 0) {
    // Fall back to cold mode if no variants for selected mode
    const coldVariants = getVoiceVariants(category, 'cold')
    if (coldVariants.length === 0) return null
    return selectWeightedRandom(coldVariants, playerId)
  }
  
  // Filter by player level
  const eligible = variants.filter(v => {
    if (v.minLevel && context.playerLevel < v.minLevel) return false
    if (v.maxLevel && context.playerLevel > v.maxLevel) return false
    if (v.requiresStreak && context.currentStreak < v.requiresStreak) return false
    return true
  })
  
  if (eligible.length === 0) return null
  
  return selectWeightedRandom(eligible, playerId)
}

/**
 * Select a variant using weighted random, avoiding recently seen
 */
function selectWeightedRandom(
  variants: VoiceVariant[],
  playerId: string
): VoiceVariant {
  const seen = seenMessagesCache.get(playerId)?.messageIds || []
  
  // Prefer unseen variants
  let candidates = variants.filter(v => !seen.includes(v.id))
  
  // If all seen, reset and use all
  if (candidates.length === 0) {
    clearSeenMessages(playerId)
    candidates = variants
  }
  
  // Weighted selection
  const totalWeight = candidates.reduce((sum, v) => sum + v.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const variant of candidates) {
    random -= variant.weight
    if (random <= 0) {
      markAsSeen(playerId, variant.id)
      return variant
    }
  }
  
  // Fallback to first
  const selected = candidates[0]!
  markAsSeen(playerId, selected.id)
  return selected
}

/**
 * Mark a message as seen
 */
function markAsSeen(playerId: string, messageId: string): void {
  let entry = seenMessagesCache.get(playerId)
  
  if (!entry) {
    entry = {
      messageIds: [],
      lastCleared: new Date().toISOString(),
    }
  }
  
  // Keep last 50 seen messages
  if (entry.messageIds.length >= 50) {
    entry.messageIds.shift()
  }
  
  entry.messageIds.push(messageId)
  seenMessagesCache.set(playerId, entry)
}

/**
 * Clear seen messages for a player
 */
function clearSeenMessages(playerId: string): void {
  seenMessagesCache.delete(playerId)
}

/**
 * Voice variants - sample content
 */
const VOICE_VARIANTS: VoiceVariant[] = [
  // Quest completion - cold
  {
    id: 'quest.complete.cold.1',
    mode: 'cold',
    text: 'Quest recorded. Continue.',
    weight: 10,
  },
  {
    id: 'quest.complete.cold.2',
    mode: 'cold',
    text: 'Data logged. The pattern holds.',
    weight: 10,
  },
  {
    id: 'quest.complete.cold.3',
    mode: 'cold',
    text: 'Acknowledged.',
    weight: 8,
  },
  
  // Quest completion - observant
  {
    id: 'quest.complete.observant.1',
    mode: 'observant',
    text: 'The System notes: you completed this faster than yesterday.',
    weight: 8,
  },
  {
    id: 'quest.complete.observant.2',
    mode: 'observant',
    text: 'Pattern detected: consistency is building.',
    weight: 8,
  },
  
  // Quest completion - encouraging (rare)
  {
    id: 'quest.complete.encouraging.1',
    mode: 'encouraging',
    text: 'The data speaks for itself. You are changing.',
    weight: 5,
    requiresStreak: 7,
  },
  
  // Streak update - cold
  {
    id: 'streak.update.cold.1',
    mode: 'cold',
    text: 'Streak: {{streak}} days. Continue.',
    weight: 10,
  },
  {
    id: 'streak.update.cold.2',
    mode: 'cold',
    text: '{{streak}} consecutive days recorded.',
    weight: 10,
  },
  
  // Streak update - reverent (high streaks)
  {
    id: 'streak.update.reverent.1',
    mode: 'reverent',
    text: '{{streak}} days. Few reach this far. The System observes with... interest.',
    weight: 10,
    requiresStreak: 30,
  },
  
  // Streak broken - stern
  {
    id: 'streak.broken.stern.1',
    mode: 'stern',
    text: 'Streak terminated. The pattern broke. Begin again.',
    weight: 10,
  },
  {
    id: 'streak.broken.stern.2',
    mode: 'stern',
    text: 'Zero. That is your new streak. The System does not judge. It only records.',
    weight: 10,
  },
  
  // Morning greeting - observant
  {
    id: 'morning.greeting.observant.1',
    mode: 'observant',
    text: 'Morning detected. Quests await.',
    weight: 10,
  },
  {
    id: 'morning.greeting.observant.2',
    mode: 'observant',
    text: 'A new day. The data slate is blank. Fill it.',
    weight: 8,
  },
  
  // Night time - cryptic
  {
    id: 'evening.message.cryptic.1',
    mode: 'cryptic',
    text: 'The day ends. What remains? Only what you did.',
    weight: 10,
  },
  {
    id: 'evening.message.cryptic.2',
    mode: 'cryptic',
    text: 'Tomorrow arrives regardless. Be ready.',
    weight: 8,
  },
]

/**
 * Get formatted message with context interpolation
 */
export function formatVoiceMessage(
  variant: VoiceVariant,
  context: Record<string, string | number>
): string {
  let text = variant.text
  
  for (const [key, value] of Object.entries(context)) {
    text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  }
  
  return text
}
