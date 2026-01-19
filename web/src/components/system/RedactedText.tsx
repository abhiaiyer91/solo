/**
 * RedactedText - Styled locked/classified content
 */

import { motion } from 'framer-motion'

interface RedactedTextProps {
  reason?: string
  level?: number
  className?: string
}

export function RedactedText({ reason, level, className = '' }: RedactedTextProps) {
  const displayReason = level 
    ? `LEVEL ${level} REQUIRED` 
    : reason

  return (
    <span
      className={`inline-block bg-system-border/50 text-system-text-muted px-2 py-0.5 
                  rounded font-mono text-sm border border-system-border/30 ${className}`}
    >
      [DATA RESTRICTED{displayReason ? ` - ${displayReason}` : ''}]
    </span>
  )
}

/**
 * Classified block for larger content
 */
export function ClassifiedBlock({ 
  title,
  reason,
  className = '',
}: { 
  title?: string
  reason?: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-purple-950/20 border border-purple-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-400">◆</span>
        <span className="font-mono text-xs font-bold text-purple-400">CLASSIFIED</span>
      </div>
      
      {title && (
        <p className="font-mono text-sm text-white mb-1">{title}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="inline-block bg-purple-900/30 text-purple-300/50 px-2 py-1 
                       rounded font-mono text-xs"
          >
            ████████
          </span>
        ))}
      </div>
      
      {reason && (
        <p className="font-mono text-xs text-purple-400/70 mt-3">
          Access restricted: {reason}
        </p>
      )}
    </motion.div>
  )
}

/**
 * Inline redacted span (glitch effect on hover)
 */
export function RedactedSpan({ 
  content,
  revealed = false,
}: { 
  content: string
  revealed?: boolean
}) {
  if (revealed) {
    return <span className="font-mono">{content}</span>
  }

  return (
    <motion.span
      className="inline-block bg-gray-700 text-gray-700 px-1 rounded cursor-not-allowed"
      whileHover={{ 
        backgroundColor: 'rgba(100, 100, 100, 0.8)',
      }}
    >
      {content.replace(/./g, '█')}
    </motion.span>
  )
}

/**
 * Scrambled text effect
 */
export function ScrambledText({ 
  text,
  revealed = false,
  scrambleChars = '!@#$%^&*',
}: { 
  text: string
  revealed?: boolean
  scrambleChars?: string
}) {
  if (revealed) {
    return <span className="font-mono">{text}</span>
  }

  const scrambled = text
    .split('')
    .map((char) => {
      if (char === ' ') return ' '
      const idx = Math.floor(Math.random() * scrambleChars.length)
      return scrambleChars[idx]
    })
    .join('')

  return (
    <span className="font-mono text-system-text-muted opacity-50">
      {scrambled}
    </span>
  )
}
