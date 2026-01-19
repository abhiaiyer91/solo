/**
 * XP Timeline Hook
 *
 * Fetches and manages XP history data with pagination.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type XPSource = 'quest' | 'streak' | 'bonus' | 'boss' | 'dungeon' | 'achievement' | 'level_up' | 'other'

export interface XPModifier {
  name: string
  multiplier: number
  source: string
}

export interface XPEntry {
  id: string
  amount: number
  source: XPSource
  sourceName: string // e.g., "Daily Steps", "7-Day Streak"
  timestamp: string
  date: string // For grouping
  baseAmount?: number
  modifiers?: XPModifier[]
  questId?: string
  description?: string
}

export interface XPTimelineResponse {
  entries: XPEntry[]
  hasMore: boolean
  nextCursor?: string
  total: number
}

export interface DayGroup {
  date: string
  entries: XPEntry[]
  totalXP: number
}

const PAGE_SIZE = 20

export function useXPTimeline() {
  const query = useInfiniteQuery({
    queryKey: ['xp-timeline'],
    queryFn: async ({ pageParam }) => {
      try {
        const url = pageParam
          ? `/api/player/xp-timeline?cursor=${pageParam}&limit=${PAGE_SIZE}`
          : `/api/player/xp-timeline?limit=${PAGE_SIZE}`

        const response = await api.get<XPTimelineResponse>(url)
        return response
      } catch {
        // Return sample data for development
        return generateSamplePage(pageParam as string | undefined)
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60, // 1 minute
  })

  // Flatten all pages and group by date
  const allEntries = query.data?.pages.flatMap(page => page.entries) ?? []
  
  const groupedByDay: DayGroup[] = []
  const dateMap = new Map<string, XPEntry[]>()
  
  for (const entry of allEntries) {
    const existing = dateMap.get(entry.date) ?? []
    dateMap.set(entry.date, [...existing, entry])
  }
  
  for (const [date, entries] of dateMap.entries()) {
    groupedByDay.push({
      date,
      entries,
      totalXP: entries.reduce((sum, e) => sum + e.amount, 0),
    })
  }
  
  // Sort by date descending
  groupedByDay.sort((a, b) => b.date.localeCompare(a.date))

  return {
    entries: allEntries,
    groupedByDay,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    total: query.data?.pages[0]?.total ?? 0,
  }
}

/**
 * Get source icon for XP entry
 */
export function getSourceIcon(source: XPSource): string {
  switch (source) {
    case 'quest': return '⚔️'
    case 'streak': return '🔥'
    case 'bonus': return '⭐'
    case 'boss': return '👹'
    case 'dungeon': return '🏰'
    case 'achievement': return '🏆'
    case 'level_up': return '⬆️'
    default: return '✨'
  }
}

/**
 * Get source color for XP entry
 */
export function getSourceColor(source: XPSource): string {
  switch (source) {
    case 'quest': return '#60A5FA'
    case 'streak': return '#FF6600'
    case 'bonus': return '#A855F7'
    case 'boss': return '#EF4444'
    case 'dungeon': return '#F59E0B'
    case 'achievement': return '#FBBF24'
    case 'level_up': return '#4ADE80'
    default: return '#94A3B8'
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/**
 * Format date for day header
 */
export function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today'
  }
  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * Generate sample XP timeline page for development
 */
function generateSamplePage(cursor?: string): XPTimelineResponse {
  const startIndex = cursor ? parseInt(cursor) : 0
  const entries: XPEntry[] = []

  const sources: XPSource[] = ['quest', 'streak', 'bonus', 'quest', 'quest', 'achievement']
  const questNames = ['Daily Steps', 'Workout Complete', 'Hydration Goal', '10 Min Meditation', 'Sleep Goal']

  for (let i = 0; i < PAGE_SIZE; i++) {
    const index = startIndex + i
    const daysAgo = Math.floor(index / 4) // ~4 entries per day
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(date.getHours() - (index % 4) * 3)

    const source = sources[index % sources.length]!
    const baseAmount = 30 + Math.floor(Math.random() * 50)
    const hasModifiers = Math.random() > 0.7

    entries.push({
      id: `xp-${index}`,
      amount: hasModifiers ? Math.floor(baseAmount * 1.25) : baseAmount,
      source,
      sourceName: source === 'quest'
        ? questNames[index % questNames.length]!
        : source === 'streak'
        ? `${7 + (index % 14)} Day Streak`
        : source === 'achievement'
        ? 'New Achievement Unlocked'
        : 'Bonus Reward',
      timestamp: date.toISOString(),
      date: date.toISOString().split('T')[0]!,
      baseAmount: hasModifiers ? baseAmount : undefined,
      modifiers: hasModifiers
        ? [{ name: 'Weekend Bonus', multiplier: 1.25, source: 'weekend' }]
        : undefined,
    })
  }

  const hasMore = startIndex + PAGE_SIZE < 100

  return {
    entries,
    hasMore,
    nextCursor: hasMore ? String(startIndex + PAGE_SIZE) : undefined,
    total: 100,
  }
}
