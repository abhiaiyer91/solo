/**
 * Quest History Screen
 *
 * Shows historical quest completion data and statistics.
 */

import { View, Text, ScrollView, RefreshControl, Pressable, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import {
  useQuestHistory,
  type DateRange,
  type QuestFilter,
  type QuestHistoryEntry,
  type QuestHistoryStats,
} from '@/hooks/useQuestHistory';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Filter options
const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All' },
];

const QUEST_FILTERS: { value: QuestFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Done' },
  { value: 'partial', label: 'Partial' },
  { value: 'missed', label: 'Missed' },
];

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: isActive ? '#60A5FA' : pressed ? '#334155' : '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
      })}
    >
      <Text style={{ color: isActive ? '#FFF' : '#94A3B8', fontSize: 13, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

function StatCard({ label, value, percentage, color = '#E2E8F0' }: StatCardProps) {
  return (
    <View style={{
      flex: 1,
      padding: 12,
      backgroundColor: '#0F172A',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1E293B',
    }}>
      <Text style={{ color: '#64748B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
        <Text style={{ color, fontSize: 20, fontWeight: '700' }}>
          {value}
        </Text>
        {percentage !== undefined && (
          <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 4 }}>
            ({percentage}%)
          </Text>
        )}
      </View>
    </View>
  );
}

interface CompletionChartProps {
  data: Array<{ date: string; rate: number }>;
}

function CompletionChart({ data }: CompletionChartProps) {
  if (data.length === 0) {
    return (
      <View style={{
        height: 100,
        backgroundColor: '#0F172A',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ color: '#64748B', fontSize: 12 }}>No data available</Text>
      </View>
    );
  }

  const maxRate = 100;
  const chartWidth = SCREEN_WIDTH - 64;
  const barWidth = Math.max(4, (chartWidth / data.length) - 2);

  return (
    <View style={{
      height: 100,
      backgroundColor: '#0F172A',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1E293B',
      padding: 12,
    }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {data.map((point, i) => (
          <View
            key={point.date}
            style={{
              width: barWidth,
              height: `${(point.rate / maxRate) * 100}%`,
              backgroundColor: point.rate >= 80 ? '#4ADE80' : point.rate >= 50 ? '#FBBF24' : '#EF4444',
              borderRadius: 2,
              minHeight: 4,
              opacity: 0.8,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ color: '#64748B', fontSize: 10 }}>{data[0]?.date}</Text>
        <Text style={{ color: '#64748B', fontSize: 10 }}>{data[data.length - 1]?.date}</Text>
      </View>
    </View>
  );
}

interface QuestHistoryItemProps {
  entry: QuestHistoryEntry;
}

function QuestHistoryItem({ entry }: QuestHistoryItemProps) {
  const statusConfig = {
    completed: { color: '#4ADE80', bg: '#4ADE8015', icon: 'checkmark-circle' as const },
    partial: { color: '#FBBF24', bg: '#FBBF2415', icon: 'ellipse-outline' as const },
    missed: { color: '#EF4444', bg: '#EF444415', icon: 'close-circle' as const },
  };

  const config = statusConfig[entry.status];

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: config.bg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${config.color}30`,
      marginBottom: 8,
    }}>
      <Ionicons name={config.icon} size={20} color={config.color} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '500' }}>
          {entry.questName}
        </Text>
        <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
          {entry.date}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
          +{entry.xpEarned} XP
        </Text>
        <Text style={{ color: '#64748B', fontSize: 10, textTransform: 'capitalize' }}>
          {entry.questType}
        </Text>
      </View>
    </View>
  );
}

export default function QuestHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [filter, setFilter] = useState<QuestFilter>('all');

  const { history, stats, isLoading, refetch } = useQuestHistory({ dateRange, filter });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <>
      <Stack.Screen options={{ title: 'QUEST HISTORY' }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
          }
        >
          {/* Header */}
          <SystemWindow variant="default" style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              TRACK YOUR PROGRESS
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 14, marginTop: 4 }}>
              Review your quest completion history
            </Text>
          </SystemWindow>

          {/* Date Range Filter */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              DATE RANGE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {DATE_RANGES.map((range) => (
                <FilterChip
                  key={range.value}
                  label={range.label}
                  isActive={dateRange === range.value}
                  onPress={() => setDateRange(range.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              STATUS
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUEST_FILTERS.map((f) => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  isActive={filter === f.value}
                  onPress={() => setFilter(f.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <StatCard label="Total" value={stats.totalQuests} />
            <StatCard
              label="Completed"
              value={stats.completed}
              percentage={stats.completionRate}
              color="#4ADE80"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <StatCard label="Partial" value={stats.partial} color="#FBBF24" />
            <StatCard label="Missed" value={stats.missed} color="#EF4444" />
          </View>

          {/* Completion Trend */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              COMPLETION TREND
            </Text>
            <CompletionChart data={stats.dailyRates} />
          </View>

          {/* Quest Log */}
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              QUEST LOG
            </Text>
            {isLoading && !refreshing ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: '#64748B' }}>Loading history...</Text>
              </View>
            ) : history.length > 0 ? (
              history.map((entry) => (
                <QuestHistoryItem key={entry.id} entry={entry} />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="document-text-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#64748B', fontSize: 14 }}>
                  No quest history for selected filters
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
