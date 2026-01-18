import { useState, useEffect, useCallback } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number // ms per character
  onComplete?: () => void
  className?: string
  showCursor?: boolean
}

export function TypewriterText({
  text,
  speed = 30,
  onComplete,
  className = '',
  showCursor = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const stableOnComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('')
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)

      return () => clearTimeout(timeout)
    } else if (!isComplete && displayedText.length === text.length) {
      setIsComplete(true)
      stableOnComplete()
    }
  }, [displayedText, text, speed, isComplete, stableOnComplete])

  // Split by newlines to preserve formatting
  const lines = displayedText.split('\n')

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      {showCursor && !isComplete && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-system-blue animate-pulse align-middle" />
      )}
    </span>
  )
}
