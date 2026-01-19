# G127: Profile Avatar and Customization

## Overview

Allow users to customize their profile with avatars, display names, and visual preferences that reflect their journey progress.

## Context

**Source:** User personalization and engagement
**Current State:** Basic profile with no customization options

## Acceptance Criteria

- [ ] Avatar selection from preset options
- [ ] Avatar unlock based on achievements/level
- [ ] Display name customization with validation
- [ ] Profile border/frame based on title equipped
- [ ] Background theme selection
- [ ] Profile card preview
- [ ] Export profile card as image (shareable)
- [ ] Animated avatars for special achievements

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/profile.ts | Create | Profile customization schema |
| server/src/routes/profile.ts | Create | Profile customization endpoints |
| server/src/services/profile.ts | Create | Profile service logic |
| web/src/components/profile/AvatarPicker.tsx | Create | Avatar selection grid |
| web/src/components/profile/ProfileCard.tsx | Create | Shareable profile card |
| web/src/components/profile/ThemePicker.tsx | Create | Theme selection UI |
| web/src/pages/Profile.tsx | Modify | Add customization section |
| web/public/avatars/ | Create | Avatar image assets |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Avatar unlock conditions work correctly
- [ ] Profile changes save reliably
- [ ] Export produces quality image
- [ ] No TypeScript errors
