/**
 * QuestTemplateCard - Display a quest template with toggle option
 */

import React from 'react'
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { QuestTemplate, QuestCategory } from '@/hooks/useQuestTemplates'

const CATEGORY_COLORS: Record<QuestCategory, string> = {
  MOVEMENT: '#22C55E',
  TRAINING: '#EF4444',
  RECOVERY: '#3B82F6',
  MINDSET: '#A855F7',
  NUTRITION: '#F59E0B',
}

const STAT_ICONS: Record<string, string> = {
  STR: '💪',
  AGI: '🏃',
  VIT: '❤️',
  DISC: '🎯',
}

interface QuestTemplateCardProps {
  template: QuestTemplate
  isCore?: boolean
  isWeekly?: boolean
  isSpecial?: boolean
  onToggle?: () => void
  isToggling?: boolean
}

export function QuestTemplateCard({
  template,
  isCore,
  isWeekly,
  isSpecial,
  onToggle,
  isToggling,
}: QuestTemplateCardProps) {
  const categoryColor = CATEGORY_COLORS[template.category] || '#888888'
  const statIcon = STAT_ICONS[template.statType] || '📊'

  return (
    <View style={[styles.container, !template.isActive && styles.containerInactive]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {template.category}
            </Text>
          </View>
          {isCore && (
            <View style={styles.coreBadge}>
              <Text style={styles.coreText}>CORE</Text>
            </View>
          )}
          {isWeekly && (
            <View style={styles.weeklyBadge}>
              <Ionicons name="calendar" size={10} color="#60A5FA" />
              <Text style={styles.weeklyText}>WEEKLY</Text>
            </View>
          )}
          {isSpecial && (
            <View style={styles.specialBadge}>
              <Ionicons name="star" size={10} color="#FFD700" />
              <Text style={styles.specialText}>SPECIAL</Text>
            </View>
          )}
        </View>
        <Text style={styles.xpBadge}>+{template.baseXP} XP</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.questInfo}>
          <Text style={styles.questName}>{template.name}</Text>
          <Text style={styles.questDescription} numberOfLines={2}>
            {template.description}
          </Text>
        </View>

        {/* Toggle for bonus quests */}
        {onToggle && (
          <Switch
            value={template.isActive ?? true}
            onValueChange={onToggle}
            disabled={isToggling}
            trackColor={{ false: '#444', true: '#00FF00' }}
            thumbColor="#fff"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.statInfo}>
          <Text style={styles.statIcon}>{statIcon}</Text>
          <Text style={styles.statText}>
            +{template.statBonus} {template.statType}
          </Text>
        </View>
        {template.requirement && (
          <Text style={styles.requirementText}>
            {formatRequirement(template.requirement)}
          </Text>
        )}
      </View>
    </View>
  )
}

function formatRequirement(req: QuestTemplate['requirement']): string {
  if (!req) return ''
  
  const { type, metric, operator, value } = req
  if (type === 'numeric') {
    const ops: Record<string, string> = {
      gte: '≥',
      lte: '≤',
      eq: '=',
    }
    return `${metric}: ${operator ? ops[operator] || '' : ''} ${value?.toLocaleString()}`
  }
  if (type === 'boolean') {
    return metric || ''
  }
  return ''
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  containerInactive: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  coreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 3,
  },
  coreText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  weeklyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 3,
  },
  weeklyText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  specialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 3,
  },
  specialText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  xpBadge: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
    marginRight: 12,
  },
  questName: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
  },
  requirementText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
})
