import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Dungeon, type DungeonRank, useEnterDungeon } from '@/hooks/useDungeons'
import { DungeonCard } from './DungeonCard'
import { DungeonEntryModal } from './DungeonEntryModal'

interface DungeonListProps {
  dungeons: Dungeon[]
}

const RANK_ORDER: DungeonRank[] = ['E', 'D', 'C', 'B', 'A', 'S']
const RANK_LABELS: Record<DungeonRank, string> = {
  E: 'E-Rank (Beginner)',
  D: 'D-Rank (Easy)',
  C: 'C-Rank (Normal)',
  B: 'B-Rank (Hard)',
  A: 'A-Rank (Expert)',
  S: 'S-Rank (Legendary)',
}

export function DungeonList({ dungeons }: DungeonListProps) {
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null)
  const enterMutation = useEnterDungeon()

  // Group by rank
  const groupedDungeons = dungeons.reduce(
    (acc, dungeon) => {
      if (!acc[dungeon.rank]) {
        acc[dungeon.rank] = []
      }
      acc[dungeon.rank]!.push(dungeon)
      return acc
    },
    {} as Record<DungeonRank, Dungeon[]>
  )

  const handleEnterClick = (dungeonId: string) => {
    const dungeon = dungeons.find((d) => d.id === dungeonId)
    if (dungeon) {
      setSelectedDungeon(dungeon)
    }
  }

  const handleConfirmEnter = () => {
    if (selectedDungeon) {
      enterMutation.mutate(selectedDungeon.id)
      setSelectedDungeon(null)
    }
  }

  return (
    <>
      <div className="space-y-8">
        {RANK_ORDER.map((rank) => {
          const rankDungeons = groupedDungeons[rank]
          if (!rankDungeons || rankDungeons.length === 0) return null

          return (
            <motion.div
              key={rank}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-sm font-medium text-system-text mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-system-purple rounded-full" />
                {RANK_LABELS[rank]}
                <span className="text-system-text-muted">
                  ({rankDungeons.length})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rankDungeons.map((dungeon) => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    onEnter={handleEnterClick}
                    isEntering={enterMutation.isPending}
                  />
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Entry confirmation modal */}
      <AnimatePresence>
        {selectedDungeon && (
          <DungeonEntryModal
            dungeon={selectedDungeon}
            onConfirm={handleConfirmEnter}
            onCancel={() => setSelectedDungeon(null)}
            isEntering={enterMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  )
}
