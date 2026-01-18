# G1: Connect Dashboard to Backend APIs

## Overview

The Dashboard currently displays hardcoded quest data. This task connects it to the real backend APIs so users see their actual quests, XP progress, and stats.

## Context

**Current State:**
- Backend has working endpoints: `/api/quests`, `/api/player`, `/api/player/level-progress`
- Dashboard shows static placeholder data
- Auth is working (useAuth hook exists)

**Related Files:**
- `web/src/pages/Dashboard.tsx` - Current dashboard with hardcoded data
- `server/src/index.ts` - API endpoints
- `web/src/hooks/useAuth.ts` - Existing auth hook pattern to follow

**API Endpoints Available:**
```
GET /api/quests - Returns today's quests for authenticated user
GET /api/player - Returns player profile with stats
GET /api/player/level-progress - Returns XP progress to next level
```

## Acceptance Criteria

- [ ] `useQuests` hook fetches from `/api/quests` with TanStack Query
- [ ] `useLevelProgress` hook fetches from `/api/player/level-progress`
- [ ] Dashboard displays real quest data from API
- [ ] XP progress bar shows actual values from API
- [ ] Loading state shown while fetching
- [ ] Error state shown if API fails
- [ ] Data refetches on window focus

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/hooks/useQuests.ts` | Create | Quest data hook |
| `web/src/hooks/useLevelProgress.ts` | Create | Level progress hook |
| `web/src/lib/api.ts` | Create | API client with auth |
| `web/src/pages/Dashboard.tsx` | Modify | Use real data |

## Implementation Guide

### Step 1: Create API Client

Create `web/src/lib/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send auth cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
```

### Step 2: Create useQuests Hook

Create `web/src/hooks/useQuests.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Quest {
  id: string
  name: string
  description: string
  category: string
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED'
  currentValue: number | null
  targetValue: number
  completionPercent: number
  baseXP: number
  isCore: boolean
}

interface QuestsResponse {
  quests: Quest[]
  date: string
}

export function useQuests() {
  return useQuery({
    queryKey: ['quests', 'today'],
    queryFn: () => api.get<QuestsResponse>('/api/quests'),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  })
}
```

### Step 3: Create useLevelProgress Hook

Create `web/src/hooks/useLevelProgress.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface LevelProgress {
  currentLevel: number
  xpProgress: number
  xpNeeded: number
  progressPercent: number
  totalXP: number
}

export function useLevelProgress() {
  return useQuery({
    queryKey: ['player', 'level-progress'],
    queryFn: () => api.get<LevelProgress>('/api/player/level-progress'),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60,
  })
}
```

### Step 4: Update Dashboard

Modify `web/src/pages/Dashboard.tsx` to use the hooks:

```typescript
import { useQuests } from '@/hooks/useQuests'
import { useLevelProgress } from '@/hooks/useLevelProgress'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { data: questsData, isLoading: questsLoading, error: questsError } = useQuests()
  const { data: levelProgress, isLoading: levelLoading } = useLevelProgress()

  // Replace hardcoded quests with questsData?.quests
  // Replace hardcoded XP with levelProgress data
  // Add loading and error states
}
```

## Testing

1. **Manual Testing:**
   - Start backend: `cd server && bun dev`
   - Start frontend: `cd web && bun dev`
   - Log in with test account
   - Verify Dashboard shows real quests from database
   - Verify XP bar shows actual progress

2. **Verify Loading States:**
   - Add artificial delay to API
   - Confirm loading spinner appears

3. **Verify Error States:**
   - Stop backend server
   - Confirm error message displays

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] No TypeScript errors
- [ ] Console has no errors/warnings
- [ ] Dashboard loads real data on login
- [ ] XP progress updates after quest completion
- [ ] Code follows existing patterns in codebase
