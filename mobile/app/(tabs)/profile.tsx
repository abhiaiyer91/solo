import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SystemWindow } from '@/components/SystemWindow';
import { useAuthStore } from '@/stores/auth';
import { usePlayer } from '@/hooks/usePlayer';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, danger }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
      })}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={danger ? '#EF4444' : '#64748B'} 
        style={{ marginRight: 12 }}
      />
      <Text style={{ 
        flex: 1, 
        color: danger ? '#EF4444' : '#E2E8F0', 
        fontSize: 15 
      }}>
        {label}
      </Text>
      {value && (
        <Text style={{ color: '#64748B', fontSize: 14, marginRight: 8 }}>
          {value}
        </Text>
      )}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color="#64748B" />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { player } = usePlayer();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Profile Header */}
      <SystemWindow variant="default" style={{ marginBottom: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: '#1E293B',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ color: '#60A5FA', fontSize: 32, fontWeight: '700' }}>
              {player?.name?.charAt(0)?.toUpperCase() || 'H'}
            </Text>
          </View>
          <Text style={{ color: '#E2E8F0', fontSize: 20, fontWeight: '700' }}>
            {player?.name || 'Hunter'}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
            {player?.email || ''}
          </Text>
          {player?.activeTitle && (
            <View style={{ 
              marginTop: 8, 
              paddingHorizontal: 12, 
              paddingVertical: 4, 
              backgroundColor: '#FBBF24/20',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#FBBF24',
            }}>
              <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '600' }}>
                {player.activeTitle}
              </Text>
            </View>
          )}
        </View>
      </SystemWindow>

      {/* Account Settings */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          ACCOUNT
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => {}}
        />
        <SettingsRow
          icon="notifications-outline"
          label="Notifications"
          value="On"
          onPress={() => {}}
        />
        <SettingsRow
          icon="time-outline"
          label="Timezone"
          value={player?.timezone || 'Auto'}
          onPress={() => {}}
        />
      </SystemWindow>

      {/* Preferences */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          PREFERENCES
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="fitness-outline"
          label="Health Data"
          value="Connected"
          onPress={() => {}}
        />
        <SettingsRow
          icon="shield-outline"
          label="Privacy"
          onPress={() => {}}
        />
        <SettingsRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => {}}
        />
      </SystemWindow>

      {/* Danger Zone */}
      <SystemWindow variant="default" style={{ marginBottom: 40, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="log-out-outline"
          label="Log Out"
          onPress={handleLogout}
          danger
        />
      </SystemWindow>

      {/* Version */}
      <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
        Journey v1.0.0
      </Text>
    </ScrollView>
  );
}
