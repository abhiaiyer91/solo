# Content

Documentation for narrative content and content management.

---

## Documents

| Document | Description |
|----------|-------------|
| [Narrative Engine](./narrative-engine.md) | Dynamic storytelling architecture |
| [Content Requirements](./content-requirements.md) | Writer's brief for all narrative content |

---

## Content Philosophy

The System's voice is:
- **Cold** but not cruel
- **Observational** not judgmental
- **Precise** not robotic
- **Philosophical** not preachy

---

## Key Rules

1. Never use exclamation marks
2. Never encourage or motivate
3. Always reference specific player data when relevant
4. Short, declarative sentences
5. The System records; it does not command

---

## Storage

All narrative content is stored in the `narrativeContents` PostgreSQL table and managed via:
- `server/src/services/narrative.ts` - Content fetching and interpolation
- `server/src/db/seed-narrative.ts` - Content seeding script
