/**
 * useLeaderboard - Hook for leaderboard data (weekly, all-time, friends, guild)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { usePlayer } from './usePlayer'

export type LeaderboardType = 'weekly' | 'alltime' | 'friends' | 'guild'

export interface LeaderboardEntry {
  rank: number | null
  odai: string
  userName: string | null
  totalXP: number
  seasonalXP?: number
  level: number
  currentStreak: number
  isCurrentUser?: boolean
  isOptedOut?: boolean
  activeTitle?: string
}

export interface GuildLeaderboardEntry {
  rank: number
  guildId: string
  guildName: string
  totalXP: number
  memberCount: number
  averageXP: number
}

/**
 * Hook for fetching leaderboard data
 */
export function useLeaderboard(type: LeaderboardType = 'weekly', limit: number = 50) {
  const queryClient = useQueryClient()
  const { player } = usePlayer()

  const query = useQuery({
    queryKey: ['leaderboard', type, limit],
    queryFn: async () => {
      switch (type) {
        case 'weekly':
        case 'alltime': {
          const seasonResponse = await api.get<{ participation: { seasonId: string } | null }>(
            '/api/player/season'
          )

          if (!seasonResponse.participation?.seasonId) {
            return { leaderboard: [], currentUserEntry: null, total: 0 }
          }

          const response = await api.get<{ leaderboard: LeaderboardEntry[] }>(
            `/api/seasons/${seasonResponse.participation.seasonId}/leaderboard?limit=${limit}`
          )

          const currentUserEntry = response.leaderboard.find(
            entry => entry.userId === player?.id
          )

          return {
            leaderboard: response.leaderboard.map(entry => ({
              ...entry,
              isCurrentUser: entry.userId === player?.id,
            })),
            currentUserEntry: currentUserEntry || null,
            total: response.leaderboard.length,
          }
        }

        case 'friends': {
          const partnersResponse = await api.get<{ partners: Array<{ user1Id: string, user2Id: string, user1?: any, user2?: any }> }>(
            '/api/accountability/partners'
          )

          const friendEntries: LeaderboardEntry[] = partnersResponse.partners
            .map(partner => {
              const friend = partner.user1Id === player?.id ? partner.user2 : partner.user1
              if (!friend) return null
              return {
                rank: null,
                userId: friend.id,
                userName: friend.name,
                totalXP: friend.totalXP,
                level: friend.level,
                currentStreak: friend.currentStreak,
                isCurrentUser: false,
                activeTitle: friend.activeTitle,
              }
            })
            .filter((entry): entry is LeaderboardEntry => entry !== null)

          if (player) {
            friendEntries.push({
              rank: null,
              userId: player.id,
              userName: player.name,
              totalXP: player.totalXP,
              level: player.level,
              currentStreak: player.currentStreak,
              isCurrentUser: true,
              activeTitle: player.activeTitle,
            })
          }

          friendEntries.sort((a, b) => b.totalXP - a.totalXP)
          friendEntries.forEach((entry, index) => {
            entry.rank = index + 1
          })

          return {
            leaderboard: friendEntries,
            currentUserEntry: friendEntries.find(e => e.isCurrentUser) || null,
            total: friendEntries.length,
          }
        }

        case 'guild': {
          const response = await api.get<{ leaderboard: GuildLeaderboardEntry[] }>(
            `/api/guilds/leaderboard?limit=${limit}`
          )

          return {
            leaderboard: response.leaderboard.map((entry, index) => ({
              rank: index + 1,
              userId: entry.guildId,
              userName: entry.guildName,
              totalXP: entry.totalXP,
              level: entry.memberCount,
              currentStreak: Math.round(entry.averageXP),
              isCurrentUser: false,
            })),
            currentUserEntry: null,
            total: response.leaderboard.length,
          }
        }

        default:
          return { leaderboard: [], currentUserEntry: null, total: 0 }
      }
    },
    enabled: !!player,
    staleTime: 60 * 1000,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['leaderboard', type] })
  }

  // Transform leaderboard entries for the simpler UI format
  const transformedLeaderboard = (query.data?.leaderboard || []).map(entry => ({
    rank: entry.rank ?? 0,
    player: {
      id: entry.odai || '',
      name: entry.userName || 'Anonymous',
      level: entry.level,
      xp: entry.totalXP,
      streak: entry.currentStreak,
    },
    isCurrentUser: entry.isCurrentUser ?? false,
  }))

  const currentUserRank = query.data?.currentUserEntry?.rank ?? null

  return {
    // Simplified accessors for common UI patterns
    leaderboard: transformedLeaderboard,
    currentUserRank,
    isLoading: query.isLoading,
    refetch: refresh,

    // Detailed accessors
    rawLeaderboard: query.data?.leaderboard || [],
    currentUserEntry: query.data?.currentUserEntry,
    total: query.data?.total || 0,
    isRefetching: query.isRefetching,
    error: query.error,
    refresh,
  }
}
