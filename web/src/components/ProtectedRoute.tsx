import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePlayer } from '@/hooks/usePlayer'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="system-window p-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted">SYSTEM LOADING...</span>
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: player, isLoading: playerLoading } = usePlayer()
  const location = useLocation()

  // Wait for auth check
  if (authLoading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Wait for player data to check onboarding status
  if (playerLoading) {
    return <LoadingScreen />
  }

  // Redirect to onboarding if not completed
  if (player && !player.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

/**
 * Route wrapper for the onboarding page
 * Redirects completed users to dashboard
 */
export function OnboardingRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: player, isLoading: playerLoading } = usePlayer()
  const location = useLocation()

  // Wait for auth check
  if (authLoading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Wait for player data to check onboarding status
  if (playerLoading) {
    return <LoadingScreen />
  }

  // Redirect to dashboard if onboarding already completed
  if (player?.onboardingCompleted) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
