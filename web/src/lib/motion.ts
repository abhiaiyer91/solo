/**
 * Framer Motion variant presets
 * Shared animation variants for consistent micro-interactions
 */

import { type Variants, type Transition } from 'framer-motion'

// ============================================================
// Base Transitions
// ============================================================

export const easeOut: Transition = { duration: 0.2, ease: 'easeOut' }
export const easeInOut: Transition = { duration: 0.3, ease: 'easeInOut' }
export const spring: Transition = { type: 'spring', stiffness: 300, damping: 25 }
export const springBouncy: Transition = { type: 'spring', stiffness: 400, damping: 20 }

// ============================================================
// Fade Variants
// ============================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: easeOut },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: easeOut },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

export const fadeSlideDown: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: easeOut },
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
}

export const fadeSlideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: easeOut },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

export const fadeSlideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: easeOut },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
}

// ============================================================
// Scale Variants
// ============================================================

export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: spring },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.15 } },
}

export const scaleUp: Variants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: springBouncy },
  exit: { scale: 0.5, opacity: 0, transition: { duration: 0.1 } },
}

export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: springBouncy },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.1 } },
}

// ============================================================
// Stagger Variants
// ============================================================

export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerChildrenSlow: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

// ============================================================
// Quest/Game Specific Variants
// ============================================================

export const questComplete: Variants = {
  idle: { scale: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  complete: {
    scale: [1, 1.02, 1],
    backgroundColor: ['rgba(0, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.1)', 'rgba(0, 0, 0, 0.5)'],
    transition: { duration: 0.5 },
  },
}

export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const xpFloat: Variants = {
  initial: { y: 0, opacity: 1, scale: 1 },
  animate: {
    y: -80,
    opacity: 0,
    scale: 1.2,
    transition: { duration: 1, ease: 'easeOut' },
  },
}

export const streakPulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  },
}

// ============================================================
// System UI Variants
// ============================================================

export const systemMessage: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.2 },
  },
}

export const modal: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: easeInOut },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const overlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// ============================================================
// Glitch/Special Effects
// ============================================================

export const glitch: Variants = {
  normal: { x: 0, filter: 'none' },
  glitch: {
    x: [0, -2, 2, -1, 1, 0],
    filter: [
      'none',
      'hue-rotate(90deg)',
      'hue-rotate(-90deg)',
      'hue-rotate(45deg)',
      'none',
    ],
    transition: { duration: 0.2 },
  },
}

export const scanline: Variants = {
  animate: {
    backgroundPosition: ['0% 0%', '0% 100%'],
    transition: { duration: 4, repeat: Infinity, ease: 'linear' },
  },
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Create stagger container with custom delay
 */
export function createStaggerContainer(staggerDelay: number = 0.05): Variants {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }
}

/**
 * Create delayed animation
 */
export function withDelay<T extends Variants>(variants: T, delay: number): Variants {
  return {
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...(typeof variants.animate === 'object' ? variants.animate.transition : {}),
        delay,
      },
    },
  }
}
