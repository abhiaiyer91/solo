# G57: Mobile Quest UI

## Overview

Build the quest board and quest detail screens for the mobile app. This is the primary interaction surface where users see and complete daily quests.

## Context

**Source:** Retrospection analysis - Mobile UI needed
**Design Doc:** docs/mobile/README.md
**Current State:** Web quest components exist, need mobile adaptation

## Acceptance Criteria

- [ ] Quest board shows core daily quests
- [ ] Quest board shows rotating quest (if unlocked)
- [ ] Quest board shows bonus quest (if Level 5+)
- [ ] Quest progress updates from health data
- [ ] Manual completion for non-automated quests
- [ ] Quest detail modal with progress visualization
- [ ] Pull-to-refresh syncs health data
- [ ] Daily XP summary visible

## Files to Create

| File | Description |
|------|-------------|
| `mobile/src/components/QuestCard.tsx` | Quest card component |
| `mobile/src/components/QuestProgress.tsx` | Progress ring/bar |
| `mobile/src/components/QuestList.tsx` | Quest list container |
| `mobile/src/components/DailyXPSummary.tsx` | XP earned today |
| `mobile/app/(tabs)/index.tsx` | Quest board screen |
| `mobile/app/quest/[id].tsx` | Quest detail modal |
| `mobile/src/hooks/useQuests.ts` | Quest data hook |

## Implementation Notes

### Quest Card Design

```
┌─────────────────────────────────────┐
│  ◉ DAILY STEPS                      │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░ 7,234 / 10,000   │
│                                     │
│  [Auto-tracking via HealthKit]      │
│                            +25 XP   │
└─────────────────────────────────────┘
```

### Progress Visualization

- Circular progress ring for main metric
- Animated fill on update
- Haptic feedback on completion

### Auto-Completion Flow

1. Health data syncs
2. Quest evaluator runs
3. If complete: Show celebration + XP toast
4. Update quest card state

## Definition of Done

- [ ] All quest types display correctly
- [ ] Progress updates in real-time
- [ ] Manual completion works
- [ ] Animations feel native
- [ ] Pull-to-refresh works
