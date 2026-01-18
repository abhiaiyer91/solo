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
        <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
      <div className="space-y-2 max-h-96 overflow-y-auto">
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
