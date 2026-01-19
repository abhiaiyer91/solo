/**
 * GuildMemberList - Member list with roles
 */

import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import type { GuildMember } from '../hooks/useGuild'

interface GuildMemberListProps {
  members: GuildMember[]
  leaderId: string
  currentUserId?: string
}

export function GuildMemberList({ members, leaderId, currentUserId }: GuildMemberListProps) {
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { LEADER: 0, OFFICER: 1, MEMBER: 2 }
    return roleOrder[a.role] - roleOrder[b.role] || b.weeklyContribution - a.weeklyContribution
  })

  const formatXP = (xp: number): string => {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toString()
  }

  const renderMember = ({ item }: { item: GuildMember }) => {
    const isLeader = item.role === 'LEADER'
    const isOfficer = item.role === 'OFFICER'
    const isCurrentUser = item.id === currentUserId

    return (
      <View style={[styles.memberCard, isCurrentUser && styles.memberCardHighlight]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.memberDetails}>
          <View style={styles.nameRow}>
            <Text style={[styles.memberName, isCurrentUser && styles.memberNameHighlight]} numberOfLines={1}>
              {item.name || 'Hunter'}
            </Text>
            {isLeader && (
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderText}>LEADER</Text>
              </View>
            )}
            {isOfficer && (
              <View style={styles.officerBadge}>
                <Text style={styles.officerText}>OFFICER</Text>
              </View>
            )}
          </View>
          <View style={styles.memberStats}>
            <Text style={styles.memberLevel}>Lv {item.level}</Text>
            <Text style={styles.memberDivider}>•</Text>
            <Text style={styles.memberXP}>{formatXP(item.weeklyContribution)} XP this week</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members ({members.length})</Text>
      <FlatList
        data={sortedMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    padding: 12,
    marginBottom: 8,
  },
  memberCardHighlight: { borderColor: '#3b82f6', backgroundColor: '#1a1a3e' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  memberDetails: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  memberNameHighlight: { color: '#3b82f6' },
  leaderBadge: { backgroundColor: '#fbbf2420', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#fbbf24' },
  leaderText: { fontSize: 10, fontWeight: 'bold', color: '#fbbf24' },
  officerBadge: { backgroundColor: '#8b5cf620', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#8b5cf6' },
  officerText: { fontSize: 10, fontWeight: 'bold', color: '#8b5cf6' },
  memberStats: { flexDirection: 'row', alignItems: 'center' },
  memberLevel: { fontSize: 12, color: '#9ca3af' },
  memberDivider: { fontSize: 12, color: '#6b7280', marginHorizontal: 6 },
  memberXP: { fontSize: 12, color: '#3b82f6' },
})
