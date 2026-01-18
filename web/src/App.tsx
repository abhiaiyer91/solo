import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Dashboard } from '@/pages/Dashboard'
import { Quests } from '@/pages/Quests'
import { Stats } from '@/pages/Stats'
import { Profile } from '@/pages/Profile'
import { Leaderboard } from '@/pages/Leaderboard'
import { Titles } from '@/pages/Titles'
import { Dungeons } from '@/pages/Dungeons'
import { Onboarding } from '@/pages/Onboarding'
import { Guild } from '@/pages/Guild'
import { ProtectedRoute, OnboardingRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout'
import { ErrorBoundary, RouteErrorBoundary } from '@/components/error'
import { ReturnProtocolModal } from '@/components/ReturnProtocolModal'
import { useSession } from '@/lib/auth-client'

function App() {
  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-system-black text-system-text font-mono">
      {/* Return Protocol check for returning players */}
      <ReturnProtocolModal />

      <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />

          {/* Onboarding route - protected but without AppShell */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            }
          />

          {/* Protected routes with AppShell and route-level error boundaries */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Dashboard />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Quests />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Leaderboard />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/titles"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Titles />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dungeons"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Dungeons />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Stats />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Profile />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/guild"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RouteErrorBoundary>
                    <Guild />
                  </RouteErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

// Redirect authenticated users away from auth pages
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  if (isPending) {
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

  if (session?.user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default App
