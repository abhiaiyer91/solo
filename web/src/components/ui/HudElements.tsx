/**
 * HUD Elements - Decorative UI components for System aesthetic
 */

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

/**
 * Corner brackets for panels (Solo Leveling System window style)
 */
export function HudCorners({ 
  className = '',
  color = 'system-blue',
  size = 'md',
}: { 
  className?: string
  color?: 'system-blue' | 'system-accent' | 'system-xp' | 'crimson'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size]

  const borderColor = `border-${color}/50`

  return (
    <>
      <div className={`absolute top-0 left-0 ${sizeClass} border-l-2 border-t-2 ${borderColor} ${className}`} />
      <div className={`absolute top-0 right-0 ${sizeClass} border-r-2 border-t-2 ${borderColor} ${className}`} />
      <div className={`absolute bottom-0 left-0 ${sizeClass} border-l-2 border-b-2 ${borderColor} ${className}`} />
      <div className={`absolute bottom-0 right-0 ${sizeClass} border-r-2 border-b-2 ${borderColor} ${className}`} />
    </>
  )
}

/**
 * Targeting reticle for highlighting elements
 */
export function TargetingReticle({ 
  size = 24,
  color = 'currentColor',
  animated = true,
}: { 
  size?: number
  color?: string
  animated?: boolean
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      animate={animated ? { rotate: 360 } : undefined}
      transition={animated ? { duration: 8, repeat: Infinity, ease: 'linear' } : undefined}
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
      {/* Inner crosshairs */}
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="2" fill={color} />
    </motion.svg>
  )
}

/**
 * Scanline overlay effect
 */
export function ScanlineOverlay({ 
  intensity = 'low',
}: { 
  intensity?: 'low' | 'medium' | 'high'
}) {
  const opacityClass = {
    low: 'opacity-5',
    medium: 'opacity-10',
    high: 'opacity-20',
  }[intensity]

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${opacityClass}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.3) 2px,
          rgba(0, 0, 0, 0.3) 4px
        )`,
      }}
    />
  )
}

/**
 * Glow effect wrapper
 */
export function GlowWrapper({ 
  children,
  color = 'blue',
  intensity = 'medium',
}: { 
  children: ReactNode
  color?: 'blue' | 'green' | 'gold' | 'red' | 'purple'
  intensity?: 'low' | 'medium' | 'high'
}) {
  const glowColors = {
    blue: '0, 100, 255',
    green: '0, 255, 100',
    gold: '255, 200, 0',
    red: '255, 50, 50',
    purple: '150, 50, 255',
  }

  const glowIntensity = {
    low: 0.2,
    medium: 0.4,
    high: 0.6,
  }

  const rgb = glowColors[color]
  const alpha = glowIntensity[intensity]

  return (
    <div
      className="relative"
      style={{
        filter: `drop-shadow(0 0 8px rgba(${rgb}, ${alpha})) drop-shadow(0 0 20px rgba(${rgb}, ${alpha * 0.5}))`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Terminal-style text prefix
 */
export function TerminalPrefix({ 
  children,
  className = '',
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`font-mono ${className}`}>
      <span className="text-system-accent">&gt;</span> {children}
    </span>
  )
}

/**
 * Status indicator dot
 */
export function StatusDot({ 
  status,
  size = 'md',
  pulse = false,
}: { 
  status: 'active' | 'warning' | 'error' | 'inactive'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}) {
  const sizeClass = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }[size]

  const colorClass = {
    active: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    inactive: 'bg-gray-500',
  }[status]

  return (
    <span className={`relative inline-block ${sizeClass} rounded-full ${colorClass}`}>
      {pulse && status === 'active' && (
        <span className={`absolute inset-0 rounded-full ${colorClass} animate-ping`} />
      )}
    </span>
  )
}

/**
 * Divider with terminal style
 */
export function HudDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-system-border to-transparent" />
      <span className="text-system-accent text-xs">◆</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-system-border to-transparent" />
    </div>
  )
}

/**
 * Loading spinner with System style
 */
export function SystemSpinner({ 
  size = 24,
  className = '',
}: { 
  size?: number
  className?: string
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="15.7 47.1"
      />
    </motion.svg>
  )
}

/**
 * Panel wrapper with HUD styling
 */
export function HudPanel({ 
  children,
  title,
  className = '',
  corners = true,
}: { 
  children: ReactNode
  title?: string
  className?: string
  corners?: boolean
}) {
  return (
    <div className={`relative bg-system-black/50 border border-system-border rounded-lg ${className}`}>
      {corners && <HudCorners />}
      {title && (
        <div className="px-4 py-2 border-b border-system-border">
          <TerminalPrefix className="text-sm text-system-text">
            {title}
          </TerminalPrefix>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
