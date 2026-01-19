/**
 * API Mock Helpers for Testing
 * Provides utilities for mocking API responses in component tests
 */

import React from 'react'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Quest } from '@/hooks/useQuests'
import type { Player, LevelProgress } from '@/hooks/usePlayer'

// Mock Quest factory
export function createMockQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: `quest-${Math.random().toString(36).substr(2, 9)}`,
    templateId: 'template-1',
    name: 'Daily Steps',
    description: 'Walk 10,000 steps today',
    type: 'DAILY',
    category: 'MOVEMENT',
    isCore: true,
    baseXP: 50,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 50,
    status: 'ACTIVE',
    currentValue: 0,
    targetValue: 10000,
    completionPercent: 0,
    completedAt: null,
    xpAwarded: null,
    questDate: new Date().toISOString().split('T')[0],
    requirement: { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
    ...overrides,
  }
}

// Mock Player factory
export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 5,
    totalXP: 2500,
    currentStreak: 7,
    longestStreak: 14,
    perfectStreak: 3,
    str: 15,
    agi: 12,
    vit: 18,
    disc: 10,
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
    currentTitle: 'Apprentice',
    debuffActive: false,
    debuffActiveUntil: null,
    weekendBonusActive: false,
    weekendBonusPercent: 0,
    ...overrides,
  }
}

// Mock Level Progress factory
export function createMockLevelProgress(overrides: Partial<LevelProgress> = {}): LevelProgress {
  return {
    currentLevel: 5,
    xpProgress: 250,
    xpNeeded: 500,
    progressPercent: 50,
    totalXP: 2500,
    ...overrides,
  }
}

// Mock fetch response
export function mockFetchResponse<T>(data: T, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// Mock fetch error
export function mockFetchError(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message))
}

// Setup global fetch mock
export function setupFetchMock() {
  const mockFn = vi.fn()
  global.fetch = mockFn
  return mockFn
}

// Reset all mocks
export function resetMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

// Create a wrapper for React Query tests
export function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
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
