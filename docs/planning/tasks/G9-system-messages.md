# G9: Build System Message Components

## Overview

Create the `SystemMessage` and `TypewriterText` components that display narrative content in the characteristic "System" voice of the app.

## Context

**Current State:**
- CSS animations for typewriter exist in index.css
- No reusable SystemMessage component
- Narrative content will come from backend later

**This task is independent** - no dependencies.

## Acceptance Criteria

- [ ] `SystemMessage` component with system window styling
- [ ] `TypewriterText` animates text character by character
- [ ] Configurable typing speed
- [ ] Optional callback when typing completes
- [ ] Supports multi-line messages
- [ ] System message shown on daily login (hardcoded initially)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/system/SystemMessage.tsx` | Create | Message container |
| `web/src/components/system/TypewriterText.tsx` | Create | Animated text |
| `web/src/components/system/index.ts` | Create | Exports |

## Implementation Guide

### TypewriterText Component

```typescript
import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number // ms per character
  onComplete?: () => void
  className?: string
}

export function TypewriterText({
  text,
  speed = 30,
  onComplete,
  className = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  )
}
```

### SystemMessage Component

```typescript
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SystemMessageProps {
  children: ReactNode
  variant?: 'default' | 'warning' | 'success' | 'error'
}

export function SystemMessage({
  children,
  variant = 'default',
}: SystemMessageProps) {
  const borderColors = {
    default: 'border-system-blue/50',
    warning: 'border-system-gold/50',
    success: 'border-system-green/50',
    error: 'border-system-red/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded border bg-system-panel/50
        ${borderColors[variant]}
      `}
    >
      <div className="text-system-text-muted text-xs mb-2 uppercase tracking-wider">
        [SYSTEM]
      </div>
      <div className="text-system-text font-mono text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  )
}
```

## Usage Example

```typescript
import { SystemMessage, TypewriterText } from '@/components/system'

function DailyWelcome() {
  return (
    <SystemMessage>
      <TypewriterText
        text="Day 14. The pattern holds. Your consistency is noted."
        speed={25}
      />
    </SystemMessage>
  )
}
```

## Definition of Done

- [ ] SystemMessage component styled correctly
- [ ] TypewriterText animates text
- [ ] Cursor blinks during typing
- [ ] Multi-line text works
- [ ] Used in at least one place (Dashboard welcome)
