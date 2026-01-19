# G142: Sentry Error Tracking Integration

## Overview
Integrate Sentry for error tracking across server, web, and mobile applications to enable production debugging and proactive issue detection.

## Context
**Source:** Retrospective analysis 2026-01-18, observability gap
**Current State:** No error tracking, rely on console.log
**Rationale:** Cannot debug production issues without error aggregation

## Acceptance Criteria
- [ ] Sentry SDK installed in server, web, and mobile packages
- [ ] Errors automatically captured with stack traces
- [ ] User context attached to errors (userId, level)
- [ ] Source maps uploaded for readable stack traces
- [ ] Environment separation (development, staging, production)
- [ ] Performance monitoring enabled (optional)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/sentry.ts | Create | Sentry initialization for server |
| server/src/index.ts | Modify | Add Sentry error handler |
| web/src/lib/sentry.ts | Create | Sentry initialization for web |
| web/src/main.tsx | Modify | Initialize Sentry early |
| mobile/src/lib/sentry.ts | Create | Sentry initialization for mobile |
| .github/workflows/ci.yml | Modify | Upload source maps on deploy |

## Implementation Notes

### Server Integration
```typescript
// server/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.postgresIntegration(),
    ],
  });
}

export function setUserContext(userId: string, level: number) {
  Sentry.setUser({ id: userId, level });
}

export { Sentry };
```

### Server Error Handler
```typescript
// In server/src/index.ts, at the end of middleware chain
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err, {
    extra: {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    },
  });

  logger.error('Unhandled error', { error: err, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});
```

### Web Integration
```typescript
// web/src/lib/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
```

### Mobile Integration
```typescript
// mobile/src/lib/sentry.ts
import * as Sentry from '@sentry/react-native';

export function initSentry() {
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  });
}

export { Sentry };
```

### Source Map Upload
```yaml
# In CI workflow, after build
- name: Upload Source Maps
  if: github.ref == 'refs/heads/main'
  run: |
    npx @sentry/cli sourcemaps upload \
      --org ${{ secrets.SENTRY_ORG }} \
      --project journey-web \
      --auth-token ${{ secrets.SENTRY_AUTH_TOKEN }} \
      web/dist
```

### Environment Variables
| Variable | Package | Description |
|----------|---------|-------------|
| SENTRY_DSN | server | Server Sentry DSN |
| VITE_SENTRY_DSN | web | Web Sentry DSN |
| EXPO_PUBLIC_SENTRY_DSN | mobile | Mobile Sentry DSN |
| SENTRY_AUTH_TOKEN | CI | For source map upload |
| SENTRY_ORG | CI | Organization slug |

## Definition of Done
- [ ] Sentry initialized in all packages
- [ ] Test error appears in Sentry dashboard
- [ ] User context appears with errors
- [ ] Source maps produce readable stack traces
- [ ] Environments correctly separated
- [ ] Documentation updated with setup instructions
