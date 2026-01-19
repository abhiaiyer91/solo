import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SystemWindow } from '@/components/SystemWindow';
import { useGuild } from '@/hooks/useGuild';
import { useLeaderboard } from '@/hooks/useLeaderboard';

type TabType = 'leaderboard' | 'guild';

interface LeaderboardItemProps {
  rank: number;
  player: {
    id: string;
    name: string;
    level: number;
    xp: number;
    streak?: number;
  };
  isCurrentUser?: boolean;
}

function LeaderboardItem({ rank, player, isCurrentUser }: LeaderboardItemProps) {
  const getRankStyle = () => {
    if (rank === 1) return { bg: '#FBBF2420', border: '#FBBF24', text: '#FBBF24' };
    if (rank === 2) return { bg: '#94A3B820', border: '#94A3B8', text: '#94A3B8' };
    if (rank === 3) return { bg: '#CD7F3220', border: '#CD7F32', text: '#CD7F32' };
    return { bg: '#1E293B', border: '#1E293B', text: '#64748B' };
  };

  const style = getRankStyle();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: isCurrentUser ? '#60A5FA10' : 'transparent',
      borderLeftWidth: isCurrentUser ? 3 : 0,
      borderLeftColor: '#60A5FA',
    }}>
      {/* Rank */}
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: style.bg,
        borderWidth: 1,
        borderColor: style.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: style.text, fontSize: 14, fontWeight: '700' }}>
          {rank}
        </Text>
      </View>

      {/* Player Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          color: isCurrentUser ? '#60A5FA' : '#E2E8F0',
          fontSize: 14,
          fontWeight: isCurrentUser ? '700' : '500'
        }}>
          {player.name}
          {isCurrentUser && ' (You)'}
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12 }}>
          Level {player.level}
        </Text>
      </View>

      {/* Stats */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#FBBF24', fontSize: 14, fontWeight: '600' }}>
          {player.xp.toLocaleString()} XP
        </Text>
        {player.streak && player.streak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame" size={12} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 11, marginLeft: 2 }}>
              {player.streak}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function GuildSection() {
  const router = useRouter();
  const { guild, isLoading, isInGuild } = useGuild();

  if (isLoading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: '#64748B' }}>Loading guild info...</Text>
      </View>
    );
  }

  if (!isInGuild) {
    return (
      <View style={{ paddingVertical: 20 }}>
        <SystemWindow variant="default">
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="people-outline" size={48} color="#64748B" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              No Guild Yet
            </Text>
            <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
              Join or create a guild to compete with others
            </Text>
            <Link href="/guild-browser" asChild>
              <Pressable style={({ pressed }) => ({
                backgroundColor: pressed ? '#60A5FA' : '#60A5FACC',
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 8,
              })}>
                <Text style={{ color: '#FFF', fontWeight: '600' }}>
                  Browse Guilds
                </Text>
              </Pressable>
            </Link>
          </View>
        </SystemWindow>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 20 }}>
      <SystemWindow variant="default">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              YOUR GUILD
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 18, fontWeight: '700' }}>
              {guild?.name || 'Unknown'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#FBBF24', fontSize: 20, fontWeight: '700' }}>
              #{guild?.rank || '?'}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 10 }}>RANK</Text>
          </View>
        </View>

        {/* Guild Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E293B' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#E2E8F0', fontSize: 18, fontWeight: '600' }}>
              {guild?.memberCount || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Members</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#60A5FA', fontSize: 18, fontWeight: '600' }}>
              {guild?.weeklyXP?.toLocaleString() || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Weekly XP</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#4ADE80', fontSize: 18, fontWeight: '600' }}>
              {guild?.challengesWon || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Wins</Text>
          </View>
        </View>
      </SystemWindow>

      <Pressable 
        onPress={() => router.push('/guild-browser')}
        style={({ pressed }) => ({
          marginTop: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: pressed ? '#60A5FA' : '#1E293B',
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Text style={{ color: '#60A5FA', fontWeight: '500' }}>
          View Guild Details
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#60A5FA" style={{ marginLeft: 4 }} />
      </Pressable>
    </View>
  );
}

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [refreshing, setRefreshing] = useState(false);
  const { leaderboard, currentUserRank, isLoading, refetch } = useLeaderboard();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      {/* Tab Selector */}
      <View style={{
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 8,
        gap: 8,
      }}>
        {(['leaderboard', 'guild'] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === tab
                ? '#60A5FA20'
                : pressed ? '#1E293B' : 'transparent',
              borderWidth: 1,
              borderColor: activeTab === tab ? '#60A5FA' : '#1E293B',
              alignItems: 'center',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={tab === 'leaderboard' ? 'trophy-outline' : 'people-outline'}
                size={16}
                color={activeTab === tab ? '#60A5FA' : '#64748B'}
              />
              <Text style={{
                color: activeTab === tab ? '#60A5FA' : '#64748B',
                fontSize: 13,
                fontWeight: '600',
                marginLeft: 6,
                textTransform: 'uppercase',
              }}>
                {tab}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
        }
      >
        {activeTab === 'leaderboard' ? (
          <>
            {/* Current User Rank */}
            {currentUserRank && (
              <SystemWindow variant="default" style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
                      YOUR RANK
                    </Text>
                    <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: '700' }}>
                      #{currentUserRank}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
                      THIS WEEK
                    </Text>
                    <Text style={{ color: '#E2E8F0', fontSize: 14 }}>
                      Top {Math.round((currentUserRank / (leaderboard?.length || 1)) * 100)}%
                    </Text>
                  </View>
                </View>
              </SystemWindow>
            )}

            {/* Leaderboard */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
                WEEKLY LEADERBOARD
              </Text>
            </View>

            {isLoading && !refreshing ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: '#64748B' }}>Loading leaderboard...</Text>
              </View>
            ) : (
              <SystemWindow variant="default" style={{ padding: 0, overflow: 'hidden' }}>
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <View
                      key={entry.player.id}
                      style={{
                        borderBottomWidth: index < leaderboard.length - 1 ? 1 : 0,
                        borderBottomColor: '#1E293B',
                      }}
                    >
                      <LeaderboardItem
                        rank={entry.rank}
                        player={entry.player}
                        isCurrentUser={entry.isCurrentUser}
                      />
                    </View>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Ionicons name="trophy-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#64748B', fontSize: 14 }}>
                      No leaderboard data yet
                    </Text>
                  </View>
                )}
              </SystemWindow>
            )}
          </>
        ) : (
          <GuildSection />
        )}
      </ScrollView>
    </View>
  );
}
