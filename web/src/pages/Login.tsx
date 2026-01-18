import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="system-window max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-system-blue mb-2">
            HUNTER LOGIN
          </h1>
          <p className="text-system-text-muted text-sm">
            Enter your credentials to access the System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded border border-system-red/50 bg-system-red/10 text-system-red text-sm"
            >
              [ERROR] {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-system-text-muted text-sm uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-system-black border border-system-border rounded
                         text-system-text placeholder-system-text-muted/50
                         focus:border-system-blue focus:outline-none focus:ring-1 focus:ring-system-blue/50
                         transition-colors"
              placeholder="hunter@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-system-text-muted text-sm uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-system-black border border-system-border rounded
                         text-system-text placeholder-system-text-muted/50
                         focus:border-system-blue focus:outline-none focus:ring-1 focus:ring-system-blue/50
                         transition-colors"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              'ACCESS SYSTEM'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-system-text-muted text-sm">
            New Hunter?{' '}
            <Link
              to="/signup"
              className="text-system-blue hover:text-system-blue/80 transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-system-text-muted/50 text-xs"
      >
        Solo Leveling Fitness Quest System v1.0
      </motion.p>
    </div>
  )
}
