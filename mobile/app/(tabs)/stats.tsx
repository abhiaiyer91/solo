import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { StatsRadar, StatsData } from '@/components/StatsRadar';
import { usePlayer } from '@/hooks/usePlayer';
import { useWeeklySummary, formatWeekRange } from '@/hooks/useWeeklySummary';

interface StatDisplayProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  description?: string;
}

function StatDisplay({ label, value, maxValue = 100, color, description }: StatDisplayProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#64748B', fontSize: 12, letterSpacing: 1 }}>
            {label}
          </Text>
          {description && (
            <Text style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>
              {description}
            </Text>
          )}
        </View>
        <Text style={{ color, fontSize: 20, fontWeight: '700' }}>
          {Math.round(value)}
        </Text>
      </View>
      <View style={{
        height: 8,
        backgroundColor: '#1E293B',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <View style={{
          height: '100%',
          backgroundColor: color,
          width: `${percentage}%`,
          borderRadius: 4,
        }} />
      </View>
    </View>
  );
}

const RANK_COLORS: Record<string, string> = {
  'E': '#64748B',
  'D': '#22C55E',
  'C': '#60A5FA',
  'B': '#A855F7',
  'A': '#FBBF24',
  'S': '#EF4444',
};

export default function StatsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { player, refetch, isLoading } = usePlayer();
  const { data: lastWeekSummary } = useWeeklySummary(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const stats = player?.stats || {
    strength: 10,
    agility: 10,
    vitality: 10,
    discipline: 10,
  };

  // Convert to StatsRadar format
  const radarStats: StatsData = {
    STR: stats.strength,
    AGI: stats.agility,
    VIT: stats.vitality,
    DISC: stats.discipline,
  };

  const rankColor = RANK_COLORS[player?.rank || 'E'] || '#64748B';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
      }
    >
      {/* Player Summary */}
      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 2 }}>
              HUNTER RANK
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
              <Text style={{ color: rankColor, fontSize: 48, fontWeight: '700' }}>
                {player?.rank || 'E'}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 14, marginLeft: 8 }}>
                Level {player?.level || 1}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              TOTAL XP
            </Text>
            <Text style={{ color: '#FBBF24', fontSize: 20, fontWeight: '700', marginTop: 4 }}>
              {(player?.totalXP || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* XP Progress to next level */}
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E293B' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Progress to Level {(player?.level || 1) + 1}</Text>
            <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '600' }}>
              {player?.currentXP || 0} / {player?.xpToNextLevel || 100} XP
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#1E293B', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{
              height: '100%',
              backgroundColor: '#60A5FA',
              width: `${player?.xpProgress || 0}%`,
              borderRadius: 4,
            }} />
          </View>
        </View>
      </SystemWindow>

      {/* Stats Radar */}
      <View style={{ marginBottom: 20 }}>
        <StatsRadar
          stats={radarStats}
          isLoading={isLoading}
          maxValue={100}
          showLabels={true}
          showValues={true}
        />
      </View>

      {/* Detailed Stats */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          ATTRIBUTE DETAILS
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          Your current capabilities
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <StatDisplay
          label="STRENGTH"
          value={stats.strength}
          color="#EF4444"
          description="Power from workout completion"
        />
        <StatDisplay
          label="AGILITY"
          value={stats.agility}
          color="#22C55E"
          description="Speed from steps and cardio"
        />
        <StatDisplay
          label="VITALITY"
          value={stats.vitality}
          color="#3B82F6"
          description="Health from nutrition and sleep"
        />
        <StatDisplay
          label="DISCIPLINE"
          value={stats.discipline}
          color="#A855F7"
          description="Consistency from daily completion"
        />
      </SystemWindow>

      {/* Streak Info */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          STREAK STATISTICS
        </Text>
      </View>

      <SystemWindow
        variant={player?.currentStreak && player.currentStreak > 0 ? 'success' : 'default'}
        style={{ marginBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons
              name="flame"
              size={24}
              color={player?.currentStreak && player.currentStreak > 0 ? '#EF4444' : '#64748B'}
            />
            <Text style={{
              color: player?.currentStreak && player.currentStreak > 0 ? '#EF4444' : '#64748B',
              fontSize: 28,
              fontWeight: '700',
              marginTop: 4
            }}>
              {player?.currentStreak || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
              CURRENT
            </Text>
          </View>

          <View style={{ width: 1, backgroundColor: '#1E293B' }} />

          <View style={{ alignItems: 'center' }}>
            <Ionicons name="trophy-outline" size={24} color="#FBBF24" />
            <Text style={{ color: '#FBBF24', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
              {player?.longestStreak || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
              BEST
            </Text>
          </View>

          <View style={{ width: 1, backgroundColor: '#1E293B' }} />

          <View style={{ alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color="#60A5FA" />
            <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
              {player?.perfectDays || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
              PERFECT
            </Text>
          </View>
        </View>

        {/* Streak Bonus */}
        {player?.currentStreak && player.currentStreak > 0 && (
          <View style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#1E293B',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#64748B', fontSize: 11 }}>STREAK BONUS ACTIVE</Text>
            <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: '600', marginTop: 4 }}>
              +{Math.min(player.currentStreak * 5, 25)}% XP on all quests
            </Text>
          </View>
        )}
      </SystemWindow>

      {/* Weekly Summary Link */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          WEEKLY PROGRESS
        </Text>
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/weekly-summary');
        }}
      >
        <SystemWindow variant="default" style={{ marginBottom: 20 }}>
          {lastWeekSummary ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>LAST WEEK</Text>
                  <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                    {formatWeekRange(lastWeekSummary.weekStart, lastWeekSummary.weekEnd)}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: lastWeekSummary.coreCompletionRate >= 80 ? '#4ADE8020' : '#60A5FA20',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}>
                  <Text style={{
                    color: lastWeekSummary.coreCompletionRate >= 80 ? '#4ADE80' : '#60A5FA',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                    {lastWeekSummary.coreCompletionRate}%
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#60A5FA', fontSize: 18, fontWeight: '700' }}>
                    {lastWeekSummary.daysCompleted}/7
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>days</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FBBF24', fontSize: 18, fontWeight: '700' }}>
                    +{lastWeekSummary.xpEarned}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>XP</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4ADE80', fontSize: 18, fontWeight: '700' }}>
                    {lastWeekSummary.perfectDays}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>perfect</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: '#64748B', fontSize: 13 }}>
                Complete a week to see your summary
              </Text>
            </View>
          )}
          <View style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#1E293B',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '500' }}>
              View Weekly History
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#60A5FA" style={{ marginLeft: 4 }} />
          </View>
        </SystemWindow>
      </Pressable>

      {/* Quick Links */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/quest-history');
          }}
          style={{ flex: 1 }}
        >
          <SystemWindow variant="default">
            <View style={{ alignItems: 'center', padding: 8 }}>
              <Ionicons name="time-outline" size={24} color="#4ADE80" />
              <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '500', marginTop: 6 }}>
                Quest History
              </Text>
            </View>
          </SystemWindow>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/titles');
          }}
          style={{ flex: 1 }}
        >
          <SystemWindow variant="default">
            <View style={{ alignItems: 'center', padding: 8 }}>
              <Ionicons name="ribbon-outline" size={24} color="#FBBF24" />
              <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '500', marginTop: 6 }}>
                Titles
              </Text>
            </View>
          </SystemWindow>
        </Pressable>
      </View>
    </ScrollView>
  );
}
