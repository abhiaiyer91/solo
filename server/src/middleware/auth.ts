import type { Context, Next } from 'hono'
import { auth, type Session } from '../lib/auth'

declare module 'hono' {
  interface ContextVariableMap {
    user: Session['user'] | null
    session: Session['session'] | null
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // If auth is not configured (no database), skip auth
  if (!auth) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (session) {
      c.set('user', session.user)
      c.set('session', session.session)
    } else {
      c.set('user', null)
      c.set('session', null)
    }
  } catch {
    c.set('user', null)
    c.set('session', null)
  }

  return next()
}

export async function requireAuth(c: Context, next: Next) {
  const user = c.get('user')

  if (!user) {
    return c.json(
      {
        error: 'Unauthorized',
        message: '[SYSTEM] Authentication required to access this resource.',
      },
      401
    )
  }

  return next()
}
