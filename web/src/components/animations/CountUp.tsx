import { useEffect, useState, useRef } from 'react'

interface CountUpProps {
  from: number
  to: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
  onComplete?: () => void
}

/**
 * CountUp - Animated number counter
 * 
 * Smoothly animates from one number to another using easing.
 */
export function CountUp({
  from,
  to,
  duration = 1,
  formatter = (v) => Math.round(v).toLocaleString(),
  className = '',
  onComplete,
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(from)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    if (from === to) {
      setDisplayValue(to)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = from + (to - from) * eased
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(to)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [from, to, duration, onComplete])

  return <span className={className}>{formatter(displayValue)}</span>
}

/**
 * XPCountUp - Specialized counter for XP with + prefix
 */
export function XPCountUp({
  amount,
  duration = 0.5,
  className = '',
  onComplete,
}: {
  amount: number
  duration?: number
  className?: string
  onComplete?: () => void
}) {
  return (
    <span className={className}>
      +<CountUp from={0} to={amount} duration={duration} onComplete={onComplete} />
    </span>
  )
}
