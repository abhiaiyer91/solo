# G120: Workout Exercise Library

## Overview

Create a searchable library of exercises with proper form guidance, muscle group targeting, and integration with quest requirements.

## Context

**Source:** Fitness content expansion
**Current State:** Quests reference exercises but no exercise database exists

## Acceptance Criteria

- [ ] Exercise database schema with categories and muscle groups
- [ ] Seed data with 50+ common exercises
- [ ] Exercise detail view with description and tips
- [ ] Filter by muscle group, equipment, difficulty
- [ ] Search by exercise name
- [ ] Link exercises to relevant quests
- [ ] Exercise of the day feature
- [ ] User favorites/bookmarks

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/exercises.ts | Create | Exercise database schema |
| server/src/db/seed-exercises.ts | Create | Exercise seed data |
| server/src/routes/exercises.ts | Create | Exercise API endpoints |
| server/src/services/exercise.ts | Create | Exercise service logic |
| web/src/pages/Exercises.tsx | Create | Exercise library page |
| web/src/components/exercise/ExerciseCard.tsx | Create | Exercise list item |
| web/src/components/exercise/ExerciseDetail.tsx | Create | Exercise detail modal |
| web/src/hooks/useExercises.ts | Create | Exercise data hook |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] 50+ exercises seeded
- [ ] Search is fast and accurate
- [ ] Mobile-responsive layout
- [ ] No TypeScript errors
