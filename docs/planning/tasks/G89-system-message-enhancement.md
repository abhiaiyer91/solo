# G89: System Message Enhancement

## Overview

Enhance the System message component with improved typewriter effects, dramatic pauses, terminal-style formatting, and calculated timing for maximum impact.

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Basic typewriter effect exists; needs enhancement for dramatic effect

## Acceptance Criteria

- [ ] Variable typing speed (faster for mundane text, slower for emphasis)
- [ ] Calculated pauses between lines (1-3 seconds)
- [ ] Terminal-style prefixes: `> `, `[SYSTEM]`, `!WARNING`, `[ERROR]`
- [ ] Redacted text styling for locked content: `[DATA RESTRICTED]`
- [ ] Glitch effect on error/warning messages
- [ ] Sound hook points for future audio integration
- [ ] Skip animation option (tap to reveal all)
- [ ] Queue system for multiple sequential messages

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/system/TypewriterText.tsx` | Enhance | Advanced typewriter with pauses |
| `web/src/components/system/SystemMessage.tsx` | Enhance | Prefix support, variants |
| `web/src/components/system/SystemMessageQueue.tsx` | Create | Sequential message display |
| `web/src/components/system/RedactedText.tsx` | Create | Locked/classified content |
| `web/src/hooks/useSystemMessage.ts` | Create | Message queue management |
| `web/src/lib/text-parser.ts` | Create | Parse message format tokens |

## Implementation Notes

### Enhanced Typewriter

```typescript
interface TypewriterConfig {
  baseSpeed: number      // ms per character (default: 25)
  pauseOnPunctuation: boolean
  pauseDuration: {
    comma: number        // 200ms
    period: number       // 500ms
    newline: number      // 1000ms
    ellipsis: number     // 1500ms
  }
  emphasisSpeed: number  // Slower for *emphasized* text
}

function TypewriterText({ text, config, onComplete }: Props) {
  // Parse text for special tokens
  // Type character by character with variable delays
  // Call onComplete when finished
}
```

### Message Format Tokens

```typescript
// Supported formatting in message strings
const MESSAGE_TOKENS = {
  PAUSE: '{{pause:1000}}',     // Pause for 1000ms
  SLOW: '{{slow}}',            // Switch to slow typing
  FAST: '{{fast}}',            // Switch to fast typing
  GLITCH: '{{glitch}}',        // Glitch effect on next word
  REDACTED: '{{redacted}}',    // Render as [DATA RESTRICTED]
}

// Example message:
// "Day 14.{{pause:500}} Two weeks without failure.{{pause:1000}}\n{{slow}}Now begins the real test."
```

### System Message Variants

```tsx
type MessageVariant = 
  | 'default'      // Blue border, normal
  | 'warning'      // Gold border, ! prefix
  | 'error'        // Red border, glitch effect
  | 'success'      // Green border, checkmark
  | 'classified'   // Purple border, restricted feel

function SystemMessage({ children, variant, prefix }: Props) {
  const prefixes = {
    default: '● SYSTEM',
    warning: '! WARNING',
    error: '[ERROR]',
    success: '✓ CONFIRMED',
    classified: '◆ CLASSIFIED',
  }
  
  return (
    <div className={`system-message ${variantStyles[variant]}`}>
      <div className="message-header">
        <span className="prefix">{prefix ?? prefixes[variant]}</span>
        {variant === 'error' && <GlitchEffect />}
      </div>
      <div className="message-body">
        {children}
      </div>
    </div>
  )
}
```

### Message Queue

```tsx
function SystemMessageQueue() {
  const { messages, currentIndex, advance } = useSystemMessage()
  
  return (
    <AnimatePresence mode="wait">
      {messages[currentIndex] && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <SystemMessage 
            variant={messages[currentIndex].variant}
            onComplete={advance}
          >
            <TypewriterText text={messages[currentIndex].text} />
          </SystemMessage>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### Redacted Text

```tsx
function RedactedText({ reason }: { reason?: string }) {
  return (
    <span className="inline-block bg-system-border/50 text-system-text-muted px-2 py-0.5 rounded font-mono text-sm">
      [DATA RESTRICTED{reason ? ` - ${reason}` : ''}]
    </span>
  )
}

// Usage:
// <RedactedText reason="LEVEL 10 REQUIRED" />
// Renders: [DATA RESTRICTED - LEVEL 10 REQUIRED]
```

### Glitch Effect Component

```tsx
function GlitchEffect({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute inset-0 text-system-red opacity-70 animate-glitch" 
        aria-hidden
      >
        {children}
      </span>
      <span 
        className="absolute inset-0 text-system-blue opacity-70 animate-glitch-reverse" 
        aria-hidden
      >
        {children}
      </span>
    </span>
  )
}
```

## Definition of Done

- [ ] Typewriter effect has natural rhythm with pauses
- [ ] Message variants are visually distinct
- [ ] Skip option works (tap anywhere to reveal)
- [ ] Message queue handles sequential displays
- [ ] Redacted text is properly styled
- [ ] Glitch effect is subtle but noticeable
- [ ] Performance is maintained (no memory leaks)
