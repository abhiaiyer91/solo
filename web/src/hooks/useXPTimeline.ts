import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export interface XPEvent {
  id: string
  source: string
  sourceId: string | null
  baseAmount: number
  finalAmount: number
  levelBefore: number
  levelAfter: number
  totalXPBefore: number
  totalXPAfter: number
  description: string
  createdAt: string
}

interface XPTimelineResponse {
  events: XPEvent[]
}

export interface XPModifier {
  id: string
  type: string
  multiplier: number
  description: string
  order: number
}

interface XPBreakdownResponse {
  event: XPEvent
  modifiers: XPModifier[]
}

export function useXPTimeline(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['xp', 'timeline'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/xp/timeline?limit=${limit}&offset=${pageParam}`,
        { credentials: 'include' }
      )
      if (!response.ok) throw new Error('Failed to fetch XP timeline')
      const data: XPTimelineResponse = await response.json()
      return {
        events: data.events,
        nextOffset: data.events.length === limit ? pageParam + limit : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  })
}

export function useXPBreakdown(eventId: string | null) {
  return useQuery({
    queryKey: ['xp', 'breakdown', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/xp/${eventId}/breakdown`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch XP breakdown')
      return response.json() as Promise<XPBreakdownResponse>
    },
    enabled: !!eventId,
  })
}
