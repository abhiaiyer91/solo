import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';
import { SystemWindow } from '@/components/SystemWindow';
import { usePlayer } from '@/hooks/usePlayer';
import { useQuests } from '@/hooks/useQuests';

export default function QuestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { player, refetch: refetchPlayer } = usePlayer();
  const { quests, refetch: refetchQuests } = useQuests();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPlayer(), refetchQuests()]);
    setRefreshing(false);
  }, [refetchPlayer, refetchQuests]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#60A5FA"
        />
      }
    >
      {/* Player Status */}
      <SystemWindow variant="default" style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              HUNTER
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 18, fontWeight: '700' }}>
              {player?.name || 'Loading...'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              LEVEL
            </Text>
            <Text style={{ color: '#60A5FA', fontSize: 24, fontWeight: '700' }}>
              {player?.level || 1}
            </Text>
          </View>
        </View>
        
        {/* XP Progress Bar */}
        <View style={{ marginTop: 12 }}>
          <View style={{ 
            height: 6, 
            backgroundColor: '#1E293B', 
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#60A5FA',
              width: `${player?.xpProgress || 0}%`,
              borderRadius: 3,
            }} />
          </View>
          <Text style={{ color: '#64748B', fontSize: 10, marginTop: 4, textAlign: 'right' }}>
            {player?.currentXP || 0} / {player?.xpToNextLevel || 100} XP
          </Text>
        </View>
      </SystemWindow>

      {/* Quest Header */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          DAILY QUESTS
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          Complete all quests to maintain your streak
        </Text>
      </View>

      {/* Quest List */}
      {quests?.dailyQuests?.map((quest) => (
        <SystemWindow
          key={quest.id}
          variant={quest.completed ? 'success' : 'default'}
          style={{ marginBottom: 12 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                color: quest.completed ? '#4ADE80' : '#E2E8F0', 
                fontSize: 14, 
                fontWeight: '600',
                textDecorationLine: quest.completed ? 'line-through' : 'none',
              }}>
                {quest.title}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                {quest.progress || 0} / {quest.target} {quest.unit}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '600' }}>
                +{quest.xpReward} XP
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={{ marginTop: 8 }}>
            <View style={{ 
              height: 4, 
              backgroundColor: '#1E293B', 
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <View style={{ 
                height: '100%', 
                backgroundColor: quest.completed ? '#4ADE80' : '#60A5FA',
                width: `${Math.min(100, ((quest.progress || 0) / quest.target) * 100)}%`,
                borderRadius: 2,
              }} />
            </View>
          </View>
        </SystemWindow>
      ))}

      {/* No Quests State */}
      {(!quests?.dailyQuests || quests.dailyQuests.length === 0) && (
        <SystemWindow variant="warning" style={{ marginTop: 20 }}>
          <Text style={{ color: '#FBBF24', textAlign: 'center', fontSize: 14 }}>
            No quests available. Check back tomorrow.
          </Text>
        </SystemWindow>
      )}
    </ScrollView>
  );
}
