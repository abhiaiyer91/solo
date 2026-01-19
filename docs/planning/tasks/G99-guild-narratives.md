# G99: Guild & Social Narratives

## Overview

Add narrative framing to social features (guilds, accountability partners, raid bosses) to transform social mechanics into shared story experiences.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Guild system exists (G27) but lacks narrative content

## The Psychology

Social features become more engaging when framed narratively:
- Guilds become "cohorts" on the same journey
- Accountability partners become "Shadows" — linked destinies
- Raid bosses become collective struggles against shared enemies

## Narrative Elements

### Guild as Cohort

```
GUILD FORMATION DETECTED

You are no longer alone.

{{guild_name}} has been established.
{{member_count}} individuals.
{{member_count}} separate journeys.
One collective observation.

The System now tracks group patterns.
When one member struggles,
the cohort data reflects it.

When all members succeed,
something larger is proven:
this is not individual luck.
This is shared architecture.
```

### Accountability Partner as Shadow Link

```
SHADOW LINK ESTABLISHED

You and {{partner_name}} are now connected.

Not friends. Not accountability partners.
Shadows of each other.

When you falter, they will feel the gap in their data.
When they falter, you will know.

This is not judgment.
This is visibility.

Two people who have agreed:
hiding is no longer an option.
```

### Raid Boss Narrative

```
RAID BOSS DETECTED

A threat too large for one Hunter.

{{raid_boss_name}}
Collective challenge requiring {{required_participants}} participants.

This boss represents something none of you
can defeat alone.

{{raid_boss_name}} has been fed by years
of collective inconsistency.
Every January 1st promise abandoned.
Every group fitness challenge that faded.
Every "we should do this together" that didn't.

It knows your species.
It knows you give up together
as easily as you start together.

Prove it wrong.
```

## Acceptance Criteria

- [ ] Guild creation has narrative introduction
- [ ] Guild events (new member, member absence, collective milestone) have narratives
- [ ] Accountability partner linking has narrative framing
- [ ] Raid boss encounters have full narrative content
- [ ] Guild feed shows narrative-framed events
- [ ] Collective milestones celebrated with shared narrative

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/seed-narrative.ts` | Modify | Add all guild/social narratives |
| `server/src/services/guild.ts` | Modify | Trigger narrative events |
| `server/src/services/accountability.ts` | Modify | Add shadow link narratives |
| `server/src/services/raid.ts` | Modify | Add raid narrative content |
| `web/src/pages/Guild.tsx` | Modify | Display narrative events |
| `web/src/components/GuildFeed.tsx` | Modify | Narrative-framed event feed |

## Narrative Content to Seed

### Guild Events

```typescript
// guild.member.joined
"NEW HUNTER DETECTED

{{member_name}} has joined {{guild_name}}.

Their data will now be observed alongside yours.
Their patterns will affect the collective record.

The System notes: cohort size increased to {{member_count}}."

// guild.member.absent
"ABSENCE DETECTED

{{member_name}} has not logged activity in {{days}} days.

This is recorded in the cohort data.
The System does not notify them.
The System only notes for you:

A member of your cohort is struggling.
What you do with this information
is not the System's concern."

// guild.milestone.streak
"COLLECTIVE MILESTONE DETECTED

{{guild_name}} has achieved a collective streak.
All {{member_count}} members: {{streak}} consecutive days.

This is statistically improbable.
Groups typically fail within 14 days.

The System notes: your cohort is not typical."

// guild.weekly.summary
"COHORT WEEKLY SUMMARY

Guild: {{guild_name}}
Members: {{member_count}}

Top performer: {{top_member}} ({{top_xp}} XP)
Most consistent: {{consistent_member}} (0 missed days)
Struggling: {{struggling_count}} members with gaps

Collective completion rate: {{completion_rate}}%

The System observes:
{{dynamic_observation}}"
```

### Accountability Partner (Shadow Link)

```typescript
// accountability.linked
"SHADOW LINK ESTABLISHED

You and {{partner_name}} are now connected.

Their data is visible to you.
Your data is visible to them.
Neither can hide.

This is not friendship.
This is mutual accountability.
Two Hunters who have agreed:
silence is failure."

// accountability.partner.struggling
"SHADOW ALERT

{{partner_name}} has missed {{days}} consecutive days.

Their shadow grows weaker.
The link between you stretches thin.

The System does not tell you what to do.
The System only tells you what is."

// accountability.partner.milestone
"SHADOW CELEBRATION

{{partner_name}} has achieved {{milestone}}.

Your shadow link contributed to this.
Accountability is not control.
It is visibility.

When someone knows they are watched,
they often surprise themselves."
```

### Raid Boss

```typescript
// raid.boss.announcement
"RAID BOSS DETECTED

A collective threat has emerged.

{{boss_name}}

This enemy cannot be defeated alone.
It feeds on group failure.
Every abandoned group challenge.
Every 'we should do this together' that wasn't.

It requires {{required}} Hunters to defeat.
Your guild has {{available}} available.

Duration: {{duration}} days
Reward: {{reward_xp}} XP (split among participants)

The System asks:
Can you succeed together
where so many have failed alone?"

// raid.boss.phase_complete
"RAID PHASE COMPLETE

{{boss_name}} - Phase {{phase_num}}: {{phase_name}}

Contributors: {{contributor_count}}
Total damage dealt: {{total_damage}}

The collective held.
Phase {{next_phase}} begins.

{{next_phase_preview}}"

// raid.boss.defeat
"RAID BOSS DEFEATED

{{boss_name}} has fallen.

Not to one Hunter.
To {{participant_count}} Hunters
who refused to let each other fail.

This is the secret the System observes:
Humans fail individually.
But they can succeed collectively.

RAID REWARD: {{reward_xp}} XP (distributed)
COLLECTIVE TITLE: {{title}}"
```

## Implementation Notes

1. **Guild feed is social** — Should feel like a shared journey log
2. **Accountability is intimate** — Two-person narratives are direct
3. **Raids are epic** — Full narrative treatment for collective moments
4. **Dynamic observations** — AI can generate custom guild observations

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Guild creation shows narrative intro
- [ ] Guild feed displays narrative events
- [ ] Accountability partners have shadow link narrative
- [ ] Raid bosses have full narrative arc
- [ ] No TypeScript errors
- [ ] Existing tests pass
