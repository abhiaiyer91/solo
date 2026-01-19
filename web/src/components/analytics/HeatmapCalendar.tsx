/**
 * HeatmapCalendar - Activity heatmap showing patterns by day and hour
 */

import type { HeatmapCell } from '../../hooks/useAnalytics'

interface HeatmapCalendarProps {
  data: HeatmapCell[]
  title?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function HeatmapCalendar({ data, title = 'Activity Heatmap' }: HeatmapCalendarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900/50 rounded-lg border border-gray-800">
        <span className="text-gray-500">No activity data available</span>
      </div>
    )
  }

  // Create a map for quick lookup
  const dataMap = new Map<string, HeatmapCell>()
  data.forEach((cell) => {
    dataMap.set(`${cell.day}-${cell.hour}`, cell)
  })

  // Find max count for intensity calculation
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // Get intensity class based on activity level
  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-gray-900'
    const intensity = count / maxCount
    if (intensity >= 0.8) return 'bg-blue-500'
    if (intensity >= 0.6) return 'bg-blue-600'
    if (intensity >= 0.4) return 'bg-blue-700'
    if (intensity >= 0.2) return 'bg-blue-800'
    return 'bg-blue-900'
  }

  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12a'
    if (hour === 12) return '12p'
    if (hour < 12) return `${hour}a`
    return `${hour - 12}p`
  }

  // Find peak activity
  const peakCell = data.reduce((max, cell) => (cell.count > (max?.count ?? 0) ? cell : max), data[0])

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {peakCell && peakCell.count > 0 && (
          <span className="text-xs text-gray-500">
            Peak: {DAYS[peakCell.day]} {formatHour(peakCell.hour)}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-1">
            {HOURS.filter((_, i) => i % 3 === 0).map((hour) => (
              <div key={hour} className="flex-1 text-[10px] text-gray-500 text-center" style={{ width: `${100 / 24}%` }}>
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <span className="w-12 text-xs text-gray-500 pr-2 text-right">{day}</span>
              <div className="flex flex-1 gap-[2px]">
                {HOURS.map((hour) => {
                  const cell = dataMap.get(`${dayIndex}-${hour}`)
                  const count = cell?.count ?? 0
                  const avgXP = cell?.avgXP ?? 0

                  return (
                    <div
                      key={hour}
                      className={`aspect-square rounded-sm transition-colors ${getIntensityClass(count)}`}
                      style={{ flex: 1, maxWidth: '20px' }}
                      title={`${day} ${formatHour(hour)}: ${count} activities, ${avgXP} avg XP`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-900" />
          <div className="w-3 h-3 rounded-sm bg-blue-900" />
          <div className="w-3 h-3 rounded-sm bg-blue-700" />
          <div className="w-3 h-3 rounded-sm bg-blue-600" />
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
        </div>
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  )
}
