/**
 * useQuests Hook Tests
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuests } from './useQuests'

interface Quest {
  id: string
  name: string
  status: string
  currentValue: number
  targetValue: number
  baseXP: number
  xpAwarded?: number
}

// Mock the API
jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      quests: [
        {
          id: 'quest-1',
          name: 'Daily Steps',
          status: 'ACTIVE',
          currentValue: 5000,
          targetValue: 10000,
          baseXP: 50,
        },
        {
          id: 'quest-2',
          name: 'Workout',
          status: 'COMPLETED',
          currentValue: 1,
          targetValue: 1,
          baseXP: 75,
          xpAwarded: 75,
        },
      ],
    }),
    post: jest.fn().mockResolvedValue({ success: true }),
  },
  queryKeys: {
    quests: () => ['quests'],
  },
}))

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useQuests', () => {
  describe('fetching quests', () => {
    it('returns quests from API', async () => {
      const { result } = renderHook(() => useQuests(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.quests).toHaveLength(2)
      expect(result.current.quests[0].name).toBe('Daily Steps')
    })

    it('separates active and completed quests', async () => {
      const { result } = renderHook(() => useQuests(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const active = result.current.quests.filter((q: Quest) => q.status === 'ACTIVE')
      const completed = result.current.quests.filter((q: Quest) => q.status === 'COMPLETED')

      expect(active).toHaveLength(1)
      expect(completed).toHaveLength(1)
    })
  })

  describe('loading state', () => {
    it('starts with isLoading true', () => {
      const { result } = renderHook(() => useQuests(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })
  })
})
