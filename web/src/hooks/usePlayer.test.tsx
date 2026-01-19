import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePlayer, useLevelProgress } from './usePlayer'
import { createMockPlayer, createMockLevelProgress } from '@/test/mocks/api'
import type { ReactNode } from 'react'

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePlayer', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('Successful fetch', () => {
    it('should fetch and return player data', async () => {
      const mockPlayer = createMockPlayer({ name: 'Test Hunter', level: 10 })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlayer),
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPlayer)
      expect(result.current.data?.name).toBe('Test Hunter')
      expect(result.current.data?.level).toBe(10)
    })

    it('should include all player stats', async () => {
      const mockPlayer = createMockPlayer({
        str: 20,
        agi: 15,
        vit: 25,
        disc: 12,
      })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlayer),
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.str).toBe(20)
      expect(result.current.data?.agi).toBe(15)
      expect(result.current.data?.vit).toBe(25)
      expect(result.current.data?.disc).toBe(12)
    })

    it('should include streak information', async () => {
      const mockPlayer = createMockPlayer({
        currentStreak: 7,
        longestStreak: 30,
        perfectStreak: 5,
      })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlayer),
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.currentStreak).toBe(7)
      expect(result.current.data?.longestStreak).toBe(30)
      expect(result.current.data?.perfectStreak).toBe(5)
    })
  })

  describe('Loading state', () => {
    it('should have isLoading true initially', () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('Error handling', () => {
    it('should handle fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should handle network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('API call', () => {
    it('should call correct endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockPlayer()),
      })

      renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/player', expect.objectContaining({
          credentials: 'include',
        }))
      })
    })
  })

  describe('Weekend bonus', () => {
    it('should include weekend bonus status', async () => {
      const mockPlayer = createMockPlayer({
        weekendBonusActive: true,
        weekendBonusPercent: 20,
      })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlayer),
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.weekendBonusActive).toBe(true)
      expect(result.current.data?.weekendBonusPercent).toBe(20)
    })
  })

  describe('Debuff status', () => {
    it('should include debuff information', async () => {
      const mockPlayer = createMockPlayer({
        debuffActive: true,
        debuffActiveUntil: '2026-01-20T00:00:00Z',
      })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlayer),
      })

      const { result } = renderHook(() => usePlayer(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.debuffActive).toBe(true)
      expect(result.current.data?.debuffActiveUntil).toBe('2026-01-20T00:00:00Z')
    })
  })
})

describe('useLevelProgress', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should fetch level progress data', async () => {
    const mockProgress = createMockLevelProgress({
      currentLevel: 10,
      xpProgress: 300,
      xpNeeded: 600,
      progressPercent: 50,
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProgress),
    })

    const { result } = renderHook(() => useLevelProgress(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.currentLevel).toBe(10)
    expect(result.current.data?.progressPercent).toBe(50)
  })

  it('should call correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createMockLevelProgress()),
    })

    renderHook(() => useLevelProgress(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/player/level-progress', expect.objectContaining({
        credentials: 'include',
      }))
    })
  })

  it('should handle error gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    const { result } = renderHook(() => useLevelProgress(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
