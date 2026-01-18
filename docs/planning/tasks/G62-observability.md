# G62: Observability & Error Tracking

## Overview

Implement production observability with error tracking (Sentry), structured logging, and basic analytics.

## Context

**Source:** Retrospection analysis - No production monitoring
**Current State:** Console.log only, no error tracking

## Acceptance Criteria

- [ ] Sentry configured for backend error tracking
- [ ] Sentry configured for frontend error tracking
- [ ] Structured logging with pino
- [ ] Request/response logging (non-sensitive)
- [ ] Health check endpoint
- [ ] Basic timing metrics for slow queries

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/lib/logger.ts` | Create | Pino logger |
| `server/src/lib/sentry.ts` | Create | Sentry setup |
| `server/src/middleware/logging.ts` | Create | Request logging |
| `server/src/routes/health.ts` | Create | Health check |
| `web/src/lib/sentry.ts` | Create | Frontend Sentry |
| `web/src/main.tsx` | Modify | Initialize Sentry |

## Implementation Notes

### Sentry Setup (Backend)

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
})

// Capture unhandled errors
app.onError((err, c) => {
  Sentry.captureException(err)
  return c.json({ error: 'Internal server error' }, 500)
})
```

### Structured Logging

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
})

// Usage
logger.info({ userId, questId }, 'Quest completed')
logger.error({ error, userId }, 'Failed to process XP')
```

### Request Logging Middleware

```typescript
app.use('*', async (c, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()
  
  c.set('requestId', requestId)
  
  await next()
  
  const duration = Date.now() - start
  
  logger.info({
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    userId: c.get('user')?.id,
  }, 'Request completed')
  
  // Alert on slow requests
  if (duration > 1000) {
    logger.warn({ requestId, duration }, 'Slow request')
  }
})
```

### Health Check

```typescript
app.get('/health', async (c) => {
  try {
    // Check database
    await db.execute(sql`SELECT 1`)
    
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown',
    })
  } catch (error) {
    return c.json({ status: 'unhealthy', error: 'Database connection failed' }, 503)
  }
})
```

### Frontend Sentry

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({ maskAllText: true }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
})
```

## Definition of Done

- [ ] Errors appear in Sentry dashboard
- [ ] Logs are structured JSON
- [ ] Health endpoint returns database status
- [ ] Slow requests are logged
- [ ] Frontend errors tracked
