/**
 * Daily Challenge Component
 * 
 * Displays the daily rotating challenge with special styling.
 */

import { motion } from 'framer-motion'

export interface DailyChallenge {
  id: string
  name: string
  description: string
  type: string
  bonusXP: number
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  progress?: number
  target?: number
  completed?: boolean
}

interface DailyChallengeProps {
  challenge: DailyChallenge
  onComplete?: () => void
}

export function DailyChallengeCard({ challenge, onComplete }: DailyChallengeProps) {
  const { name, description, bonusXP, difficulty, completed, progress, target } = challenge
  
  const difficultyColors = {
    easy: 'border-green-500 bg-green-500/10',
    medium: 'border-yellow-500 bg-yellow-500/10',
    hard: 'border-red-500 bg-red-500/10',
  }
  
  const difficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  }
  
  const progressPercent = target && progress 
    ? Math.min(100, Math.round((progress / target) * 100))
    : 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-4 rounded-lg border-2
        ${completed ? 'border-green-500 bg-green-500/10' : difficultyColors[difficulty]}
        overflow-hidden
      `}
    >
      {/* Challenge badge */}
      <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg bg-purple-600/80 text-xs font-bold uppercase tracking-wider">
        Daily Challenge
      </div>
      
      <div className="pt-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={`font-bold text-lg ${completed ? 'text-green-400' : 'text-white'}`}>
              {name}
            </h3>
            <span className={`text-xs uppercase tracking-wider ${
              difficulty === 'easy' ? 'text-green-400' :
              difficulty === 'medium' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {difficultyLabels[difficulty]}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-purple-400 font-bold">+{bonusXP} XP</div>
            <div className="text-xs text-gray-400">Bonus</div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        
        {/* Progress bar */}
        {!completed && target && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress ?? 0} / {target}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        )}
        
        {/* Completed state */}
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-green-400"
          >
            <span className="text-2xl">✓</span>
            <span className="font-bold">Challenge Complete!</span>
          </motion.div>
        )}
        
        {/* Complete button for manual completion */}
        {!completed && onComplete && progressPercent >= 100 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold transition-colors"
          >
            Claim Bonus
          </motion.button>
        )}
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
    </motion.div>
  )
}

/**
 * Empty state for when no challenge is available
 */
export function NoDailyChallenge() {
  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/50 text-center">
      <div className="text-4xl mb-2">🎯</div>
      <h3 className="font-bold text-gray-400">No Active Challenge</h3>
      <p className="text-sm text-gray-500">Check back tomorrow for a new daily challenge!</p>
    </div>
  )
}

/**
 * Challenge streak indicator
 */
interface ChallengeStreakProps {
  currentStreak: number
  longestStreak: number
}

export function ChallengeStreak({ currentStreak, longestStreak }: ChallengeStreakProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-400">{currentStreak}</div>
        <div className="text-xs text-gray-400">Current</div>
      </div>
      <div className="h-8 w-px bg-gray-700" />
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-300">{longestStreak}</div>
        <div className="text-xs text-gray-400">Best</div>
      </div>
      <div className="flex-1 text-right">
        <div className="text-sm text-gray-400">Challenge Streak</div>
      </div>
    </div>
  )
}
