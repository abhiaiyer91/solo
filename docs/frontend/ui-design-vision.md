# UI/UX Design Vision: Journey Fitness Quest

**Created:** 2026-01-18
**Status:** Design Document

This document defines the visual identity and UX philosophy for the Journey Fitness Quest System, inspired by Solo Leveling's "System" aesthetic.

---

## Design Philosophy

### Core Principles

1. **The System is Cold, Not Friendly**
   - No cheerful emojis or motivational phrases
   - Facts, not encouragement: "Objective complete. +50 XP logged."
   - The System observes and records, never praises

2. **Digital Hologram Aesthetic**
   - Dark backgrounds with glowing accents
   - Scanline effects suggesting CRT/holographic displays
   - Interference patterns that pulse occasionally
   - HUD-like corner brackets and targeting elements

3. **Cinematic Moments**
   - Key actions (level-up, boss defeat) become micro-cinematics
   - Screen takeovers for major achievements
   - The app feels like living inside an anime

4. **Environmental Responsiveness**
   - UI adapts to player state (debuffed, streaking, in combat)
   - Time-of-day affects visual treatment
   - Current "mode" is immediately visible without reading

---

## Visual Identity

### Color Palette

```javascript
// Core System Colors
'system-black': '#0a0a0f',      // Deep void black
'system-dark': '#12121a',       // Panel backgrounds
'system-panel': '#1a1a24',      // Elevated surfaces
'system-border': '#2a2a3a',     // Subtle borders

// Accent Colors
'system-blue': '#4a9eff',       // Primary - System interface
'system-purple': '#9b5de5',     // Secondary - Special/seasonal
'system-gold': '#ffd700',       // Streaks, achievements
'system-green': '#2ed573',      // Success, completion
'system-red': '#ff4757',        // Danger, debuffs
'system-orange': '#ff7f50',     // Warnings

// Stat Colors
'stat-str': '#ff6b6b',          // Strength - warm red
'stat-agi': '#4ecdc4',          // Agility - teal
'stat-vit': '#45b7d1',          // Vitality - cyan
'stat-disc': '#f9ca24',         // Discipline - gold

// Environmental States
'state-debuff': '#8b0000',      // Crimson overlay
'state-boss': '#1a0505',        // Dark red ambient
'state-streak-high': '#332200', // Golden ambient
'state-dungeon': '#0a1a1a',     // Tension teal
```

### Typography

- **System Voice:** JetBrains Mono (monospace) - cold, technical
- **Headers:** Bold uppercase, tracking-wider
- **Body:** System text at 0.875rem-1rem
- **XP/Numbers:** Tabular numbers, bold

### Motion Principles

1. **Entrances:** Fade + slide from edge (opacity 0→1, y 10→0)
2. **Celebrations:** Scale burst + particle effects
3. **State changes:** Cross-fade with subtle flicker
4. **Numbers:** Count-up animations for XP gains
5. **System text:** Typewriter effect at 25-40ms/char

---

## Environmental UI States

The entire app shifts visually based on player state:

| State | Visual Treatment |
|-------|------------------|
| **Normal** | Default dark theme, blue accents |
| **Debuffed** | Desaturated colors, red vignette, static overlay, warning border |
| **High Streak (30+)** | Gold accent shift, subtle glow, "royal" feel |
| **Boss Fight Active** | Dark crimson ambient, tension-inducing, restricted navigation |
| **Dungeon Active** | Timer prominent, countdown pressure, teal tension |
| **Weekend Bonus** | Purple ambient glow, celebratory particles |
| **Evening (6pm-10pm)** | Warmer tones, reconciliation prompts |
| **Night (10pm+)** | Darker contrast, softer animations, rest mode |

### Implementation

```tsx
// Use a context to manage global visual state
const VisualState = {
  normal: 'bg-system-black',
  debuffed: 'bg-system-black debuff-overlay filter-desaturate',
  streakHigh: 'bg-system-black streak-glow',
  bossActive: 'bg-state-boss boss-tension',
  dungeonActive: 'bg-state-dungeon',
  evening: 'bg-system-black evening-warm',
  night: 'bg-system-black night-mode',
}
```

---

## Key UI Components

### System Message

The System's voice is delivered through distinctive message panels:

```
┌─────────────────────────────────────────────────────────┐
│ ● SYSTEM                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Day 14. Two weeks without failure.                     │
│  The easy part is over.                                 │
│  Now begins the real test.                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Features:
- Pulsing blue indicator dot
- Typewriter text reveal
- Monospace font
- Calculated pauses between lines
- Terminal-style prefixes for warnings: `> `, `[WARNING]`, `!ERROR`

### Quest Card 2.0

Mission briefing style with integrated progress:

```
┌─ DAILY OBJECTIVE ──────────────────────────────────────┐
│                                                         │
│  ▸ STEPS                               [████████░░]    │
│    Walk 10,000 steps                    8,240 / 10K    │
│                                                         │
│    REWARD: +25 XP (AGI)          STATUS: IN PROGRESS   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Features:
- Category indicator (CORE badge for mandatory)
- Inline progress bar
- Stat affected shown
- Completion triggers satisfying "stamp" animation
- Failed quests show redacted/crossed styling

### Stat Radar Visualization

Enhanced hexagon chart:

- Pulsing glow on recent stat increases
- History trail (ghosted previous values)
- Achievement markers at threshold values
- Comparison overlay option (You vs Shadow)
- Danger zone highlighting when stats low

### XP Gain Toast

```
┌──────────────────────────────┐
│  ⚡ +75 XP                   │
│     Quest: Daily Steps       │
│     Modifiers: +5% streak    │
└──────────────────────────────┘
```

Features:
- Animated count-up
- Slides in from right
- Shows source and any modifiers
- Stacks for multiple gains

### Level Up Celebration

Full-screen takeover:

1. Screen flash (white 0.1s)
2. Particles burst from center
3. "LEVEL UP" text animates in
4. Old level → New level count-up
5. System message appears
6. Stats cascade in if any increased
7. Dismiss button after 2s

---

## Onboarding: The Awakening

First-time experience should be unforgettable:

### Screen 1: Detection
```
[Black screen, 2s pause]

A dormant capability has been detected.

[2s pause]

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

[3s pause]

You have been granted access to the System.
```

### Screen 2: Terms
```
This interface will not motivate you.
It will not encourage you.

[pause]

It will only record what you do.
```

### Screen 3: Accept
```
                    [ACCEPT ACCESS]
```

### Design Notes
- No bright colors until first quest completion
- Interface "turns on" as user engages
- Each element fades in one at a time
- Sound: Low hum, single beep on accept

---

## Animation Library

### CSS Keyframes

```css
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px var(--glow-color); }
  50% { box-shadow: 0 0 20px var(--glow-color); }
}
```

### Framer Motion Variants

```typescript
const fadeSlideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

const slideFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
}
```

---

## Sound Design (Future)

Define sound moments for future implementation:

| Event | Sound | Notes |
|-------|-------|-------|
| Quest complete | Short chime | Satisfying, not intrusive |
| XP gain | Soft "ding" | Stack-able |
| Level up | Dramatic fanfare | Full moment |
| Debuff applied | Low warning tone | Unsettling |
| Streak milestone | Achievement sound | Celebratory |
| Boss encounter start | Tension sting | Dramatic |
| System message appear | Soft beep | Terminal-like |

---

## Accessibility Considerations

- Reduced motion option (respects `prefers-reduced-motion`)
- Color blind safe stat colors (distinguishable by shape too)
- Screen reader support for all interactive elements
- Minimum contrast ratios maintained
- Keyboard navigation throughout

---

## Implementation Tasks

See planning documents:
- G86-ui-design-system
- G87-environmental-ui-states
- G88-quest-completion-ceremony
- G89-system-message-enhancement
- G90-onboarding-cinematic
- G91-stat-visualization-upgrade
