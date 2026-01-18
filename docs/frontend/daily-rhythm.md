# Daily Experience Rhythm

This document defines the temporal flow of the game — what happens when, and how the experience changes throughout the day.

---

## Philosophy

**The System is always there, but never nagging.**

- Morning: Clear objectives
- Midday: Quiet unless relevant
- Evening: Reflect and close
- Night: Respect sleep

Notifications are minimal, meaningful, and always skippable.

---

## The Daily Arc

```
    5 AM        8 AM        12 PM       4 PM        8 PM        10 PM
      │           │           │           │           │           │
      ▼           ▼           ▼           ▼           ▼           ▼
   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
   │QUIET │   │QUEST │   │CHECK │   │PUSH  │   │WIND  │   │CLOSE │
   │      │   │START │   │IN    │   │      │   │DOWN  │   │      │
   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘
      │           │           │           │           │           │
   Respect     New day     Optional   Last chance  Evening    Day ends
   wake time   begins      midpoint   reminder     mode       reconcile
```

---

## Morning Phase (Wake → 10 AM)

### First App Open

The first open of the day triggers the morning experience:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  DAY 24                                                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  "The System does not ask how you slept.                    │
│   It only records what you do next."                        │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  TODAY'S QUESTS                                             │
│                                                              │
│  ○ Movement       0 / 10,000 steps                          │
│  ○ Strength       Workout pending                           │
│  ○ Fuel           Protein target: 160g                      │
│  ○ Discipline     Wake by 6:30 AM — ✓ Recorded              │
│                                                              │
│  ○ Rotating: Hydration (8 glasses)                          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  BONUS AVAILABLE: Dawn Warrior                              │
│  Complete workout before 7:00 AM for 1.75x XP               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Streak: 23 days                                            │
│  Debuff: Clear                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Wake Time Auto-Check

If wake time tracking is enabled, the System automatically records first activity:

```
WAKE TIME RECORDED

Target: 6:30 AM
Actual: 6:18 AM

Twelve minutes early.
The day began on your terms.

+15 XP (Discipline)
```

### Morning Dungeon Prompt (if applicable)

If a time-sensitive dungeon is available:

```
MORNING DUNGEON AVAILABLE

"The Morning Protocol"
Complete workout before 7:00 AM

Time remaining: 47 minutes

[Enter Dungeon]   [Not Today]
```

---

## Midday Phase (10 AM → 4 PM)

### Quiet by Default

The System does not interrupt. If the user opens the app:

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 24 — Midday                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Progress:                                                   │
│                                                              │
│  ✓ Discipline     6:18 AM                        +15 XP     │
│  ✓ Strength       7:42 AM                        +40 XP     │
│  ~ Movement       6,847 / 10,000 steps           pending    │
│  ○ Fuel           Not yet logged                 pending    │
│  ~ Hydration      4 / 8 glasses                  pending    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  XP Today: 55 earned / 115 potential                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Milestone Notifications (In-App Only)

When thresholds are crossed, show briefly:

**Steps Goal Hit**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  MOVEMENT COMPLETE                                          │
│                                                              │
│  10,000 steps reached.                                      │
│  The minimum is met.                                        │
│                                                              │
│  +25 XP                                                     │
│                                                              │
│                                      [Dismiss]              │
└─────────────────────────────────────────────────────────────┘
```

### Workout Detection

If auto-detected via health integration:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  WORKOUT DETECTED                                           │
│                                                              │
│  Activity: Strength Training                                │
│  Duration: 52 minutes                                       │
│  Source: Apple Health                                       │
│                                                              │
│  [Confirm & Log]     [Not a Workout]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Afternoon Phase (4 PM → 8 PM)

### Late Afternoon Check (Optional Push Notification)

If user has opted in AND significant quests remain incomplete:

**Push Notification** (5 PM):
```
Journey
──────────────
Movement: 6,847 / 10,000
The System is recording.
```

No call-to-action. No "You can do it!" Just data.

### In-App Afternoon View

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 24 — Afternoon                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Time remaining: 6 hours until day close                    │
│                                                              │
│  INCOMPLETE:                                                 │
│  ~ Movement       6,847 / 10,000 steps     3,153 remaining  │
│  ○ Fuel           Not logged                                │
│  ~ Hydration      5 / 8 glasses            3 remaining      │
│                                                              │
│  COMPLETE:                                                   │
│  ✓ Discipline     +15 XP                                    │
│  ✓ Strength       +40 XP                                    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Current trajectory: 3/4 core quests (streak maintained)    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Evening Phase (8 PM → 10 PM)

### Evening Mode

The interface shifts subtly. Darker. Calmer.

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 24 — Evening                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  The day winds down.                                        │
│  Time remaining: 2 hours.                                   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ✓ Discipline     Complete                                  │
│  ✓ Strength       Complete                                  │
│  ✓ Movement       10,234 steps                              │
│  ○ Fuel           Pending                                   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Protein check:                                             │
│  Did you hit your 160g target today?                        │
│                                                              │
│  [YES]     [NO]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Screen Sunset Quest (If Active)

```
ROTATING QUEST: Screen Sunset

Target: No screens after 8:00 PM
Current time: 8:47 PM

If you're seeing this notification,
you're likely failing this quest.

Close the app.
The System will still be here tomorrow.
```

---

## Night Phase (10 PM → Midnight)

### End-of-Day Reconciliation (10 PM)

Triggered automatically or at user-configured time:

```
┌─────────────────────────────────────────────────────────────┐
│  DAILY RECONCILIATION                                        │
│                                                              │
│  Day 24 is closing.                                         │
│  Confirm any remaining items.                               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  FUEL                                                        │
│  Did you hit your protein target (160g)?                    │
│  [YES — HIT IT]     [NO — MISSED]                          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  HYDRATION                                                   │
│  Logged: 6/8 glasses                                        │
│  [That's correct]   [I had more: ___]                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [Close Day 24]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Day Summary

After reconciliation:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  DAY 24 COMPLETE                                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Core Quests: 4/4                                           │
│  Rotating: 0/1 (Hydration incomplete)                       │
│                                                              │
│  XP Earned: 115                                             │
│  XP Multipliers: 1.15x (14-day streak)                      │
│  Final XP: 132                                              │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Streak: 24 days                                            │
│  Level: 12 (2,847 / 3,200 XP)                               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Tomorrow's quests generate at midnight.                    │
│  Rest well. The System continues.                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Late Night Quiet Mode

After 10 PM, no notifications whatsoever (unless user overrides).

If user opens app after day close:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Day 24 is closed.                                          │
│  Day 25 begins at midnight.                                 │
│                                                              │
│  Time until new day: 1h 23m                                 │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  The System does not encourage late-night activity.         │
│  Sleep affects recovery.                                    │
│  Recovery affects tomorrow.                                 │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [View Today's Summary]    [Close App]                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Notification Strategy

### Notification Philosophy

1. **Opt-in only** — No notifications by default
2. **Never motivational** — Data only, no "You can do it!"
3. **Never guilt** — No "You haven't opened the app in 3 days"
4. **Minimal frequency** — Max 2-3 per day if fully enabled
5. **Useful information** — Must provide value to receive

### Notification Types

| Type | Default | Description |
|------|---------|-------------|
| **Morning Quests** | OFF | "Day X. 4 quests await." |
| **Milestone Hit** | OFF | "Movement complete. 10,432 steps." |
| **Afternoon Status** | OFF | "Movement: 6,847/10,000. Fuel: pending." |
| **Dungeon Available** | OFF | Time-sensitive dungeon prompt |
| **Reconciliation** | ON | "Day closing. Confirm remaining items." |
| **Streak Milestone** | ON | "7 consecutive days recorded." |
| **Level Up** | ON | "Level 12 reached." |
| **Boss Phase** | ON | Boss fight progress updates |

### Notification Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION SETTINGS                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  The System can notify you. Or not.                         │
│  Both are valid choices.                                    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  DAILY REMINDERS                                            │
│  ○ Morning quest summary (8 AM)                   [OFF]     │
│  ○ Afternoon progress check (5 PM)                [OFF]     │
│  ● End-of-day reconciliation (10 PM)              [ON]      │
│                                                              │
│  ACHIEVEMENTS                                                │
│  ● Level up notifications                         [ON]      │
│  ● Streak milestones (7, 14, 30 days)            [ON]      │
│  ○ Quest completions                              [OFF]     │
│                                                              │
│  SPECIAL EVENTS                                              │
│  ● Boss fight updates                             [ON]      │
│  ○ Dungeon availability                           [OFF]     │
│  ● Season transitions                             [ON]      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Quiet Hours: 10 PM — 7 AM                      [Edit]      │
│  (No notifications during this window)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Weekly Rhythm

### Weekday vs Weekend

| Day | Difference |
|-----|------------|
| **Monday** | "The week begins." Special narrative. |
| **Tuesday-Thursday** | Standard |
| **Friday** | "Weekend approaches. Historically difficult." |
| **Saturday-Sunday** | Weekend XP bonus available (+10%) |

### Monday Morning

```
┌─────────────────────────────────────────────────────────────┐
│  MONDAY — DAY 25                                            │
│                                                              │
│  The week begins.                                           │
│                                                              │
│  Last week:                                                 │
│  • Days completed: 6/7                                      │
│  • Core completion: 89%                                     │
│  • XP earned: 847                                           │
│                                                              │
│  This week's slate is clean.                                │
│  What you did last week is recorded.                        │
│  What you do this week is undetermined.                     │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [View This Week's Quests]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Weekend Mode

```
┌─────────────────────────────────────────────────────────────┐
│  SATURDAY — DAY 30                                          │
│                                                              │
│  Weekend detected.                                          │
│                                                              │
│  Schedule changes. Routines break.                          │
│  The System does not adjust expectations.                   │
│  The quests remain.                                         │
│                                                              │
│  Weekend Bonus Active: +10% XP on all completions           │
│                                                              │
│  Historically, your weekend completion rate: 71%            │
│  Weekday completion rate: 94%                               │
│                                                              │
│  This is data, not judgment.                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Special Day Types

### Streak Milestone Day

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ═══════════════════════════════════════════════════════   │
│                                                              │
│                    DAY 30                                    │
│                                                              │
│           30 CONSECUTIVE DAYS RECORDED                       │
│                                                              │
│  ═══════════════════════════════════════════════════════   │
│                                                              │
│  Habit formation threshold reached.                         │
│                                                              │
│  The neural pathways have begun to shift.                   │
│  Resistance will decrease.                                  │
│  The action will become default.                            │
│                                                              │
│  Streak Bonus Upgraded: +25% XP                             │
│                                                              │
│  This is not motivation.                                    │
│  This is architecture.                                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Today's quests await below.                                │
│  Day 30 is not different from Day 29.                       │
│  Except that you've arrived here.                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Level Up Day

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  LEVEL UP                                                   │
│                                                              │
│  Level 11 → Level 12                                        │
│                                                              │
│  Stats increased:                                           │
│  • STR: 14 → 15                                             │
│  • AGI: 12 → 12                                             │
│  • VIT: 13 → 14                                             │
│  • DISC: 15 → 15                                            │
│                                                              │
│  Distance from origin: measurable.                          │
│                                                              │
│  No celebration required.                                   │
│  Progress is expected.                                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [Continue to Today's Quests]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Boss Fight Active Day

During an active boss encounter, the daily view reflects it:

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 24 — BOSS ENCOUNTER ACTIVE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  THE INCONSISTENT ONE                                       │
│  Phase 2: Resistance — Day 4 of 7                           │
│                                                              │
│  Phase requirement: 80% daily completion                    │
│  Your current phase average: 82%                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  The pattern offers logic.                                  │
│  "One day won't matter."                                    │
│  It will.                                                   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [View Today's Quests]                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Time Zone Handling

- Day boundaries based on user's local timezone
- Set during onboarding, adjustable in settings
- Travel detection: "Your timezone appears to have changed. Update?"

```
┌─────────────────────────────────────────────────────────────┐
│  TIMEZONE CHANGE DETECTED                                    │
│                                                              │
│  Previous: America/New_York (EST)                           │
│  Current location suggests: America/Los_Angeles (PST)       │
│                                                              │
│  How should the System handle this?                         │
│                                                              │
│  [Update to PST]                                            │
│  Current day extends by 3 hours                             │
│                                                              │
│  [Keep EST]                                                  │
│  Day boundaries remain unchanged                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  The System does not judge travel.                          │
│  It only needs to know when your day ends.                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: Daily Touchpoints

| Time | Event | Type |
|------|-------|------|
| Wake | Wake time recorded (auto) | Passive |
| First open | Daily quest board shown | Active |
| Morning | Time-sensitive dungeon prompts | Optional |
| Midday | Quiet (unless milestones) | Minimal |
| 5 PM | Optional progress notification | Push (opt-in) |
| Evening | Evening mode UI | Passive |
| 10 PM | Reconciliation prompt | Active |
| After close | Day summary | Active |
| Night | Quiet mode | Silent |

**Maximum notifications per day (if all enabled)**: 4
**Default notifications per day**: 1-2
