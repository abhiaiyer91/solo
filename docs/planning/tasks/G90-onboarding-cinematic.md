# G90: Onboarding Cinematic Experience

## Overview

Transform the first-time user experience into a cinematic "Awakening" sequence that sets the tone for the entire game.

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Basic onboarding form exists; needs dramatic presentation

## Acceptance Criteria

- [ ] Black screen start with delayed text reveal
- [ ] "Detection" sequence with capability assessment
- [ ] "Terms" sequence with System personality establishment
- [ ] "Accept" screen with single dramatic button
- [ ] Progressive interface reveal (UI "turns on")
- [ ] First quest assignment feels like mission briefing
- [ ] No bright colors until first completion
- [ ] Sound hook points for atmospheric audio
- [ ] Skip option for returning users (but hidden)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/pages/Onboarding.tsx` | Rewrite | Cinematic sequence flow |
| `web/src/components/onboarding/DetectionScreen.tsx` | Create | Capability detection screen |
| `web/src/components/onboarding/TermsScreen.tsx` | Create | System terms screen |
| `web/src/components/onboarding/AcceptScreen.tsx` | Create | Accept access screen |
| `web/src/components/onboarding/FirstQuestScreen.tsx` | Create | Mission briefing |
| `web/src/components/onboarding/InterfaceReveal.tsx` | Create | Progressive UI reveal |
| `web/src/hooks/useOnboardingSequence.ts` | Create | Sequence state management |

## Implementation Notes

### Sequence Flow

```typescript
type OnboardingStep = 
  | 'detection'       // "A dormant capability..."
  | 'assessment'      // Show capability readings
  | 'terms'           // "This interface will not..."
  | 'accept'          // Accept button
  | 'baseline'        // Optional baseline questions
  | 'first-quest'     // Mission briefing
  | 'interface-reveal' // UI turns on
  | 'complete'        // Redirect to dashboard

const STEP_ORDER: OnboardingStep[] = [
  'detection',
  'assessment', 
  'terms',
  'accept',
  'baseline',
  'first-quest',
  'interface-reveal',
  'complete'
]
```

### Detection Screen

```tsx
function DetectionScreen({ onComplete }: Props) {
  const lines = [
    { text: "A dormant capability has been detected.", delay: 2000 },
    { text: "", delay: 1500 },
    { text: "Physical output: underdeveloped", delay: 500 },
    { text: "Recovery capacity: unstable", delay: 500 },
    { text: "Discipline coefficient: unknown", delay: 500 },
    { text: "", delay: 2000 },
    { text: "You have been granted access to the System.", delay: 0 },
  ]
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="max-w-lg text-center">
        <SequentialTypewriter 
          lines={lines} 
          onComplete={onComplete}
          speed={30}
        />
      </div>
    </div>
  )
}
```

### Terms Screen

```tsx
function TermsScreen({ onComplete }: Props) {
  const lines = [
    { text: "This interface will not motivate you.", delay: 1500 },
    { text: "It will not encourage you.", delay: 1500 },
    { text: "", delay: 2000 },
    { text: "It will only record what you do.", delay: 0 },
  ]
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <SequentialTypewriter 
        lines={lines} 
        onComplete={onComplete}
        speed={35}
      />
    </div>
  )
}
```

### Accept Screen

```tsx
function AcceptScreen({ onAccept }: Props) {
  const [showButton, setShowButton] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAccept}
            className="px-8 py-4 border-2 border-system-blue text-system-blue 
                       font-bold uppercase tracking-widest
                       hover:bg-system-blue/10 transition-colors"
          >
            ACCEPT ACCESS
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Interface Reveal

```tsx
function InterfaceReveal({ onComplete }: Props) {
  // Elements fade in one by one
  const elements = [
    { id: 'header', delay: 0 },
    { id: 'stats-panel', delay: 0.3 },
    { id: 'quest-panel', delay: 0.6 },
    { id: 'xp-bar', delay: 0.9 },
  ]
  
  return (
    <div className="fixed inset-0 bg-system-black">
      {/* Render full dashboard but with staggered reveals */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.3 } }
        }}
        onAnimationComplete={onComplete}
      >
        {/* Dashboard elements with reveal animations */}
      </motion.div>
    </div>
  )
}
```

### First Quest Briefing

```tsx
function FirstQuestScreen({ onComplete }: Props) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8">
      <SystemMessage variant="classified">
        <TypewriterText text={`
FIRST OBJECTIVE ASSIGNED

▸ Walk 10,000 steps

This is not a suggestion.
It is a measurement.

The System will record your response.
        `} />
      </SystemMessage>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 5 } }}
        onClick={onComplete}
        className="absolute bottom-8 text-system-text-muted text-sm"
      >
        BEGIN
      </motion.button>
    </div>
  )
}
```

## Visual Progression

1. **Screens 1-3:** Pure black background, white/gray text only
2. **Accept screen:** First hint of blue (button border)
3. **First quest:** System blue appears in message
4. **Interface reveal:** Full color palette activates
5. **First completion:** Green/gold celebration colors unlock

## Definition of Done

- [ ] First-time users experience full cinematic sequence
- [ ] Each screen has appropriate timing and pacing
- [ ] Text appears naturally with typewriter effect
- [ ] UI progressively "activates" 
- [ ] Skip option exists but is subtle (triple tap)
- [ ] Mobile experience is equally impactful
- [ ] Returning users skip to dashboard
