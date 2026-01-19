/**
 * QuietHours - Quiet hours configuration component
 */

import React, { useState } from 'react'
import { View, Text, Switch, Pressable, StyleSheet, Modal } from 'react-native'

interface QuietHoursProps {
  enabled: boolean
  startTime: string
  endTime: string
  onUpdate: (updates: { enabled?: boolean; startTime?: string; endTime?: string }) => void
  isLoading?: boolean
}

export function QuietHours({
  enabled,
  startTime,
  endTime,
  onUpdate,
  isLoading,
}: QuietHoursProps) {
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Quiet Hours</Text>
          <Text style={styles.subtitle}>
            Pause notifications during sleep
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={(val) => onUpdate({ enabled: val })}
          disabled={isLoading}
          trackColor={{ false: '#333', true: 'rgba(0, 255, 0, 0.4)' }}
          thumbColor={enabled ? '#00FF00' : '#666'}
          ios_backgroundColor="#333"
        />
      </View>

      {enabled && (
        <View style={styles.timeRow}>
          <TimeButton
            label="From"
            time={startTime}
            onPress={() => setShowTimePicker('start')}
          />
          <Text style={styles.timeSeparator}>→</Text>
          <TimeButton
            label="To"
            time={endTime}
            onPress={() => setShowTimePicker('end')}
          />
        </View>
      )}

      {/* Time Picker Modal (simplified) */}
      <TimePickerModal
        visible={showTimePicker !== null}
        currentTime={showTimePicker === 'start' ? startTime : endTime}
        onSelect={(time) => {
          if (showTimePicker === 'start') {
            onUpdate({ startTime: time })
          } else {
            onUpdate({ endTime: time })
          }
          setShowTimePicker(null)
        }}
        onCancel={() => setShowTimePicker(null)}
      />
    </View>
  )
}

function TimeButton({
  label,
  time,
  onPress,
}: {
  label: string
  time: string
  onPress: () => void
}) {
  return (
    <Pressable style={styles.timeButton} onPress={onPress}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{formatTime(time)}</Text>
    </Pressable>
  )
}

function TimePickerModal({
  visible,
  currentTime,
  onSelect,
  onCancel,
}: {
  visible: boolean
  currentTime: string
  onSelect: (time: string) => void
  onCancel: () => void
}) {
  const [selectedHour, setSelectedHour] = useState(() => {
    const [h] = currentTime.split(':')
    return parseInt(h!, 10)
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Time</Text>
          
          <View style={styles.hourGrid}>
            {hours.map((hour) => (
              <Pressable
                key={hour}
                style={[
                  styles.hourButton,
                  hour === selectedHour && styles.hourButtonSelected,
                ]}
                onPress={() => setSelectedHour(hour)}
              >
                <Text style={[
                  styles.hourText,
                  hour === selectedHour && styles.hourTextSelected,
                ]}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.confirmButton}
              onPress={() => onSelect(`${selectedHour.toString().padStart(2, '0')}:00`)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  hourButton: {
    width: 65,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    alignItems: 'center',
  },
  hourButtonSelected: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  hourText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  hourTextSelected: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666666',
  },
  confirmButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000000',
  },
})
