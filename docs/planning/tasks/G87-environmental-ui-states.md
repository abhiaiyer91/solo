# G87: Environmental UI States

## Overview

Implement visual state system where the entire app UI shifts based on player state (debuffed, high streak, boss fight active, etc.).

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Some state indicators exist (debuff badge), but no global visual treatment

## Acceptance Criteria

- [ ] Visual state context provider with state detection
- [ ] Debuffed state: desaturated colors, red vignette, static overlay
- [ ] High streak state (30+ days): gold ambient glow, accent shift
- [ ] Boss fight active: dark crimson ambient, tension-inducing visuals
- [ ] Dungeon active: teal tension, timer emphasis
- [ ] Weekend bonus: purple ambient glow
- [ ] Evening mode: warmer tones (6pm-10pm)
- [ ] Night mode: darker contrast, softer animations (10pm+)
- [ ] Smooth transitions between states

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/contexts/VisualStateContext.tsx` | Create | Global visual state provider |
| `web/src/hooks/useVisualState.ts` | Create | Hook to consume visual state |
| `web/src/styles/states.css` | Create | State-specific CSS overlays |
| `web/src/components/layout/AppShell.tsx` | Modify | Apply visual state classes |
| `web/src/components/overlays/DebuffOverlay.tsx` | Create | Debuff visual treatment |
| `web/src/components/overlays/index.ts` | Create | Export overlays |

## Implementation Notes

### Visual State Context

```typescript
type VisualState = 
  | 'normal' 
  | 'debuffed' 
  | 'streak-high' 
  | 'boss-active' 
  | 'dungeon-active' 
  | 'weekend-bonus'
  | 'evening'
  | 'night'

interface VisualStateContextValue {
  state: VisualState
  className: string
  overlayComponent: React.ComponentType | null
}
```

### State Detection Logic

```typescript
function determineVisualState(player: Player, dayStatus: DayStatus): VisualState {
  // Priority order (highest first)
  if (player.activeBossAttempt) return 'boss-active'
  if (player.activeDungeonAttempt) return 'dungeon-active'
  if (player.debuffActive) return 'debuffed'
  if (player.currentStreak >= 30) return 'streak-high'
  if (player.weekendBonusActive) return 'weekend-bonus'
  if (dayStatus.phase === 'night') return 'night'
  if (dayStatus.phase === 'evening') return 'evening'
  return 'normal'
}
```

### CSS Overlays

```css
.debuff-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, transparent 50%, rgba(139, 0, 0, 0.3) 100%);
  pointer-events: none;
  z-index: 100;
}

.debuff-overlay {
  filter: saturate(0.7);
}

.streak-high-overlay {
  --system-blue: #ffd700; /* Shift accent to gold */
}

.boss-active-overlay {
  background-color: #1a0505 !important;
}
```

### Debuff Static Effect

```tsx
function DebuffOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Red vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-red-900/30" />
      
      {/* Static noise (subtle) */}
      <div className="absolute inset-0 opacity-5 bg-noise animate-flicker" />
      
      {/* Warning text */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <span className="text-xs text-system-red uppercase tracking-wider animate-pulse">
          DEBUFF ACTIVE
        </span>
      </div>
    </div>
  )
}
```

## Definition of Done

- [ ] Player state automatically triggers correct visual mode
- [ ] Transitions between states are smooth (0.3s fade)
- [ ] Each state is visually distinct and recognizable
- [ ] Overlays don't block interaction
- [ ] Performance is maintained (no jank)
- [ ] Night mode respects actual time of day
