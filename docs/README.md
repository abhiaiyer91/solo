# Solo Leveling Fitness Quest System — Documentation

> *"The System does not encourage. It does not celebrate. It records."*

A gamified fitness application inspired by Solo Leveling, where real-world health data automatically drives quest completion, XP gains, and character progression.

---

## Quick Links

| I want to... | Go to |
|--------------|-------|
| Understand the project | [Overview](#overview) |
| See the database schema | [Database Schema](./database/schema.md) |
| Understand game mechanics | [Game Systems](./game-systems/README.md) |
| Build the backend | [Backend Guide](./backend/README.md) |
| Build the mobile app | [Mobile Guide](./mobile/README.md) |
| Write narrative content | [Content Guide](./content/README.md) |
| See what to build | [Task Decomposition](./planning/task-decomposition.md) |
| See immediate priorities | [Gaps & Priorities](./planning/gaps-and-priorities.md) |

---

## Overview

### [Tech Stack](./overview/tech-stack.md)
Core technologies: React Native + Expo, Hono, Drizzle, HealthKit, LogMeal AI

### [Core Concepts](./overview/core-concepts.md)
Player stats, quest types, XP system, debuffs — the foundational game design

### [Player Journey](./overview/player-journey.md)
Complete experience map from first login through mastery

---

## Database

### [Schema](./database/schema.md)
Complete Drizzle ORM schema: users, quests, XP ledger, titles, bosses, dungeons, seasons

---

## Game Systems

### [Overview](./game-systems/README.md)
Index of all gameplay mechanics

### [XP & Leveling](./game-systems/xp-leveling.md)
Level curve formulas, XP modifiers, progression math

### [Quests](./game-systems/quests.md)
Requirements DSL, quest types, auto-completion logic

### [Quest Variety](./game-systems/quest-variety.md)
Core quests vs rotating quests, novelty system

### [Streaks & Debuffs](./game-systems/streaks-debuffs.md)
Streak calculation, debuff triggers, recovery

### [Failure & Recovery](./game-systems/failure-recovery.md)
Philosophy on handling player failures constructively

### [Titles & Passives](./game-systems/titles.md)
Unlock conditions, passive effects, title regression

### [Boss Fights](./game-systems/bosses.md)
Multi-phase identity challenges

### [Dungeons](./game-systems/dungeons.md)
Time-limited high-risk challenges

### [Dungeon Designs](./game-systems/dungeon-designs.md)
Specific dungeon configurations and narratives

### [Seasons](./game-systems/seasons.md)
Seasonal content, leaderboards, themes

### [Social](./game-systems/social.md)
Guilds, accountability partners, leaderboards, raid bosses

---

## Mobile

### [Overview](./mobile/README.md)
Mobile app architecture, screens, health integration

### [Data Input System](./mobile/data-input.md)
How health data flows from devices to quests

---

## Frontend

### [Overview](./frontend/README.md)
Web architecture, design system, component patterns

### [Daily Rhythm](./frontend/daily-rhythm.md)
Temporal UX flow and daily user experience

---

## Backend

### [API Documentation](./backend/README.md)
Hono routes, service layer, cron jobs

---

## Content

### [Overview](./content/README.md)
Content philosophy and guidelines

### [Narrative Engine](./content/narrative-engine.md)
Dynamic, personalized storytelling architecture

### [Content Requirements](./content/content-requirements.md)
Writer's brief — all narrative content needed

---

## Planning

### [Task Decomposition](./planning/task-decomposition.md)
All tasks organized by phase and sprint

### [Gaps & Priorities](./planning/gaps-and-priorities.md)
Current implementation gaps with prioritized action items

---

## Project Structure

```
solo/
├── docs/                   # You are here
│   ├── overview/          # Tech stack, concepts, journey
│   ├── database/          # Drizzle schema
│   ├── game-systems/      # XP, quests, bosses, dungeons, social
│   ├── backend/           # API routes, services
│   ├── mobile/            # HealthKit, data input
│   ├── frontend/          # UI, daily rhythm
│   ├── content/           # Narrative, CMS
│   └── planning/          # Task decomposition
├── server/                 # Hono backend
│   ├── src/
│   │   ├── db/            # Drizzle schema
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── mastra/        # AI agents
│   └── package.json
├── web/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   └── hooks/         # Custom hooks
│   └── package.json
└── mobile/                 # React Native app (Expo)
    ├── app/               # Expo Router
    ├── src/
    │   ├── health/        # HealthKit integration
    │   └── components/    # Mobile UI
    └── package.json
```

---

## Getting Started

```bash
# Clone and install
git clone <repo>
cd solo

# Start database
docker-compose up -d postgres

# Run backend
cd server && bun install && bun dev

# Run web frontend
cd web && bun install && bun dev

# Run mobile app
cd mobile && bun install && npx expo start
```
