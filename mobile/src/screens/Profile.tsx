/**
 * Profile Screen - User profile and settings
 * Shows account info, settings, and app preferences
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  Switch,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ProfileHeader } from '@/components/ProfileHeader'
import { SystemWindow } from '@/components/SystemWindow'
import { NotificationPrefs } from '@/components/NotificationPrefs'
import { QuietHours } from '@/components/QuietHours'
import { TimezoneSelector } from '@/components/TimezoneSelector'
import { HardModeToggle } from '@/components/HardModeToggle'
import { DataExport } from '@/components/DataExport'
import { usePlayer } from '@/hooks/usePlayer'
import { useSettings } from '@/hooks/useSettings'
import { useAuth } from '@/stores/auth'

export default function ProfileScreen() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  
  const { data: player, isLoading: playerLoading, refetch: refetchPlayer } = usePlayer()
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings()
  const { logout } = useAuth()

  const isLoading = playerLoading || settingsLoading

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetchPlayer()
    setRefreshing(false)
  }, [refetchPlayer])

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/')
          },
        },
      ]
    )
  }

  const handlePrivacyToggle = (key: keyof typeof settings.privacy, value: boolean) => {
    updateSettings({
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    })
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00FF00" />
        </Pressable>
        <Text style={styles.headerTitle}>{'>'} PROFILE</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF00"
          />
        }
      >
        {/* Profile Header */}
        {player && (
          <View style={styles.profileSection}>
            <ProfileHeader
              name={player.name}
              level={player.level}
              totalXP={player.totalXP}
              currentStreak={player.currentStreak}
            />
          </View>
        )}

        {/* Account Info */}
        <SystemWindow title="ACCOUNT" style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{player?.email ?? '...'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>Jan 2026</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quests Completed</Text>
            <Text style={styles.infoValue}>{player?.questsCompleted ?? 0}</Text>
          </View>
        </SystemWindow>

        {/* Display Settings */}
        <SystemWindow title="DISPLAY" style={styles.section}>
          <TimezoneSelector
            timezone={settings.display.timezone}
            onSelect={(tz) =>
              updateSettings({
                display: { ...settings.display, timezone: tz },
              })
            }
          />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>24-Hour Time</Text>
              <Text style={styles.settingDescription}>Use 24-hour clock format</Text>
            </View>
            <Switch
              value={settings.display.use24HourTime}
              onValueChange={(value) =>
                updateSettings({
                  display: { ...settings.display, use24HourTime: value },
                })
              }
              trackColor={{ false: '#444', true: '#00FF00' }}
              thumbColor="#fff"
            />
          </View>
        </SystemWindow>

        {/* Notifications */}
        <SystemWindow title="NOTIFICATIONS" style={styles.section}>
          <NotificationPrefs />
          <View style={styles.divider} />
          <QuietHours />
        </SystemWindow>

        {/* Hard Mode */}
        <HardModeToggle />

        {/* Privacy */}
        <SystemWindow title="PRIVACY" style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show on Leaderboard</Text>
              <Text style={styles.settingDescription}>Appear in public rankings</Text>
            </View>
            <Switch
              value={settings.privacy.showOnLeaderboard}
              onValueChange={(v) => handlePrivacyToggle('showOnLeaderboard', v)}
              trackColor={{ false: '#444', true: '#00FF00' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Share Progress</Text>
              <Text style={styles.settingDescription}>Allow others to see your stats</Text>
            </View>
            <Switch
              value={settings.privacy.shareProgress}
              onValueChange={(v) => handlePrivacyToggle('shareProgress', v)}
              trackColor={{ false: '#444', true: '#00FF00' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Accountability Requests</Text>
              <Text style={styles.settingDescription}>Receive partner invites</Text>
            </View>
            <Switch
              value={settings.privacy.allowAccountabilityRequests}
              onValueChange={(v) => handlePrivacyToggle('allowAccountabilityRequests', v)}
              trackColor={{ false: '#444', true: '#00FF00' }}
              thumbColor="#fff"
            />
          </View>
        </SystemWindow>

        {/* Data & Export */}
        <SystemWindow title="DATA" style={styles.section}>
          <DataExport />
          <Pressable
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://journey.app/privacy')}
          >
            <Ionicons name="document-text-outline" size={18} color="#60A5FA" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </Pressable>
          <Pressable
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://journey.app/terms')}
          >
            <Ionicons name="document-outline" size={18} color="#60A5FA" />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </Pressable>
        </SystemWindow>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.versionText}>Journey v1.0.0</Text>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#60A5FA',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#444444',
    marginTop: 24,
  },
  bottomSpacer: {
    height: 100,
  },
})
