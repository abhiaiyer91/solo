import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: window.location.origin, // Uses current origin, goes through Vite proxy in dev
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
