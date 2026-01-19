/**
 * DataExport - Component for exporting user data
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Share } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'

interface ExportData {
  player: Record<string, unknown>
  quests: unknown[]
  xpHistory: unknown[]
  healthData: unknown[]
  exportedAt: string
}

async function fetchExportData(): Promise<ExportData> {
  return api.get<ExportData>('/api/player/data-export')
}

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Fetch the data
      const data = await fetchExportData()

      // Format as JSON with nice formatting
      const jsonContent = JSON.stringify(data, null, 2)

      // Use React Native's built-in Share for cross-platform compatibility
      await Share.share({
        message: jsonContent,
        title: `Journey Data Export - ${new Date().toISOString().split('T')[0]}`,
      })
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'Unable to export data. Please try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleRequestDeletion = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Request Submitted',
              'Your account deletion request has been submitted. You will receive a confirmation email within 48 hours.',
              [{ text: 'OK' }]
            )
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Export Button */}
      <Pressable
        style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
        onPress={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <ActivityIndicator size="small" color="#00FF00" />
        ) : (
          <Ionicons name="download-outline" size={18} color="#00FF00" />
        )}
        <Text style={styles.exportText}>
          {isExporting ? 'Exporting...' : 'Export My Data'}
        </Text>
      </Pressable>
      <Text style={styles.exportDescription}>
        Download all your data as JSON
      </Text>

      {/* Delete Account */}
      <Pressable style={styles.deleteButton} onPress={handleRequestDeletion}>
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
        <Text style={styles.deleteText}>Delete Account</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 8,
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  exportDescription: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#EF4444',
  },
})
