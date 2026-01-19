import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SystemWindow } from '@/components/SystemWindow';
import { useDungeons } from '@/hooks/useDungeons';

const RANK_COLORS: Record<string, string> = {
  'E': '#64748B',
  'D': '#22C55E',
  'C': '#60A5FA',
  'B': '#A855F7',
  'A': '#FBBF24',
  'S': '#EF4444',
};

interface DungeonCardProps {
  dungeon: {
    id: string;
    name: string;
    description?: string;
    rank: string;
    timeLimit: number;
    xpReward: number;
    requirements?: { level?: number };
    isActive?: boolean;
  };
  onStart?: (id: string) => void;
  disabled?: boolean;
}

function DungeonCard({ dungeon, onStart, disabled }: DungeonCardProps) {
  const rankColor = RANK_COLORS[dungeon.rank] || '#64748B';

  const handleStart = () => {
    Alert.alert(
      'Enter Dungeon',
      `Start ${dungeon.name}? You have ${dungeon.timeLimit} minutes to complete it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter',
          onPress: () => onStart?.(dungeon.id),
        },
      ]
    );
  };

  return (
    <SystemWindow variant="default" style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Rank Badge */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: `${rankColor}20`,
          borderWidth: 1,
          borderColor: rankColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ color: rankColor, fontSize: 18, fontWeight: '700' }}>
            {dungeon.rank}
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600' }}>
            {dungeon.name}
          </Text>
          {dungeon.description && (
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }} numberOfLines={2}>
              {dungeon.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 4 }}>
                {dungeon.timeLimit}min
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star-outline" size={14} color="#FBBF24" />
              <Text style={{ color: '#FBBF24', fontSize: 12, marginLeft: 4 }}>
                +{dungeon.xpReward} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        {!disabled && !dungeon.isActive && (
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#A855F7' : '#A855F7CC',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            })}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
              ENTER
            </Text>
          </Pressable>
        )}
      </View>
    </SystemWindow>
  );
}

interface ActiveDungeonProps {
  dungeon: {
    id: string;
    name: string;
    rank: string;
    progress: number;
    timeRemaining: number;
    questsCompleted: number;
    totalQuests: number;
  };
  onAbandon?: () => void;
}

function ActiveDungeonCard({ dungeon, onAbandon }: ActiveDungeonProps) {
  const rankColor = RANK_COLORS[dungeon.rank] || '#64748B';
  const minutes = Math.floor(dungeon.timeRemaining / 60);
  const seconds = dungeon.timeRemaining % 60;

  const handleAbandon = () => {
    Alert.alert(
      'Abandon Dungeon',
      'Are you sure? Progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: onAbandon },
      ]
    );
  };

  return (
    <SystemWindow variant="warning" style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: `${rankColor}20`,
            borderWidth: 1,
            borderColor: rankColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
            <Text style={{ color: rankColor, fontSize: 14, fontWeight: '700' }}>
              {dungeon.rank}
            </Text>
          </View>
          <View>
            <Text style={{ color: '#64748B', fontSize: 10, letterSpacing: 1 }}>
              ACTIVE DUNGEON
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600' }}>
              {dungeon.name}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#64748B', fontSize: 10 }}>TIME LEFT</Text>
          <Text style={{
            color: dungeon.timeRemaining < 300 ? '#EF4444' : '#FBBF24',
            fontSize: 20,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#64748B', fontSize: 12 }}>
            Progress: {dungeon.questsCompleted}/{dungeon.totalQuests} quests
          </Text>
          <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '600' }}>
            {Math.round(dungeon.progress)}%
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#1E293B', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{
            height: '100%',
            backgroundColor: '#FBBF24',
            width: `${dungeon.progress}%`,
            borderRadius: 4,
          }} />
        </View>
      </View>

      <Pressable
        onPress={handleAbandon}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#EF444420' : 'transparent',
          borderWidth: 1,
          borderColor: '#EF444480',
          paddingVertical: 8,
          borderRadius: 6,
          alignItems: 'center',
        })}
      >
        <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '500' }}>
          ABANDON DUNGEON
        </Text>
      </Pressable>
    </SystemWindow>
  );
}

export default function DungeonsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    dungeons,
    activeDungeon,
    completedDungeons,
    totalCleared,
    isLoading,
    refetch,
    startDungeon,
    abandonDungeon,
  } = useDungeons();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="skull-outline" size={32} color="#A855F7" style={{ marginBottom: 8 }} />
        <Text style={{ color: '#64748B', fontSize: 14 }}>Loading dungeons...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />
      }
    >
      {/* Header Stats */}
      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              DUNGEON BROWSER
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 14, marginTop: 2 }}>
              Time-limited challenges
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#A855F7', fontSize: 24, fontWeight: '700' }}>
              {totalCleared || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 10 }}>CLEARED</Text>
          </View>
        </View>
      </SystemWindow>

      {/* Active Dungeon */}
      {activeDungeon && (
        <ActiveDungeonCard
          dungeon={activeDungeon}
          onAbandon={() => abandonDungeon(activeDungeon.id)}
        />
      )}

      {/* Available Dungeons */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          AVAILABLE
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          Select a dungeon to begin
        </Text>
      </View>

      {dungeons && dungeons.length > 0 ? (
        dungeons.map((dungeon) => (
          <DungeonCard
            key={dungeon.id}
            dungeon={dungeon}
            onStart={startDungeon}
            disabled={!!activeDungeon}
          />
        ))
      ) : (
        <SystemWindow variant="default" style={{ marginBottom: 20 }}>
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="lock-closed-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center' }}>
              No dungeons available at your level
            </Text>
          </View>
        </SystemWindow>
      )}

      {/* Completed History */}
      {completedDungeons && completedDungeons.length > 0 && (
        <>
          <View style={{ marginTop: 8, marginBottom: 12 }}>
            <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
              HISTORY
            </Text>
          </View>

          <SystemWindow variant="default" style={{ padding: 0, overflow: 'hidden' }}>
            {completedDungeons.slice(0, 5).map((completed, index) => (
              <View
                key={completed.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderBottomWidth: index < completedDungeons.length - 1 ? 1 : 0,
                  borderBottomColor: '#1E293B',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    color: RANK_COLORS[completed.rank] || '#64748B',
                    fontSize: 14,
                    fontWeight: '700',
                    width: 24,
                  }}>
                    {completed.rank}
                  </Text>
                  <Text style={{ color: '#E2E8F0', fontSize: 14 }}>
                    {completed.dungeonName}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#4ADE80', fontSize: 12, fontWeight: '600' }}>
                    +{completed.xpEarned} XP
                  </Text>
                </View>
              </View>
            ))}
          </SystemWindow>
        </>
      )}
    </ScrollView>
  );
}
