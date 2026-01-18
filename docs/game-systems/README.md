# Game Systems

Documentation for all gameplay mechanics in the Journey Fitness Quest System.

---

## Core Systems

| Document | Description |
|----------|-------------|
| [XP & Leveling](./xp-leveling.md) | Level curve, XP awards, modifiers |
| [Quests](./quests.md) | Quest types, requirements DSL, auto-completion |
| [Streaks & Debuffs](./streaks-debuffs.md) | Streak calculation, debuff triggers |
| [Titles & Passives](./titles.md) | Title conditions, passive effects |
| [Boss Fights](./bosses.md) | Multi-phase identity challenges |
| [Dungeons](./dungeons.md) | Time-limited high-risk challenges |
| [Seasons](./seasons.md) | Seasonal progression, themes |
| [Social](./social.md) | Guilds, leaderboards, accountability, raids |

---

## System Interactions

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Health    │────▶│   Quests    │────▶│     XP      │
│    Data     │     │             │     │   Ledger    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Daily     │     │   Level     │
                    │    Logs     │     │    Up!      │
                    └─────────────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  Streaks  │ │  Debuffs  │ │  Titles   │
       └───────────┘ └───────────┘ └───────────┘
```

---

## Progression Flow

1. **Daily**: Complete core quests → Build streaks → Earn XP
2. **Weekly**: Complete weekly challenges → Bonus XP
3. **Monthly**: Boss fights → Title unlocks
4. **Seasonal**: Season transitions → New content unlocks

---

## Key Principles

1. **Append-only XP**: No XP is ever deleted
2. **Consistency over intensity**: Streaks matter more than single efforts
3. **No punishment, only reflection**: Debuffs are consequences, not penalties
4. **Identity transformation**: Bosses represent internal enemies
5. **Voluntary challenge**: Dungeons are always optional
