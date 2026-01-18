/**
 * Security Headers Middleware
 * 
 * Adds security headers to all responses to protect against common attacks.
 */

import type { Context, Next } from 'hono'
import { createId } from '@paralleldrive/cuid2'

/**
 * Security headers middleware
 * Adds common security headers to protect against XSS, clickjacking, etc.
 */
export async function securityHeaders(c: Context, next: Next) {
  // Generate request ID for tracing
  const requestId = c.req.header('x-request-id') || createId()
  c.set('requestId', requestId)
  
  await next()
  
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('X-Request-ID', requestId)
  
  // Prevent caching of API responses
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  c.header('Pragma', 'no-cache')
  
  // Content Security Policy for API responses
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  
  // Permissions Policy (disable unnecessary browser features)
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

/**
 * Production CORS configuration
 * Only allows specific origins in production
 */
export function getSecureCorsConfig() {
  const allowedOrigins = [
    'https://solo.example.com',
    'https://app.solo.example.com',
  ]
  
  // Add development origins
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173')
    allowedOrigins.push('http://localhost:3000')
    allowedOrigins.push('http://127.0.0.1:5173')
  }
  
  // Add configured frontend URL
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL)
  }
  
  return {
    origin: (origin: string) => {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return null
      
      if (allowedOrigins.includes(origin)) {
        return origin
      }
      
      // In development, be more permissive
      if (process.env.NODE_ENV !== 'production') {
        return origin
      }
      
      return null
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
  }
}

/**
 * Input sanitization helper
 * Removes potentially dangerous characters from strings
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol  
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
        item
      )
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  
  return result as T
}
