# G8: Build Profile Page

## Overview

Create the Profile page for account settings, timezone configuration, and user preferences.

## Context

**Dependencies:**
- Requires G6-layout-navigation (AppShell)

**Current State:**
- Route exists but shows Dashboard
- User model has timezone field

## Acceptance Criteria

- [ ] Profile page shows account info
- [ ] Timezone selector with common timezones
- [ ] Update timezone via API
- [ ] Logout button with confirmation
- [ ] Account stats (days active, total quests, etc.)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/index.ts` | Modify | Add PATCH /api/player endpoint |
| `web/src/pages/Profile.tsx` | Create | Profile page |
| `web/src/components/profile/TimezoneSelect.tsx` | Create | Timezone picker |
| `web/src/App.tsx` | Modify | Route to Profile page |

## Implementation Notes

Timezone options should include major timezones:
- America/New_York, America/Chicago, America/Denver, America/Los_Angeles
- Europe/London, Europe/Paris, Europe/Berlin
- Asia/Tokyo, Asia/Shanghai, Asia/Singapore
- Australia/Sydney
- UTC

## Definition of Done

- [ ] Profile page accessible via navigation
- [ ] Shows user email and name
- [ ] Timezone can be changed
- [ ] Logout works
- [ ] Responsive on mobile
