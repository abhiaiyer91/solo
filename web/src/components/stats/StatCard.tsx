import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: number
  description?: string
  color: string
  icon?: string
  maxValue?: number
}

export function StatCard({
  label,
  value,
  description,
  color,
  maxValue = 100,
}: StatCardProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-system-border rounded bg-system-panel/30"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-system-text-muted text-xs uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-2xl font-bold`} style={{ color }}>
          {value}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-system-black rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {description && (
        <p className="text-system-text-muted text-xs mt-2">{description}</p>
      )}
    </motion.div>
  )
}
