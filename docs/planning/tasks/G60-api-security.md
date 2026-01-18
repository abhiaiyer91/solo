# G60: API Security Hardening

## Overview

Implement production security measures including rate limiting, request validation, CORS configuration, and API versioning.

## Context

**Source:** Retrospection analysis - Security gaps
**Current State:** No rate limiting, basic CORS, no validation middleware

## Acceptance Criteria

- [ ] Rate limiting on all endpoints (100/min per IP, 1000/min per user)
- [ ] Request body validation with Zod
- [ ] CORS configured for production domains only
- [ ] API versioning (v1 prefix)
- [ ] Request ID tracking for debugging
- [ ] Security headers (Helmet or equivalent)
- [ ] Input sanitization

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/middleware/rate-limit.ts` | Create | Rate limiting |
| `server/src/middleware/validation.ts` | Create | Request validation |
| `server/src/middleware/security.ts` | Create | Security headers |
| `server/src/lib/validators.ts` | Create | Zod schemas |
| `server/src/index.ts` | Modify | Apply middleware |

## Implementation Notes

### Rate Limiting

```typescript
import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

// IP-based rate limiting
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // 100 requests per minute
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
  standardHeaders: true,
})

// User-based rate limiting (for authenticated routes)
const userLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 1000,
  keyGenerator: (c) => c.get('user')?.id || 'anonymous',
})
```

### Request Validation

```typescript
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const createQuestSchema = z.object({
  templateId: z.string().min(1),
  progress: z.record(z.number()),
})

app.post('/quests', 
  zValidator('json', createQuestSchema),
  async (c) => { ... }
)
```

### CORS Configuration

```typescript
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'https://solo.example.com',
      'https://app.solo.example.com',
    ]
    if (process.env.NODE_ENV === 'development') {
      allowed.push('http://localhost:5173')
    }
    return allowed.includes(origin) ? origin : null
  },
  credentials: true,
}))
```

### Security Headers

```typescript
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})
```

## Definition of Done

- [ ] Rate limiting active on all routes
- [ ] Invalid requests return 400 with clear errors
- [ ] CORS blocks unauthorized origins
- [ ] Security headers present in responses
- [ ] API versioned at /api/v1/
