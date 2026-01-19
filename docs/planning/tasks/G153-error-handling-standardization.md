# G153: Error Handling Standardization

## Overview
Standardize error handling across the backend with custom error classes, centralized middleware, and consistent response formats. Currently error handling is inconsistent across 463 try/catch blocks.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `server/src/routes/*.ts`, `server/src/services/*.ts`
**Current State:** Inconsistent error handling patterns across services

## Acceptance Criteria
- [ ] Custom error classes for common error types
- [ ] Centralized error handling middleware
- [ ] Consistent error response format across all routes
- [ ] Proper HTTP status codes for different error types
- [ ] Structured error logging with context
- [ ] Client-friendly error messages (no stack traces in production)
- [ ] Migration of existing error handling to new pattern

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/errors.ts | Create | Custom error classes |
| server/src/middleware/error-handler.ts | Create | Centralized error middleware |
| server/src/routes/quests.ts | Modify | Use new error handling |
| server/src/routes/health.ts | Modify | Use new error handling |
| server/src/routes/player.ts | Modify | Use new error handling |
| server/src/routes/guilds.ts | Modify | Use new error handling |
| server/src/services/quest.ts | Modify | Throw custom errors |
| server/src/services/health.ts | Modify | Throw custom errors |
| server/src/services/guild.ts | Modify | Throw custom errors |
| server/src/index.ts | Modify | Register error middleware |

## Implementation Notes

### Custom Error Classes
```typescript
// server/src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      404,
      'NOT_FOUND',
      { resource, id }
    )
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}
```

### Error Handler Middleware
```typescript
// server/src/middleware/error-handler.ts

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error with context
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  })

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    })
  }

  // Handle unknown errors
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    error: isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack })
  })
}
```

### Usage in Routes
```typescript
// Before
app.get('/quests/:id', async (req, res) => {
  try {
    const quest = await questService.getQuest(req.params.id)
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' })
    }
    res.json(quest)
  } catch (error) {
    console.error('Error fetching quest:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// After
app.get('/quests/:id', async (req, res) => {
  const quest = await questService.getQuest(req.params.id)
  if (!quest) {
    throw new NotFoundError('Quest', req.params.id)
  }
  res.json(quest)
})
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] All existing tests pass
- [ ] Error responses are consistent across routes
- [ ] Production errors don't expose stack traces
- [ ] Errors are logged with sufficient context
