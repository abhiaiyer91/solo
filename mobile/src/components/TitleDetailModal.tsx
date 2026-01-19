/**
 * TitleDetailModal - Title detail popup for mobile
 */

import React from 'react'
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import type { Title } from '../hooks/useTitles'
import { getRarityColor, getRarityBgColor, getCategoryIcon, getRarityLabel } from '../hooks/useTitles'

interface TitleDetailModalProps {
  title: Title | null
  visible: boolean
  onClose: () => void
  onEquip: (titleId: string) => void
  onUnequip: () => void
  isLoading?: boolean
}

export function TitleDetailModal({
  title,
  visible,
  onClose,
  onEquip,
  onUnequip,
  isLoading = false,
}: TitleDetailModalProps) {
  if (!title) return null

  const rarityColor = getRarityColor(title.rarity)
  const rarityBg = getRarityBgColor(title.rarity)
  const categoryIcon = getCategoryIcon(title.category)

  const handleAction = () => {
    if (title.isActive) {
      onUnequip()
    } else if (title.isEarned) {
      onEquip(title.id)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.modal, { borderColor: title.isEarned ? rarityColor : '#2a2a4e' }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: rarityBg }]}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Rarity Badge */}
            <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>{getRarityLabel(title.rarity)}</Text>
            </View>

            {/* Title Name */}
            <Text style={[styles.name, { color: title.isEarned ? '#ffffff' : '#6b7280' }]}>{title.name}</Text>

            {/* Description */}
            <Text style={styles.description}>{title.description}</Text>

            {/* Requirement */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Requirement</Text>
              <Text style={[styles.requirement, { color: title.isEarned ? '#22c55e' : '#9ca3af' }]}>
                {title.isEarned ? '✓ ' : ''}
                {title.requirement}
              </Text>
            </View>

            {/* Passive Effect */}
            {title.passiveEffect && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Passive Bonus</Text>
                <Text style={[styles.passive, { color: rarityColor }]}>
                  +{title.passiveValue}% {title.passiveEffect}
                </Text>
              </View>
            )}

            {/* Season Exclusive */}
            {title.isSeasonExclusive && (
              <View style={styles.exclusiveBadge}>
                <Text style={styles.exclusiveText}>🌟 Season Exclusive</Text>
              </View>
            )}

            {/* Earned Date */}
            {title.isEarned && title.earnedAt && (
              <View style={styles.earnedInfo}>
                <Text style={styles.earnedLabel}>Earned on</Text>
                <Text style={styles.earnedDate}>{new Date(title.earnedAt).toLocaleDateString()}</Text>
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.footer}>
            {title.isEarned ? (
              <Pressable
                style={[
                  styles.actionButton,
                  title.isActive ? styles.unequipButton : { backgroundColor: rarityColor },
                ]}
                onPress={handleAction}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>{title.isActive ? 'Unequip Title' : 'Equip Title'}</Text>
                )}
              </Pressable>
            ) : (
              <View style={styles.lockedButton}>
                <Text style={styles.lockedButtonText}>🔒 Not Yet Earned</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  categoryIcon: {
    fontSize: 48,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  requirement: {
    fontSize: 14,
    lineHeight: 20,
  },
  passive: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exclusiveBadge: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  exclusiveText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  earnedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  earnedLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  earnedDate: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unequipButton: {
    backgroundColor: '#2a2a4e',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lockedButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  lockedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
})
