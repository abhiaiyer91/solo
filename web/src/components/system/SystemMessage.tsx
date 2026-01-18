import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SystemMessageProps {
  children: ReactNode
  variant?: 'default' | 'warning' | 'success' | 'error'
  className?: string
}

const borderColors = {
  default: 'border-system-blue/50',
  warning: 'border-system-gold/50',
  success: 'border-system-green/50',
  error: 'border-system-red/50',
}

const glowColors = {
  default: 'shadow-system-blue/10',
  warning: 'shadow-system-gold/10',
  success: 'shadow-system-green/10',
  error: 'shadow-system-red/10',
}

export function SystemMessage({
  children,
  variant = 'default',
  className = '',
}: SystemMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        p-4 rounded border bg-system-panel/50 backdrop-blur-sm
        shadow-lg ${glowColors[variant]}
        ${borderColors[variant]}
        ${className}
      `}
    >
      <div className="text-system-text-muted text-xs mb-2 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-system-blue rounded-full animate-pulse" />
        SYSTEM
      </div>
      <div className="text-system-text font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </motion.div>
  )
}
