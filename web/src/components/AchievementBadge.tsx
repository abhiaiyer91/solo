/**
 * Achievement Badge Component
 * 
 * Displays an achievement with progress or completion status.
 */

import { motion } from 'framer-motion'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
  progress?: {
    current: number
    target: number
    percentage: number
  }
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
  onClick,
}: AchievementBadgeProps) {
  const { name, description, icon, xpReward, unlocked, progress } = achievement
  
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }
  
  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }
  
  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.02 : 1 }}
      whileTap={{ scale: unlocked ? 0.98 : 1 }}
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-lg border
        ${unlocked 
          ? 'border-system-blue bg-system-blue/10 cursor-pointer' 
          : 'border-gray-700 bg-gray-900/50 opacity-60'}
        transition-colors duration-200
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          ${iconSizes[size]}
          ${unlocked ? '' : 'grayscale'}
        `}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-bold truncate
            ${unlocked ? 'text-white' : 'text-gray-400'}
          `}>
            {name}
          </h3>
          
          <p className="text-sm text-gray-400 line-clamp-2">
            {description}
          </p>
          
          {/* XP Reward */}
          <div className="mt-1 text-xs">
            <span className={unlocked ? 'text-system-blue' : 'text-gray-500'}>
              +{xpReward} XP
            </span>
          </div>
          
          {/* Progress bar for incomplete achievements */}
          {!unlocked && showProgress && progress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{progress.current} / {progress.target}</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gray-500 rounded-full"
                />
              </div>
            </div>
          )}
          
          {/* Unlock date for completed achievements */}
          {unlocked && achievement.unlockedAt && (
            <div className="mt-1 text-xs text-gray-500">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* Checkmark for unlocked */}
        {unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-500 text-xl"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Achievement Grid Component
 */
interface AchievementGridProps {
  achievements: Achievement[]
  columns?: 1 | 2 | 3
}

export function AchievementGrid({ achievements, columns = 2 }: AchievementGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }
  
  // Sort: unlocked first, then by progress
  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    if (!a.unlocked && !b.unlocked) {
      return (b.progress?.percentage ?? 0) - (a.progress?.percentage ?? 0)
    }
    return 0
  })
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {sorted.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} />
      ))}
    </div>
  )
}

/**
 * Achievement Unlock Animation (for toasts/modals)
 */
export function AchievementUnlockAnimation({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-8xl mb-4"
        >
          {achievement.icon}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Achievement Unlocked!
          </h2>
          <h3 className="text-xl text-system-blue font-bold mb-1">
            {achievement.name}
          </h3>
          <p className="text-gray-400 mb-4">{achievement.description}</p>
          <div className="text-green-400 font-bold">+{achievement.xpReward} XP</div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
