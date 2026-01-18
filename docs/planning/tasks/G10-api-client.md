# G10: Create Shared API Client

## Overview

Create a centralized API client that handles authentication, base URL configuration, and typed requests. This avoids duplicating fetch logic across hooks.

## Context

**Current State:**
- Auth uses `better-auth/react` client
- No shared API client for game endpoints
- Each hook would need to duplicate fetch logic

**This task is independent** - no dependencies on other tasks.

## Acceptance Criteria

- [ ] `api.ts` exports typed fetch helpers
- [ ] Base URL configured from environment
- [ ] Auth credentials included automatically
- [ ] Error responses parsed consistently
- [ ] TypeScript generics for type-safe responses
- [ ] Reusable across all hooks

## Files to Create

| File | Action | Description |
|------|--------|-------------|
| `web/src/lib/api.ts` | Create | API client |

## Implementation Guide

### Create API Client

Create `web/src/lib/api.ts`:

```typescript
/**
 * Centralized API client for game endpoints
 *
 * Usage:
 *   const data = await api.get<PlayerResponse>('/api/player')
 *   const result = await api.post<QuestResult>('/api/quests/123/complete', { data })
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiErrorResponse {
  error?: string
  message?: string
  details?: unknown
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse = {}
    try {
      errorData = await response.json()
    } catch {
      // Response wasn't JSON
    }

    throw new ApiError(
      errorData.message || errorData.error || `API error: ${response.status}`,
      response.status,
      errorData.error,
      errorData.details
    )
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include auth cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  return handleResponse<T>(response)
}

/**
 * API client with typed methods
 */
export const api = {
  /**
   * GET request
   * @example const player = await api.get<Player>('/api/player')
   */
  get: <T>(endpoint: string, options?: Omit<RequestInit, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   * @example const result = await api.post<Result>('/api/quests/1/complete', { data })
   */
  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestInit, 'method' | 'body'>
  ) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  /**
   * PUT request
   * @example await api.put('/api/player/title', { titleId: '123' })
   */
  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestInit, 'method' | 'body'>
  ) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  /**
   * PATCH request
   * @example await api.patch('/api/player', { timezone: 'America/New_York' })
   */
  patch: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestInit, 'method' | 'body'>
  ) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  /**
   * DELETE request
   * @example await api.delete('/api/guilds/123/leave')
   */
  delete: <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method' | 'body'>
  ) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
}

/**
 * Type-safe query key builder for TanStack Query
 * Ensures consistent cache keys across the app
 */
export const queryKeys = {
  player: () => ['player'] as const,
  playerStats: () => ['player', 'stats'] as const,
  playerStreak: () => ['player', 'streak'] as const,
  levelProgress: () => ['player', 'level-progress'] as const,

  quests: () => ['quests'] as const,
  questsToday: () => ['quests', 'today'] as const,
  quest: (id: string) => ['quests', id] as const,

  xpTimeline: () => ['xp', 'timeline'] as const,
  xpBreakdown: (eventId: string) => ['xp', 'breakdown', eventId] as const,
}
```

## Usage Examples

### In a Hook

```typescript
// web/src/hooks/useQuests.ts
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'

interface Quest {
  id: string
  name: string
  // ...
}

interface QuestsResponse {
  quests: Quest[]
  date: string
}

export function useQuests() {
  return useQuery({
    queryKey: queryKeys.questsToday(),
    queryFn: () => api.get<QuestsResponse>('/api/quests'),
  })
}
```

### For a Mutation

```typescript
// web/src/hooks/useCompleteQuest.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'

export function useCompleteQuest(questId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { data: Record<string, number | boolean> }) =>
      api.post<CompleteQuestResponse>(`/api/quests/${questId}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() })
      queryClient.invalidateQueries({ queryKey: queryKeys.player() })
    },
  })
}
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api'

try {
  await api.post('/api/quests/123/complete', data)
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status) // 400, 401, 500, etc.
    console.log(error.code)   // 'VALIDATION_ERROR', etc.
    console.log(error.message) // Human-readable message
  }
}
```

## Testing

1. **GET Request:**
   ```typescript
   const player = await api.get('/api/player')
   // Should return player data
   ```

2. **POST Request:**
   ```typescript
   const result = await api.post('/api/quests/123/complete', { data: { steps: 10000 } })
   // Should return completion result
   ```

3. **Error Handling:**
   ```typescript
   try {
     await api.get('/api/nonexistent')
   } catch (e) {
     // Should be ApiError with status 404
   }
   ```

4. **Auth Included:**
   - Make request while logged in
   - Verify auth cookie sent (check Network tab)

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] `api.ts` created with all methods
- [ ] ApiError class handles errors consistently
- [ ] queryKeys helper exported
- [ ] TypeScript generics work correctly
- [ ] No console errors
