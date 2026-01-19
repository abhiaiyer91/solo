/**
 * ReconciliationBanner - Banner shown when reconciliation is available
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { formatTimeToMidnight } from '../hooks/useReconciliation';

interface ReconciliationBannerProps {
  pendingCount: number;
  minutesToMidnight: number;
  phase: 'evening' | 'night';
}

/**
 * Banner that prompts user to complete reconciliation
 */
export function ReconciliationBanner({
  pendingCount,
  minutesToMidnight,
  phase,
}: ReconciliationBannerProps) {
  const isUrgent = minutesToMidnight < 60;
  const backgroundColor = isUrgent ? '#EF444420' : '#A855F720';
  const borderColor = isUrgent ? '#EF4444' : '#A855F7';
  const iconColor = isUrgent ? '#EF4444' : '#A855F7';

  return (
    <Link href="/reconciliation" asChild>
      <Pressable style={[styles.container, { backgroundColor, borderColor }]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isUrgent ? 'warning' : 'moon'}
            size={24}
            color={iconColor}
          />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: borderColor }]}>
            {phase === 'night' ? 'LATE NIGHT MODE' : 'EVENING RECONCILIATION'}
          </Text>
          <Text style={styles.subtitle}>
            {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending
            {' \u2022 '}
            {formatTimeToMidnight(minutesToMidnight)} until midnight
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </Pressable>
    </Link>
  );
}

/**
 * Compact version for bottom of screen
 */
export function ReconciliationBannerCompact({
  pendingCount,
  minutesToMidnight,
}: Omit<ReconciliationBannerProps, 'phase'>) {
  const isUrgent = minutesToMidnight < 60;

  return (
    <Link href="/reconciliation" asChild>
      <Pressable
        style={[
          styles.compactContainer,
          isUrgent && styles.compactContainerUrgent,
        ]}
      >
        <Ionicons
          name={isUrgent ? 'time' : 'moon-outline'}
          size={16}
          color={isUrgent ? '#EF4444' : '#A855F7'}
        />
        <Text
          style={[
            styles.compactText,
            { color: isUrgent ? '#EF4444' : '#A855F7' },
          ]}
        >
          {pendingCount} pending \u2022 {formatTimeToMidnight(minutesToMidnight)}
        </Text>
      </Pressable>
    </Link>
  );
}

/**
 * Day closed banner
 */
export function DayClosedBanner() {
  return (
    <View style={styles.closedContainer}>
      <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
      <View style={styles.closedContent}>
        <Text style={styles.closedTitle}>DAY COMPLETE</Text>
        <Text style={styles.closedSubtitle}>
          The System has recorded today's progress
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 20,
  },
  compactContainerUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  closedContent: {
    marginLeft: 12,
  },
  closedTitle: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  closedSubtitle: {
    color: '#64748B',
    fontSize: 12,
  },
});

export default ReconciliationBanner;
