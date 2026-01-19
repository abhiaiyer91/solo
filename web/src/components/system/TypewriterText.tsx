/**
 * TypewriterText - Advanced typewriter effect with pauses
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'

export interface TypewriterConfig {
  baseSpeed: number
  pauseOnPunctuation: boolean
  pauseDuration: {
    comma: number
    period: number
    newline: number
    ellipsis: number
  }
  emphasisSpeed: number
}

const DEFAULT_CONFIG: TypewriterConfig = {
  baseSpeed: 25,
  pauseOnPunctuation: true,
  pauseDuration: {
    comma: 200,
    period: 500,
    newline: 1000,
    ellipsis: 1500,
  },
  emphasisSpeed: 50,
}

interface TypewriterTextProps {
  text: string
  config?: Partial<TypewriterConfig>
  speed?: number  // Convenience prop - maps to config.baseSpeed
  onComplete?: () => void
  onSkip?: () => void
  className?: string
  showCursor?: boolean
}

export function TypewriterText({
  text,
  config: configOverrides,
  speed,
  onComplete,
  onSkip,
  className = '',
  showCursor = true,
}: TypewriterTextProps) {
  // Merge speed prop into config for convenience - memoize to prevent effect resets
  const config = useMemo(() => {
    const mergedConfig = speed ? { ...configOverrides, baseSpeed: speed } : configOverrides
    return { ...DEFAULT_CONFIG, ...mergedConfig }
  }, [speed, configOverrides])
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [currentSpeed] = useState(config.baseSpeed)
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate delay for current character
  const { pauseOnPunctuation, pauseDuration } = config
  const getDelay = useCallback(
    (char: string, nextChars: string): number => {
      if (!pauseOnPunctuation) return currentSpeed

      // Check for ellipsis
      if (char === '.' && nextChars.startsWith('..')) {
        return pauseDuration.ellipsis
      }

      switch (char) {
        case '.':
        case '!':
        case '?':
          return pauseDuration.period
        case ',':
        case ';':
        case ':':
          return pauseDuration.comma
        case '\n':
          return pauseDuration.newline
        default:
          return currentSpeed
      }
    },
    [pauseOnPunctuation, pauseDuration, currentSpeed]
  )

  // Type next character
  const typeNextChar = useCallback(() => {
    if (indexRef.current >= text.length) {
      setIsComplete(true)
      onComplete?.()
      return
    }

    const char = text[indexRef.current]!
    const remaining = text.slice(indexRef.current + 1)
    const delay = getDelay(char, remaining)

    setDisplayedText(text.slice(0, indexRef.current + 1))
    indexRef.current += 1

    timeoutRef.current = setTimeout(typeNextChar, delay)
  }, [text, getDelay, onComplete])

  // Start typing
  useEffect(() => {
    indexRef.current = 0
    setDisplayedText('')
    setIsComplete(false)
    
    timeoutRef.current = setTimeout(typeNextChar, config.baseSpeed)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, typeNextChar, config.baseSpeed])

  // Handle skip
  const handleSkip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setDisplayedText(text)
    setIsComplete(true)
    onComplete?.()
    onSkip?.()
  }, [text, onComplete, onSkip])

  return (
    <span
      onClick={handleSkip}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSkip()}
    >
      {displayedText}
      {showCursor && !isComplete && (
        <motion.span
          className="inline-block w-2 h-4 bg-current ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/**
 * Simple typewriter for short texts
 */
export function TypewriterSimple({
  text,
  speed = 30,
  onComplete,
}: {
  text: string
  speed?: number
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayed('')

    const interval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(interval)
        onComplete?.()
        return
      }
      setDisplayed(text.slice(0, index + 1))
      index++
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return <>{displayed}</>
}
