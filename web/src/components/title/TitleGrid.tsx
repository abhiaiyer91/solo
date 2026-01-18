import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Title, type TitleCategory } from '@/hooks/useTitles'
import { TitleCard } from './TitleCard'

interface TitleGridProps {
  titles: Title[]
  showFilters?: boolean
}

const CATEGORY_LABELS: Record<TitleCategory, string> = {
  streak: 'Streak',
  boss: 'Boss',
  dungeon: 'Dungeon',
  seasonal: 'Seasonal',
  achievement: 'Achievement',
  hard_mode: 'Hard Mode',
}

type FilterType = 'all' | 'earned' | 'locked'

export function TitleGrid({ titles, showFilters = true }: TitleGridProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<TitleCategory | 'all'>('all')

  const filteredTitles = titles.filter((title) => {
    // Status filter
    if (filter === 'earned' && !title.isEarned) return false
    if (filter === 'locked' && title.isEarned) return false

    // Category filter
    if (categoryFilter !== 'all' && title.category !== categoryFilter) return false

    return true
  })

  // Group by category
  const groupedTitles = filteredTitles.reduce(
    (acc, title) => {
      if (!acc[title.category]) {
        acc[title.category] = []
      }
      acc[title.category]!.push(title)
      return acc
    },
    {} as Record<TitleCategory, Title[]>
  )

  const categories = Object.keys(groupedTitles) as TitleCategory[]

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4">
          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-system-panel rounded">
            {(['all', 'earned', 'locked'] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`
                  px-3 py-1 text-xs rounded transition-colors capitalize
                  ${filter === f
                    ? 'bg-system-blue text-white'
                    : 'text-system-text-muted hover:text-system-text'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-1 p-1 bg-system-panel rounded overflow-x-auto">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`
                px-3 py-1 text-xs rounded transition-colors whitespace-nowrap
                ${categoryFilter === 'all'
                  ? 'bg-system-purple text-white'
                  : 'text-system-text-muted hover:text-system-text'
                }
              `}
            >
              All
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategoryFilter(key as TitleCategory)}
                className={`
                  px-3 py-1 text-xs rounded transition-colors whitespace-nowrap
                  ${categoryFilter === key
                    ? 'bg-system-purple text-white'
                    : 'text-system-text-muted hover:text-system-text'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredTitles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 text-center text-system-text-muted"
          >
            No titles found for current filters
          </motion.div>
        ) : categoryFilter === 'all' ? (
          // Grouped view
          <motion.div
            key="grouped"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-system-text mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-system-purple rounded-full" />
                  {CATEGORY_LABELS[category]}
                  <span className="text-system-text-muted">
                    ({groupedTitles[category]?.length ?? 0})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTitles[category]?.map((title) => (
                    <TitleCard key={title.id} title={title} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          // Flat view
          <motion.div
            key="flat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredTitles.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
