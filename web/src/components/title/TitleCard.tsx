import { motion } from 'framer-motion'
import {
  type Title,
  getRarityColor,
  getRarityBorderColor,
  getCategoryIcon,
  useSetActiveTitle,
} from '@/hooks/useTitles'

interface TitleCardProps {
  title: Title
  showEquipButton?: boolean
}

export function TitleCard({ title, showEquipButton = true }: TitleCardProps) {
  const setActiveMutation = useSetActiveTitle()
  const rarityColor = getRarityColor(title.rarity)
  const borderColor = getRarityBorderColor(title.rarity)
  const categoryIcon = getCategoryIcon(title.category)

  const handleEquip = () => {
    if (title.isActive) {
      // Unequip
      setActiveMutation.mutate(null)
    } else {
      setActiveMutation.mutate(title.id)
    }
  }

  const isLocked = !title.isEarned

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      className={`
        relative p-4 border rounded transition-colors
        ${borderColor}
        ${isLocked ? 'opacity-50 bg-system-black/30' : 'bg-system-panel/30'}
        ${title.isActive ? 'ring-2 ring-system-gold' : ''}
      `}
    >
      {/* Active indicator */}
      {title.isActive && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-system-gold text-system-black text-xs font-bold rounded">
          ACTIVE
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="text-2xl">{categoryIcon}</div>
        <div className="flex-1">
          <div className={`font-bold ${rarityColor}`}>
            {title.name}
          </div>
          <div className="text-system-text-muted text-xs capitalize">
            {title.rarity} • {title.category.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-system-text-muted text-sm">
        {title.description}
      </p>

      {/* Requirement or Earned date */}
      <div className="mt-3 pt-3 border-t border-system-border">
        {isLocked ? (
          <div className="flex items-center gap-2 text-xs text-system-text-muted">
            <span>🔒</span>
            <span>{title.requirement}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-xs text-system-green">
              ✓ Earned {title.earnedAt ? new Date(title.earnedAt).toLocaleDateString() : ''}
            </div>
            {showEquipButton && (
              <button
                type="button"
                onClick={handleEquip}
                disabled={setActiveMutation.isPending}
                className={`
                  px-3 py-1 text-xs rounded transition-colors
                  ${title.isActive
                    ? 'border border-system-gold/50 text-system-gold hover:bg-system-gold/10'
                    : 'border border-system-blue/50 text-system-blue hover:bg-system-blue/10'
                  }
                  disabled:opacity-50
                `}
              >
                {setActiveMutation.isPending ? '...' : title.isActive ? 'Unequip' : 'Equip'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Passive effect if any */}
      {title.passiveEffect && title.isEarned && (
        <div className="mt-2 p-2 bg-system-purple/10 border border-system-purple/30 rounded">
          <div className="text-xs text-system-purple">
            <span className="font-medium">Passive:</span> {title.passiveEffect}
          </div>
        </div>
      )}

      {/* Seasonal exclusive badge */}
      {title.isSeasonExclusive && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-system-gold/20 border border-system-gold/50 rounded">
          <span className="text-system-gold text-[10px] font-bold">EXCLUSIVE</span>
        </div>
      )}
    </motion.div>
  )
}
