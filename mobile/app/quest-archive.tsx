/**
 * Quest Archive Screen
 *
 * Shows all quest templates grouped by type with activate/deactivate functionality.
 */

import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { useQuestTemplates, type QuestTemplate } from '@/hooks/useQuestTemplates';

interface QuestTemplateCardProps {
  template: QuestTemplate;
  variant: 'core' | 'bonus' | 'weekly' | 'special';
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  isActioning?: boolean;
}

function QuestTemplateCard({
  template,
  variant,
  onActivate,
  onDeactivate,
  isActioning,
}: QuestTemplateCardProps) {
  const variantConfig = {
    core: { color: '#FBBF24', bg: '#FBBF2410', label: 'CORE' },
    bonus: { color: '#60A5FA', bg: template.isActive ? '#4ADE8010' : '#1E293B', label: template.isActive ? 'ACTIVE' : 'INACTIVE' },
    weekly: { color: '#A78BFA', bg: '#A78BFA10', label: 'WEEKLY' },
    special: { color: '#EF4444', bg: template.isActive ? '#EF444410' : '#1E293B', label: template.type },
  };

  const config = variantConfig[variant];
  const canToggle = variant === 'bonus' || variant === 'special';

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (template.isActive) {
      Alert.alert(
        'Remove Quest',
        `Remove "${template.name}" from your daily quests?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => onDeactivate?.(template.id) },
        ]
      );
    } else {
      onActivate?.(template.id);
    }
  };

  return (
    <View style={{
      padding: 14,
      backgroundColor: config.bg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: template.isActive && canToggle ? '#4ADE8040' : `${config.color}30`,
      marginBottom: 10,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 15, fontWeight: '600', flex: 1 }} numberOfLines={1}>
          {template.name}
        </Text>
        <View style={{
          backgroundColor: template.isActive && canToggle ? '#4ADE8020' : `${config.color}20`,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 4,
        }}>
          <Text style={{
            color: template.isActive && canToggle ? '#4ADE80' : config.color,
            fontSize: 10,
            fontWeight: '600',
          }}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 10, lineHeight: 18 }}>
        {template.description}
      </Text>

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#64748B', fontSize: 11 }}>
          {template.category} • {template.baseXP} XP
        </Text>

        {variant === 'core' && (
          <Text style={{ color: '#4ADE80', fontSize: 11, fontWeight: '500' }}>
            ALWAYS ACTIVE
          </Text>
        )}

        {variant === 'weekly' && (
          <Text style={{ color: '#A78BFA', fontSize: 11, opacity: 0.7 }}>
            AUTO-TRACKED
          </Text>
        )}

        {canToggle && (
          <Pressable
            onPress={handleToggle}
            disabled={isActioning}
            style={({ pressed }) => ({
              backgroundColor: template.isActive
                ? pressed ? '#334155' : '#1E293B'
                : pressed ? '#60A5FA' : '#60A5FACC',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 4,
              borderWidth: template.isActive ? 1 : 0,
              borderColor: '#334155',
              opacity: isActioning ? 0.5 : 1,
            })}
          >
            <Text style={{
              color: template.isActive ? '#94A3B8' : '#FFF',
              fontSize: 11,
              fontWeight: '600',
            }}>
              {isActioning
                ? (template.isActive ? 'REMOVING...' : 'ACTIVATING...')
                : (template.isActive ? 'REMOVE' : 'ACTIVATE')
              }
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

interface QuestSectionProps {
  title: string;
  subtitle: string;
  color: string;
  templates: QuestTemplate[];
  variant: 'core' | 'bonus' | 'weekly' | 'special';
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  actioningId?: string;
}

function QuestSection({
  title,
  subtitle,
  color,
  templates,
  variant,
  onActivate,
  onDeactivate,
  actioningId,
}: QuestSectionProps) {
  if (templates.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 8 }} />
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '700', letterSpacing: 1 }}>
          {title}
        </Text>
      </View>
      <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 12, marginLeft: 16 }}>
        {subtitle}
      </Text>

      {/* Quest Cards */}
      {templates.map((template) => (
        <QuestTemplateCard
          key={template.id}
          template={template}
          variant={variant}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          isActioning={actioningId === template.id}
        />
      ))}
    </View>
  );
}

export default function QuestArchiveScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    coreQuests,
    bonusDaily,
    weeklyQuests,
    specialQuests,
    isLoading,
    refetch,
    activateQuest,
    deactivateQuest,
    activatingId,
    deactivatingId,
  } = useQuestTemplates();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleActivate = (id: string) => {
    activateQuest(id, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to activate quest. Please try again.');
      },
    });
  };

  const handleDeactivate = (id: string) => {
    deactivateQuest(id, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to remove quest. Please try again.');
      },
    });
  };

  const actioningId = activatingId || deactivatingId;

  return (
    <>
      <Stack.Screen options={{ title: 'QUEST ARCHIVE' }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
          }
        >
          {/* Header */}
          <SystemWindow variant="default" style={{ marginBottom: 20 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              QUEST ARCHIVE ACCESS GRANTED
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 14, marginTop: 4 }}>
              Select additional objectives to enhance your progression.
            </Text>
          </SystemWindow>

          {isLoading && !refreshing ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#64748B' }}>Accessing quest archive...</Text>
            </View>
          ) : (
            <>
              {/* Core Quests */}
              <QuestSection
                title="CORE QUESTS"
                subtitle="Fundamental quests that form your training foundation."
                color="#FBBF24"
                templates={coreQuests}
                variant="core"
              />

              {/* Bonus Daily */}
              <QuestSection
                title="BONUS DAILY QUESTS"
                subtitle="Optional daily challenges to accelerate growth."
                color="#60A5FA"
                templates={bonusDaily}
                variant="bonus"
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                actioningId={actioningId}
              />

              {/* Weekly Quests */}
              <QuestSection
                title="WEEKLY QUESTS"
                subtitle="Sustained challenges tracked automatically."
                color="#A78BFA"
                templates={weeklyQuests}
                variant="weekly"
              />

              {/* Special Quests */}
              <QuestSection
                title="SPECIAL QUESTS"
                subtitle="High-risk, high-reward challenges."
                color="#EF4444"
                templates={specialQuests}
                variant="special"
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                actioningId={actioningId}
              />

              {/* Empty State */}
              {coreQuests.length === 0 && bonusDaily.length === 0 && weeklyQuests.length === 0 && specialQuests.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="document-text-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                  <Text style={{ color: '#64748B', fontSize: 14 }}>
                    No quest templates available
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}
