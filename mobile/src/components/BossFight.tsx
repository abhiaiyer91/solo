/**
 * Mobile Boss Fight UI Components
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native'

const { width } = Dimensions.get('window')

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface BossData {
  id: string
  name: string
  phase: number
  totalPhases: number
  daysCompleted: number
  daysRequired: number
  narrative: {
    intro: string
    phaseIntro: string
    encouragement: string
  }
  status: 'available' | 'active' | 'defeated' | 'locked'
  unlockLevel: number
  xpReward: number
  titleReward: string
}

interface BossFightProps {
  boss: BossData
  onStart: () => void
  onAbandon: () => void
}

// ═══════════════════════════════════════════════════════════
// BOSS CARD (for listing)
// ═══════════════════════════════════════════════════════════

export function BossCard({
  boss,
  onPress,
}: {
  boss: BossData
  onPress: () => void
}) {
  const statusColors = {
    available: '#22c55e',
    active: '#f59e0b',
    defeated: '#8b5cf6',
    locked: '#6b7280',
  }

  const statusText = {
    available: 'AVAILABLE',
    active: 'IN PROGRESS',
    defeated: 'DEFEATED',
    locked: `LOCKED (LVL ${boss.unlockLevel})`,
  }

  return (
    <TouchableOpacity
      style={[
        styles.bossCard,
        boss.status === 'locked' && styles.bossCardLocked,
        boss.status === 'active' && styles.bossCardActive,
        boss.status === 'defeated' && styles.bossCardDefeated,
      ]}
      onPress={onPress}
      disabled={boss.status === 'locked'}
    >
      <View style={styles.bossCardHeader}>
        <Text style={styles.bossCardName}>{boss.name}</Text>
        <Text style={[styles.bossCardStatus, { color: statusColors[boss.status] }]}>
          {statusText[boss.status]}
        </Text>
      </View>

      {boss.status === 'active' && (
        <View style={styles.bossProgress}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(boss.daysCompleted / boss.daysRequired) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.bossProgressText}>
            Phase {boss.phase}/{boss.totalPhases} • Day {boss.daysCompleted}/{boss.daysRequired}
          </Text>
        </View>
      )}

      {boss.status === 'defeated' && (
        <Text style={styles.bossRewardText}>
          ✓ {boss.titleReward} earned
        </Text>
      )}

      <Text style={styles.bossReward}>
        Reward: {boss.xpReward} XP • "{boss.titleReward}" title
      </Text>
    </TouchableOpacity>
  )
}

// ═══════════════════════════════════════════════════════════
// BOSS ENCOUNTER (full screen)
// ═══════════════════════════════════════════════════════════

export function BossEncounter({ boss, onStart, onAbandon }: BossFightProps) {
  const [showNarrative, setShowNarrative] = useState(true)
  const [fadeAnim] = useState(new Animated.Value(0))
  const [pulseAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [fadeAnim, pulseAnim])

  return (
    <Animated.View style={[styles.encounterContainer, { opacity: fadeAnim }]}>
      {/* Boss name header */}
      <Animated.View
        style={[styles.encounterHeader, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.encounterTitle}>{boss.name}</Text>
        <View style={styles.encounterDivider} />
      </Animated.View>

      {/* Narrative or Phase info */}
      <ScrollView style={styles.encounterContent}>
        {showNarrative ? (
          <View style={styles.narrativeContainer}>
            <Text style={styles.narrativeText}>
              {boss.status === 'active' ? boss.narrative.phaseIntro : boss.narrative.intro}
            </Text>
          </View>
        ) : (
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
            <Text style={styles.phaseNumber}>
              {boss.phase} of {boss.totalPhases}
            </Text>
            <View style={styles.phaseProgress}>
              <View
                style={[
                  styles.phaseProgressFill,
                  { width: `${(boss.daysCompleted / boss.daysRequired) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.phaseDays}>
              Day {boss.daysCompleted} of {boss.daysRequired}
            </Text>
          </View>
        )}

        {boss.status === 'active' && (
          <Text style={styles.encouragementText}>
            {boss.narrative.encouragement}
          </Text>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.encounterActions}>
        {boss.status === 'available' && (
          <TouchableOpacity style={styles.startBattleButton} onPress={onStart}>
            <Text style={styles.startBattleText}>BEGIN BATTLE</Text>
          </TouchableOpacity>
        )}

        {boss.status === 'active' && (
          <>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowNarrative(!showNarrative)}
            >
              <Text style={styles.toggleButtonText}>
                {showNarrative ? 'View Progress' : 'View Narrative'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.abandonButton}
              onPress={onAbandon}
            >
              <Text style={styles.abandonButtonText}>Abandon Battle</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════
// BOSS VICTORY SCREEN
// ═══════════════════════════════════════════════════════════

export function BossVictory({
  boss,
  onContinue,
}: {
  boss: BossData
  onContinue: () => void
}) {
  const [scaleAnim] = useState(new Animated.Value(0))
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [scaleAnim, fadeAnim])

  return (
    <View style={styles.victoryContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={styles.victoryIcon}>⚔️</Text>
        <Text style={styles.victoryTitle}>{boss.name}</Text>
        <Text style={styles.victorySubtitle}>DEFEATED</Text>
      </Animated.View>

      <Animated.View style={[styles.victoryRewards, { opacity: fadeAnim }]}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardLabel}>XP EARNED</Text>
          <Text style={styles.rewardValue}>+{boss.xpReward}</Text>
        </View>

        <View style={styles.rewardDivider} />

        <View style={styles.rewardItem}>
          <Text style={styles.rewardLabel}>TITLE EARNED</Text>
          <Text style={styles.rewardValue}>{boss.titleReward}</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.victoryMessage}>
          The pattern that once controlled you{'\n'}
          has been named and overcome.
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// BOSS LIST
// ═══════════════════════════════════════════════════════════

export function BossList({
  bosses,
  onBossPress,
}: {
  bosses: BossData[]
  onBossPress: (boss: BossData) => void
}) {
  const activeBoss = bosses.find((b) => b.status === 'active')
  const defeatedBosses = bosses.filter((b) => b.status === 'defeated')
  const availableBosses = bosses.filter((b) => b.status === 'available')
  const lockedBosses = bosses.filter((b) => b.status === 'locked')

  return (
    <ScrollView style={styles.bossListContainer}>
      <Text style={styles.bossListTitle}>BOSS FIGHTS</Text>
      <Text style={styles.bossListSubtitle}>
        Face the patterns that hold you back
      </Text>

      {activeBoss && (
        <View style={styles.bossSection}>
          <Text style={styles.bossSectionTitle}>ACTIVE BATTLE</Text>
          <BossCard boss={activeBoss} onPress={() => onBossPress(activeBoss)} />
        </View>
      )}

      {availableBosses.length > 0 && (
        <View style={styles.bossSection}>
          <Text style={styles.bossSectionTitle}>AVAILABLE</Text>
          {availableBosses.map((boss) => (
            <BossCard key={boss.id} boss={boss} onPress={() => onBossPress(boss)} />
          ))}
        </View>
      )}

      {defeatedBosses.length > 0 && (
        <View style={styles.bossSection}>
          <Text style={styles.bossSectionTitle}>DEFEATED</Text>
          {defeatedBosses.map((boss) => (
            <BossCard key={boss.id} boss={boss} onPress={() => onBossPress(boss)} />
          ))}
        </View>
      )}

      {lockedBosses.length > 0 && (
        <View style={styles.bossSection}>
          <Text style={styles.bossSectionTitle}>LOCKED</Text>
          {lockedBosses.map((boss) => (
            <BossCard key={boss.id} boss={boss} onPress={() => onBossPress(boss)} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  bossCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bossCardLocked: {
    opacity: 0.5,
  },
  bossCardActive: {
    borderColor: '#f59e0b',
  },
  bossCardDefeated: {
    borderColor: '#8b5cf6',
  },
  bossCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bossCardName: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bossCardStatus: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bossProgress: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  bossProgressText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#9ca3af',
  },
  bossReward: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#6b7280',
  },
  bossRewardText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 8,
  },
  encounterContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 24,
  },
  encounterHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  encounterTitle: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    letterSpacing: 2,
  },
  encounterDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#dc2626',
    marginTop: 16,
  },
  encounterContent: {
    flex: 1,
  },
  narrativeContainer: {
    paddingVertical: 24,
  },
  narrativeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 24,
    textAlign: 'center',
  },
  phaseInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  phaseLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  phaseNumber: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  phaseProgress: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  phaseDays: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
  },
  encouragementText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
  },
  encounterActions: {
    paddingVertical: 24,
  },
  startBattleButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBattleText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.5)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
  },
  abandonButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  abandonButtonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6b7280',
  },
  victoryContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  victoryIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  victoryTitle: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  victorySubtitle: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#22c55e',
    letterSpacing: 4,
    marginTop: 8,
    textAlign: 'center',
  },
  victoryRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 24,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  rewardValue: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    marginHorizontal: 24,
  },
  victoryMessage: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    borderWidth: 1,
    borderColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  continueButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#8b5cf6',
  },
  bossListContainer: {
    flex: 1,
    padding: 16,
  },
  bossListTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  bossListSubtitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 24,
  },
  bossSection: {
    marginBottom: 24,
  },
  bossSectionTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
  },
})

export default {
  BossCard,
  BossEncounter,
  BossVictory,
  BossList,
}
