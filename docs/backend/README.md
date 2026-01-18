# Backend

Documentation for the Hono API server and business logic.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Bun |
| **Framework** | Hono |
| **ORM** | Drizzle |
| **Database** | PostgreSQL |
| **AI Agents** | Mastra |
| **Auth** | Clerk |

---

## Architecture

```
server/
├── src/
│   ├── index.ts              # Hono app entry
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   ├── client.ts         # Database client
│   │   └── migrations/       # SQL migrations
│   ├── routes/
│   │   ├── auth.ts           # Authentication
│   │   ├── player.ts         # Player data
│   │   ├── quests.ts         # Quest management
│   │   ├── health.ts         # Health data ingestion
│   │   ├── xp.ts             # XP and leveling
│   │   ├── titles.ts         # Title management
│   │   ├── bosses.ts         # Boss fights
│   │   ├── dungeons.ts       # Dungeon runs
│   │   ├── guilds.ts         # Social - guilds
│   │   ├── leaderboards.ts   # Rankings
│   │   └── content.ts        # Narrative content
│   ├── services/
│   │   ├── quest.service.ts      # Quest logic
│   │   ├── xp.service.ts         # XP calculations
│   │   ├── streak.service.ts     # Streak management
│   │   ├── debuff.service.ts     # Debuff logic
│   │   ├── title.service.ts      # Title evaluation
│   │   ├── boss.service.ts       # Boss progression
│   │   ├── dungeon.service.ts    # Dungeon mechanics
│   │   ├── guild.service.ts      # Guild logic
│   │   └── narrative.service.ts  # Content assembly
│   ├── mastra/
│   │   ├── agents/
│   │   │   ├── narrator.ts       # Narrative generation
│   │   │   ├── observer.ts       # Pattern detection
│   │   │   └── prophecy.ts       # Future prediction
│   │   └── tools/                # Agent tools
│   └── lib/
│       └── health-apis.ts        # Health API wrappers
└── package.json
```

---

## API Routes

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Player

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/player` | Get player profile |
| GET | `/api/player/stats` | Get stats breakdown |
| GET | `/api/player/titles` | Get earned titles |
| PATCH | `/api/player/title` | Set active title |
| GET | `/api/player/history` | Get activity history |

### Quests

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quests/daily` | Get today's quests |
| GET | `/api/quests/:id` | Get quest details |
| POST | `/api/quests/:id/complete` | Mark quest complete |
| POST | `/api/quests/:id/progress` | Update progress |
| GET | `/api/quests/rotating/pool` | Get rotating quest pool |

### Health Data

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/health/sync` | Bulk sync health data |
| POST | `/api/health/steps` | Update step count |
| POST | `/api/health/workout` | Log workout |
| POST | `/api/health/nutrition` | Log nutrition |
| GET | `/api/health/sources` | Get connected sources |
| POST | `/api/health/sources` | Connect health source |

### XP & Leveling

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/xp` | Get XP summary |
| GET | `/api/xp/ledger` | Get XP transaction history |
| GET | `/api/xp/level` | Get current level details |
| GET | `/api/xp/next-level` | Get XP to next level |

### Titles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/titles` | Get all titles |
| GET | `/api/titles/earned` | Get player's earned titles |
| GET | `/api/titles/:id` | Get title details |
| POST | `/api/titles/:id/equip` | Equip title |

### Boss Fights

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bosses` | Get available bosses |
| GET | `/api/bosses/active` | Get active boss fight |
| POST | `/api/bosses/:id/start` | Start boss fight |
| GET | `/api/bosses/:id/progress` | Get boss progress |
| POST | `/api/bosses/:id/phase/complete` | Complete phase |

### Dungeons

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dungeons` | Get available dungeons |
| GET | `/api/dungeons/active` | Get active dungeon |
| POST | `/api/dungeons/:id/enter` | Enter dungeon |
| GET | `/api/dungeons/:id/status` | Get dungeon status |
| POST | `/api/dungeons/:id/complete` | Complete dungeon |

### Guilds

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/guilds` | Create guild |
| GET | `/api/guilds/:id` | Get guild |
| GET | `/api/guilds/:id/members` | Get members |
| POST | `/api/guilds/:id/invite` | Send invite |
| POST | `/api/guilds/:id/join` | Join guild |
| DELETE | `/api/guilds/:id/leave` | Leave guild |
| GET | `/api/guilds/:id/challenges` | Get challenges |

### Leaderboards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboards/weekly` | Weekly XP rankings |
| GET | `/api/leaderboards/streaks` | Streak rankings |
| GET | `/api/leaderboards/level` | Level rankings |
| GET | `/api/leaderboards/guilds` | Guild rankings |
| PATCH | `/api/leaderboards/preferences` | Update visibility |

### Content

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/content/narrative/:key` | Get narrative by key |
| GET | `/api/content/daily-message` | Get personalized daily message |

---

## Service Layer

### QuestService

```typescript
class QuestService {
  // Get today's quests for player
  getDailyQuests(playerId: string): Promise<Quest[]>

  // Check if quest requirements met
  evaluateQuest(questId: string, healthData: HealthData): Promise<QuestStatus>

  // Auto-complete quests from health data
  processHealthData(playerId: string, data: HealthData): Promise<CompletedQuest[]>

  // Select rotating quest for today
  selectRotatingQuest(playerId: string, date: Date): Promise<Quest>

  // Generate bonus quest
  generateBonusQuest(playerId: string): Promise<Quest>
}
```

### XPService

```typescript
class XPService {
  // Award XP and handle level ups
  awardXP(playerId: string, amount: number, source: XPSource): Promise<XPResult>

  // Calculate current level from XP
  calculateLevel(totalXP: number): number

  // Get XP needed for next level
  xpToNextLevel(currentLevel: number): number

  // Apply modifiers (streak bonus, debuff penalty, title effects)
  applyModifiers(baseXP: number, playerId: string): Promise<number>
}
```

### StreakService

```typescript
class StreakService {
  // Check and update streak
  updateStreak(playerId: string, dailyLog: DailyLog): Promise<StreakResult>

  // Get current streak with bonus tier
  getCurrentStreak(playerId: string): Promise<StreakInfo>

  // Check for streak milestones
  checkMilestones(streak: number): StreakMilestone[]
}
```

### DebuffService

```typescript
class DebuffService {
  // Apply debuff if conditions met
  evaluateDebuff(playerId: string, dailyLog: DailyLog): Promise<Debuff | null>

  // Get active debuffs
  getActiveDebuffs(playerId: string): Promise<Debuff[]>

  // Clear expired debuffs
  clearExpiredDebuffs(playerId: string): Promise<void>
}
```

### TitleService

```typescript
class TitleService {
  // Evaluate all title conditions
  evaluateTitles(playerId: string): Promise<TitleUpdate[]>

  // Check if specific title earned
  checkTitleCondition(playerId: string, titleId: string): Promise<boolean>

  // Handle title regression
  checkTitleRegression(playerId: string): Promise<TitleLoss[]>

  // Apply title passive effect
  getTitlePassive(titleId: string): TitlePassive
}
```

### NarrativeService

```typescript
class NarrativeService {
  // Get personalized narrative
  getNarrative(key: string, context: PlayerContext): Promise<string>

  // Generate daily message using Mastra
  generateDailyMessage(playerId: string): Promise<string>

  // Get contextual System message
  getSystemMessage(event: GameEvent, playerId: string): Promise<string>
}
```

---

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `daily-reset` | 00:00 UTC | Reset daily quests, process previous day |
| `streak-check` | 00:05 UTC | Evaluate streaks for all players |
| `debuff-clear` | Hourly | Clear expired debuffs |
| `dungeon-timeout` | Every 5 min | Check dungeon time limits |
| `weekly-leaderboard` | Monday 00:00 | Calculate weekly rankings |
| `season-transition` | Manual | Handle season changes |

---

## Error Handling

All errors return consistent format:

```typescript
interface APIError {
  error: string;      // Error code
  message: string;    // Human-readable message
  details?: any;      // Additional context
}
```

Common error codes:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for action |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Action conflicts with state |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| General API | 100/min |
| Health sync | 10/min |
| Auth | 5/min |
| Leaderboards | 20/min |

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
CLERK_SECRET_KEY=...

# Mastra (AI)
ANTHROPIC_API_KEY=...

# Health APIs
GOOGLE_FIT_CLIENT_ID=...
GOOGLE_FIT_CLIENT_SECRET=...
FITBIT_CLIENT_ID=...
FITBIT_CLIENT_SECRET=...
```

---

## Implementation Priority

| Phase | Endpoints |
|-------|-----------|
| **MVP** | Auth, Player, Quests, Health, XP |
| **V1** | Titles, Streaks/Debuffs, Leaderboards (basic) |
| **V1.5** | Bosses, Dungeons, Content/Narrative |
| **V2** | Guilds, Raids, Social features |
