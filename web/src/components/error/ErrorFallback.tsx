import { motion } from 'framer-motion'

interface ErrorFallbackProps {
  error: Error | null
  errorId: string | null
  onRetry?: () => void
  onNavigateHome?: () => void
}

/**
 * Fallback UI displayed when an error is caught by ErrorBoundary.
 * Styled to match the Solo Leveling System theme.
 */
export function ErrorFallback({
  error,
  errorId,
  onRetry,
  onNavigateHome,
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      // Default: reload the page
      window.location.reload()
    }
  }

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-system-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="system-window p-8 border-system-red/50">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-2 border-system-red rounded-lg flex items-center justify-center">
              <span className="text-system-red text-3xl font-bold">!</span>
            </div>
          </div>

          {/* Error Header */}
          <div className="text-center mb-6">
            <h1 className="text-system-red text-lg font-bold mb-2">
              SYSTEM ERROR DETECTED
            </h1>
            <div className="h-px bg-system-red/30 mx-auto w-32" />
          </div>

          {/* Error Message */}
          <div className="space-y-4 text-center">
            <p className="text-system-text">
              An unexpected error has occurred.
            </p>
            <p className="text-system-text-muted text-sm">
              The System is recording this incident.
            </p>

            {/* Error Details */}
            {error && (
              <div className="mt-4 p-3 bg-system-black/50 border border-system-border rounded text-left">
                <p className="text-system-text-muted text-xs font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Error ID for debugging */}
            {errorId && (
              <p className="text-system-text-muted text-xs">
                Error ID: <span className="font-mono text-system-blue">{errorId}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleRetry}
              className="w-full py-3 border border-system-blue rounded bg-system-blue/10 text-system-blue hover:bg-system-blue/20 transition-colors font-medium"
            >
              RETRY
            </button>
            <button
              type="button"
              onClick={handleNavigateHome}
              className="w-full py-3 border border-system-border rounded bg-transparent text-system-text-muted hover:border-system-text-muted hover:text-system-text transition-colors"
            >
              Return to Dashboard
            </button>
          </div>

          {/* System Footer */}
          <div className="mt-8 pt-4 border-t border-system-border">
            <p className="text-system-text-muted text-xs text-center">
              [SYSTEM] Error logged. Your progress has been preserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
