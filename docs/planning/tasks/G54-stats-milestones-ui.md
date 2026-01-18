# G54: Stats Milestones UI

## Overview

Create frontend components to display stats with real-world equivalents, milestone progress, and body composition tracking. Users should understand what their stats mean in the real world.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** Stats page shows basic numbers without context

## Acceptance Criteria

- [ ] Stats page shows real-world equivalent for each stat
- [ ] Milestone progress bar for next achievement
- [ ] Stat breakdown tooltip (baseline vs activity contribution)
- [ ] Body composition widget on dashboard (if opted in)
- [ ] Weight trend chart
- [ ] Level displayed with real-world title equivalent
- [ ] Mobile responsive

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/stats/StatCard.tsx` | Modify | Add real-world context |
| `web/src/components/stats/StatMilestone.tsx` | Create | Milestone progress display |
| `web/src/components/stats/StatBreakdown.tsx` | Create | Detailed breakdown popover |
| `web/src/components/body/BodyCompositionWidget.tsx` | Create | Dashboard widget |
| `web/src/components/body/WeightChart.tsx` | Create | Weight trend chart |
| `web/src/hooks/useStats.ts` | Create | Fetch stat breakdown data |
| `web/src/hooks/useBodyComposition.ts` | Create | Body comp data hook |
| `web/src/pages/Stats.tsx` | Modify | Integrate new components |

## Implementation Notes

### StatCard Enhancement

```tsx
interface EnhancedStatCardProps {
  stat: 'STR' | 'AGI' | 'VIT' | 'DISC'
  value: number
  breakdown: {
    baseline: number
    activity: number
  }
  benchmark: {
    current: { label: string; realWorldEquivalent: string }
    next: { value: number; label: string; realWorldEquivalent: string } | null
    progressToNext: number
  }
}

function EnhancedStatCard({ stat, value, breakdown, benchmark }: EnhancedStatCardProps) {
  return (
    <div className="stat-card system-window">
      <div className="stat-header">
        <span className="stat-name">{stat}</span>
        <span className="stat-value">{value}</span>
      </div>
      
      <div className="stat-benchmark">
        <span className="benchmark-label">{benchmark.current.label}</span>
        <span className="benchmark-real">{benchmark.current.realWorldEquivalent}</span>
      </div>
      
      {benchmark.next && (
        <div className="stat-milestone">
          <div className="milestone-progress">
            <div 
              className="milestone-bar" 
              style={{ width: `${benchmark.progressToNext}%` }}
            />
          </div>
          <span className="milestone-next">
            Next: {benchmark.next.label} ({benchmark.next.value})
          </span>
        </div>
      )}
      
      <StatBreakdownTooltip baseline={breakdown.baseline} activity={breakdown.activity} />
    </div>
  )
}
```

### Body Composition Widget

```tsx
function BodyCompositionWidget() {
  const { data, isLoading } = useBodyComposition()
  
  if (!data || !data.isTracking) return null
  
  return (
    <div className="body-comp-widget system-window">
      <h3>BODY COMPOSITION</h3>
      
      <div className="weight-display">
        <span className="current-weight">{data.currentWeight} {data.unit}</span>
        <span className="weight-change">
          {data.change > 0 ? '+' : ''}{data.change} {data.unit}
        </span>
      </div>
      
      <div className="deficit-display">
        <span className="deficit-label">Weekly Deficit</span>
        <span className="deficit-value">{data.weeklyDeficit} cal</span>
        <span className="deficit-projected">
          ≈ {(data.weeklyDeficit / 3500).toFixed(1)} lb
        </span>
      </div>
      
      <WeightChart data={data.history} />
    </div>
  )
}
```

### Level with Real-World Title

```tsx
const LEVEL_TITLES: Record<number, { title: string; description: string }> = {
  1: { title: 'Dormant', description: 'Starting point' },
  5: { title: 'Awakened', description: 'Completed first week' },
  10: { title: 'E-Rank Hunter', description: '3 months consistency' },
  15: { title: 'D-Rank Hunter', description: '6 months gym experience' },
  20: { title: 'C-Rank Hunter', description: 'Military fitness level' },
  30: { title: 'B-Rank Hunter', description: 'Personal trainer fitness' },
  40: { title: 'A-Rank Hunter', description: 'Amateur athlete' },
  50: { title: 'S-Rank Hunter', description: 'Competitive athlete' },
}

function LevelDisplay({ level }: { level: number }) {
  const title = getLevelTitle(level)
  
  return (
    <div className="level-display">
      <span className="level-number">LV. {level}</span>
      <span className="level-title">{title.title}</span>
      <span className="level-desc">{title.description}</span>
    </div>
  )
}
```

### Weight Chart Component

```tsx
function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <div className="weight-chart">
      {/* Use a simple SVG line chart or recharts */}
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="var(--system-blue)"
            strokeWidth={2}
            dot={false}
          />
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Stats feel meaningful and grounded
- [ ] Body composition tracking is unobtrusive
- [ ] Chart renders correctly
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Existing tests pass
