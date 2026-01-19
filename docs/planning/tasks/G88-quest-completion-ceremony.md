# G88: Quest Completion Ceremony

## Overview

Transform quest completion into a satisfying micro-ceremony with enhanced animations, particle effects, and XP visualization.

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Basic completion with simple XP toast; needs more impact

## Acceptance Criteria

- [ ] Quest card "stamps" with satisfying checkmark animation on complete
- [ ] XP numbers float up from card with particle trail
- [ ] Progress bar fills with glow effect before completion
- [ ] Sound hook integration points (for future audio)
- [ ] Combo indicator when completing multiple quests quickly
- [ ] All-quests-complete celebration ("Perfect Day" moment)
- [ ] Streak increment animation if applicable

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/quest/QuestCard.tsx` | Modify | Add completion animation states |
| `web/src/components/animations/QuestComplete.tsx` | Enhance | Full completion ceremony |
| `web/src/components/animations/XPFloater.tsx` | Create | Floating XP numbers |
| `web/src/components/animations/ComboIndicator.tsx` | Create | Quick completion combo |
| `web/src/components/animations/PerfectDay.tsx` | Create | All quests complete celebration |
| `web/src/hooks/useCompletionCeremony.ts` | Create | Orchestrate ceremony sequence |

## Implementation Notes

### Completion Sequence

```typescript
async function playCompletionCeremony(quest: Quest, xpGained: number) {
  // 1. Card stamps (checkmark animation)
  await animateCheckmark(0.3)
  
  // 2. Progress bar glows
  await animateProgressComplete(0.2)
  
  // 3. XP floats up
  spawnXPFloater(xpGained, quest.category)
  
  // 4. Check for combos
  if (recentCompletions.length >= 2) {
    showComboIndicator(recentCompletions.length)
  }
  
  // 5. Check for perfect day
  if (allCoreQuestsComplete) {
    await delay(0.5)
    showPerfectDayCelebration()
  }
}
```

### Quest Card Stamp Animation

```tsx
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

function CompletionStamp() {
  return (
    <motion.svg className="absolute inset-0 w-full h-full">
      <motion.path
        d="M20 50 L40 70 L80 30"
        stroke="var(--system-green)"
        strokeWidth="4"
        fill="none"
        variants={checkmarkVariants}
        initial="hidden"
        animate="visible"
      />
    </motion.svg>
  )
}
```

### XP Floater

```tsx
function XPFloater({ amount, x, y }: Props) {
  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ 
        y: y - 100, 
        opacity: 0, 
        scale: 1.2,
        transition: { duration: 1, ease: "easeOut" }
      }}
      className="fixed pointer-events-none z-50 text-system-gold font-bold text-xl"
    >
      +{amount} XP
      <ParticleTrail count={5} />
    </motion.div>
  )
}
```

### Perfect Day Celebration

```tsx
function PerfectDayCelebration() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <ParticleEffect count={100} color="gold" />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-system-gold mb-4">
          PERFECT DAY
        </h1>
        <SystemMessage>
          All core objectives complete.
          The System acknowledges your compliance.
        </SystemMessage>
      </motion.div>
    </motion.div>
  )
}
```

### Combo Indicator

```tsx
function ComboIndicator({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed top-20 right-4 z-40"
    >
      <div className="bg-system-purple/20 border border-system-purple rounded px-4 py-2">
        <span className="text-system-purple font-bold">
          {count}x COMBO
        </span>
      </div>
    </motion.div>
  )
}
```

## Definition of Done

- [ ] Quest completion feels satisfying and rewarding
- [ ] XP gain is clearly visible and animated
- [ ] Combos encourage quick successive completions
- [ ] Perfect Day is celebrated appropriately
- [ ] Animations don't block further interaction
- [ ] Mobile performance is acceptable
