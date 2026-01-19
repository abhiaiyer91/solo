# G86: UI Design System Enhancement

## Overview

Enhance the core design system with new colors, animations, and utility classes to support the Solo Leveling-inspired "System" aesthetic.

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Basic dark theme with blue accents exists; needs enhancement for full aesthetic

## Acceptance Criteria

- [ ] Extended color palette in Tailwind config (environmental states, new accents)
- [ ] CSS keyframe animations (scanline, flicker, glitch, pulse-glow)
- [ ] Framer Motion variant presets exported from shared module
- [ ] Utility classes for common effects (.scanline-overlay, .glow-blue, etc.)
- [ ] HUD-style decorative elements (corner brackets, targeting reticles)
- [ ] Typography refinements (terminal prefixes, calculated spacing)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/tailwind.config.js` | Modify | Add environmental state colors, new animations |
| `web/src/styles/animations.css` | Create | CSS keyframes for effects |
| `web/src/lib/motion.ts` | Create | Framer Motion variant presets |
| `web/src/components/ui/HudElements.tsx` | Create | Corner brackets, decorative elements |
| `web/src/components/ui/index.ts` | Create | Export UI primitives |

## Implementation Notes

### Extended Tailwind Config

```javascript
// tailwind.config.js additions
colors: {
  state: {
    debuff: '#8b0000',
    boss: '#1a0505',
    'streak-high': '#332200',
    dungeon: '#0a1a1a',
  },
  system: {
    // existing colors...
    crimson: '#dc143c',
    ice: '#a5f3fc',
  }
},
animation: {
  scanline: 'scanline 4s linear infinite',
  flicker: 'flicker 0.15s infinite',
  glitch: 'glitch 0.5s cubic-bezier(.25,.46,.45,.94) both',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
}
```

### Motion Variants

```typescript
// web/src/lib/motion.ts
export const fadeSlideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
}

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
}
```

### HUD Elements

```tsx
// Corner brackets for panels
export function HudCorners({ className }: { className?: string }) {
  return (
    <>
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-system-blue/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-system-blue/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-system-blue/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-system-blue/50" />
    </>
  )
}
```

## Definition of Done

- [ ] All new colors work in components
- [ ] Animations are performant (GPU-accelerated)
- [ ] Motion variants reduce animation boilerplate
- [ ] HUD elements are reusable across app
- [ ] Existing components still render correctly
