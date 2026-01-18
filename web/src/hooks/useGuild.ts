import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface GuildMember {
  id: string
  guildId: string
  userId: string
  role: 'LEADER' | 'OFFICER' | 'MEMBER'
  status: 'ACTIVE' | 'LEFT' | 'KICKED'
  contributedXP: number
  joinedAt: string
}

export interface Guild {
  id: string
  name: string
  description: string | null
  leaderId: string
  rank: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  totalXP: number
  weeklyXP: number
  minLevel: number
  maxMembers: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  members: GuildMember[]
  memberCount: number
}

export interface GuildLeaderboardEntry {
  guild: Guild
  memberCount: number
  rank: number
}

export interface CreateGuildInput {
  name: string
  description?: string
  isPublic?: boolean
  minLevel?: number
}

// API Functions
async function fetchUserGuild(): Promise<{ guild: Guild | null }> {
  const res = await fetch('/api/guilds/me', {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch guild')
  return res.json()
}

async function fetchPublicGuilds(limit = 20): Promise<{ guilds: Guild[] }> {
  const res = await fetch(`/api/guilds?limit=${limit}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch public guilds')
  return res.json()
}

async function fetchGuildLeaderboard(
  limit = 10
): Promise<{ leaderboard: GuildLeaderboardEntry[] }> {
  const res = await fetch(`/api/guilds/leaderboard?limit=${limit}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch guild leaderboard')
  return res.json()
}

async function createGuild(
  input: CreateGuildInput
): Promise<{ guild: Guild; message: string }> {
  const res = await fetch('/api/guilds', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create guild')
  }
  return res.json()
}

async function joinGuild(
  guildId: string
): Promise<{ member: GuildMember; message: string }> {
  const res = await fetch(`/api/guilds/${guildId}/join`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to join guild')
  }
  return res.json()
}

async function leaveGuild(): Promise<{ message: string }> {
  const res = await fetch('/api/guilds/leave', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to leave guild')
  }
  return res.json()
}

async function inviteToGuild(userId: string): Promise<{ message: string }> {
  const res = await fetch('/api/guilds/invite', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to send invite')
  }
  return res.json()
}

// Hooks
export function useUserGuild() {
  return useQuery({
    queryKey: ['guild', 'me'],
    queryFn: fetchUserGuild,
  })
}

export function usePublicGuilds(limit = 20) {
  return useQuery({
    queryKey: ['guilds', 'public', limit],
    queryFn: () => fetchPublicGuilds(limit),
  })
}

export function useGuildLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['guilds', 'leaderboard', limit],
    queryFn: () => fetchGuildLeaderboard(limit),
  })
}

export function useCreateGuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild'] })
      queryClient.invalidateQueries({ queryKey: ['guilds'] })
    },
  })
}

export function useJoinGuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: joinGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild'] })
      queryClient.invalidateQueries({ queryKey: ['guilds'] })
    },
  })
}

export function useLeaveGuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild'] })
      queryClient.invalidateQueries({ queryKey: ['guilds'] })
    },
  })
}

export function useInviteToGuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inviteToGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild'] })
    },
  })
}
