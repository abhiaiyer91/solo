import { View, Text, ScrollView, RefreshControl, Pressable, TextInput } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { useGuild, Guild } from '@/hooks/useGuild';

interface GuildCardProps {
  guild: Guild;
  onJoin: (guildId: string) => void;
  isJoining: boolean;
}

function GuildCard({ guild, onJoin, isJoining }: GuildCardProps) {
  return (
    <SystemWindow variant="default" style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600' }}>
            {guild.name}
          </Text>
          {guild.description && (
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }} numberOfLines={2}>
              {guild.description}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="people-outline" size={14} color="#64748B" />
            <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 4 }}>
              {guild.memberCount}/{guild.maxMembers}
            </Text>
            {guild.minLevel > 1 && (
              <>
                <Text style={{ color: '#475569', marginHorizontal: 8 }}>•</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>
                  Min Level {guild.minLevel}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#FBBF24', fontSize: 14, fontWeight: '600' }}>
            {guild.weeklyXP.toLocaleString()} XP
          </Text>
          <Text style={{ color: '#64748B', fontSize: 10 }}>this week</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onJoin(guild.id);
            }}
            disabled={isJoining || guild.memberCount >= guild.maxMembers}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#60A5FA' : '#60A5FACC',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              marginTop: 8,
              opacity: guild.memberCount >= guild.maxMembers ? 0.5 : 1,
            })}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
              {guild.memberCount >= guild.maxMembers ? 'FULL' : 'JOIN'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SystemWindow>
  );
}

export default function GuildBrowserScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);
  const { publicGuilds, isLoadingPublic, fetchPublicGuilds, joinGuild, isInGuild } = useGuild();

  useEffect(() => {
    fetchPublicGuilds();
  }, [fetchPublicGuilds]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPublicGuilds();
    setRefreshing(false);
  }, [fetchPublicGuilds]);

  const handleJoinGuild = async (guildId: string) => {
    setJoiningGuildId(guildId);
    const result = await joinGuild(guildId);
    setJoiningGuildId(null);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const filteredGuilds = publicGuilds.filter(guild =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guild.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInGuild) {
    return (
      <>
        <Stack.Screen options={{ title: 'Browse Guilds' }} />
        <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="checkmark-circle" size={48} color="#4ADE80" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#E2E8F0', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Already in a Guild
          </Text>
          <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center' }}>
            You must leave your current guild before joining a new one.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Browse Guilds' }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        {/* Search */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1E293B',
            borderRadius: 8,
            paddingHorizontal: 12,
          }}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search guilds..."
              placeholderTextColor="#64748B"
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                color: '#E2E8F0',
                fontSize: 14,
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
          }
        >
          {isLoadingPublic && !refreshing ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#64748B' }}>Loading guilds...</Text>
            </View>
          ) : filteredGuilds.length > 0 ? (
            filteredGuilds.map(guild => (
              <GuildCard
                key={guild.id}
                guild={guild}
                onJoin={handleJoinGuild}
                isJoining={joiningGuildId === guild.id}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="search-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#64748B', fontSize: 14 }}>
                {searchQuery ? 'No guilds match your search' : 'No public guilds available'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
