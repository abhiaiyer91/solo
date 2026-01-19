import { View, Text, ScrollView, Pressable, Alert, Switch, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { useAuthStore } from '@/stores/auth';
import { usePlayer } from '@/hooks/usePlayer';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
  toggle,
  toggleValue,
  onToggle,
  disabled
}: SettingsRowProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || toggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed && !toggle ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        opacity: disabled ? 0.5 : 1,
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
      {value && !toggle && (
        <Text style={{ color: '#64748B', fontSize: 14, marginRight: 8 }}>
          {value}
        </Text>
      )}
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle?.(val);
          }}
          trackColor={{ false: '#1E293B', true: '#60A5FA40' }}
          thumbColor={toggleValue ? '#60A5FA' : '#64748B'}
        />
      ) : onPress && !disabled ? (
        <Ionicons name="chevron-forward" size={18} color="#64748B" />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { player, refetch } = usePlayer();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hardModeEnabled, setHardModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will generate a JSON file with all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {} },
      ]
    );
  };

  const handleHardMode = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        'Enable Hard Mode',
        'Hard Mode increases difficulty but gives bonus XP. Are you ready for the challenge?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setHardModeEnabled(true)
          },
        ]
      );
    } else {
      setHardModeEnabled(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
      }
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
            borderWidth: 2,
            borderColor: '#60A5FA',
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
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
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

        {/* Quick Stats */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#60A5FA', fontSize: 20, fontWeight: '700' }}>
              {player?.level || 1}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Level</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FBBF24', fontSize: 20, fontWeight: '700' }}>
              {(player?.totalXP || 0).toLocaleString()}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Total XP</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: '700' }}>
              {player?.currentStreak || 0}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>Streak</Text>
          </View>
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
          onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon.')}
        />
        <SettingsRow
          icon="ribbon-outline"
          label="Titles"
          value={`${player?.titlesCount || 0} earned`}
          onPress={() => router.push('/titles')}
        />
        <SettingsRow
          icon="time-outline"
          label="Timezone"
          value={player?.timezone || 'Auto'}
          onPress={() => Alert.alert('Timezone', 'Timezone is auto-detected from your device.')}
        />
      </SystemWindow>

      {/* Game Settings */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          GAME
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="flame-outline"
          label="Hard Mode"
          toggle
          toggleValue={hardModeEnabled}
          onToggle={handleHardMode}
        />
        <SettingsRow
          icon="volume-high-outline"
          label="Sound Effects"
          toggle
          toggleValue={soundEnabled}
          onToggle={setSoundEnabled}
        />
      </SystemWindow>

      {/* Notifications */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          NOTIFICATIONS
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="notifications-outline"
          label="Push Notifications"
          toggle
          toggleValue={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />
        <SettingsRow
          icon="moon-outline"
          label="Quiet Hours"
          value="10pm - 7am"
          onPress={() => Alert.alert('Quiet Hours', 'Configure when to pause notifications.')}
        />
      </SystemWindow>

      {/* Health & Data */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          HEALTH & DATA
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="fitness-outline"
          label="Apple Health"
          value="Connected"
          onPress={() => Alert.alert('Apple Health', 'HealthKit is connected and syncing your health data.')}
        />
        <SettingsRow
          icon="download-outline"
          label="Export Data"
          onPress={handleExportData}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Privacy Settings"
          onPress={() => Alert.alert('Privacy', 'Manage your data and privacy settings.')}
        />
      </SystemWindow>

      {/* Support */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600', letterSpacing: 1 }}>
          SUPPORT
        </Text>
      </View>

      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="help-circle-outline"
          label="Help & FAQ"
          onPress={() => Alert.alert('Help', 'Visit our support website for help.')}
        />
        <SettingsRow
          icon="chatbubble-outline"
          label="Send Feedback"
          onPress={() => Alert.alert('Feedback', 'We appreciate your feedback!')}
        />
        <SettingsRow
          icon="document-text-outline"
          label="Terms & Privacy"
          onPress={() => Alert.alert('Legal', 'View our terms of service and privacy policy.')}
        />
      </SystemWindow>

      {/* Danger Zone */}
      <SystemWindow variant="default" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <SettingsRow
          icon="log-out-outline"
          label="Log Out"
          onPress={handleLogout}
          danger
        />
      </SystemWindow>

      {/* Version */}
      <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
        Journey v1.0.0 • Build 1
      </Text>
    </ScrollView>
  );
}
