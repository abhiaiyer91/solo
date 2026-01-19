/**
 * DashboardHeader - Player info, level, XP bar, and streak display
 * Top section of the mobile dashboard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakBadge } from './StreakBadge';
import type { DayPhase } from '@/hooks/useDayStatus';

interface PlayerData {
  id: string;
  name: string;
  level: number;
  rank: string;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  xpProgress: number;
  currentStreak: number;
  longestStreak: number;
  activeTitle?: string;
  stats: {
    strength: number;
    agility: number;
    vitality: number;
    discipline: number;
  };
}

interface PhaseStyle {
  bgColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  icon: string;
  label: string;
}

interface DashboardHeaderProps {
  player: PlayerData | undefined;
  isLoading?: boolean;
  phase: DayPhase;
  phaseStyles: PhaseStyle;
  weekendBonusActive?: boolean;
  weekendBonusPercent?: number;
  onStreakPress?: () => void;
  onProfilePress?: () => void;
}

export function DashboardHeader({
  player,
  isLoading,
  phase,
  phaseStyles,
  weekendBonusActive,
  weekendBonusPercent,
  onStreakPress,
  onProfilePress,
}: DashboardHeaderProps) {
  if (isLoading || !player) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingState}>
          <View style={styles.loadingAvatar} />
          <View style={styles.loadingContent}>
            <View style={styles.loadingName} />
            <View style={styles.loadingLevel} />
          </View>
        </View>
      </View>
    );
  }

  const xpPercent = Math.min(100, player.xpProgress);

  return (
    <View style={[styles.container, { borderColor: phaseStyles.borderColor }]}>
      {/* Top Row: Player Info & Phase */}
      <View style={styles.topRow}>
        <Pressable onPress={onProfilePress} style={styles.playerInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {player.name?.charAt(0).toUpperCase() || 'H'}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: phaseStyles.accentColor }]}>
              <Text style={styles.levelBadgeText}>{player.level}</Text>
            </View>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.playerName}>{player.name || 'Hunter'}</Text>
            {player.activeTitle && (
              <Text style={[styles.playerTitle, { color: phaseStyles.accentColor }]}>
                {player.activeTitle}
              </Text>
            )}
            <Text style={[styles.playerRank, { color: phaseStyles.mutedColor }]}>
              {player.rank || 'E-Rank Hunter'}
            </Text>
          </View>
        </Pressable>

        {/* Phase Indicator */}
        <View style={[styles.phaseIndicator, { backgroundColor: phaseStyles.bgColor }]}>
          <Text style={styles.phaseIcon}>{phaseStyles.icon}</Text>
          <Text style={[styles.phaseLabel, { color: phaseStyles.accentColor }]}>
            {phaseStyles.label}
          </Text>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.xpContainer}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>LEVEL PROGRESS</Text>
          <Text style={styles.xpValue}>
            {player.currentXP.toLocaleString()} / {player.xpToNextLevel.toLocaleString()} XP
          </Text>
        </View>
        <View style={styles.xpBarBg}>
          <Animated.View
            style={[
              styles.xpBarFill,
              { width: `${xpPercent}%`, backgroundColor: phaseStyles.accentColor },
            ]}
          />
        </View>
      </View>

      {/* Stats & Streak Row */}
      <View style={styles.statsRow}>
        {/* Streak Badge */}
        <Pressable onPress={onStreakPress} style={styles.streakContainer}>
          <StreakBadge streak={player.currentStreak} size="medium" />
          {player.longestStreak > player.currentStreak && (
            <Text style={styles.longestStreak}>Best: {player.longestStreak}</Text>
          )}
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <StatMini label="STR" value={player.stats.strength} color="#EF4444" />
          <StatMini label="AGI" value={player.stats.agility} color="#22C55E" />
          <StatMini label="VIT" value={player.stats.vitality} color="#3B82F6" />
          <StatMini label="DISC" value={player.stats.discipline} color="#A855F7" />
        </View>
      </View>

      {/* Weekend Bonus Banner */}
      {weekendBonusActive && (
        <View style={styles.weekendBonus}>
          <Ionicons name="sparkles" size={14} color="#A855F7" />
          <Text style={styles.weekendBonusText}>
            WEEKEND BONUS ACTIVE: +{weekendBonusPercent || 20}% XP
          </Text>
        </View>
      )}
    </View>
  );
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statMini}>
      <Text style={[styles.statMiniValue, { color }]}>{Math.round(value)}</Text>
      <Text style={styles.statMiniLabel}>{label}</Text>
    </View>
  );
}

export function DashboardHeaderCompact({
  player,
  phase,
  phaseStyles,
}: Pick<DashboardHeaderProps, 'player' | 'phase' | 'phaseStyles'>) {
  if (!player) return null;

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactLeft}>
        <Text style={styles.compactName}>{player.name}</Text>
        <Text style={[styles.compactLevel, { color: phaseStyles.accentColor }]}>
          LVL {player.level}
        </Text>
      </View>
      <StreakBadge streak={player.currentStreak} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContent: {
    flex: 1,
    gap: 8,
  },
  loadingName: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingLevel: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0F',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  playerTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  playerRank: {
    fontSize: 11,
    marginTop: 2,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  phaseIcon: {
    fontSize: 12,
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  xpContainer: {
    marginBottom: 12,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  xpValue: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    alignItems: 'flex-start',
  },
  longestStreak: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statMini: {
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statMiniLabel: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  weekendBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  weekendBonusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A855F7',
    fontFamily: 'monospace',
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  compactLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
