/**
 * HealthPermissionCard - Card showing requested health permissions
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface PermissionItem {
  icon: string
  title: string
  description: string
  granted?: boolean
}

const PERMISSIONS: PermissionItem[] = [
  {
    icon: '👟',
    title: 'Steps',
    description: 'Track your daily movement quest',
  },
  {
    icon: '💪',
    title: 'Workouts',
    description: 'Detect strength training sessions',
  },
  {
    icon: '🏃',
    title: 'Exercise Minutes',
    description: 'Monitor your active time',
  },
  {
    icon: '😴',
    title: 'Sleep',
    description: 'Track recovery and discipline',
  },
  {
    icon: '🔥',
    title: 'Calories Burned',
    description: 'Calculate activity intensity',
  },
]

interface HealthPermissionCardProps {
  showGrantedStatus?: boolean
  grantedPermissions?: string[]
}

export function HealthPermissionCard({
  showGrantedStatus = false,
  grantedPermissions = [],
}: HealthPermissionCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>❤️</Text>
        <Text style={styles.headerTitle}>HEALTH DATA ACCESS</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        The System requires access to your health data to track your progress automatically.
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Permission List */}
      <View style={styles.permissionList}>
        {PERMISSIONS.map((permission, index) => (
          <PermissionRow
            key={index}
            permission={permission}
            isGranted={
              showGrantedStatus &&
              grantedPermissions.includes(permission.title.toLowerCase())
            }
          />
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Privacy Note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          Your data stays on your device.
        </Text>
        <Text style={styles.privacyText}>
          We only sync daily totals to calculate quests.
        </Text>
      </View>
    </View>
  )
}

function PermissionRow({
  permission,
  isGranted,
}: {
  permission: PermissionItem
  isGranted?: boolean
}) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionIcon}>
        <Text style={styles.checkmark}>
          {isGranted ? '✓' : permission.icon}
        </Text>
      </View>
      <View style={styles.permissionContent}>
        <Text style={[styles.permissionTitle, isGranted && styles.grantedText]}>
          {permission.title}
        </Text>
        <Text style={styles.permissionDescription}>
          {permission.description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  permissionList: {
    gap: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  permissionIcon: {
    width: 24,
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#00FF00',
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  grantedText: {
    color: '#00FF00',
  },
  permissionDescription: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  privacyNote: {
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    textAlign: 'center',
  },
})
