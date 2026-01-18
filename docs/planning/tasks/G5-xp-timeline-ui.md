# G5: Build XP Timeline Component

## Overview

Create the XP Timeline UI that displays the player's XP transaction history, showing how XP was earned and any modifiers applied.

## Context

**Current State:**
- Backend has `/api/xp/timeline` returning XP events
- Backend has `/api/xp/:eventId/breakdown` for modifier details
- No frontend displays this data

**Dependencies:**
- Requires G1-dashboard-connection (api client pattern)

**XP Event Structure:**
```typescript
{
  id: string
  source: 'QUEST_COMPLETION' | 'STREAK_BONUS' | 'BOSS_DEFEAT' | etc
  baseAmount: number
  finalAmount: number
  levelBefore: number
  levelAfter: number
  totalXPBefore: bigint
  totalXPAfter: bigint
  description: string
  createdAt: string
}
```

## Acceptance Criteria

- [ ] `useXPTimeline` hook fetches paginated timeline
- [ ] `XPTimelineItem` displays individual XP event
- [ ] `XPTimeline` component shows scrollable list
- [ ] Events show source, amount, and time
- [ ] Level-up events highlighted
- [ ] Click event shows modifier breakdown
- [ ] Infinite scroll or pagination
- [ ] Timeline integrates into Dashboard or Stats

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/hooks/useXPTimeline.ts` | Create | Timeline data hook |
| `web/src/components/xp/XPTimelineItem.tsx` | Create | Single event display |
| `web/src/components/xp/XPTimeline.tsx` | Create | Timeline container |
| `web/src/components/xp/XPBreakdownModal.tsx` | Create | Modifier details |
| `web/src/pages/Dashboard.tsx` | Modify | Add timeline section |

## Implementation Guide

### Step 1: Create useXPTimeline Hook

Create `web/src/hooks/useXPTimeline.ts`:

```typescript
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface XPEvent {
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

interface XPModifier {
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
      const response = await api.get<XPTimelineResponse>(
        `/api/xp/timeline?limit=${limit}&offset=${pageParam}`
      )
      return {
        events: response.events,
        nextOffset: response.events.length === limit ? pageParam + limit : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  })
}

export function useXPBreakdown(eventId: string | null) {
  return useQuery({
    queryKey: ['xp', 'breakdown', eventId],
    queryFn: () => api.get<XPBreakdownResponse>(`/api/xp/${eventId}/breakdown`),
    enabled: !!eventId,
  })
}
```

### Step 2: Create XPTimelineItem Component

Create `web/src/components/xp/XPTimelineItem.tsx`:

```typescript
import { motion } from 'framer-motion'

interface XPEvent {
  id: string
  source: string
  baseAmount: number
  finalAmount: number
  levelBefore: number
  levelAfter: number
  description: string
  createdAt: string
}

interface XPTimelineItemProps {
  event: XPEvent
  onClick: () => void
}

const sourceIcons: Record<string, string> = {
  QUEST_COMPLETION: '⚔',
  STREAK_BONUS: '🔥',
  BOSS_DEFEAT: '👹',
  DUNGEON_CLEAR: '🏰',
  LEVEL_UP: '⬆',
  DEFAULT: '◈',
}

const sourceColors: Record<string, string> = {
  QUEST_COMPLETION: 'text-system-blue',
  STREAK_BONUS: 'text-system-gold',
  BOSS_DEFEAT: 'text-system-purple',
  DUNGEON_CLEAR: 'text-system-green',
  DEFAULT: 'text-system-text-muted',
}

export function XPTimelineItem({ event, onClick }: XPTimelineItemProps) {
  const isLevelUp = event.levelAfter > event.levelBefore
  const hasModifiers = event.finalAmount !== event.baseAmount
  const icon = sourceIcons[event.source] || sourceIcons.DEFAULT
  const color = sourceColors[event.source] || sourceColors.DEFAULT

  const timeAgo = getTimeAgo(new Date(event.createdAt))

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`
        flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors
        ${isLevelUp
          ? 'border-system-gold/50 bg-system-gold/5'
          : 'border-system-border hover:border-system-blue/30 hover:bg-system-panel/50'
        }
      `}
    >
      {/* Icon */}
      <div className={`text-xl ${color}`}>{icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-system-text text-sm truncate">
            {event.description}
          </span>
          <span className="text-system-green font-bold text-sm whitespace-nowrap">
            +{event.finalAmount} XP
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-system-text-muted text-xs">{timeAgo}</span>
          {hasModifiers && (
            <span className="text-system-gold text-xs">
              (base: {event.baseAmount})
            </span>
          )}
          {isLevelUp && (
            <span className="px-1.5 py-0.5 text-xs bg-system-gold/20 text-system-gold rounded">
              LEVEL {event.levelAfter}
            </span>
          )}
        </div>
      </div>

      {/* Expand indicator */}
      <div className="text-system-text-muted text-xs">›</div>
    </motion.div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}
```

### Step 3: Create XPBreakdownModal Component

Create `web/src/components/xp/XPBreakdownModal.tsx`:

```typescript
import { motion, AnimatePresence } from 'framer-motion'
import { useXPBreakdown } from '@/hooks/useXPTimeline'

interface XPBreakdownModalProps {
  eventId: string | null
  onClose: () => void
}

export function XPBreakdownModal({ eventId, onClose }: XPBreakdownModalProps) {
  const { data, isLoading } = useXPBreakdown(eventId)

  if (!eventId) return null

  return (
    <AnimatePresence>
      {eventId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
          >
            <div className="system-window p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-system-blue">
                  XP BREAKDOWN
                </h3>
                <button
                  onClick={onClose}
                  className="text-system-text-muted hover:text-system-text"
                >
                  ✕
                </button>
              </div>

              {isLoading ? (
                <div className="text-system-text-muted text-center py-8">
                  Loading...
                </div>
              ) : data ? (
                <div className="space-y-4">
                  {/* Event description */}
                  <div className="text-system-text">
                    {data.event.description}
                  </div>

                  {/* Calculation breakdown */}
                  <div className="border border-system-border rounded p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-system-text-muted">Base XP</span>
                      <span className="text-system-text">
                        {data.event.baseAmount}
                      </span>
                    </div>

                    {data.modifiers.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-system-text-muted">
                          {mod.description}
                        </span>
                        <span
                          className={
                            mod.multiplier >= 1
                              ? 'text-system-green'
                              : 'text-system-red'
                          }
                        >
                          ×{mod.multiplier.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-system-border pt-2 flex justify-between font-bold">
                      <span className="text-system-text">Final XP</span>
                      <span className="text-system-green">
                        +{data.event.finalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Level info */}
                  {data.event.levelAfter > data.event.levelBefore && (
                    <div className="bg-system-gold/10 border border-system-gold/30 rounded p-3 text-center">
                      <div className="text-system-gold font-bold">
                        LEVEL UP!
                      </div>
                      <div className="text-system-text-muted text-sm">
                        Level {data.event.levelBefore} → Level{' '}
                        {data.event.levelAfter}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-system-text-muted text-xs text-center">
                    {new Date(data.event.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-system-text-muted text-center py-8">
                  Event not found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Step 4: Create XPTimeline Component

Create `web/src/components/xp/XPTimeline.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react'
import { XPTimelineItem } from './XPTimelineItem'
import { XPBreakdownModal } from './XPBreakdownModal'
import { useXPTimeline } from '@/hooks/useXPTimeline'

export function XPTimeline() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useXPTimeline()

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allEvents = data?.pages.flatMap((page) => page.events) ?? []

  if (isLoading) {
    return (
      <div className="text-system-text-muted text-center py-8">
        Loading XP history...
      </div>
    )
  }

  if (allEvents.length === 0) {
    return (
      <div className="text-system-text-muted text-center py-8">
        No XP events yet. Complete quests to earn XP!
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {allEvents.map((event) => (
          <XPTimelineItem
            key={event.id}
            event={event}
            onClick={() => setSelectedEventId(event.id)}
          />
        ))}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-4">
          {isFetchingNextPage && (
            <div className="text-system-text-muted text-center text-sm">
              Loading more...
            </div>
          )}
        </div>
      </div>

      <XPBreakdownModal
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
      />
    </>
  )
}
```

### Step 5: Create Index Export

Create `web/src/components/xp/index.ts`:

```typescript
export { XPTimeline } from './XPTimeline'
export { XPTimelineItem } from './XPTimelineItem'
export { XPBreakdownModal } from './XPBreakdownModal'
```

### Step 6: Add to Dashboard

Add XP Timeline section to Dashboard:

```typescript
import { XPTimeline } from '@/components/xp'

// In Dashboard render:
<div className="system-window p-6">
  <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
    <span className="w-2 h-2 bg-system-green rounded-full" />
    XP HISTORY
  </h2>
  <XPTimeline />
</div>
```

## Testing

1. **Timeline Display:**
   - Complete quests to generate XP events
   - Verify events appear in timeline
   - Verify newest events at top

2. **Infinite Scroll:**
   - Generate 30+ events
   - Scroll to bottom
   - Verify more events load

3. **Breakdown Modal:**
   - Click an event
   - Verify modal shows base XP and modifiers
   - Verify calculation adds up to final amount

4. **Level Up Highlight:**
   - Level up via quest completion
   - Verify level-up event highlighted in gold

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] Timeline shows XP events
- [ ] Infinite scroll works
- [ ] Breakdown modal shows modifiers
- [ ] Level-up events highlighted
- [ ] No TypeScript errors
- [ ] Responsive on mobile
