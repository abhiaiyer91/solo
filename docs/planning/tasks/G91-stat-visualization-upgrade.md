# G91: Stat Visualization Upgrade

## Overview

Enhance the stat radar/hexagon visualization with dynamic effects, history trails, comparison overlays, and achievement markers.

## Context

**Source:** UI/UX Design Ideation - 2026-01-18
**Design Doc:** `docs/frontend/ui-design-vision.md`
**Current State:** Basic radar chart exists; needs enhancement for visual impact

## Acceptance Criteria

- [ ] Pulsing glow on stats that recently increased
- [ ] History trail showing stat growth (ghosted previous values)
- [ ] Comparison overlay mode (You vs Shadow, You vs Yesterday)
- [ ] Danger zone highlighting when stats are low
- [ ] Achievement markers at threshold values on the radar
- [ ] Smooth animation when stats change
- [ ] Stat breakdown tooltip on hover/tap
- [ ] Mobile-friendly touch interactions

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/stats/StatHexagon.tsx` | Enhance | Add effects and overlays |
| `web/src/components/stats/StatHistory.tsx` | Create | Historical overlay layer |
| `web/src/components/stats/StatComparison.tsx` | Create | Comparison mode |
| `web/src/components/stats/StatMarkers.tsx` | Create | Achievement markers |
| `web/src/components/stats/StatTooltip.tsx` | Create | Detailed stat tooltip |
| `web/src/hooks/useStatHistory.ts` | Create | Track stat changes |

## Implementation Notes

### Enhanced Hexagon with Layers

```tsx
function StatHexagon({ stats, showHistory, comparison }: Props) {
  return (
    <div className="relative">
      <svg viewBox="0 0 280 280">
        {/* Background grid */}
        <GridLines levels={[0.25, 0.5, 0.75, 1]} />
        
        {/* Achievement markers layer */}
        <AchievementMarkers stats={stats} />
        
        {/* History trail layer (ghosted) */}
        {showHistory && (
          <HistoryTrail 
            current={stats} 
            history={statHistory}
            className="opacity-30"
          />
        )}
        
        {/* Comparison layer */}
        {comparison && (
          <ComparisonPolygon 
            data={comparison}
            className="stroke-system-purple fill-system-purple/10"
          />
        )}
        
        {/* Current stats polygon */}
        <StatsPolygon 
          stats={stats}
          className="stroke-system-blue fill-system-blue/20"
          animate
        />
        
        {/* Stat points with glow */}
        <StatPoints stats={stats} showGlow={recentlyChanged} />
        
        {/* Labels */}
        <StatLabels stats={stats} />
      </svg>
      
      {/* Tooltips portal */}
      <StatTooltips stats={stats} />
    </div>
  )
}
```

### Pulsing Glow for Recent Changes

```tsx
function StatPoints({ stats, recentlyChanged }: Props) {
  return (
    <>
      {stats.map((stat, i) => {
        const isRecent = recentlyChanged.includes(stat.label)
        const { x, y } = getPointPosition(stat, i, stats.length)
        
        return (
          <g key={stat.label}>
            {/* Glow effect for recent changes */}
            {isRecent && (
              <motion.circle
                cx={x}
                cy={y}
                r={12}
                fill={stat.color}
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ 
                  opacity: [0.8, 0.3, 0.8], 
                  scale: [1, 1.5, 1] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="blur-sm"
              />
            )}
            
            {/* Main point */}
            <motion.circle
              cx={x}
              cy={y}
              r={4}
              fill={stat.color}
              whileHover={{ r: 6 }}
            />
          </g>
        )
      })}
    </>
  )
}
```

### History Trail

```tsx
function HistoryTrail({ current, history }: Props) {
  // Show last 3 snapshots as ghosted polygons
  const snapshots = history.slice(-3)
  
  return (
    <>
      {snapshots.map((snapshot, i) => (
        <polygon
          key={snapshot.date}
          points={getPolygonPoints(snapshot.stats)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-system-border"
          style={{ opacity: 0.1 + (i * 0.1) }}
        />
      ))}
    </>
  )
}
```

### Comparison Mode

```tsx
function StatComparison({ userStats, shadowStats }: Props) {
  return (
    <div className="relative">
      <StatHexagon 
        stats={userStats}
        comparison={shadowStats}
      />
      
      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-system-blue rounded-full" />
          You
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-system-purple rounded-full" />
          Shadow (Avg)
        </span>
      </div>
    </div>
  )
}
```

### Achievement Markers

```tsx
const STAT_ACHIEVEMENTS = {
  STR: [
    { value: 25, label: "20-30 push-ups" },
    { value: 50, label: "Intermediate lifter" },
    { value: 75, label: "Advanced lifter" },
  ],
  AGI: [
    { value: 30, label: "10K capable" },
    { value: 50, label: "Half-marathon ready" },
  ],
  // ... etc
}

function AchievementMarkers({ stats }: Props) {
  return (
    <>
      {stats.map((stat, i) => {
        const achievements = STAT_ACHIEVEMENTS[stat.label]
        const angle = getAngle(i, stats.length)
        
        return achievements?.map(achievement => {
          const radius = (achievement.value / 100) * maxRadius
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          
          return (
            <circle
              key={`${stat.label}-${achievement.value}`}
              cx={x}
              cy={y}
              r={3}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="text-system-gold/50"
            />
          )
        })
      })}
    </>
  )
}
```

### Danger Zone

```tsx
function DangerZoneHighlight({ stats }: Props) {
  const dangerStats = stats.filter(s => s.value < 20)
  
  if (dangerStats.length === 0) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute -bottom-8 left-1/2 -translate-x-1/2"
    >
      <span className="text-xs text-system-red uppercase">
        Warning: {dangerStats.map(s => s.label).join(', ')} low
      </span>
    </motion.div>
  )
}
```

## Definition of Done

- [ ] Stat increases trigger visible glow animation
- [ ] History trail shows progression over time
- [ ] Comparison mode clearly distinguishes two data sets
- [ ] Achievement markers are visible but subtle
- [ ] Low stats trigger danger zone warning
- [ ] Tooltips provide detailed breakdown
- [ ] Animations are smooth (60fps)
- [ ] Mobile touch interactions work properly
