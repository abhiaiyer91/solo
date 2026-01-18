# G34: Implement Error Boundaries

## Overview
Add React error boundaries for graceful failure handling in the frontend.

## Context
**Source:** Ideation Loop analysis - gaps-and-priorities.md Gap 11
**Related Docs:** docs/planning/gaps-and-priorities.md
**Current State:** No error boundaries exist in the React app

## Acceptance Criteria
- [ ] ErrorBoundary component created with componentDidCatch
- [ ] ErrorFallback UI with System-style messaging and retry button
- [ ] Main App wrapped with ErrorBoundary
- [ ] Route-level error boundaries for isolated failures

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/error/ErrorBoundary.tsx | Create | Error boundary component |
| web/src/components/error/ErrorFallback.tsx | Create | Fallback UI |
| web/src/components/error/index.ts | Create | Barrel export |
| web/src/App.tsx | Modify | Wrap with ErrorBoundary |

## Implementation Notes
- Error message should match System tone: "An unexpected error occurred. The System is recording."
- Include error ID for debugging
- Retry button attempts to recover or navigates to Dashboard

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
