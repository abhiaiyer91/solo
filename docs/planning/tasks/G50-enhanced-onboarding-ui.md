# G50: Enhanced Onboarding UI

## Overview

Extend the existing onboarding flow to include baseline assessment questionnaire and AI psychology conversation steps. Maintains the existing narrative flow while adding data collection.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** Onboarding has 5 narrative screens, no data collection

## Acceptance Criteria

- [ ] Onboarding flow has 3 phases: Narrative → Baseline → Psychology
- [ ] Baseline form collects physical/lifestyle/experience data
- [ ] Psychology chat interface for AI conversation
- [ ] Skip option for both baseline and psychology (not recommended but allowed)
- [ ] Progress indicator shows current phase
- [ ] Form validation with helpful error messages
- [ ] Unit toggle for weight (kg/lbs)
- [ ] Responsive design for mobile

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/pages/Onboarding.tsx` | Modify | Add phases for assessment |
| `web/src/components/onboarding/BaselineForm.tsx` | Create | Baseline questionnaire |
| `web/src/components/onboarding/PsychologyChat.tsx` | Create | AI chat interface |
| `web/src/components/onboarding/OnboardingProgress.tsx` | Create | Phase progress bar |
| `web/src/hooks/useOnboarding.ts` | Create | Onboarding state and API calls |

## Implementation Notes

### Onboarding Flow

```
Phase 1: Narrative (existing)
├── Screen 1: Detection
├── Screen 2: Terms
├── Screen 3: Accept
└── [Continue to Phase 2]

Phase 2: Baseline Assessment
├── Step 1: Physical (weight, height, push-ups, steps)
├── Step 2: Lifestyle (sleep, protein, alcohol)
├── Step 3: Experience (level, gym access, equipment)
└── [Continue to Phase 3 or Skip]

Phase 3: Psychology Assessment
├── AI conversation (5-8 messages)
└── [Complete or Skip]

→ Dashboard
```

### Baseline Form Component

```tsx
interface BaselineFormProps {
  onComplete: (data: BaselineAssessment) => void
  onSkip: () => void
}

function BaselineForm({ onComplete, onSkip }: BaselineFormProps) {
  const [step, setStep] = useState(1)
  const [unit, setUnit] = useState<'kg' | 'lbs'>('lbs')
  
  // Multi-step form with physical → lifestyle → experience
}
```

### Psychology Chat Component

```tsx
interface PsychologyChatProps {
  onComplete: () => void
  onSkip: () => void
}

function PsychologyChat({ onComplete, onSkip }: PsychologyChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  // Stream AI responses with typewriter effect
  // Show "System is analyzing..." during AI processing
}
```

### UI Design Notes

- Use existing System Window aesthetic
- Form inputs should feel like "data entry" not "friendly form"
- AI chat should feel like talking to the System, not a chatbot
- Progress bar shows: ███░░░░░ Phase 2 of 3

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Onboarding feels cohesive with existing narrative
- [ ] Data successfully submitted to backend
- [ ] Skip options work correctly
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Existing tests pass
