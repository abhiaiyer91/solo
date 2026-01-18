# G7: Build Stats Page

## Overview

Create the dedicated Stats page showing detailed player statistics including the stat hexagon (STR/AGI/VIT/DISC), XP progress, and historical data.

## Context

**Dependencies:**
- Requires G1-dashboard-connection (hooks pattern)
- Requires G6-layout-navigation (AppShell)

**Current State:**
- Route exists but shows Dashboard
- Backend has `/api/player` with stats

## Acceptance Criteria

- [ ] `/api/player/stats` endpoint with detailed breakdown
- [ ] `StatHexagon` component visualizes 4 stats
- [ ] Stats page shows level, XP progress, stats
- [ ] Stat history or recent changes shown
- [ ] Responsive layout

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/index.ts` | Modify | Add /api/player/stats endpoint |
| `web/src/components/stats/StatHexagon.tsx` | Create | Hexagon visualization |
| `web/src/components/stats/StatCard.tsx` | Create | Individual stat display |
| `web/src/pages/Stats.tsx` | Create | Stats page |
| `web/src/App.tsx` | Modify | Route to Stats page |

## Implementation Notes

The StatHexagon should use SVG or Canvas to draw a radar/hexagon chart showing the 4 stats relative to each other. Consider using a library like recharts (already in stack) or building custom SVG.

Stats to display:
- **STR** (Strength) - from workout quests
- **AGI** (Agility) - from movement quests
- **VIT** (Vitality) - from sleep/recovery quests
- **DISC** (Discipline) - from consistency quests

## Definition of Done

- [ ] Stats page accessible via navigation
- [ ] StatHexagon renders 4 stats visually
- [ ] XP progress bar shows level progress
- [ ] Page loads real data from API
- [ ] Responsive on mobile
