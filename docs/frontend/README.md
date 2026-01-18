# Frontend

Documentation for web and shared UI components.

---

## Documents

| Document | Description |
|----------|-------------|
| [Daily Rhythm](./daily-rhythm.md) | Temporal UX flow, notifications, daily experience |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | React 18 |
| **Build** | Vite |
| **Styling** | Tailwind CSS |
| **State** | Zustand + TanStack Query |
| **Router** | React Router |
| **Charts** | Recharts |
| **Animations** | Framer Motion |

---

## Architecture

```
web/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── pages/
│   │   ├── Dashboard.tsx     # Quest board (home)
│   │   ├── Stats.tsx         # Player stats
│   │   ├── Dungeons.tsx      # Dungeon browser
│   │   ├── Profile.tsx       # Settings, titles
│   │   ├── Boss.tsx          # Boss fight screen
│   │   └── Onboarding.tsx    # First-time flow
│   ├── components/
│   │   ├── common/           # Shared components
│   │   │   ├── SystemMessage.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Card.tsx
│   │   ├── quest/            # Quest-related
│   │   │   ├── QuestCard.tsx
│   │   │   ├── QuestBoard.tsx
│   │   │   └── QuestProgress.tsx
│   │   ├── stats/            # Stats display
│   │   │   ├── StatHexagon.tsx
│   │   │   └── XPProgress.tsx
│   │   └── boss/             # Boss fight UI
│   │       ├── BossCard.tsx
│   │       └── PhaseProgress.tsx
│   ├── hooks/
│   │   ├── useQuests.ts      # Quest data
│   │   ├── usePlayer.ts      # Player data
│   │   └── useHealth.ts      # Health data
│   ├── stores/
│   │   └── ui.ts             # UI state
│   ├── api/
│   │   └── client.ts         # API client
│   └── styles/
│       └── globals.css       # Tailwind imports
└── package.json
```

---

## Design System

### Colors

The System's palette is dark and clinical:

```css
:root {
  /* Background */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a24;

  /* Text */
  --text-primary: #e4e4e7;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* Accent */
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-gold: #eab308;

  /* Stats */
  --stat-str: #ef4444;
  --stat-vit: #22c55e;
  --stat-agi: #3b82f6;
  --stat-disc: #a855f7;
}
```

### Typography

```css
/* System messages: monospace, cold */
.system-text {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.025em;
}

/* Headings: clean, stark */
.heading {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### Component Patterns

**System Message Box**:
```tsx
<SystemMessage>
  QUEST COMPLETE

  Movement target reached.
  10,234 steps recorded.

  +25 XP
</SystemMessage>
```

**Stat Display**:
```tsx
<StatHexagon
  str={12}
  vit={14}
  agi={18}
  disc={10}
/>
```

**Progress Bar**:
```tsx
<ProgressBar
  current={7432}
  target={10000}
  label="Steps"
  color="agi"
/>
```

---

## Animation Guidelines

Animations should feel:
- **Swift** - No delays, instant feedback
- **Mechanical** - Like System processes, not playful
- **Purposeful** - Only animate meaningful changes

```tsx
// XP gain
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  +25 XP
</motion.div>

// Level up (more dramatic)
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", damping: 15 }}
>
  LEVEL UP
</motion.div>
```

---

## Key Screens

### Dashboard (Quest Board)

The home screen shows:
- Today's core quests with progress
- Rotating quest
- Bonus quest (if unlocked)
- Active boss/dungeon status
- Daily XP summary

### Stats

Full stat breakdown:
- Level and XP progress
- Stat hexagon (STR, VIT, AGI, DISC)
- Current streak
- Active title and effects
- Recent XP ledger

### Profile

Player configuration:
- Title selection
- Title collection
- Health source management
- Notification settings
- Privacy preferences

---

## Responsive Design

| Breakpoint | Target |
|------------|--------|
| `sm` (640px) | Mobile portrait |
| `md` (768px) | Tablet |
| `lg` (1024px) | Desktop |
| `xl` (1280px) | Large desktop |

Mobile-first approach. Quest cards stack on mobile, grid on desktop.

---

## Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation for all interactive elements
- Screen reader support for System messages
- Reduced motion mode available
- High contrast mode for stat colors

---

## Implementation Priority

| Phase | Screens |
|-------|---------|
| **MVP** | Dashboard, basic stats, onboarding |
| **V1** | Full stats, profile, title selection |
| **V1.5** | Boss fight UI, dungeon UI |
| **V2** | Guild screens, leaderboards, social |
