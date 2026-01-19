# G123: UI Sound Effects System

## Overview

Implement an optional sound effects system that enhances the game experience with audio feedback for key actions.

## Context

**Source:** User engagement and polish
**Current State:** No audio feedback exists

## Acceptance Criteria

- [ ] Sound effect manager with volume control
- [ ] User preference to enable/disable sounds
- [ ] Sound effects for: quest completion, level up, XP gain, boss encounter
- [ ] Sound effects for: UI interactions (button clicks, notifications)
- [ ] Preload critical sounds to avoid delays
- [ ] Web Audio API implementation for low latency
- [ ] Mobile support via expo-av

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| web/src/lib/audio.ts | Create | Sound effect manager |
| web/src/hooks/useSound.ts | Create | Sound hook for components |
| web/public/sounds/ | Create | Sound effect files (mp3/ogg) |
| web/src/contexts/AudioContext.tsx | Create | Audio settings context |
| web/src/pages/Profile.tsx | Modify | Add sound settings |
| mobile/src/lib/audio.ts | Create | Mobile sound manager |
| mobile/src/hooks/useSound.ts | Create | Mobile sound hook |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Sounds are appropriate volume and duration
- [ ] No audio playback issues
- [ ] Settings persist across sessions
- [ ] Works on both web and mobile
- [ ] No TypeScript errors
