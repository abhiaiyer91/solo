/**
 * QuestArchive - Quest template management screen
 * View all quest templates and activate/deactivate optional quests
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { QuestTemplateCard } from '@/components/QuestTemplateCard'
import { useQuestTemplates, type QuestTemplate, type QuestCategory } from '@/hooks/useQuestTemplates'

const CATEGORY_ORDER: QuestCategory[] = ['MOVEMENT', 'TRAINING', 'RECOVERY', 'MINDSET', 'NUTRITION']

const CATEGORY_INFO: Record<QuestCategory, { icon: string; description: string }> = {
  MOVEMENT: { icon: '🏃', description: 'Daily activity and step goals' },
  TRAINING: { icon: '💪', description: 'Workout and strength training' },
  RECOVERY: { icon: '😴', description: 'Sleep and rest activities' },
  MINDSET: { icon: '🧘', description: 'Meditation and mental wellness' },
  NUTRITION: { icon: '🥗', description: 'Food and hydration tracking' },
}

interface SectionData {
  title: string
  icon: string
  description: string
  data: QuestTemplate[]
  type: 'core' | 'bonus' | 'weekly' | 'special'
}

export default function QuestArchiveScreen() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const {
    coreQuests,
    bonusQuests,
    weeklyQuests,
    specialQuests,
    isLoading,
    refetch,
    toggleQuest,
    isToggling,
  } = useQuestTemplates()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleToggleQuest = useCallback((templateId: string, isActive: boolean) => {
    toggleQuest({ templateId, isActive: !isActive })
  }, [toggleQuest])

  // Build sections
  const sections: SectionData[] = []

  // Core Quests (grouped by category)
  CATEGORY_ORDER.forEach((category) => {
    const categoryQuests = coreQuests.filter((q) => q.category === category)
    if (categoryQuests.length > 0) {
      sections.push({
        title: `CORE: ${category}`,
        icon: CATEGORY_INFO[category].icon,
        description: CATEGORY_INFO[category].description,
        data: categoryQuests,
        type: 'core',
      })
    }
  })

  // Bonus Quests
  if (bonusQuests.length > 0) {
    sections.push({
      title: 'BONUS QUESTS',
      icon: '⭐',
      description: 'Optional quests for extra XP',
      data: bonusQuests,
      type: 'bonus',
    })
  }

  // Weekly Quests
  if (weeklyQuests.length > 0) {
    sections.push({
      title: 'WEEKLY QUESTS',
      icon: '📅',
      description: 'Longer-term goals tracked over the week',
      data: weeklyQuests,
      type: 'weekly',
    })
  }

  // Special Quests
  if (specialQuests.length > 0) {
    sections.push({
      title: 'SPECIAL QUESTS',
      icon: '🏰',
      description: 'Dungeons, bosses, and challenges',
      data: specialQuests,
      type: 'special',
    })
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00FF00" />
          </Pressable>
          <Text style={styles.headerTitle}>{'>'} QUEST ARCHIVE</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={styles.loadingText}>Loading quests...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00FF00" />
        </Pressable>
        <Text style={styles.headerTitle}>{'>'} QUEST ARCHIVE</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF00"
          />
        }
        renderSectionHeader={({ section }) => (
          <Pressable
            style={styles.sectionHeader}
            onPress={() =>
              setExpandedCategory(
                expandedCategory === section.title ? null : section.title
              )
            }
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.questCount}>{section.data.length}</Text>
              <Ionicons
                name={expandedCategory === section.title ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#888888"
              />
            </View>
          </Pressable>
        )}
        renderItem={({ item, section }) => {
          // Collapse sections by default, expand on click
          const isExpanded = expandedCategory === section.title
          if (!isExpanded) return null

          return (
            <QuestTemplateCard
              template={item}
              isCore={section.type === 'core'}
              isWeekly={section.type === 'weekly'}
              isSpecial={section.type === 'special'}
              onToggle={section.type === 'bonus' ? 
                () => handleToggleQuest(item.id, item.isActive ?? true) : 
                undefined
              }
              isToggling={isToggling}
            />
          )
        }}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  listContent: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  sectionDescription: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questCount: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  footer: {
    height: 100,
  },
})
