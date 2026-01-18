# Tech Stack

## Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web Frontend** | React 18 + Vite + React Router | Fast SPA with file-based routing |
| **Mobile** | React Native + Expo | iOS app with native capabilities |
| **Health Data** | Apple HealthKit (react-native-health) | Steps, workouts, sleep from Apple Watch |
| **Nutrition AI** | LogMeal API | Photo-based food recognition |
| **State** | Zustand + TanStack Query | Client state + server cache |
| **Animation** | Framer Motion (web) / Reanimated (mobile) | System visual effects |
| **Auth** | Better Auth | Session-based authentication |
| **Backend** | Hono + TypeScript | Fast, type-safe API server |
| **AI/Rules** | Mastra Agent Framework | Quest evaluation, XP calculation |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe SQL queries |
| **Content** | PostgreSQL + NarrativeService | Narrative content in database |
| **Hosting** | TBD (Vercel/Railway/Render) | Deployment platform |

---

## Why These Choices

### Hono over Express/Fastify
- Extremely fast (built on Web Standards)
- First-class TypeScript support
- Works everywhere (Node, Bun, Deno, Edge)
- Lightweight (~14kb)

### Drizzle over Prisma
- No code generation step
- Better TypeScript inference
- SQL-like syntax (less abstraction)
- Lighter runtime

### Better Auth over NextAuth/Clerk
- Framework agnostic
- Self-hosted (no vendor lock-in)
- Simple session management
- Works with any database adapter

### React Native + Expo over Native Swift
- Share code with web frontend
- Faster iteration
- Good enough performance for this use case
- Expo manages native complexity

### LogMeal over building our own
- Production-ready food recognition
- 1300+ dishes recognized
- Nutritional data included
- Focus on core product, not ML

### Mastra over raw LLM calls
- Structured agent framework
- Tool composition
- Reproducible evaluations
- Anthropic best practices built-in

---

## Version Requirements

```json
{
  "node": ">=20.0.0",
  "bun": ">=1.0.0",
  "postgresql": ">=15.0"
}
```

---

## Package Highlights

### Backend
```json
{
  "hono": "^4.x",
  "drizzle-orm": "^0.30.x",
  "better-auth": "^1.x",
  "@mastra/core": "^0.x"
}
```

### Web Frontend
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "framer-motion": "^11.x"
}
```

### Mobile
```json
{
  "expo": "~50.x",
  "react-native": "0.73.x",
  "react-native-health": "^1.x",
  "react-native-reanimated": "^3.x"
}
```
