import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'

export type TitleRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type TitleCategory = 'streak' | 'boss' | 'dungeon' | 'seasonal' | 'achievement' | 'hard_mode'

export interface Title {
  id: string
  name: string
  description: string
  category: TitleCategory
  rarity: TitleRarity
  requirement: string
  passiveEffect?: string
  passiveValue?: number
  isEarned: boolean
  earnedAt?: string
  isActive: boolean
  isSeasonExclusive?: boolean
  seasonId?: string
}

export interface TitlesResponse {
  titles: Title[]
  activeTitle: Title | null
  totalEarned: number
  totalAvailable: number
}

async function fetchTitles(): Promise<TitlesResponse> {
  const res = await fetch('/api/player/titles', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch titles')
  }

  return res.json()
}

async function setActiveTitle(titleId: string | null): Promise<{ activeTitle: Title | null }> {
  const res = await fetch('/api/player/titles/active', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titleId }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to set active title')
  }

  return res.json()
}

export function useTitles() {
  return useQuery({
    queryKey: ['titles'],
    queryFn: fetchTitles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSetActiveTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setActiveTitle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['titles'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
      if (data.activeTitle) {
        toast.success(`Title equipped: ${data.activeTitle.name}`)
      } else {
        toast.system('Title removed')
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to set title')
    },
  })
}

export function getRarityColor(rarity: TitleRarity): string {
  switch (rarity) {
    case 'common':
      return 'text-system-text-muted'
    case 'uncommon':
      return 'text-system-green'
    case 'rare':
      return 'text-system-blue'
    case 'epic':
      return 'text-system-purple'
    case 'legendary':
      return 'text-system-gold'
    default:
      return 'text-system-text'
  }
}

export function getRarityBorderColor(rarity: TitleRarity): string {
  switch (rarity) {
    case 'common':
      return 'border-system-border'
    case 'uncommon':
      return 'border-system-green/50'
    case 'rare':
      return 'border-system-blue/50'
    case 'epic':
      return 'border-system-purple/50'
    case 'legendary':
      return 'border-system-gold/50'
    default:
      return 'border-system-border'
  }
}

export function getCategoryIcon(category: TitleCategory): string {
  switch (category) {
    case 'streak':
      return '🔥'
    case 'boss':
      return '⚔️'
    case 'dungeon':
      return '🏰'
    case 'seasonal':
      return '🌟'
    case 'achievement':
      return '🏆'
    case 'hard_mode':
      return '💀'
    default:
      return '📜'
  }
}
