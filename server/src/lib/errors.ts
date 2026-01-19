/**
 * Custom Error Classes
 * Standardized error handling for the API
 */

/**
 * Base application error with HTTP status and error code
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND', { resource, id })
    this.name = 'NotFoundError'
  }
}

/**
 * Validation error for invalid input (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

/**
 * Authentication required error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Authorization denied error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Resource conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', retryAfter ? { retryAfter } : undefined)
    this.name = 'RateLimitError'
  }
}

/**
 * Bad request for malformed data (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details)
    this.name = 'BadRequestError'
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string, details?: Record<string, unknown>) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE', {
      service,
      ...details,
    })
    this.name = 'ServiceUnavailableError'
  }
}

/**
 * Quest-specific errors
 */
export class QuestNotFoundError extends NotFoundError {
  constructor(questId: string) {
    super('Quest', questId)
  }
}

export class QuestAlreadyCompletedError extends ConflictError {
  constructor(questId: string) {
    super('Quest has already been completed', { questId })
  }
}

export class QuestNotActiveError extends BadRequestError {
  constructor(questId: string, currentStatus: string) {
    super('Quest is not active', { questId, currentStatus })
  }
}

/**
 * User-specific errors
 */
export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('User', userId)
  }
}

/**
 * Guild-specific errors
 */
export class GuildNotFoundError extends NotFoundError {
  constructor(guildId: string) {
    super('Guild', guildId)
  }
}

export class GuildMembershipError extends ConflictError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details)
    this.name = 'GuildMembershipError'
  }
}

/**
 * Dungeon-specific errors
 */
export class DungeonNotFoundError extends NotFoundError {
  constructor(dungeonId: string) {
    super('Dungeon', dungeonId)
  }
}

export class DungeonAlreadyActiveError extends ConflictError {
  constructor() {
    super('You already have an active dungeon')
  }
}

/**
 * Health sync errors
 */
export class HealthSyncError extends AppError {
  constructor(message: string, source: string) {
    super(message, 400, 'HEALTH_SYNC_ERROR', { source })
    this.name = 'HealthSyncError'
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Create error from unknown catch block value
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  return new Error('Unknown error occurred')
}
