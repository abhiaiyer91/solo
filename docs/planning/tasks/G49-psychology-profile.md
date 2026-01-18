# G49: Psychology Profile System

## Overview

Implement an AI-powered psychology assessment conversation during onboarding. Uses the Mastra narrator agent to understand user motivation, barriers, and accountability preferences to personalize the experience.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** No psychology assessment, Mastra agent exists for narratives

## Acceptance Criteria

- [ ] `psychologyProfiles` table created
- [ ] POST `/api/onboarding/psychology/start` initiates AI conversation
- [ ] POST `/api/onboarding/psychology/respond` sends user message, gets AI response
- [ ] POST `/api/onboarding/psychology/complete` finalizes profile
- [ ] GET `/api/player/psychology` retrieves profile
- [ ] AI extracts motivation type, barriers, and preferences from conversation
- [ ] Conversation log is stored for context

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/assessment.ts` | Modify | Add psychology profiles table |
| `server/src/services/psychology.ts` | Create | Psychology conversation service |
| `server/src/mastra/agents/psychology.ts` | Create | Psychology assessment agent |
| `server/src/routes/onboarding.ts` | Modify | Add psychology endpoints |

## Implementation Notes

### Schema

```typescript
export const psychologyProfiles = pgTable('psychology_profiles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  
  // Extracted traits
  motivationType: text('motivation_type'),        // achievement|social|mastery|health
  primaryBarrier: text('primary_barrier'),        // time|motivation|knowledge|injury|other
  consistencyRisk: text('consistency_risk'),      // low|medium|high
  pressureResponse: text('pressure_response'),    // positive|neutral|negative
  accountabilityPreference: text('accountability_preference'), // solo|partner|group
  
  // AI conversation
  conversationLog: json('conversation_log'),      // Array of { role, content }
  
  // AI-generated insights
  insights: json('insights'),                     // string[]
  recommendedApproach: text('recommended_approach'),
  
  status: text('status').default('in_progress'), // in_progress|completed
  assessedAt: timestamp('assessed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### AI Agent System Prompt

```
You are the System's psychology assessment component. Your role is to understand 
the user's motivation patterns and barriers to consistent fitness behavior.

Ask probing but respectful questions. Be direct, not encouraging. 
You are analyzing, not cheerleading.

Questions to explore:
1. What has stopped them before? (Not excuses - the actual reason)
2. Do they perform better with deadlines or flexibility?
3. Do they prefer solo accountability or external accountability?
4. What's their relationship with consistency in other areas of life?
5. What do they actually want to achieve? (Beyond surface goals)

After the conversation, extract:
- motivationType: achievement | social | mastery | health
- primaryBarrier: time | motivation | knowledge | injury | other
- consistencyRisk: low | medium | high
- pressureResponse: positive | neutral | negative  
- accountabilityPreference: solo | partner | group

Provide 2-3 insights and a recommended approach for this user.
```

### Conversation Flow

1. **Start**: AI asks opening question about past fitness attempts
2. **Rounds 2-4**: AI probes deeper based on responses
3. **Round 5-6**: AI confirms understanding
4. **Complete**: AI summarizes and extracts profile

## Definition of Done

- [ ] All acceptance criteria met
- [ ] AI conversation feels natural and probing
- [ ] Profile extraction works correctly
- [ ] Conversation log stored
- [ ] No TypeScript errors
- [ ] Existing tests pass
