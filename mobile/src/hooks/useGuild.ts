/**
 * useGuild - Hook for guild data and actions
 */

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Guild {
  id: string
  name: string
  description?: string
  isPublic: boolean
  minLevel: number
  memberCount: number
  maxMembers: number
  totalXP: number
  weeklyXP: number
  leaderId: string
}

export interface GuildMember {
  id: string
  odai: string
  name: string
  level: number
  totalXP: number
  weeklyContribution: number
  role: 'LEADER' | 'OFFICER' | 'MEMBER'
  joinedAt: string
}

export interface GuildActivity {
  id: string
  type: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'QUEST_COMPLETED' | 'LEVEL_UP' | 'XP_MILESTONE'
  odai: string
  username: string
  message: string
  xp?: number
  timestamp: string
}

export interface GuildDetails extends Guild {
  members: GuildMember[]
}

export interface CreateGuildInput {
  name: string
  description?: string
  isPublic: boolean
  minLevel: number
}

export function useGuild() {
  const queryClient = useQueryClient()
  const [publicGuilds, setPublicGuilds] = useState<Guild[]>([])
  const [isLoadingPublic, setIsLoadingPublic] = useState(false)
  const [guildDetails, setGuildDetails] = useState<GuildDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const currentGuildQuery = useQuery({
    queryKey: ['currentGuild'],
    queryFn: async () => {
      const response = await api.get<{ guild: GuildDetails | null }>('/api/player/guild')
      return response.guild
    },
  })

  const fetchPublicGuilds = useCallback(async () => {
    setIsLoadingPublic(true)
    try {
      const response = await api.get<{ guilds: Guild[] }>('/api/guilds?public=true')
      setPublicGuilds(response.guilds)
    } finally {
      setIsLoadingPublic(false)
    }
  }, [])

  const fetchGuildDetails = useCallback(async (guildId: string) => {
    setIsLoadingDetails(true)
    try {
      const response = await api.get<GuildDetails>(`/api/guilds/${guildId}`)
      setGuildDetails(response)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])

  const createGuild = useCallback(async (data: CreateGuildInput) => {
    try {
      await api.post('/api/guilds', data)
      queryClient.invalidateQueries({ queryKey: ['currentGuild'] })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create guild' }
    }
  }, [queryClient])

  const joinGuild = useCallback(async (guildId: string) => {
    try {
      await api.post(`/api/guilds/${guildId}/join`)
      queryClient.invalidateQueries({ queryKey: ['currentGuild'] })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to join guild' }
    }
  }, [queryClient])

  const leaveGuild = useCallback(async () => {
    try {
      await api.post('/api/guilds/leave')
      queryClient.invalidateQueries({ queryKey: ['currentGuild'] })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to leave guild' }
    }
  }, [queryClient])

  return {
    // Simplified accessors for common use cases
    guild: currentGuildQuery.data,
    isInGuild: !!currentGuildQuery.data,
    isLoading: currentGuildQuery.isLoading,
    refetch: currentGuildQuery.refetch,

    // Detailed accessors
    currentGuild: currentGuildQuery.data,
    isLoadingCurrent: currentGuildQuery.isLoading,
    publicGuilds,
    isLoadingPublic,
    guildDetails,
    isLoadingDetails,
    fetchPublicGuilds,
    fetchGuildDetails,
    createGuild,
    joinGuild,
    leaveGuild,
  }
}
