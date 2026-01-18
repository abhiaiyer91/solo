import { View, Text, ScrollView } from 'react-native';
import { SystemWindow } from '@/components/SystemWindow';
import { usePlayer } from '@/hooks/usePlayer';

interface StatDisplayProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

function StatDisplay({ label, value, maxValue = 100, color }: StatDisplayProps) {
  const percentage = (value / maxValue) * 100;
  
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: '#64748B', fontSize: 12, letterSpacing: 1 }}>
          {label}
        </Text>
        <Text style={{ color, fontSize: 16, fontWeight: '700' }}>
          {value}
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

export default function StatsScreen() {
  const { player } = usePlayer();
  
  const stats = player?.stats || {
    strength: 10,
    agility: 10,
    vitality: 10,
    discipline: 10,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Player Summary */}
      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 2 }}>
            HUNTER RANK
          </Text>
          <Text style={{ color: '#60A5FA', fontSize: 48, fontWeight: '700', marginTop: 4 }}>
            {player?.rank || 'E'}
          </Text>
          <Text style={{ color: '#E2E8F0', fontSize: 18, marginTop: 8 }}>
            Level {player?.level || 1}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
            Total XP: {player?.totalXP?.toLocaleString() || 0}
          </Text>
        </View>
      </SystemWindow>

      {/* Stats Header */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          ATTRIBUTES
        </Text>
        <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
          Your current capabilities
        </Text>
      </View>

      {/* Stats Panel */}
      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <StatDisplay 
          label="STRENGTH" 
          value={stats.strength} 
          color="#EF4444" // red
        />
        <StatDisplay 
          label="AGILITY" 
          value={stats.agility} 
          color="#22C55E" // green
        />
        <StatDisplay 
          label="VITALITY" 
          value={stats.vitality} 
          color="#3B82F6" // blue
        />
        <StatDisplay 
          label="DISCIPLINE" 
          value={stats.discipline} 
          color="#A855F7" // purple
        />
      </SystemWindow>

      {/* Streak Info */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', letterSpacing: 1 }}>
          STREAK
        </Text>
      </View>

      <SystemWindow 
        variant={player?.currentStreak && player.currentStreak > 0 ? 'success' : 'warning'} 
        style={{ marginBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              CURRENT STREAK
            </Text>
            <Text style={{ color: '#E2E8F0', fontSize: 24, fontWeight: '700', marginTop: 4 }}>
              {player?.currentStreak || 0} days
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
              BEST STREAK
            </Text>
            <Text style={{ color: '#FBBF24', fontSize: 20, fontWeight: '700', marginTop: 4 }}>
              {player?.longestStreak || 0} days
            </Text>
          </View>
        </View>
      </SystemWindow>
    </ScrollView>
  );
}
