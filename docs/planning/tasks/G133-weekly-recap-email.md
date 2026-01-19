# G133: Weekly Recap Email

## Overview

Implement automated weekly recap emails that summarize player progress, achievements, and provide motivation for the coming week.

## Context

**Source:** User engagement and retention
**Current State:** Email service exists but no scheduled emails
**Related:** server/src/services/email.ts (553 lines)

## Acceptance Criteria

- [ ] Scheduled job runs every Monday morning
- [ ] Email template with week's stats summary
- [ ] Include: XP earned, quests completed, streak status, level progress
- [ ] Highlight achievements and milestones reached
- [ ] Personalized System message/observation
- [ ] Unsubscribe link with one-click opt-out
- [ ] User preference to enable/disable recap emails
- [ ] Mobile-friendly email design

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/services/weekly-recap.ts | Create | Weekly recap generation service |
| server/src/jobs/weekly-recap.ts | Create | Scheduled job runner |
| server/src/templates/weekly-recap.html | Create | Email template |
| server/src/services/email.ts | Modify | Add recap email method |
| server/src/routes/player.ts | Modify | Add email preference endpoint |
| web/src/pages/Profile.tsx | Modify | Add email preference toggle |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Emails render correctly in major clients
- [ ] Unsubscribe works reliably
- [ ] No spam trigger issues
- [ ] No TypeScript errors
