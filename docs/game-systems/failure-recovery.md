# Failure & Recovery System

Most fitness apps treat failure as something to minimize, hide, or punish. They send guilt-trip notifications. They reset everything. They make you feel like you're starting over.

The System takes a different approach: **Failure is data.**

---

## Core Philosophy

The System doesn't care if you fail. It only records.

This isn't cruelty—it's respect. The System assumes you're an adult who knows what you did. It doesn't lecture. It doesn't guilt. It states facts and waits.

**This works because:**
- Shame makes people avoid the app entirely
- Neutrality makes it safe to return
- Data framing removes emotional weight
- The player punishes themselves enough already

---

## Failure Taxonomy

| Type | Definition | Frequency | Emotional Weight |
|------|------------|-----------|------------------|
| **Missed Quest** | Failed 1 quest in a day | Common | Low |
| **Failed Day** | Missed 2+ core quests | Weekly | Medium |
| **Broken Streak** | Ended consecutive day chain | Monthly | High |
| **Abandoned Boss** | Left boss fight incomplete | Rare | High |
| **Lapsed Player** | Absent 7+ days | Variable | Very High |
| **Long Absence** | Absent 30+ days | Rare | Critical |

---

## Type 1: Missed Quest

**Trigger**: Complete 3/4 core quests (or partial completion)

**System Response**: Minimal acknowledgment

```
DAILY LOG: INCOMPLETE

Quests completed: 3/4
Quest failed: Steps (6,847/10,000)

Partial data recorded.
Tomorrow is a new measurement.
```

**Mechanical Impact**:
- XP earned for completed quests
- No debuff (only triggers at 2+ missed)
- Streak continues (3/4 maintains streak)
- Daily log shows partial completion

**Design Intent**: Missing one quest shouldn't feel catastrophic. Life happens. The System notes it and moves on.

---

## Type 2: Failed Day (Debuff Trigger)

**Trigger**: Miss 2+ core quests in a day

**System Response**: The debuff narrative

```
SYSTEM NOTICE: PERFORMANCE DEGRADATION

Core tasks incomplete: 2
Tasks completed: 2/4

No punishment issued.
Efficiency temporarily reduced.

For the next 24 hours:
• XP gains: -10%
• Dungeon bonuses: Disabled

You are not being punished.
You are experiencing the cost of neglect.

The System reflects reality—nothing more.
```

**Mechanical Impact**:
- Debuff active for 24 hours
- XP penalty: 10% reduction on all gains
- Dungeon bonuses disabled
- Streak may or may not break (depends on 3/4 threshold)

**Recovery**: Simply complete tomorrow's quests. The debuff expires automatically.

**Design Intent**: There's a cost to neglect, but it's temporary and proportional. One bad day doesn't ruin everything.

---

## Type 3: Broken Streak

This is the critical failure state. This is where most apps lose people.

### The Moment of Breaking

**Trigger**: Fail to hit 3/4 quests for consecutive days requirement

**System Response** (varies by streak length):

#### Short Streak (3-6 days)
```
STREAK TERMINATED

Days recorded: 5
Cause: Insufficient daily completion

The System does not judge.
It only resets the counter.

Streaks measure consistency.
Consistency is rebuilt the same way it was built.

One day at a time.
```

#### Medium Streak (7-13 days)
```
STREAK TERMINATED

Days recorded: 11
Previous best: 11

This was progress.
It is now data.

The habit was forming.
It will need to form again.

The System observes many restarts.
Some become permanent.
Most do not.

Which one is this?
```

#### Long Streak (14-29 days)
```
STREAK TERMINATED

Days recorded: 23
Previous best: 23

Twenty-three days of consistency
reduced to a number in a database.

The System does not feel loss.
You might.

That feeling is information.
It tells you this mattered.

The question is not "why did I stop?"
The question is "what happens now?"
```

#### Major Streak (30+ days)
```
STREAK TERMINATED

Days recorded: 47
Previous best: 47

Forty-seven days.
The longest you have maintained.

The neural pathways were real.
The habit was forming.
The identity was shifting.

None of that is erased.
Only the counter.

The System has seen players return from longer absences.
It has also seen players never return.

Both are recorded equally.
```

### Mechanical Impact of Broken Streak

| Lost Streak | XP Bonus Lost | Recovery Requirement |
|-------------|---------------|---------------------|
| 7-day | 10% bonus | 7 new consecutive days |
| 14-day | 15% bonus | 7 new consecutive days |
| 30-day | 25% bonus | 7 new consecutive days |

**Important**: Previous progress toward titles/achievements is NOT lost. Only the active streak bonus.

**Design Intent**: The loss is real but not catastrophic. You lose the multiplier, not your history. The narrative acknowledges the weight without adding to it.

---

## Type 4: Abandoned Boss Fight

**Trigger**: Player chooses to abandon or fails boss phase

### Voluntary Abandonment

```
ENCOUNTER ABANDONED

Boss: The Inconsistent One
Progress: Phase 2 of 3
Days invested: 11

The encounter is suspended.
The boss remains.

No penalty is issued.
The System does not force confrontation.

When you return—if you return—
the boss will remember your tactics.
Phase progress resets.
Knowledge remains.
```

**Mechanical Impact**:
- Boss returns to "available" state
- Phase progress resets to Phase 1
- XP invested is kept (no clawback)
- Can re-engage anytime

### Phase Failure

```
PHASE FAILED

Boss: The Inconsistent One
Phase: 2 - Resistance
Requirement: 80% daily completion
Achieved: 71%

The pattern recognized your tactics.
It waited. You negotiated.

Options:
[RESTART PHASE] - Begin Phase 2 again
[ABANDON] - Return to this boss later

The Inconsistent One is patient.
It has defeated you before.
It can wait.
```

**Design Intent**: Failing a boss isn't game over. It's a setback. The narrative reinforces that this is a long game, not a single battle.

---

## Type 5: Lapsed Player (7-29 days absent)

This is the critical re-engagement window.

### Return Experience

**Day 1 Back (after 7-14 days away)**:
```
SYSTEM REACTIVATED

Last activity: 12 days ago
Streak at departure: 18 days
Current streak: 0

The System continued operating.
You did not.

Absence is recorded, not judged.
Every return is recorded equally.

Previous status:
• Level: 8
• Total XP: 2,847
• Titles: 3

Current status:
• Level: 8
• Total XP: 2,847
• Titles: 3

Nothing was lost except time.
Time cannot be recovered.

Today's quests are ready.
```

**Day 1 Back (after 15-29 days away)**:
```
SYSTEM REACTIVATED

Last activity: 22 days ago

The System does not ask where you went.
It does not ask why you left.
It only records that you returned.

Many do not return.
You did.

This is noted.

Your history remains:
• Level: 12
• Workouts logged: 89
• Bosses defeated: 1

The counter resets.
The record does not.

Would you like to resume?

[RESUME JOURNEY]
```

### Comeback Mechanics

**"Return Protocol" Quest Chain** (Optional, offered on return):

```
RETURN PROTOCOL DETECTED

The System offers a structured return path.
Acceptance is optional.
Completion provides bonus XP.

Duration: 7 days
Objective: Rebuild foundation

Day 1-3: Complete 2/4 daily quests (reduced threshold)
Day 4-5: Complete 3/4 daily quests (normal threshold)
Day 6-7: Complete 4/4 daily quests (full completion)

Reward: 200 XP + "The Returner" title

The protocol exists because
intensity after absence causes re-injury.
Of body and of habit.

[ACCEPT PROTOCOL]
[DECLINE - FULL INTENSITY]
```

**Design Intent**: Meet players where they are. Reduced expectations for the first few days prevents the shame spiral of immediately failing again.

---

## Type 6: Long Absence (30+ days)

### Return Experience

```
SYSTEM REACTIVATED

Last activity: 67 days ago

You have been away longer than you were present.

The System does not calculate probability of return.
It only records that you did.

Your data remains intact:
• Account age: 89 days
• Active days: 22
• Level at departure: 9
• Current level: 9

Nothing was deleted.
Nothing was punished.
The System waited.

Not patiently—it does not feel patience.
It simply continued existing.

As did you.

And now you are here again.

[BEGIN AGAIN]
```

### Soft Reset Option

For very long absences (90+ days), offer optional soft reset:

```
EXTENDED ABSENCE DETECTED

Last activity: 134 days ago

Your previous data can be:

[PRESERVED]
Continue from Level 11 with full history.
Streak: 0 days
Titles: Retained

[ARCHIVED]
Start fresh at Level 1.
Previous run stored as "Archive 1"
Can view history but not current stats.

Some players prefer clean starts.
Others prefer continuity.

The System has no preference.
Both are valid approaches.
```

**Design Intent**: Some people need psychological permission to start over. Give them that option without losing their history entirely.

---

## Narrative Voice Guide: Failure States

### What the System NEVER does:

❌ "We missed you!"
❌ "Don't give up!"
❌ "You can do it!"
❌ "Everyone falls sometimes"
❌ Uses exclamation marks
❌ Asks why they failed
❌ Offers unsolicited encouragement
❌ Implies disappointment
❌ Uses guilt language ("you broke your streak")

### What the System ALWAYS does:

✅ States facts neutrally
✅ Acknowledges the weight without adding to it
✅ Presents options without pushing
✅ Respects the player's intelligence
✅ Treats return as normal, not exceptional
✅ Maintains consistent cold tone
✅ References data, not feelings
✅ Ends with forward-looking options

### Tone Examples

**Wrong**: "Your 30-day streak ended. Don't worry, you can rebuild it! Every journey has setbacks."

**Right**: "Thirty days recorded. Then zero. The counter resets. The record remains. Tomorrow is a new measurement."

**Wrong**: "Welcome back! We're so glad you returned. Let's get back on track together!"

**Right**: "System reactivated. Last activity: 23 days ago. Absence recorded. Today's quests are ready."

---

## Comeback Titles

Special titles for players who return after failure:

| Title | Requirement | Passive | Narrative |
|-------|-------------|---------|-----------|
| The Returner | Complete Return Protocol | +2% XP | "Absence was noted. Return was noted. The latter matters more." |
| Twice Fallen | Break 14+ day streak, rebuild to 14 | +3% XP | "The pattern broke twice. Twice, it was rebuilt." |
| The Persistent | Return after 30+ day absence, reach 30-day streak | +5% XP | "Probability of return: low. Observed outcome: return." |
| Phoenix | Break 30+ streak, rebuild to 30+ | +7% XP, reduces debuff penalty | "What was built. What fell. What rose." |

---

## Re-engagement Triggers

When should the app reach out to lapsed players?

### Philosophy: Minimal Contact

The System doesn't chase. It waits. But some touchpoints:

**Day 3 of absence** (if streak was 7+):
```
[Push Notification - Optional]

Streak status: Frozen at Day [X]

The System is recording absence.
Not judging. Recording.
```

**Day 7 of absence**:
```
[Push Notification - Optional]

Last login: 7 days ago.

The quests continued generating.
They will continue generating.

The System does not wait.
But it does not forget.
```

**After that**: Silence. The app doesn't beg.

**Day 30+**:
```
[Email - Optional]

Subject: System Status

Your account remains active.
Your data remains intact.
Level [X]. [Y] XP. [Z] titles.

No action required.
This is not a request.
This is a status report.
```

---

## Integration with Mastra

The `narrator` agent needs failure context:

```typescript
interface FailureContext {
  failureType: 'missed_quest' | 'failed_day' | 'broken_streak' |
               'abandoned_boss' | 'lapsed_return' | 'long_absence';

  // For broken streaks
  streakLength?: number;
  previousBest?: number;

  // For lapses
  daysAbsent?: number;
  levelAtDeparture?: number;

  // For boss abandonment
  bossName?: string;
  phaseReached?: number;

  // Historical
  previousComebacks?: number;
  averageStreakLength?: number;
}
```

The agent can then personalize:
- First-time failure vs. repeat pattern
- Long streak loss vs. short streak loss
- Quick return vs. extended absence
- Player who always comes back vs. first lapse

---

## Content Needed

| Key | Category | Purpose |
|-----|----------|---------|
| `streak.broken.short` | failure | 3-6 day streak loss |
| `streak.broken.medium` | failure | 7-13 day streak loss |
| `streak.broken.long` | failure | 14-29 day streak loss |
| `streak.broken.major` | failure | 30+ day streak loss |
| `lapse.return.short` | recovery | Return after 7-14 days |
| `lapse.return.medium` | recovery | Return after 15-29 days |
| `lapse.return.long` | recovery | Return after 30+ days |
| `boss.abandoned` | failure | Boss fight abandonment |
| `boss.phase.failed` | failure | Boss phase failure |
| `comeback.protocol.intro` | recovery | Return Protocol offer |
| `comeback.protocol.complete` | recovery | Protocol completion |

---

## Metrics to Track

| Metric | Purpose |
|--------|---------|
| Return rate by absence length | Which lapsed players come back? |
| Time to return after streak break | How long before they try again? |
| Second streak length vs. first | Do they do better after failing? |
| Protocol acceptance rate | Do players want guided return? |
| Notification response rate | Do notifications help or hurt? |
| Long-term retention post-failure | Does our approach work? |

---

## Summary

The failure system rests on three pillars:

1. **Neutrality**: The System doesn't guilt, shame, or cheerfully encourage. It states facts.

2. **Preservation**: Nothing is deleted. History remains. Only active bonuses reset.

3. **Easy Return**: The door is always open. No friction. No interrogation. Just "Today's quests are ready."

This approach bets that treating players as adults—who don't need hand-holding or guilt trips—creates more sustainable engagement than the standard fitness app playbook.

The System doesn't care if you fail.
It only cares that you return.
And when you do, it's ready.
