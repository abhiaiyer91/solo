/**
 * SystemMessage - Enhanced system message component
 */

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  type MessageVariant,
  getMessagePrefix,
  getVariantStyles,
} from '../../hooks/useSystemMessage'
import { TypewriterText } from './TypewriterText'

interface SystemMessageProps {
  children?: ReactNode
  text?: string
  variant?: MessageVariant
  prefix?: string
  showTypewriter?: boolean
  onComplete?: () => void
  className?: string
}

export function SystemMessage({
  children,
  text,
  variant = 'default',
  prefix,
  showTypewriter = false,
  onComplete,
  className = '',
}: SystemMessageProps) {
  const displayPrefix = prefix ?? getMessagePrefix(variant)
  const variantStyles = getVariantStyles(variant)
  const isError = variant === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-system-black/80 border-l-4 ${variantStyles} rounded-r-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-mono text-xs font-bold ${variantStyles.split(' ')[1]}`}>
          {displayPrefix}
        </span>
        {isError && <GlitchIndicator />}
      </div>

      {/* Content */}
      <div className="font-mono text-sm text-system-text">
        {showTypewriter && text ? (
          <TypewriterText text={text} onComplete={onComplete} />
        ) : (
          children ?? text
        )}
      </div>
    </motion.div>
  )
}

/**
 * Glitch indicator for error messages
 */
function GlitchIndicator() {
  return (
    <motion.span
      className="inline-block w-2 h-2 bg-red-500 rounded-full"
      animate={{
        opacity: [1, 0.3, 1],
        scale: [1, 0.8, 1],
      }}
      transition={{ duration: 0.5, repeat: Infinity }}
    />
  )
}

/**
 * Compact system message for inline use
 */
export function SystemMessageCompact({
  text,
  variant = 'default',
}: {
  text: string
  variant?: MessageVariant
}) {
  const variantStyles = getVariantStyles(variant)

  return (
    <span className={`font-mono text-xs ${variantStyles.split(' ')[1]}`}>
      [SYSTEM] {text}
    </span>
  )
}

/**
 * System message toast (for notifications)
 */
export function SystemMessageToast({
  text,
  variant = 'default',
  onDismiss,
}: {
  text: string
  variant?: MessageVariant
  onDismiss?: () => void
}) {
  const variantStyles = getVariantStyles(variant)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-system-black/95 border ${variantStyles.split(' ')[0]} rounded-lg px-4 py-2 shadow-lg max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <span className={`font-mono text-xs font-bold ${variantStyles.split(' ')[1]}`}>
          ●
        </span>
        <p className="font-mono text-sm text-system-text flex-1">{text}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-system-text-muted hover:text-system-text text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Full-screen system message overlay
 */
export function SystemMessageOverlay({
  text,
  variant = 'default',
  onComplete,
}: {
  text: string
  variant?: MessageVariant
  onComplete?: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl px-8"
      >
        <SystemMessage
          text={text}
          variant={variant}
          showTypewriter
          onComplete={onComplete}
        />
        <p className="text-center text-xs font-mono text-system-text-muted mt-4">
          Tap to continue
        </p>
      </motion.div>
    </motion.div>
  )
}
