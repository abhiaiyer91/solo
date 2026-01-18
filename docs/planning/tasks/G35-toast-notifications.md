# G35: Implement Toast Notifications

## Overview
Add in-app toast notifications for user feedback on actions.

## Context
**Source:** Ideation Loop analysis - gaps-and-priorities.md Gap 12
**Related Docs:** docs/planning/gaps-and-priorities.md
**Current State:** No user feedback for actions like quest completion or errors

## Acceptance Criteria
- [ ] Toast library installed (sonner or react-hot-toast)
- [ ] Toast provider wrapped around app
- [ ] Success toasts for quest completion
- [ ] Error toasts for API failures
- [ ] Toast styling matches Journey theme

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| package.json | Modify | Add toast library |
| web/src/main.tsx | Modify | Add toast provider |
| web/src/components/ui/toast.tsx | Create | Custom styled toasts |
| web/src/hooks/useQuests.ts | Modify | Add toast on completion |

## Implementation Notes
- Toasts should be brief and data-focused
- Success: "+25 XP. Movement quest complete."
- Error: "Request failed. The System will retry."
- Duration: 3-4 seconds

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
