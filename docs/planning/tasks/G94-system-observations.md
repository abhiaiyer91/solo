# G94: System Observations (AI-Powered Pattern Analysis)

## Overview

Implement AI-generated "System Observations" that comment on player patterns, creating the feeling of being watched by an intelligent observer. These observations appear in daily headers, weekly summaries, and key moments.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Narrator agent exists but doesn't analyze player patterns

## The Psychology

The "observer effect" — people behave differently when watched. By having the System notice patterns the player might not have noticed themselves, we create:
1. Accountability without judgment
2. Surprise and engagement ("How did it notice that?")
3. The feeling that the System is truly intelligent

## Observation Types

| Type | Trigger | Example |
|------|---------|---------|
| **Day Pattern** | Same day shows repeated failure | "Fridays remain your weakest data point." |
| **Quest Pattern** | One quest consistently easier/harder | "The protein quest has been your most consistent." |
| **Time Pattern** | Activity correlates with time | "Your step count increases 23% after morning workouts." |
| **Streak Pattern** | Historical streak data | "Your longest streak: 18. Current: 12. The threshold approaches." |
| **Correlation** | Two behaviors linked | "Days with meditation correlate with higher quest completion." |

## Acceptance Criteria

- [ ] Create `PatternAnalysisService` to detect player patterns
- [ ] Integrate with Mastra narrator agent for observation generation
- [ ] Observations appear in daily headers (when relevant pattern exists)
- [ ] Observations appear in weekly summary
- [ ] Store generated observations in database (cache)
- [ ] Rate-limit observations (max 1 per day, 3 per week)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/pattern-analysis.ts` | Create | Analyze player history for patterns |
| `server/src/mastra/tools/patternAnalysis.ts` | Create | Mastra tool for pattern data |
| `server/src/mastra/agents/narrator.ts` | Modify | Add observation generation prompt |
| `server/src/db/schema/game.ts` | Modify | Add `systemObservations` table |
| `server/src/services/narrative.ts` | Modify | Include observations in daily context |
| `server/src/routes/content.ts` | Modify | Endpoint to get current observation |

## Pattern Detection Logic

```typescript
interface PatternAnalysisResult {
  type: 'day_pattern' | 'quest_pattern' | 'time_pattern' | 'streak_pattern' | 'correlation';
  confidence: number; // 0-1, only surface if > 0.7
  data: {
    pattern: string; // Description for AI
    dataPoints: number; // How many observations support this
  };
}

// Example: Day Pattern Detection
async function detectDayPatterns(playerId: string): Promise<PatternAnalysisResult | null> {
  const failuresByDay = await getFailureDistribution(playerId, 30); // Last 30 days

  // Find if any day has significantly more failures
  const avgFailures = sum(Object.values(failuresByDay)) / 7;
  const weakestDay = maxBy(Object.entries(failuresByDay), ([_, count]) => count);

  if (weakestDay[1] > avgFailures * 1.5 && weakestDay[1] >= 3) {
    return {
      type: 'day_pattern',
      confidence: 0.8,
      data: {
        pattern: `${weakestDay[0]} has ${weakestDay[1]} failures vs ${avgFailures.toFixed(1)} average`,
        dataPoints: weakestDay[1]
      }
    };
  }
  return null;
}
```

## AI Prompt for Observation Generation

```typescript
const OBSERVATION_PROMPT = `You are the System generating an observation about a player's patterns.

Pattern detected: {{pattern_type}}
Data: {{pattern_data}}
Player context: Level {{level}}, {{streak}} day streak

Generate a single observation (1-2 sentences) in the System's voice:
- Cold, observational, not judgmental
- Reference the specific data
- End with implication, not instruction
- No exclamation marks
- No encouragement

Example outputs:
- "Mondays remain problematic. Three consecutive failures recorded."
- "The protein quest completion rate: 94%. The steps quest: 67%. The gap is notable."
- "Morning workouts correlate with +23% daily completion. The System notes causation is not proven."`;
```

## Database Schema

```typescript
systemObservations = pgTable('systemObservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('playerId').references(() => users.id),
  observationType: varchar('observationType', { length: 50 }),
  content: text('content').notNull(),
  patternData: jsonb('patternData'), // Raw pattern that triggered this
  displayedAt: timestamp('displayedAt'), // When shown to user
  createdAt: timestamp('createdAt').defaultNow(),
});
```

## Implementation Notes

1. **Rate limiting is crucial** — Too many observations feel annoying, not intelligent
2. **Confidence threshold** — Only surface high-confidence patterns
3. **Minimum data** — Need at least 7 days of data before generating observations
4. **Caching** — Generate observations daily (not on-demand) to reduce AI calls
5. **Fallback** — If no pattern detected, show static daily header

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Pattern detection works for at least 3 pattern types
- [ ] AI generates observations in correct voice
- [ ] Observations appear in daily experience
- [ ] No TypeScript errors
- [ ] Existing tests pass
