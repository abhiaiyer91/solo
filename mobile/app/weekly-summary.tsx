/**
 * Weekly Summary Screen
 *
 * Shows weekly history and detailed weekly summaries.
 */

import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { WeeklySummaryCard, WeeklySummaryModal } from '@/components/WeeklySummaryModal';
import {
  useWeeklyHistory,
  useWeeklySummary,
  type WeeklySummary,
} from '@/hooks/useWeeklySummary';

export default function WeeklySummaryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<WeeklySummary | null>(null);

  const { data: history, isLoading, refetch } = useWeeklyHistory(8);
  const { data: lastWeek } = useWeeklySummary(1);

  const summaries = history?.summaries ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCardPress = (summary: WeeklySummary) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSummary(summary);
  };

  // Calculate overall stats
  const totalXP = summaries.reduce((sum, s) => sum + s.xpEarned, 0);
  const avgCompletion = summaries.length > 0
    ? Math.round(summaries.reduce((sum, s) => sum + s.coreCompletionRate, 0) / summaries.length)
    : 0;
  const totalPerfectDays = summaries.reduce((sum, s) => sum + s.perfectDays, 0);

  return (
    <>
      <Stack.Screen options={{ title: 'WEEKLY HISTORY' }} />
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
              PERFORMANCE HISTORY
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 14, marginTop: 4 }}>
              Track your weekly progress over time
            </Text>
          </SystemWindow>

          {/* Overview Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={{
              flex: 1,
              backgroundColor: '#0F172A',
              borderRadius: 8,
              padding: 14,
              borderWidth: 1,
              borderColor: '#1E293B',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#FBBF24', fontSize: 22, fontWeight: '700' }}>
                {totalXP.toLocaleString()}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Total XP</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#0F172A',
              borderRadius: 8,
              padding: 14,
              borderWidth: 1,
              borderColor: '#1E293B',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#60A5FA', fontSize: 22, fontWeight: '700' }}>
                {avgCompletion}%
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Avg Completion</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#0F172A',
              borderRadius: 8,
              padding: 14,
              borderWidth: 1,
              borderColor: '#1E293B',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#4ADE80', fontSize: 22, fontWeight: '700' }}>
                {totalPerfectDays}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Perfect Days</Text>
            </View>
          </View>

          {/* Last Week Highlight */}
          {lastWeek && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
                LAST WEEK
              </Text>
              <Pressable
                onPress={() => handleCardPress(lastWeek)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <SystemWindow variant="success" style={{ padding: 0 }}>
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <Ionicons name="star" size={16} color="#4ADE80" />
                      <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                        {lastWeek.coreCompletionRate >= 80
                          ? 'Strong Week!'
                          : lastWeek.coreCompletionRate >= 50
                          ? 'Solid Progress'
                          : 'Room to Grow'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ color: '#64748B', fontSize: 10 }}>Completion</Text>
                        <Text style={{ color: '#4ADE80', fontSize: 20, fontWeight: '700' }}>
                          {lastWeek.coreCompletionRate}%
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: '#64748B', fontSize: 10 }}>XP Earned</Text>
                        <Text style={{ color: '#FBBF24', fontSize: 20, fontWeight: '700' }}>
                          +{lastWeek.xpEarned}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: '#64748B', fontSize: 10 }}>Perfect Days</Text>
                        <Text style={{ color: '#60A5FA', fontSize: 20, fontWeight: '700' }}>
                          {lastWeek.perfectDays}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: '#0F172A',
                    padding: 10,
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderTopColor: '#1E293B',
                  }}>
                    <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '500' }}>
                      Tap to view details
                    </Text>
                  </View>
                </SystemWindow>
              </Pressable>
            </View>
          )}

          {/* Weekly History */}
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
              PREVIOUS WEEKS
            </Text>
            {isLoading && !refreshing ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: '#64748B' }}>Loading history...</Text>
              </View>
            ) : summaries.length > 0 ? (
              summaries.map((summary, i) => (
                <WeeklySummaryCard
                  key={`${summary.weekStart}-${i}`}
                  summary={summary}
                  onPress={() => handleCardPress(summary)}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="calendar-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#64748B', fontSize: 14 }}>
                  No weekly history yet
                </Text>
                <Text style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                  Complete a week to see your summary here
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Detail Modal */}
        {selectedSummary && (
          <WeeklySummaryModal
            visible={!!selectedSummary}
            summary={selectedSummary}
            onDismiss={() => setSelectedSummary(null)}
          />
        )}
      </View>
    </>
  );
}
