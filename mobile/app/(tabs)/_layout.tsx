import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { usePlayer } from '@/hooks/usePlayer';
import { useQuests } from '@/hooks/useQuests';

/**
 * Custom tab icon with optional badge
 */
function TabIcon({
  name,
  color,
  size,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  badge?: number | boolean;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={name} size={size} color={color} />
      {badge && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}
        >
          {typeof badge === 'number' && (
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>
              {badge > 9 ? '9+' : badge}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function HeaderRight() {
  const { player } = usePlayer();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
      <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
        <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>
          LVL {player?.level || 1}
        </Text>
        <Text style={{ color: '#64748B', fontSize: 10 }}>
          {player?.currentXP || 0} XP
        </Text>
      </View>
      {player?.currentStreak && player.currentStreak > 0 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FBBF24/20',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 8,
        }}>
          <Ionicons name="flame" size={14} color="#FBBF24" />
          <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '600', marginLeft: 2 }}>
            {player.currentStreak}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { player, isLoading: isPlayerLoading } = usePlayer();
  const { dailyQuests, rotatingQuest } = useQuests();

  // Calculate pending quests count (not completed)
  const allQuests = [...dailyQuests, ...(rotatingQuest ? [rotatingQuest] : [])];
  const pendingQuestsCount = allQuests.filter(q => q.status !== 'COMPLETED').length;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Redirect to onboarding if not completed (check after player loads)
  if (!isPlayerLoading && player && !player.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#60A5FA', // system-blue
        tabBarInactiveTintColor: '#64748B', // system-text-muted
        tabBarStyle: {
          backgroundColor: '#0F0F14',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: '#0A0A0F',
          borderBottomColor: '#1E293B',
          borderBottomWidth: 1,
        },
        headerTintColor: '#E2E8F0',
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 1,
          fontSize: 16,
        },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'QUESTS',
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name="checkbox-outline"
              size={size}
              color={color}
              badge={pendingQuestsCount > 0 ? pendingQuestsCount : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dungeons"
        options={{
          title: 'DUNGEONS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="skull-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'STATS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'SOCIAL',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
