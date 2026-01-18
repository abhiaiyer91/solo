# Mobile

Documentation for the React Native mobile application.

---

## Documents

| Document | Description |
|----------|-------------|
| [Data Input System](./data-input.md) | Health API integrations, data flow, verification |

---

## Tech Stack

- **Framework**: React Native + Expo
- **Router**: Expo Router (file-based)
- **Health APIs**: Apple HealthKit, Google Fit, Fitbit
- **State**: Zustand (local) + TanStack Query (server)
- **Notifications**: Expo Notifications

---

## Architecture

```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Quest board (home)
│   │   ├── stats.tsx      # Player stats
│   │   ├── dungeons.tsx   # Dungeon browser
│   │   └── profile.tsx    # Settings, titles
│   ├── quest/[id].tsx     # Quest detail
│   ├── boss/[id].tsx      # Boss fight screen
│   ├── dungeon/[id].tsx   # Active dungeon
│   └── onboarding/        # First-time flow
├── src/
│   ├── health/            # Health API integration
│   │   ├── providers/     # HealthKit, Google Fit, Fitbit
│   │   ├── unified.ts     # Unified health API
│   │   └── sync.ts        # Background sync logic
│   ├── components/        # Shared UI components
│   │   ├── QuestCard.tsx
│   │   ├── SystemMessage.tsx
│   │   ├── ProgressRing.tsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── useHealth.ts
│   │   ├── useQuests.ts
│   │   └── usePlayer.ts
│   ├── stores/            # Zustand stores
│   │   └── health.ts      # Local health cache
│   └── api/               # Backend API client
│       └── client.ts
└── package.json
```

---

## Health Integration Flow

```
┌──────────────────┐
│  App Foreground  │──────┐
└──────────────────┘      │
                          ▼
┌──────────────────┐  ┌──────────────────────────┐
│ Background Sync  │──│  Health Data Layer       │
│ (every 15 min)   │  │  • Query HealthKit/Fit   │
└──────────────────┘  │  • Normalize data        │
                      │  • Cache locally         │
                      └───────────┬──────────────┘
                                  │
                                  ▼
                      ┌──────────────────────────┐
                      │  Backend Sync            │
                      │  • POST /api/health-data │
                      │  • Quest auto-complete   │
                      │  • XP calculation        │
                      └──────────────────────────┘
```

---

## Key Screens

### Quest Board (Home)
- Core quests progress
- Rotating quest of the day
- Bonus quest (if Level 5+)
- Daily XP summary

### Stats
- Level & XP progress
- Stat breakdown (STR, VIT, AGI, DISC)
- Streak counter
- Active debuffs (if any)

### Dungeons
- Available dungeons by rank
- Active dungeon timer
- Dungeon history

### Profile
- Active titles
- Title collection
- Settings
- Health source configuration

---

## Notification Strategy

See [Daily Rhythm](../frontend/daily-rhythm.md) for detailed notification timing.

**Key principles**:
- Opt-in only
- Data-driven, not motivational
- Maximum 3-4 per day
- Always actionable

---

## Offline Support

The app must work offline for:
- Viewing current quest progress (cached)
- Manual data entry (queued)
- Reading System messages (cached)

Sync happens when connectivity restored.

---

## Implementation Priority

1. **Phase 1**: Quest board, health sync, manual entry
2. **Phase 2**: Stats screen, profile, titles
3. **Phase 3**: Dungeons, boss fights
4. **Phase 4**: Notifications, background sync
