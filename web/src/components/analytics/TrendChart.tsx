/**
 * TrendChart - Line chart for displaying trends over time
 */

import type { TrendDataPoint } from '../../hooks/useAnalytics'

interface TrendChartProps {
  data: TrendDataPoint[]
  title: string
  color?: string
  height?: number
  showLabels?: boolean
  valueFormatter?: (value: number) => string
}

export function TrendChart({
  data,
  title,
  color = '#3b82f6',
  height = 200,
  showLabels = true,
  valueFormatter = (v) => v.toString(),
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900/50 rounded-lg border border-gray-800">
        <span className="text-gray-500">No data available</span>
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const range = maxValue - minValue || 1

  // Calculate points for the line
  const width = 100
  const padding = 10
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight
    return { x, y, ...d }
  })

  // Create SVG path
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')

  // Create area path (for gradient fill)
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${chartHeight + padding} L ${padding} ${chartHeight + padding} Z`

  // Calculate average
  const average = values.reduce((a, b) => a + b, 0) / values.length
  const avgY = padding + chartHeight - ((average - minValue) / range) * chartHeight

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height }}
      >
        <defs>
          <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#gradient-${title.replace(/\s/g, '')})`} />

        {/* Average line */}
        <line
          x1={padding}
          y1={avgY}
          x2={width - padding}
          y2={avgY}
          stroke="#6b7280"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Main line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#1f2937" strokeWidth="1" />
        ))}
      </svg>

      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{data[0]?.date}</span>
          <span className="text-gray-400">avg: {valueFormatter(Math.round(average))}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-800">
        <div>
          <span className="text-xs text-gray-500">Min</span>
          <p className="text-sm font-medium text-white">{valueFormatter(Math.round(minValue))}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">Avg</span>
          <p className="text-sm font-medium text-white">{valueFormatter(Math.round(average))}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Max</span>
          <p className="text-sm font-medium text-white">{valueFormatter(Math.round(maxValue))}</p>
        </div>
      </div>
    </div>
  )
}
