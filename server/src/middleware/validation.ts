/**
 * Request Validation Middleware
 * 
 * Provides helpers for validating request bodies with Zod.
 */

import type { Context, Next } from 'hono'
import { z } from 'zod'
import { formatZodErrors } from '../lib/validators'
import { sanitizeObject } from './security'

/**
 * Validate request body against a Zod schema
 * Returns a middleware that validates and attaches parsed data to context
 */
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      
      // Sanitize input before validation
      const sanitizedBody = typeof body === 'object' && body !== null 
        ? sanitizeObject(body as Record<string, unknown>)
        : body
      
      const result = schema.safeParse(sanitizedBody)
      
      if (!result.success) {
        return c.json({
          error: 'Validation failed',
          message: '[SYSTEM] Invalid request data',
          details: formatZodErrors(result.error),
        }, 400)
      }
      
      // Attach validated data to context
      c.set('validatedBody', result.data)
      
      await next()
    } catch (error) {
      // JSON parsing failed
      return c.json({
        error: 'Invalid JSON',
        message: '[SYSTEM] Request body must be valid JSON',
      }, 400)
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    const query = c.req.query()
    
    const result = schema.safeParse(query)
    
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        message: '[SYSTEM] Invalid query parameters',
        details: formatZodErrors(result.error),
      }, 400)
    }
    
    c.set('validatedQuery', result.data)
    
    await next()
  }
}

/**
 * Validate URL parameters against a Zod schema
 */
export function validateParams<T extends z.ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    // Extract route params - Hono handles this via c.req.param()
    // This validator is for cases where you need to validate multiple params
    const params: Record<string, string> = {}
    
    const result = schema.safeParse(params)
    
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        message: '[SYSTEM] Invalid URL parameters',
        details: formatZodErrors(result.error),
      }, 400)
    }
    
    c.set('validatedParams', result.data)
    
    await next()
  }
}

/**
 * Get validated body from context
 */
export function getValidatedBody<T>(c: Context): T {
  return c.get('validatedBody') as T
}

/**
 * Get validated query from context
 */
export function getValidatedQuery<T>(c: Context): T {
  return c.get('validatedQuery') as T
}

/**
 * Type-safe validator creator for route handlers
 */
export function createValidator<T extends z.ZodSchema>(schema: T) {
  return {
    body: validateBody(schema),
    query: validateQuery(schema),
    getBody: (c: Context) => c.get('validatedBody') as z.infer<T>,
    getQuery: (c: Context) => c.get('validatedQuery') as z.infer<T>,
  }
}
