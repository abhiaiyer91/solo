/**
 * GuildBrowser - Browse and search guilds screen
 */

import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGuild } from '../hooks/useGuild'
import { GuildCard } from '../components/GuildCard'

interface GuildBrowserProps {
  onGuildSelect: (guildId: string) => void
  onClose?: () => void
  playerLevel?: number
}

export function GuildBrowser({ onGuildSelect, onClose, playerLevel = 1 }: GuildBrowserProps) {
  const { publicGuilds, isLoadingPublic, fetchPublicGuilds, joinGuild } = useGuild()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPublicGuilds()
  }, [fetchPublicGuilds])

  const filteredGuilds = publicGuilds.filter((guild) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return guild.name.toLowerCase().includes(query) || guild.description?.toLowerCase().includes(query)
  })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Guild Browser</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.subtitle}>Join forces with other hunters</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search guilds..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {isLoadingPublic ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading guilds...</Text>
          </View>
        ) : filteredGuilds.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏰</Text>
            <Text style={styles.emptyText}>{searchQuery ? 'No guilds found' : 'No public guilds available'}</Text>
          </View>
        ) : (
          filteredGuilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} onPress={() => onGuildSelect(guild.id)} canJoin playerLevel={playerLevel} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  header: { padding: 20, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2a2a4e', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#ffffff', lineHeight: 24 },
  searchContainer: { padding: 16 },
  searchInput: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2a2a4e', borderRadius: 8, padding: 12, fontSize: 16, color: '#ffffff' },
  list: { flex: 1 },
  listContent: { padding: 16 },
  loadingContainer: { alignItems: 'center', padding: 48 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9ca3af' },
  emptyState: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#9ca3af' },
})
