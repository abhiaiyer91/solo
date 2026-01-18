# Journey Fitness Quest System

> *"The System does not encourage. It does not celebrate. It records."*

A gamified fitness application where real-world health data automatically drives quest completion, XP gains, and character progression.

## Documentation

All documentation is in the [`docs/`](./docs/README.md) folder:

- **[Overview](./docs/overview/)** — Tech stack, core concepts, player journey
- **[Database](./docs/database/schema.md)** — Drizzle ORM schema
- **[Game Systems](./docs/game-systems/)** — XP, quests, streaks, bosses, dungeons
- **[Mobile](./docs/mobile/)** — HealthKit integration, data input
- **[Frontend](./docs/frontend/)** — UI design, daily rhythm
- **[Content](./docs/content/)** — Narrative engine, Sanity CMS
- **[Planning](./docs/planning/)** — Task decomposition

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web Frontend | React 18 + Vite + React Router |
| Mobile | React Native + Expo |
| Health Data | Apple HealthKit |
| Nutrition AI | LogMeal API |
| Backend | Hono + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI/Rules | Mastra Agent Framework |
| CMS | Sanity.io |

## Quick Start

```bash
# Start database
docker-compose up -d postgres

# Run backend
cd server && bun install && bun dev

# Run web frontend
cd web && bun install && bun dev

# Run mobile app
cd mobile && bun install && npx expo start
```

## Reference

The complete technical specification is in [`MASTER_SPEC.md`](./MASTER_SPEC.md).
