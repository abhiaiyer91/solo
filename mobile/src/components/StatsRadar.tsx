/**
 * StatsRadar - Radar chart visualization for player stats
 * Displays STR, AGI, VIT, DISC in an interactive radar chart
 */

import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native'
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg'

export interface StatsData {
  STR: number
  AGI: number
  VIT: number
  DISC: number
}

interface StatsRadarProps {
  stats: StatsData | null
  isLoading?: boolean
  maxValue?: number
  size?: number
  showLabels?: boolean
  showValues?: boolean
  compact?: boolean
}

export function StatsRadar({
  stats,
  isLoading,
  maxValue = 100,
  size,
  showLabels = true,
  showValues = true,
  compact = false,
}: StatsRadarProps) {
  // Calculate default size based on screen width and compact mode
  const screenWidth = Dimensions.get('window').width
  const defaultSize = compact ? Math.min(screenWidth - 64, 200) : Math.min(screenWidth - 64, 300)
  const chartSize = size || defaultSize

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.header}>
          <Text style={styles.title}>{'>'} STATS OVERVIEW</Text>
        </View>
        <View style={[styles.loadingContainer, { height: chartSize }]}>
          <ActivityIndicator size="small" color="#00FF00" />
          <Text style={styles.loadingText}>Calculating stats...</Text>
        </View>
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.header}>
          <Text style={styles.title}>{'>'} STATS OVERVIEW</Text>
        </View>
        <View style={[styles.emptyContainer, { height: chartSize }]}>
          <Text style={styles.emptyText}>No stats available</Text>
          <Text style={styles.emptySubtext}>Complete quests to build stats</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      {!compact && (
        <View style={styles.header}>
          <Text style={styles.title}>{'>'} STATS OVERVIEW</Text>
        </View>
      )}

      {/* Radar Chart */}
      <View style={styles.chartContainer}>
        <RadarChart
          stats={stats}
          size={chartSize}
          maxValue={maxValue}
          showLabels={showLabels}
        />
      </View>

      {/* Stat Values */}
      {showValues && (
        <View style={styles.valuesContainer}>
          <StatValue label="STR" value={stats.STR} color="#EF4444" icon="💪" />
          <StatValue label="AGI" value={stats.AGI} color="#22C55E" icon="🏃" />
          <StatValue label="VIT" value={stats.VIT} color="#3B82F6" icon="❤️" />
          <StatValue label="DISC" value={stats.DISC} color="#A855F7" icon="🎯" />
        </View>
      )}
    </View>
  )
}

interface RadarChartProps {
  stats: StatsData
  size: number
  maxValue: number
  showLabels: boolean
}

function RadarChart({ stats, size, maxValue, showLabels }: RadarChartProps) {
  const center = size / 2
  const radius = (size * 0.4) // Leave room for labels
  const statKeys: Array<keyof StatsData> = ['STR', 'AGI', 'VIT', 'DISC']
  const numStats = statKeys.length
  const angleStep = (2 * Math.PI) / numStats

  // Calculate points for each stat
  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2 // Start from top
    const distance = (value / maxValue) * radius
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    }
  }

  // Build polygon points string for data
  const dataPoints = statKeys
    .map((key, i) => {
      const point = getPoint(i, stats[key])
      return `${point.x},${point.y}`
    })
    .join(' ')

  // Background grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const gridPolygons = gridLevels.map((level) => {
    const points = statKeys
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const distance = radius * level
        const x = center + distance * Math.cos(angle)
        const y = center + distance * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
    return points
  })

  // Stat colors
  const statColors: Record<keyof StatsData, string> = {
    STR: '#EF4444',
    AGI: '#22C55E',
    VIT: '#3B82F6',
    DISC: '#A855F7',
  }

  return (
    <Svg width={size} height={size}>
      {/* Background grid */}
      {gridPolygons.map((points, i) => (
        <Polygon
          key={`grid-${i}`}
          points={points}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {statKeys.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon with gradient effect */}
      <Polygon
        points={dataPoints}
        fill="rgba(0, 255, 0, 0.15)"
        stroke="#00FF00"
        strokeWidth="2"
      />

      {/* Data points and labels */}
      {statKeys.map((key, i) => {
        const point = getPoint(i, stats[key])
        const angle = i * angleStep - Math.PI / 2
        const labelDistance = radius * 1.15
        const labelX = center + labelDistance * Math.cos(angle)
        const labelY = center + labelDistance * Math.sin(angle)
        const color = statColors[key]

        return (
          <React.Fragment key={key}>
            {/* Data point */}
            <Circle cx={point.x} cy={point.y} r="4" fill={color} />

            {/* Label */}
            {showLabels && (
              <SvgText
                x={labelX}
                y={labelY}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
                fill={color}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {key}
              </SvgText>
            )}
          </React.Fragment>
        )
      })}

      {/* Center point */}
      <Circle cx={center} cy={center} r="3" fill="#00FF00" opacity={0.5} />
    </Svg>
  )
}

function StatValue({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: string
}) {
  return (
    <View style={styles.statValueItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statValueContent}>
        <Text style={[styles.statValueLabel, { color }]}>{label}</Text>
        <Text style={styles.statValueNumber}>{value.toFixed(1)}</Text>
      </View>
    </View>
  )
}

export function StatsRadarCompact(props: Omit<StatsRadarProps, 'compact'>) {
  return <StatsRadar {...props} compact showLabels={false} showValues={false} />
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerCompact: {
    padding: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  valuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  statValueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValueContent: {
    flex: 1,
  },
  statValueLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statValueNumber: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})
