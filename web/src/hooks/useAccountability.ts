/**
 * useAccountability - Hook for accountability partners
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface AccountabilityPartner {
  id: string
  partnerId: string
  partnerName: string | null
  status: 'pending' | 'active' | 'disconnected'
  role: 'requester' | 'responder'
  weeklyCompletion: DayCompletion[]
  todayCompletion: number // percentage
  lastNudgeAt: string | null
  canNudge: boolean
  connectedAt: string
}

export interface DayCompletion {
  date: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  completed: boolean | null // null = no data
}

export interface PendingRequest {
  id: string
  requesterId: string
  requesterName: string | null
  message?: string
  createdAt: string
}

export interface AccountabilityData {
  partners: AccountabilityPartner[]
  pendingRequests: PendingRequest[]
  canAddPartner: boolean
  maxPartners: number
}

/**
 * Hook for accountability data
 */
export function useAccountability() {
  return useQuery({
    queryKey: ['accountability'],
    queryFn: async () => {
      const response = await api.get<AccountabilityData>('/api/accountability')
      return response
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Hook for sending partner request
 */
export function useSendPartnerRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { username?: string; email?: string; message?: string }) => {
      return api.post<{ success: boolean; requestId: string }>('/api/accountability/request', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountability'] })
    },
  })
}

/**
 * Hook for responding to partner request
 */
export function useRespondToRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { requestId: string; accept: boolean }) => {
      return api.post<{ success: boolean }>('/api/accountability/respond', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountability'] })
    },
  })
}

/**
 * Hook for sending nudge
 */
export function useSendNudge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (partnerId: string) => {
      return api.post<{ success: boolean }>('/api/accountability/nudge', { partnerId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountability'] })
    },
  })
}

/**
 * Hook for disconnecting partner
 */
export function useDisconnectPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (partnerId: string) => {
      return api.delete(`/api/accountability/partner/${partnerId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountability'] })
    },
  })
}

/**
 * Get status color
 */
export function getStatusColor(status: AccountabilityPartner['status']): string {
  switch (status) {
    case 'active': return 'text-green-400'
    case 'pending': return 'text-yellow-400'
    case 'disconnected': return 'text-gray-400'
  }
}

/**
 * Get completion color based on percentage
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-400'
  if (percentage >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Generate invite link
 */
export function generateInviteLink(userId: string): string {
  // In production, this would generate a proper invite link
  return `${window.location.origin}/accountability/invite/${userId}`
}
