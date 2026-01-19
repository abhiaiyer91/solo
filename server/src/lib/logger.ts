/**
 * Structured Logger
 * Pino-compatible logging with JSON output for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  time: string
  msg: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const isProduction = process.env.NODE_ENV === 'production'
const configuredLevel = process.env.LOG_LEVEL || 'info'
const minLevel = LOG_LEVELS[configuredLevel as LogLevel] || LOG_LEVELS.info

/**
 * Create a structured log entry
 */
function createLogEntry(level: LogLevel, msg: string, context?: LogContext): LogEntry {
  return {
    level,
    time: new Date().toISOString(),
    msg,
    ...context,
  }
}

/**
 * Output log entry
 */
function output(entry: LogEntry): void {
  if (LOG_LEVELS[entry.level] < minLevel) return

  if (isProduction) {
    // JSON output for production
    console.log(JSON.stringify(entry))
  } else {
    // Pretty output for development
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    }
    const reset = '\x1b[0m'
    const color = levelColors[entry.level]
    
    const { level, time, msg, ...rest } = entry
    const contextStr = Object.keys(rest).length > 0 
      ? ` ${JSON.stringify(rest)}` 
      : ''
    
    console.log(
      `${color}[${level.toUpperCase()}]${reset} ${time.split('T')[1]?.slice(0, 8)} ${msg}${contextStr}`
    )
  }
}

/**
 * Main logger interface
 */
export const logger = {
  debug(msg: string, context?: LogContext): void {
    output(createLogEntry('debug', msg, context))
  },

  info(msg: string, context?: LogContext): void {
    output(createLogEntry('info', msg, context))
  },

  warn(msg: string, context?: LogContext): void {
    output(createLogEntry('warn', msg, context))
  },

  error(msg: string, context?: LogContext): void {
    output(createLogEntry('error', msg, context))
  },

  /**
   * Create a child logger with preset context
   */
  child(baseContext: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => 
        logger.debug(msg, { ...baseContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => 
        logger.info(msg, { ...baseContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => 
        logger.warn(msg, { ...baseContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => 
        logger.error(msg, { ...baseContext, ...ctx }),
    }
  },

  /**
   * Log timing for operations
   */
  time(label: string): () => number {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      logger.debug(`${label} completed`, { duration })
      return duration
    }
  },
}

/**
 * Request logger context
 */
export interface RequestLog {
  requestId: string
  method: string
  path: string
  status?: number
  duration?: number
  userId?: string
  error?: string
}

/**
 * Log a request completion
 */
export function logRequest(req: RequestLog): void {
  const level = req.status && req.status >= 500 ? 'error' : 
                req.status && req.status >= 400 ? 'warn' : 'info'
  
  const entry = createLogEntry(level, 'Request completed', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    status: req.status,
    duration: req.duration,
    userId: req.userId,
    error: req.error,
  })
  
  output(entry)

  // Warn on slow requests
  if (req.duration && req.duration > 1000) {
    logger.warn('Slow request detected', {
      requestId: req.requestId,
      duration: req.duration,
      path: req.path,
    })
  }
}

export default logger
