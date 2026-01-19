/**
 * TimezoneSelector - Timezone selection component
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Common timezones
const COMMON_TIMEZONES = [
  { id: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { id: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { id: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { id: 'America/Phoenix', label: 'Arizona (no DST)', offset: 'UTC-7' },
  { id: 'America/Anchorage', label: 'Alaska Time', offset: 'UTC-9' },
  { id: 'Pacific/Honolulu', label: 'Hawaii Time', offset: 'UTC-10' },
  { id: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { id: 'Europe/Paris', label: 'Central European', offset: 'UTC+1' },
  { id: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1' },
  { id: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  { id: 'Asia/Shanghai', label: 'China Standard', offset: 'UTC+8' },
  { id: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8' },
  { id: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+4' },
  { id: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+11' },
  { id: 'Australia/Melbourne', label: 'Melbourne', offset: 'UTC+11' },
]

interface TimezoneSelectorProps {
  timezone: string
  onSelect: (timezone: string) => void
}

export function TimezoneSelector({ timezone, onSelect }: TimezoneSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const currentTz = COMMON_TIMEZONES.find((tz) => tz.id === timezone)
  const displayLabel = currentTz?.label || timezone

  const filteredTimezones = COMMON_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (tz: string) => {
    onSelect(tz)
    setModalVisible(false)
    setSearchQuery('')
  }

  return (
    <>
      <Pressable style={styles.selector} onPress={() => setModalVisible(true)}>
        <View style={styles.selectorContent}>
          <Ionicons name="globe-outline" size={18} color="#00FF00" />
          <View style={styles.selectorText}>
            <Text style={styles.selectorLabel}>Timezone</Text>
            <Text style={styles.selectorValue}>{displayLabel}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888888" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.modalTitle}>Select Timezone</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search timezones..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Timezone List */}
          <FlatList
            data={filteredTimezones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.timezoneItem,
                  item.id === timezone && styles.timezoneItemActive,
                ]}
                onPress={() => handleSelect(item.id)}
              >
                <View style={styles.timezoneInfo}>
                  <Text style={styles.timezoneLabel}>{item.label}</Text>
                  <Text style={styles.timezoneOffset}>{item.offset}</Text>
                </View>
                {item.id === timezone && (
                  <Ionicons name="checkmark-circle" size={20} color="#00FF00" />
                )}
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorText: {
    gap: 2,
  },
  selectorLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  selectorValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  timezoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  timezoneItemActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  timezoneInfo: {
    flex: 1,
  },
  timezoneLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  timezoneOffset: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
})
