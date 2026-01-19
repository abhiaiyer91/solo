/**
 * GuildDetail - Guild information screen
 */

import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGuild } from '../hooks/useGuild'
import { GuildMemberList } from '../components/GuildMemberList'

interface GuildDetailProps {
  guildId: string
  onClose?: () => void
  onJoin?: () => void
  onLeave?: () => void
  currentUserId?: string
  playerLevel?: number
  isCurrentGuild?: boolean
}

export function GuildDetail({ guildId, onClose, onJoin, onLeave, currentUserId, playerLevel = 1, isCurrentGuild = false }: GuildDetailProps) {
  const { guildDetails, isLoadingDetails, fetchGuildDetails, joinGuild, leaveGuild } = useGuild()
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    fetchGuildDetails(guildId)
  }, [guildId, fetchGuildDetails])

  const handleJoin = async () => {
    Alert.alert('Join Guild', `Join ${guildDetails?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join',
        onPress: async () => {
          setIsJoining(true)
          const result = await joinGuild(guildId)
          setIsJoining(false)
          if (result.success) {
            Alert.alert('Success', 'You have joined the guild!')
            onJoin?.()
          } else {
            Alert.alert('Error', result.error || 'Failed to join guild')
          }
        },
      },
    ])
  }

  const handleLeave = async () => {
    Alert.alert('Leave Guild', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setIsLeaving(true)
          const result = await leaveGuild()
          setIsLeaving(false)
          if (result.success) {
            Alert.alert('Success', 'You have left the guild')
            onLeave?.()
          } else {
            Alert.alert('Error', result.error || 'Failed to leave guild')
          }
        },
      },
    ])
  }

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toString()
  }

  if (isLoadingDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading guild...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!guildDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Guild not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const meetsLevel = playerLevel >= guildDetails.minLevel
  const hasSpace = guildDetails.memberCount < guildDetails.maxMembers
  const canJoin = !isCurrentGuild && meetsLevel && hasSpace

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.name} numberOfLines={1}>{guildDetails.name}</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          )}
        </View>
        {guildDetails.description && <Text style={styles.description}>{guildDetails.description}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{guildDetails.memberCount}/{guildDetails.maxMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.xpValue]}>{formatXP(guildDetails.weeklyXP)}</Text>
          <Text style={styles.statLabel}>Weekly XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.xpValue]}>{formatXP(guildDetails.totalXP)}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        <GuildMemberList members={guildDetails.members} leaderId={guildDetails.leaderId} currentUserId={currentUserId} />
      </ScrollView>

      <View style={styles.footer}>
        {isCurrentGuild ? (
          <Pressable style={[styles.button, styles.leaveButton]} onPress={handleLeave} disabled={isLeaving}>
            {isLeaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.leaveButtonText}>Leave Guild</Text>}
          </Pressable>
        ) : (
          <Pressable style={[styles.button, styles.joinButton, !canJoin && styles.buttonDisabled]} onPress={handleJoin} disabled={!canJoin || isJoining}>
            {isJoining ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>
                {!meetsLevel ? `Requires Level ${guildDetails.minLevel}` : !hasSpace ? 'Guild Full' : 'Join Guild'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', flex: 1 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2a2a4e', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#ffffff', lineHeight: 24 },
  description: { fontSize: 16, color: '#9ca3af', lineHeight: 22 },
  statsContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  xpValue: { color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase' },
  content: { flex: 1 },
  contentPadding: { padding: 16 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#2a2a4e' },
  button: { paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  joinButton: { backgroundColor: '#3b82f6' },
  joinButtonText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  leaveButton: { backgroundColor: '#2a2a4e' },
  leaveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
  buttonDisabled: { opacity: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9ca3af' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorIcon: { fontSize: 64, marginBottom: 16 },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#9ca3af' },
})
