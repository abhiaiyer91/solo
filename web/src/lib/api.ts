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
  playerDebuff: () => ['player', 'debuff'] as const,
  levelProgress: () => ['player', 'level-progress'] as const,

  quests: () => ['quests'] as const,
  questsToday: () => ['quests', 'today'] as const,
  questsWeekly: () => ['quests', 'weekly'] as const,
  quest: (id: string) => ['quests', id] as const,

  xpTimeline: () => ['xp', 'timeline'] as const,
  xpBreakdown: (eventId: string) => ['xp', 'breakdown', eventId] as const,

  content: (key: string) => ['content', key] as const,
  contentCategory: (category: string) => ['content', 'category', category] as const,
}
