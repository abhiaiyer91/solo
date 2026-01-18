import { motion } from 'framer-motion'
import { useDungeons, getRankColor } from '@/hooks/useDungeons'
import { DungeonList, ActiveDungeon } from '@/components/dungeon'

export function Dungeons() {
  const { data, isLoading, error } = useDungeons()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING DUNGEONS...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <span className="text-system-red">Failed to load dungeons</span>
        </div>
      </div>
    )
  }

  const dungeons = data?.dungeons ?? []
  const activeDungeon = data?.activeDungeon
  const completedDungeons = data?.completedDungeons ?? []

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
              DUNGEON BROWSER
            </h1>
            <p className="text-system-text-muted text-sm mt-1">
              Time-limited challenges with increased rewards
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-system-text">
              {data?.totalCleared ?? 0}
            </div>
            <div className="text-system-text-muted text-xs">Dungeons Cleared</div>
          </div>
        </div>
      </motion.div>

      {/* Active Dungeon */}
      {activeDungeon && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActiveDungeon dungeon={activeDungeon} />
        </motion.div>
      )}

      {/* Available Dungeons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full" />
          AVAILABLE DUNGEONS
        </h2>

        {dungeons.length === 0 ? (
          <p className="text-system-text-muted text-center py-8">
            No dungeons available at your level
          </p>
        ) : (
          <DungeonList dungeons={dungeons} />
        )}
      </motion.div>

      {/* Completed Dungeons History */}
      {completedDungeons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-green rounded-full" />
            DUNGEON HISTORY
          </h2>

          <div className="space-y-2">
            {completedDungeons.slice(0, 10).map((completed) => (
              <div
                key={completed.id}
                className="flex items-center justify-between p-3 border border-system-border rounded"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getRankColor(completed.rank)}`}>
                    {completed.rank}
                  </span>
                  <span className="text-system-text">{completed.dungeonName}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-system-green">+{completed.xpEarned} XP</span>
                  <span className="text-system-text-muted">
                    {new Date(completed.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dungeons
