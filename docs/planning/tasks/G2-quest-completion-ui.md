# G2: Build Quest Completion UI

## Overview

Users need to be able to complete quests by submitting their progress data. This task builds the UI components for viewing quest details and submitting completion data.

## Context

**Current State:**
- Backend has `/api/quests/:id/complete` POST endpoint
- Quest cards exist in Dashboard but are not interactive
- Quests have different input types (numeric vs boolean)

**Dependencies:**
- Requires G1-dashboard-connection (useQuests hook)

**Quest Types & Inputs:**
| Quest | Metric | Input Type |
|-------|--------|------------|
| Daily Steps | `steps` | Numeric (0-50000) |
| Workout Complete | `workout_minutes` | Numeric (0-180) |
| Protein Target | `protein_grams` | Numeric (0-300) |
| Quality Sleep | `sleep_hours` | Numeric (0-12) |
| Alcohol-Free Day | `no_alcohol` | Boolean (yes/no) |

## Acceptance Criteria

- [ ] `QuestCard` component displays quest progress visually
- [ ] Clicking a quest opens a completion modal/drawer
- [ ] `QuestInput` handles both numeric and boolean inputs
- [ ] Submitting updates quest via API
- [ ] Success feedback shows XP earned
- [ ] Level-up triggers celebration UI
- [ ] Quest list refreshes after completion
- [ ] Cannot submit already completed quests

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/quest/QuestCard.tsx` | Create | Quest display card |
| `web/src/components/quest/QuestInput.tsx` | Create | Input modal/drawer |
| `web/src/components/quest/QuestList.tsx` | Create | List container |
| `web/src/hooks/useCompleteQuest.ts` | Create | Mutation hook |
| `web/src/pages/Dashboard.tsx` | Modify | Use new components |

## Implementation Guide

### Step 1: Create useCompleteQuest Hook

Create `web/src/hooks/useCompleteQuest.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface CompleteQuestData {
  data: Record<string, number | boolean>
}

interface CompleteQuestResponse {
  quest: {
    id: string
    status: string
    completionPercent: number
  }
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  message: string
}

export function useCompleteQuest(questId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompleteQuestData) =>
      api.post<CompleteQuestResponse>(`/api/quests/${questId}/complete`, data),
    onSuccess: () => {
      // Refetch quests and player data
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
    },
  })
}
```

### Step 2: Create QuestCard Component

Create `web/src/components/quest/QuestCard.tsx`:

```typescript
import { motion } from 'framer-motion'

interface QuestCardProps {
  quest: {
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
  onClick: () => void
}

export function QuestCard({ quest, onClick }: QuestCardProps) {
  const isCompleted = quest.status === 'COMPLETED'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={isCompleted ? undefined : onClick}
      className={`
        p-4 border rounded transition-colors
        ${isCompleted
          ? 'border-system-green/50 bg-system-green/5 cursor-default'
          : 'border-system-border hover:border-system-blue/50 cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-system-text font-medium">{quest.name}</span>
            <span className="px-2 py-0.5 text-xs bg-system-border rounded text-system-text-muted">
              {quest.category}
            </span>
            {quest.isCore && (
              <span className="px-2 py-0.5 text-xs bg-system-purple/20 rounded text-system-purple">
                CORE
              </span>
            )}
          </div>
          <p className="text-system-text-muted text-sm mt-1">
            {quest.description}
          </p>
        </div>
        <div className="text-right">
          <div className={isCompleted ? 'text-system-green' : 'text-system-blue'}>
            {isCompleted ? '✓ ' : '+'}{quest.baseXP} XP
          </div>
          <div className="text-system-text-muted text-xs">
            {isCompleted ? 'COMPLETE' : 'INCOMPLETE'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-system-border rounded overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${quest.completionPercent}%` }}
          className={`h-full ${isCompleted ? 'bg-system-green' : 'bg-system-blue/50'}`}
        />
      </div>

      {!isCompleted && (
        <div className="mt-2 text-xs text-system-text-muted text-right">
          {quest.currentValue ?? 0} / {quest.targetValue}
        </div>
      )}
    </motion.div>
  )
}
```

### Step 3: Create QuestInput Component

Create `web/src/components/quest/QuestInput.tsx`:

```typescript
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompleteQuest } from '@/hooks/useCompleteQuest'

interface QuestInputProps {
  quest: {
    id: string
    name: string
    category: string
    targetValue: number
    requirement: {
      type: 'numeric' | 'boolean'
      metric: string
      value?: number
      expected?: boolean
    }
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: (xp: number, leveledUp: boolean, newLevel?: number) => void
}

export function QuestInput({ quest, isOpen, onClose, onSuccess }: QuestInputProps) {
  const [value, setValue] = useState<number | boolean>(
    quest.requirement.type === 'boolean' ? false : 0
  )
  const { mutate, isPending, error } = useCompleteQuest(quest.id)

  const handleSubmit = () => {
    const data = { [quest.requirement.metric]: value }
    mutate(
      { data },
      {
        onSuccess: (result) => {
          onSuccess(result.xpAwarded, result.leveledUp, result.newLevel)
          onClose()
        },
      }
    )
  }

  const isNumeric = quest.requirement.type === 'numeric'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
          >
            <div className="system-window p-6">
              <h3 className="text-lg font-bold text-system-blue mb-2">
                {quest.name}
              </h3>
              <p className="text-system-text-muted text-sm mb-6">
                {quest.category} Quest
              </p>

              {error && (
                <div className="mb-4 p-3 border border-system-red/50 bg-system-red/10 rounded text-system-red text-sm">
                  {error.message}
                </div>
              )}

              {isNumeric ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-system-text-muted text-sm uppercase">
                      Enter value (target: {quest.targetValue})
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={value as number}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="mt-2 w-full px-4 py-3 bg-system-black border border-system-border rounded
                                 text-system-text text-2xl text-center
                                 focus:border-system-blue focus:outline-none"
                      placeholder="0"
                    />
                  </label>

                  {/* Quick buttons */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setValue(Math.floor(quest.targetValue * 0.5))}
                      className="px-3 py-1 text-sm border border-system-border rounded hover:border-system-blue"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setValue(Math.floor(quest.targetValue * 0.75))}
                      className="px-3 py-1 text-sm border border-system-border rounded hover:border-system-blue"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setValue(quest.targetValue)}
                      className="px-3 py-1 text-sm border border-system-blue bg-system-blue/10 rounded"
                    >
                      100%
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setValue(true)}
                    className={`px-6 py-3 rounded border-2 transition-colors ${
                      value === true
                        ? 'border-system-green bg-system-green/20 text-system-green'
                        : 'border-system-border text-system-text-muted hover:border-system-green'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setValue(false)}
                    className={`px-6 py-3 rounded border-2 transition-colors ${
                      value === false
                        ? 'border-system-red bg-system-red/20 text-system-red'
                        : 'border-system-border text-system-text-muted hover:border-system-red'
                    }`}
                  >
                    NO
                  </button>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 btn-primary"
                  disabled={isPending}
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Step 4: Create QuestList Component

Create `web/src/components/quest/QuestList.tsx`:

```typescript
import { useState } from 'react'
import { QuestCard } from './QuestCard'
import { QuestInput } from './QuestInput'

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
  requirement: {
    type: 'numeric' | 'boolean'
    metric: string
    value?: number
    expected?: boolean
  }
}

interface QuestListProps {
  quests: Quest[]
  onQuestComplete: (xp: number, leveledUp: boolean, newLevel?: number) => void
}

export function QuestList({ quests, onQuestComplete }: QuestListProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

  return (
    <>
      <div className="space-y-4">
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onClick={() => setSelectedQuest(quest)}
          />
        ))}
      </div>

      {selectedQuest && (
        <QuestInput
          quest={selectedQuest}
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onSuccess={onQuestComplete}
        />
      )}
    </>
  )
}
```

### Step 5: Update Dashboard

Update `web/src/pages/Dashboard.tsx` to use the new components and show feedback:

```typescript
// Add to Dashboard:
const [showXPGain, setShowXPGain] = useState<{ xp: number; levelUp?: number } | null>(null)

const handleQuestComplete = (xp: number, leveledUp: boolean, newLevel?: number) => {
  setShowXPGain({ xp, levelUp: leveledUp ? newLevel : undefined })
  setTimeout(() => setShowXPGain(null), 3000)
}

// Replace hardcoded quest list with:
<QuestList
  quests={questsData?.quests ?? []}
  onQuestComplete={handleQuestComplete}
/>

// Add XP gain notification:
{showXPGain && (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className="fixed bottom-8 right-8 system-window p-4"
  >
    <div className="text-system-green text-xl font-bold">+{showXPGain.xp} XP</div>
    {showXPGain.levelUp && (
      <div className="text-system-gold">LEVEL UP! Now Level {showXPGain.levelUp}</div>
    )}
  </motion.div>
)}
```

## Testing

1. **Quest Completion Flow:**
   - Click on an active quest
   - Enter a value or select yes/no
   - Submit and verify XP is awarded
   - Verify quest shows as completed

2. **Partial Completion:**
   - Submit 50% of target value
   - Verify partial XP is awarded

3. **Level Up:**
   - Complete enough quests to level up
   - Verify level-up notification appears

4. **Edge Cases:**
   - Try to click completed quest (should not open input)
   - Submit invalid data (should show error)

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] No TypeScript errors
- [ ] QuestCard displays correctly for active/completed states
- [ ] QuestInput handles both numeric and boolean quests
- [ ] XP gain notification shows after completion
- [ ] Quest list refreshes after completion
- [ ] Level-up celebration displays when triggered
