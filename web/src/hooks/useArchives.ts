import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'

export interface Archive {
  id: string
  archivedAt: string
  levelAtArchive: number
  totalXpAtArchive: number
  longestStreak: number
  currentStreak: number
  activeDays: number
  dungeonsCleared: number
  totalQuestsCompleted: number
  titlesEarned: string[]
  bossesDefeated: string[]
  seasonNumber: number | null
}

export interface ArchiveOffer {
  shouldOffer: boolean
  daysSinceActivity: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  totalXp: number
  narrative: string | null
}

export interface ArchivesResponse {
  archives: Archive[]
  totalArchives: number
}

async function checkArchiveOffer(): Promise<ArchiveOffer> {
  const res = await fetch('/api/player/archive/check', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to check archive status')
  }

  return res.json()
}

async function fetchArchives(): Promise<ArchivesResponse> {
  const res = await fetch('/api/player/archives', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch archives')
  }

  return res.json()
}

async function performSoftReset(): Promise<{ archive: Archive; message: string }> {
  const res = await fetch('/api/player/archive/reset', {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to perform soft reset')
  }

  return res.json()
}

async function declineArchive(): Promise<{ continued: boolean; message: string }> {
  const res = await fetch('/api/player/archive/decline', {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to decline archive')
  }

  return res.json()
}

export function useArchiveOffer() {
  return useQuery({
    queryKey: ['archive-offer'],
    queryFn: checkArchiveOffer,
    staleTime: 1000 * 60 * 60, // 1 hour - this doesn't change often
  })
}

export function useArchives() {
  return useQuery({
    queryKey: ['archives'],
    queryFn: fetchArchives,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSoftReset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performSoftReset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'] })
      queryClient.invalidateQueries({ queryKey: ['archives'] })
      queryClient.invalidateQueries({ queryKey: ['archive-offer'] })
      toast.system('Progress archived. Fresh start begins.')
    },
    onError: () => {
      toast.error('Failed to archive progress')
    },
  })
}

export function useDeclineArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: declineArchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-offer'] })
      toast.system('Welcome back.')
    },
    onError: () => {
      toast.error('Failed to continue')
    },
  })
}
