/**
 * Mobile API client for game endpoints
 * Similar to web/src/lib/api.ts but adapted for React Native
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Get API URL from environment or use default
const API_BASE_URL = 
  Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch {
    return null;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      // Response wasn't JSON
    }

    throw new ApiError(
      errorData.message || errorData.error || `API error: ${response.status}`,
      response.status,
      errorData.error,
      errorData.details
    );
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  return handleResponse<T>(response);
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
   */
  delete: <T>(
    endpoint: string,
    options?: Omit<RequestInit, 'method' | 'body'>
  ) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Type-safe query key builder for TanStack Query
 */
export const queryKeys = {
  player: () => ['player'] as const,
  playerStats: () => ['player', 'stats'] as const,
  playerStreak: () => ['player', 'streak'] as const,
  playerTitles: () => ['player', 'titles'] as const,

  quests: () => ['quests'] as const,
  questsToday: () => ['quests', 'today'] as const,
  questsWeekly: () => ['quests', 'weekly'] as const,
  quest: (id: string) => ['quests', id] as const,

  healthData: () => ['health'] as const,

  // Fitness tests
  fitnessTests: () => ['fitness-tests'] as const,
  fitnessTestsMandatory: () => ['fitness-tests', 'mandatory'] as const,
  fitnessTestsStatus: () => ['fitness-tests', 'mandatory', 'status'] as const,
  fitnessTestsNext: () => ['fitness-tests', 'mandatory', 'next'] as const,
  fitnessTestsHistory: () => ['fitness-tests', 'history'] as const,
  fitnessTestsPersonalRecords: () => ['fitness-tests', 'personal-records'] as const,
  fitnessTestsStats: () => ['fitness-tests', 'stats'] as const,
};
