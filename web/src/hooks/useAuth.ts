import { useSession, signIn, signUp, signOut } from '@/lib/auth-client'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  level?: number
  totalXP?: number
  currentStreak?: number
  str?: number
  agi?: number
  vit?: number
  disc?: number
}

export function useAuth() {
  const { data: session, isPending, error } = useSession()
  const navigate = useNavigate()

  const user = useMemo((): AuthUser | null => {
    if (!session?.user) return null
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      level: (session.user as Record<string, unknown>).level as number | undefined,
      totalXP: (session.user as Record<string, unknown>).totalXP as number | undefined,
      currentStreak: (session.user as Record<string, unknown>).currentStreak as number | undefined,
      str: (session.user as Record<string, unknown>).str as number | undefined,
      agi: (session.user as Record<string, unknown>).agi as number | undefined,
      vit: (session.user as Record<string, unknown>).vit as number | undefined,
      disc: (session.user as Record<string, unknown>).disc as number | undefined,
    }
  }, [session])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Login failed')
      }

      navigate('/')
      return result
    },
    [navigate]
  )

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await signUp.email({
        email,
        password,
        name: name || 'Hunter',
      })

      if (result.error) {
        throw new Error(result.error.message || 'Registration failed')
      }

      navigate('/')
      return result
    },
    [navigate]
  )

  const logout = useCallback(async () => {
    await signOut()
    navigate('/login')
  }, [navigate])

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    login,
    register,
    logout,
  }
}
