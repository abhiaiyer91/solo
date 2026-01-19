/**
 * NotificationPrefs - Notification preference toggles
 */

import React from 'react'
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native'

interface NotificationPrefsProps {
  preferences: {
    morningReminder: boolean
    morningTime: string
    eveningCheck: boolean
    eveningTime: string
    questCompletions: boolean
    levelUps: boolean
    streakReminders: boolean
    systemMessages: boolean
  }
  onUpdate: (updates: Partial<NotificationPrefsProps['preferences']>) => void
  onEditTime?: (field: 'morningTime' | 'eveningTime') => void
  isLoading?: boolean
}

export function NotificationPrefs({
  preferences,
  onUpdate,
  onEditTime,
  isLoading,
}: NotificationPrefsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'>'} NOTIFICATIONS</Text>

      {/* Morning Reminder */}
      <ToggleRow
        label="Morning Reminder"
        sublabel={preferences.morningReminder ? formatTime(preferences.morningTime) : undefined}
        value={preferences.morningReminder}
        onValueChange={(val) => onUpdate({ morningReminder: val })}
        onSublabelPress={() => onEditTime?.('morningTime')}
        disabled={isLoading}
      />

      {/* Evening Check-in */}
      <ToggleRow
        label="Evening Check-in"
        sublabel={preferences.eveningCheck ? formatTime(preferences.eveningTime) : undefined}
        value={preferences.eveningCheck}
        onValueChange={(val) => onUpdate({ eveningCheck: val })}
        onSublabelPress={() => onEditTime?.('eveningTime')}
        disabled={isLoading}
      />

      <View style={styles.divider} />

      {/* Quest Completions */}
      <ToggleRow
        label="Quest Completions"
        sublabel="Celebrate your wins"
        value={preferences.questCompletions}
        onValueChange={(val) => onUpdate({ questCompletions: val })}
        disabled={isLoading}
      />

      {/* Level Ups */}
      <ToggleRow
        label="Level Ups"
        sublabel="New level achievements"
        value={preferences.levelUps}
        onValueChange={(val) => onUpdate({ levelUps: val })}
        disabled={isLoading}
      />

      {/* Streak Reminders */}
      <ToggleRow
        label="Streak Reminders"
        sublabel="Don't break the chain"
        value={preferences.streakReminders}
        onValueChange={(val) => onUpdate({ streakReminders: val })}
        disabled={isLoading}
      />

      {/* System Messages */}
      <ToggleRow
        label="System Messages"
        sublabel="The System speaks"
        value={preferences.systemMessages}
        onValueChange={(val) => onUpdate({ systemMessages: val })}
        disabled={isLoading}
      />
    </View>
  )
}

function ToggleRow({
  label,
  sublabel,
  value,
  onValueChange,
  onSublabelPress,
  disabled,
}: {
  label: string
  sublabel?: string
  value: boolean
  onValueChange: (val: boolean) => void
  onSublabelPress?: () => void
  disabled?: boolean
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && (
          <Pressable onPress={onSublabelPress} disabled={!onSublabelPress}>
            <Text style={[
              styles.sublabel,
              onSublabelPress && styles.sublabelPressable,
            ]}>
              {sublabel}
            </Text>
          </Pressable>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#333', true: 'rgba(0, 255, 0, 0.4)' }}
        thumbColor={value ? '#00FF00' : '#666'}
        ios_backgroundColor="#333"
      />
    </View>
  )
}

function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours! >= 12 ? 'PM' : 'AM'
  const hour12 = hours! % 12 || 12
  return `${hour12}:${minutes!.toString().padStart(2, '0')} ${period}`
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  sublabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  sublabelPressable: {
    color: '#00BFFF',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
})
