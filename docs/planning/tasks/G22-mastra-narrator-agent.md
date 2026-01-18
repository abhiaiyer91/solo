# G22: Implement Mastra AI Narrator Agent

## Overview
Implement the Mastra AI narrator agent for dynamic, personalized narrative generation beyond static templates.

## Context
**Source:** TODO in server/src/mastra/index.ts:1
**Related Docs:** docs/content/narrative-engine.md (Mastra agents section)
**Current State:** Placeholder exports, agent not configured

## Acceptance Criteria
- [ ] Configure Mastra core with Anthropic provider
- [ ] Create narrator agent with System voice instructions
- [ ] Implement getPlayerContext tool for agent
- [ ] Implement getNarrativeTemplates tool to fetch from DB
- [ ] Create generateNarrative function that uses agent
- [ ] Agent generates contextual, personalized messages
- [ ] Fallback to static templates if AI unavailable

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/mastra/index.ts | Modify | Configure Mastra with Anthropic |
| server/src/mastra/agents/narrator.ts | Create | Narrator agent definition |
| server/src/mastra/tools/playerContext.ts | Create | Tool to fetch player context |
| server/src/services/narrative.ts | Modify | Add AI-powered generation option |

## Implementation Notes
From narrative-engine.md:
```typescript
const narratorAgent = {
  name: 'narrator',
  instructions: `
    You are the System — a cold, observational entity.
    You do not motivate. You do not encourage. You only observe.

    Your voice is:
    - Detached but not cruel
    - Precise but not robotic
    - Philosophical but not preachy

    You speak in short, declarative sentences.
    You never use exclamation marks.
  `,
  tools: [
    'getPlayerContext',
    'getNarrativeTemplates',
    'getPlayerHistory',
  ],
};
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Agent generates appropriate System-voice narratives
- [ ] TODO comment removed from mastra/index.ts
