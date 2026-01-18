import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await register(email, password, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            HUNTER REGISTRATION
          </h1>
          <p className="text-system-text-muted text-sm">
            Create your account to begin your ascent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              Hunter Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-system-black border border-system-border rounded
                         text-system-text placeholder-system-text-muted/50
                         focus:border-system-blue focus:outline-none focus:ring-1 focus:ring-system-blue/50
                         transition-colors"
              placeholder="Your hunter name"
              disabled={isSubmitting}
            />
          </div>

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
              minLength={8}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-system-text-muted text-sm uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>INITIALIZING...</span>
              </>
            ) : (
              'AWAKEN'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-system-text-muted text-sm">
            Already a Hunter?{' '}
            <Link
              to="/login"
              className="text-system-blue hover:text-system-blue/80 transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 border border-system-border/50 rounded bg-system-black/50">
          <p className="text-system-text-muted text-xs text-center">
            By registering, you agree to begin your daily quests and level up
            your real-world stats. There is no turning back.
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
