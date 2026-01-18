import { motion } from 'framer-motion'
import { useTitles, getRarityColor } from '@/hooks/useTitles'
import { TitleGrid } from '@/components/title'

export function Titles() {
  const { data, isLoading, error } = useTitles()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING TITLES...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <span className="text-system-red">Failed to load titles</span>
        </div>
      </div>
    )
  }

  const titles = data?.titles ?? []
  const activeTitle = data?.activeTitle

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-system-purple">
              TITLE COLLECTION
            </h1>
            <p className="text-system-text-muted text-sm mt-1">
              Earned achievements and milestones
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-system-text">
              {data?.totalEarned ?? 0}/{data?.totalAvailable ?? 0}
            </div>
            <div className="text-system-text-muted text-xs">Titles Earned</div>
          </div>
        </div>
      </motion.div>

      {/* Active Title */}
      {activeTitle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-gold rounded-full" />
            ACTIVE TITLE
          </h2>

          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${getRarityColor(activeTitle.rarity)}`}>
              {activeTitle.name}
            </div>
            <span className="text-system-text-muted text-sm capitalize">
              {activeTitle.rarity}
            </span>
          </div>

          {activeTitle.passiveEffect && (
            <div className="mt-3 p-3 bg-system-purple/10 border border-system-purple/30 rounded">
              <div className="text-sm text-system-purple">
                <span className="font-medium">Passive Bonus:</span> {activeTitle.passiveEffect}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Title Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full" />
          ALL TITLES
        </h2>

        <TitleGrid titles={titles} />
      </motion.div>
    </div>
  )
}

export default Titles
