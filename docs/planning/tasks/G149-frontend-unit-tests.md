# G149: Frontend Component Unit Tests

## Overview
Add unit tests for critical frontend components to ensure UI stability. Currently only 3 of 80 components have tests (4% coverage).

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `web/src/components/**/*.tsx`, `web/vitest.config.ts`
**Current State:** Only `SystemMessage.test.tsx`, `StatCard.test.tsx`, `QuestCard.test.tsx` exist

## Acceptance Criteria
- [ ] Tests for `QuestList.tsx` (rendering, filtering, completion)
- [ ] Tests for `XPTimeline.tsx` (display, infinite scroll)
- [ ] Tests for `DungeonCard.tsx` (state display, entry modal)
- [ ] Tests for `ErrorBoundary.tsx` (error catching, fallback)
- [ ] Tests for `Reconciliation.tsx` (daily flow)
- [ ] Tests for key hooks (`useQuests`, `usePlayer`, `useStats`)
- [ ] Each tested component has >70% coverage
- [ ] Tests use Testing Library best practices

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/quest/QuestList.test.tsx | Create | Quest list tests |
| web/src/components/xp/XPTimeline.test.tsx | Create | XP timeline tests |
| web/src/components/dungeon/DungeonCard.test.tsx | Create | Dungeon card tests |
| web/src/components/error/ErrorBoundary.test.tsx | Create | Error boundary tests |
| web/src/components/daily/Reconciliation.test.tsx | Create | Reconciliation tests |
| web/src/hooks/usePlayer.test.ts | Create | Player hook tests |
| web/src/hooks/useStats.test.ts | Create | Stats hook tests |
| web/src/test/setup.ts | Modify | Add testing utilities |
| web/src/test/mocks/api.ts | Create | API mock helpers |

## Implementation Notes
- Use `@testing-library/react` for component tests
- Mock API calls with `msw` or manual mocks
- Test user interactions, not implementation details
- Use `userEvent` for realistic interaction simulation
- Test accessibility with `@testing-library/jest-dom`
- Avoid testing third-party library behavior

## Testing Priorities
1. **QuestList** - Most frequently used component
2. **XPTimeline** - Complex data display
3. **ErrorBoundary** - Critical for stability
4. **Hooks** - Shared logic reuse

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Coverage report shows improvement
- [ ] No accessibility violations in tested components
