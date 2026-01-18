import { motion } from 'framer-motion'

interface Stat {
  label: string
  value: number
  maxValue?: number
  color: string
}

interface StatHexagonProps {
  stats: Stat[]
  size?: number
  className?: string
}

export function StatHexagon({ stats, size = 280, className = '' }: StatHexagonProps) {
  const center = size / 2
  const maxRadius = size * 0.4
  const labelRadius = size * 0.48

  // Calculate points for the background grid (concentric polygons)
  const getPolygonPoints = (radius: number) => {
    return stats
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Calculate points for the stat values polygon
  const getStatPoints = () => {
    return stats
      .map((stat, i) => {
        const maxVal = stat.maxValue || 100
        const normalizedValue = Math.min(stat.value / maxVal, 1)
        const radius = normalizedValue * maxRadius
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Get label positions
  const getLabelPosition = (index: number) => {
    const angle = (Math.PI * 2 * index) / stats.length - Math.PI / 2
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background grid */}
        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={getPolygonPoints(maxRadius * level)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-system-border/30"
          />
        ))}

        {/* Axis lines */}
        {stats.map((_, i) => {
          const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2
          const x = center + maxRadius * Math.cos(angle)
          const y = center + maxRadius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-system-border/20"
            />
          )
        })}

        {/* Stats polygon with animation */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          points={getStatPoints()}
          fill="rgba(0, 168, 255, 0.2)"
          stroke="rgb(0, 168, 255)"
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_rgba(0,168,255,0.5)]"
        />

        {/* Stat points */}
        {stats.map((stat, i) => {
          const maxVal = stat.maxValue || 100
          const normalizedValue = Math.min(stat.value / maxVal, 1)
          const radius = normalizedValue * maxRadius
          const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)

          return (
            <motion.circle
              key={i}
              initial={{ opacity: 0, r: 0 }}
              animate={{ opacity: 1, r: 4 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              cx={x}
              cy={y}
              fill={stat.color}
              className="drop-shadow-[0_0_4px_currentColor]"
            />
          )
        })}

        {/* Labels */}
        {stats.map((stat, i) => {
          const pos = getLabelPosition(i)
          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                className="fill-system-text text-xs font-bold"
              >
                {stat.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                style={{ fill: stat.color }}
                className="text-sm font-bold"
              >
                {stat.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
