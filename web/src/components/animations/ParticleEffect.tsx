import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ParticleEffectProps {
  count?: number
  colors?: string[]
  spread?: number
  duration?: number
  className?: string
}

interface Particle {
  id: number
  angle: number
  delay: number
  color: string
  size: number
}

/**
 * ParticleEffect - Animated particle burst for celebrations
 * 
 * Creates particles that explode outward from center in all directions.
 */
export function ParticleEffect({
  count = 30,
  colors = ['#60A5FA', '#FBBF24', '#4ADE80', '#A855F7'],
  spread = 200,
  duration = 1,
  className = '',
}: ParticleEffectProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + Math.random() * 20 - 10,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#60A5FA',
      size: 4 + Math.random() * 6,
    }))
  }, [count, colors])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((p) => {
        const radians = (p.angle * Math.PI) / 180
        const x = Math.cos(radians) * spread
        const y = Math.sin(radians) * spread

        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0],
              x: [0, x * 0.6, x],
              y: [0, y * 0.6, y],
              opacity: [1, 1, 0],
            }}
            transition={{
              delay: p.delay,
              duration: duration,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * ConfettiEffect - Falling confetti particles
 */
export function ConfettiEffect({
  count = 50,
  colors = ['#60A5FA', '#FBBF24', '#4ADE80', '#A855F7', '#EC4899'],
  className = '',
}: Pick<ParticleEffectProps, 'count' | 'colors' | 'className'>) {
  const confetti = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#60A5FA',
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8,
    }))
  }, [count, colors])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.x}%`,
            backgroundColor: c.color,
            width: c.size,
            height: c.size * 0.4,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: ['0%', '120%'],
            rotate: [c.rotation, c.rotation + 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            delay: c.delay,
            duration: 3,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}
