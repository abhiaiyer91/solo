/**
 * Loading Skeleton Components
 * Shimmer loading states for better UX
 */

import { motion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════
// BASE SKELETON
// ═══════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-800/50 rounded ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// QUEST CARD SKELETON
// ═══════════════════════════════════════════════════════════

export function QuestCardSkeleton() {
  return (
    <div className="bg-system-black/60 border border-system-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Skeleton className="w-5 h-5 rounded" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title */}
          <Skeleton className="h-4 w-3/4" />
          
          {/* Description */}
          <Skeleton className="h-3 w-1/2" />
          
          {/* Progress bar */}
          <Skeleton className="h-2 w-full mt-2" />
        </div>
        
        {/* XP badge */}
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function QuestListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <QuestCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STAT CARD SKELETON
// ═══════════════════════════════════════════════════════════

export function StatCardSkeleton() {
  return (
    <div className="bg-system-black/60 border border-system-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-8" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HEXAGON CHART SKELETON
// ═══════════════════════════════════════════════════════════

export function HexagonSkeleton() {
  return (
    <div className="relative aspect-square flex items-center justify-center">
      <Skeleton className="w-48 h-48 rounded-full" />
      
      {/* Stat labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2">
        <Skeleton className="w-10 h-4" />
      </div>
      <div className="absolute top-1/4 right-4">
        <Skeleton className="w-10 h-4" />
      </div>
      <div className="absolute bottom-1/4 right-4">
        <Skeleton className="w-10 h-4" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <Skeleton className="w-10 h-4" />
      </div>
      <div className="absolute bottom-1/4 left-4">
        <Skeleton className="w-10 h-4" />
      </div>
      <div className="absolute top-1/4 left-4">
        <Skeleton className="w-10 h-4" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PROFILE HEADER SKELETON
// ═══════════════════════════════════════════════════════════

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <Skeleton className="w-16 h-16 rounded-full" />
      
      {/* Info */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// XP TIMELINE SKELETON
// ═══════════════════════════════════════════════════════════

export function XPTimelineItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-2">
      <Skeleton className="w-8 h-8 rounded" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-14" />
    </div>
  )
}

export function XPTimelineSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <XPTimelineItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// FEED ITEM SKELETON
// ═══════════════════════════════════════════════════════════

export function FeedItemSkeleton() {
  return (
    <div className="bg-system-black/50 border border-system-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FeedItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TITLE CARD SKELETON
// ═══════════════════════════════════════════════════════════

export function TitleCardSkeleton() {
  return (
    <div className="bg-system-black/60 border border-system-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function TitleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// BOSS CARD SKELETON
// ═══════════════════════════════════════════════════════════

export function BossCardSkeleton() {
  return (
    <div className="bg-system-black/60 border border-red-900/30 rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="mt-4">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// DUNGEON CARD SKELETON
// ═══════════════════════════════════════════════════════════

export function DungeonCardSkeleton() {
  return (
    <div className="bg-system-black/60 border border-teal-900/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LEADERBOARD SKELETON
// ═══════════════════════════════════════════════════════════

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-system-border">
      <Skeleton className="w-8 h-8 rounded" />
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PAGE SKELETONS
// ═══════════════════════════════════════════════════════════

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <ProfileHeaderSkeleton />
      <StatsGridSkeleton />
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <QuestListSkeleton count={4} />
      </div>
    </div>
  )
}

export function StatsPageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <HexagonSkeleton />
      <StatsGridSkeleton />
      <div>
        <Skeleton className="h-5 w-40 mb-3" />
        <XPTimelineSkeleton count={5} />
      </div>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <ProfileHeaderSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}
