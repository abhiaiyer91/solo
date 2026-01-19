/**
 * XPFloater - Floating XP numbers with particle effects
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

interface XPFloaterProps {
  amount: number
  x: number
  y: number
  category?: string
  onComplete?: () => void
}

export function XPFloater({ amount, x, y, category, onComplete }: XPFloaterProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed pointer-events-none z-50 flex flex-col items-center"
      style={{ left: x, top: y }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{
        y: -80,
        opacity: 0,
        scale: 1.2,
      }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      {/* XP Amount */}
      <span className="text-xl font-bold text-system-xp font-mono drop-shadow-lg">
        +{amount} XP
      </span>

      {/* Category label */}
      {category && (
        <span className="text-xs text-system-xp/70 font-mono">
          {category}
        </span>
      )}

      {/* Particle trail */}
      <ParticleTrail count={5} />
    </motion.div>
  )
}

/**
 * Simple particle trail effect
 */
function ParticleTrail({ count }: { count: number }) {
  return (
    <div className="relative">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-system-xp"
          initial={{
            x: 0,
            y: 0,
            opacity: 0.8,
            scale: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 40,
            y: Math.random() * 30 + 10,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Hook to spawn XP floaters
 */
interface FloaterInstance {
  id: string
  amount: number
  x: number
  y: number
  category?: string
}

export function useXPFloater() {
  const [floaters, setFloaters] = useState<FloaterInstance[]>([])

  const spawn = useCallback((amount: number, x: number, y: number, category?: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setFloaters((prev) => [...prev, { id, amount, x, y, category }])
  }, [])

  const remove = useCallback((id: string) => {
    setFloaters((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const FloaterContainer = useCallback(() => (
    <AnimatePresence>
      {floaters.map((floater) => (
        <XPFloater
          key={floater.id}
          amount={floater.amount}
          x={floater.x}
          y={floater.y}
          category={floater.category}
          onComplete={() => remove(floater.id)}
        />
      ))}
    </AnimatePresence>
  ), [floaters, remove])

  return { spawn, FloaterContainer }
}

/**
 * Batch XP display (for multiple XP gains at once)
 */
export function XPBatchFloater({ 
  items,
  x,
  y,
  onComplete,
}: { 
  items: { amount: number; label: string }[]
  x: number
  y: number
  onComplete?: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <motion.div
      className="fixed pointer-events-none z-50 bg-black/80 border border-system-xp/50 rounded-lg p-3"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="flex justify-between gap-4 text-sm font-mono"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span className="text-system-text-muted">{item.label}</span>
          <span className="text-system-xp">+{item.amount}</span>
        </motion.div>
      ))}
      <motion.div
        className="mt-2 pt-2 border-t border-system-border flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: items.length * 0.1 }}
      >
        <span className="text-sm font-mono text-white font-bold">Total</span>
        <span className="text-lg font-mono text-system-xp font-bold">+{total} XP</span>
      </motion.div>
    </motion.div>
  )
}
