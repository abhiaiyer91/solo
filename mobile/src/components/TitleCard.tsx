/**
 * TitleCard - Title display card for mobile
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { Title } from '../hooks/useTitles'
import { getRarityColor, getRarityBgColor, getCategoryIcon, getRarityLabel } from '../hooks/useTitles'

interface TitleCardProps {
  title: Title
  onPress?: () => void
  compact?: boolean
}

export function TitleCard({ title, onPress, compact = false }: TitleCardProps) {
  const rarityColor = getRarityColor(title.rarity)
  const rarityBg = getRarityBgColor(title.rarity)
  const categoryIcon = getCategoryIcon(title.category)

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactContainer,
          { borderColor: title.isEarned ? rarityColor : '#2a2a4e', opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.compactIcon}>{categoryIcon}</Text>
        <View style={styles.compactContent}>
          <Text style={[styles.compactName, { color: title.isEarned ? rarityColor : '#6b7280' }]} numberOfLines={1}>
            {title.name}
          </Text>
          {title.isActive && <View style={[styles.equippedDot, { backgroundColor: rarityColor }]} />}
        </View>
        {!title.isEarned && <Text style={styles.lockedIcon}>🔒</Text>}
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: title.isEarned ? rarityColor : '#2a2a4e',
          backgroundColor: title.isEarned ? rarityBg : '#1a1a2e',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.categoryIcon}>{categoryIcon}</Text>
        <View style={styles.rarityBadge}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{getRarityLabel(title.rarity)}</Text>
        </View>
      </View>

      {/* Title Name */}
      <Text style={[styles.name, { color: title.isEarned ? '#ffffff' : '#6b7280' }]} numberOfLines={1}>
        {title.name}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {title.description}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        {title.isEarned ? (
          title.isActive ? (
            <View style={[styles.equippedBadge, { borderColor: rarityColor }]}>
              <Text style={[styles.equippedText, { color: rarityColor }]}>EQUIPPED</Text>
            </View>
          ) : (
            <Text style={styles.earnedText}>
              Earned {title.earnedAt ? new Date(title.earnedAt).toLocaleDateString() : ''}
            </Text>
          )
        ) : (
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedText}>🔒 Locked</Text>
          </View>
        )}

        {title.passiveEffect && (
          <Text style={[styles.passiveText, { color: rarityColor }]}>
            +{title.passiveValue}% {title.passiveEffect}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  rarityBadge: {
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equippedBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  equippedText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  earnedText: {
    fontSize: 12,
    color: '#6b7280',
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 12,
    color: '#6b7280',
  },
  passiveText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  compactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  equippedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  lockedIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
})
