# G63: Level-Up and XP Animations

## Overview

Implement polished animations for level-up celebrations, XP gains, and quest completions. These micro-interactions are crucial for the gamification feel.

## Context

**Source:** Retrospection analysis - Polish needed
**Current State:** Basic level-up modal exists, minimal animation

## Acceptance Criteria

- [ ] Level-up celebration with particle effects
- [ ] XP gain toast with animated counter
- [ ] Quest completion animation
- [ ] Streak milestone celebrations
- [ ] Title unlock fanfare
- [ ] Stat increase visualization
- [ ] Sound effects (optional, respects mute setting)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/animations/LevelUpCelebration.tsx` | Create | Level-up animation |
| `web/src/components/animations/XPGainToast.tsx` | Create | XP gain animation |
| `web/src/components/animations/QuestComplete.tsx` | Create | Quest completion |
| `web/src/components/animations/ParticleEffect.tsx` | Create | Reusable particles |
| `web/src/components/animations/CountUp.tsx` | Create | Animated number counter |
| `web/src/lib/sounds.ts` | Create | Sound effect utilities |
| `web/src/hooks/useCelebration.ts` | Create | Celebration state manager |

## Implementation Notes

### Level-Up Animation

```tsx
function LevelUpCelebration({ newLevel, onComplete }: Props) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="level-up-overlay"
    >
      <ParticleEffect count={50} />
      
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="level-up-text">LEVEL UP</h1>
        <div className="new-level">
          <CountUp from={newLevel - 1} to={newLevel} duration={1} />
        </div>
      </motion.div>
      
      <SystemMessage>
        The System acknowledges your progress.
      </SystemMessage>
    </motion.div>
  )
}
```

### XP Gain Toast

```tsx
function XPGainToast({ amount, source }: Props) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="xp-toast"
    >
      <span className="xp-icon">⚡</span>
      <span className="xp-amount">
        +<CountUp from={0} to={amount} duration={0.5} />
      </span>
      <span className="xp-source">{source}</span>
    </motion.div>
  )
}
```

### Particle Effect

```tsx
function ParticleEffect({ count = 30 }: Props) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i,
    delay: Math.random() * 0.3,
  }))
  
  return (
    <div className="particle-container">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="particle"
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(p.angle * Math.PI / 180) * 200,
            y: Math.sin(p.angle * Math.PI / 180) * 200,
          }}
          transition={{ delay: p.delay, duration: 1 }}
        />
      ))}
    </div>
  )
}
```

### Sound Effects

```typescript
const sounds = {
  levelUp: '/sounds/level-up.mp3',
  xpGain: '/sounds/xp-gain.mp3',
  questComplete: '/sounds/quest-complete.mp3',
  titleUnlock: '/sounds/title-unlock.mp3',
}

export function playSound(sound: keyof typeof sounds) {
  if (localStorage.getItem('soundMuted') === 'true') return
  
  const audio = new Audio(sounds[sound])
  audio.volume = 0.3
  audio.play().catch(() => {}) // Ignore autoplay errors
}
```

## Definition of Done

- [ ] Level-up feels rewarding
- [ ] XP gains are visible and satisfying
- [ ] Quest completion has feedback
- [ ] Animations don't block interaction
- [ ] Sounds are optional and work
