/**
 * Weekly Summary Modal
 * Displayed on Monday mornings summarizing the previous week
 */

import { View, Text, Modal, ScrollView, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from './SystemWindow';
import type { WeeklySummary } from '@/hooks/useWeeklySummary';
import { formatWeekRange } from '@/hooks/useWeeklySummary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WeeklySummaryModalProps {
  visible: boolean;
  summary: WeeklySummary;
  onDismiss: () => void;
}

interface StatBoxProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  color: string;
}

function StatBox({ label, value, unit, trend, color }: StatBoxProps) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#0F172A',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#1E293B',
    }}>
      <Text style={{ color: '#64748B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
        <Text style={{ color, fontSize: 24, fontWeight: '700' }}>
          {value}
        </Text>
        {unit && (
          <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 2 }}>
            {unit}
          </Text>
        )}
      </View>
      {trend !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{
            color: trend > 0 ? '#4ADE80' : trend < 0 ? '#EF4444' : '#64748B',
            fontSize: 11,
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </Text>
          <Text style={{ color: '#64748B', fontSize: 10, marginLeft: 4 }}>
            vs last week
          </Text>
        </View>
      )}
    </View>
  );
}

export function WeeklySummaryModal({ visible, summary, onDismiss }: WeeklySummaryModalProps) {
  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#0F172A',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#1E293B',
        }}>
          <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>
            [SYSTEM] WEEKLY REPORT
          </Text>
          <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '600', marginTop: 4 }}>
            {formatWeekRange(summary.weekStart, summary.weekEnd)}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Observation */}
          <SystemWindow variant="default" style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#60A5FA',
                marginTop: 6,
                marginRight: 10,
              }} />
              <Text style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 20, flex: 1 }}>
                {summary.observation}
              </Text>
            </View>
          </SystemWindow>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatBox
              label="Days Completed"
              value={summary.daysCompleted}
              unit={`/${summary.totalDays}`}
              trend={summary.comparedToLastWeek?.daysChange}
              color="#60A5FA"
            />
            <StatBox
              label="Completion"
              value={summary.coreCompletionRate}
              unit="%"
              trend={summary.comparedToLastWeek?.completionChange}
              color={summary.coreCompletionRate >= 80 ? '#4ADE80' : '#60A5FA'}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <StatBox
              label="XP Earned"
              value={`+${summary.xpEarned}`}
              trend={summary.comparedToLastWeek?.xpChange}
              color="#FBBF24"
            />
            <StatBox
              label="Current Streak"
              value={summary.currentStreak}
              unit="days"
              color={summary.currentStreak >= 7 ? '#FF6600' : '#60A5FA'}
            />
          </View>

          {/* Perfect Days */}
          {summary.perfectDays > 0 && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#4ADE8015',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}>
              <Ionicons name="star" size={18} color="#4ADE80" />
              <Text style={{ color: '#4ADE80', fontSize: 14, marginLeft: 8 }}>
                {summary.perfectDays} perfect day{summary.perfectDays !== 1 ? 's' : ''} achieved
              </Text>
            </View>
          )}

          {/* Achievements */}
          {summary.achievements.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
                ACHIEVEMENTS
              </Text>
              {summary.achievements.map((achievement, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#4ADE8010',
                    borderWidth: 1,
                    borderColor: '#4ADE8030',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="trophy" size={16} color="#4ADE80" />
                  <Text style={{ color: '#4ADE80', fontSize: 14, marginLeft: 10 }}>
                    {achievement}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* New Week Message */}
          <View style={{
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: '#1E293B',
          }}>
            <Text style={{
              color: '#64748B',
              fontSize: 13,
              textAlign: 'center',
              lineHeight: 20,
              fontStyle: 'italic',
            }}>
              This week's slate is clean.{'\n'}
              What you did last week is recorded.{'\n'}
              What you do this week is undetermined.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={{
          padding: 20,
          backgroundColor: '#0A0A0F',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
        }}>
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#60A5FA' : '#60A5FA20',
              borderWidth: 1,
              borderColor: '#60A5FA50',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            })}
          >
            <Text style={{ color: '#60A5FA', fontSize: 15, fontWeight: '600' }}>
              Begin the Week
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Compact weekly summary card for Stats page
 */
export function WeeklySummaryCard({ summary, onPress }: { summary: WeeklySummary; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <SystemWindow variant="default" style={{ marginBottom: 12 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '600' }}>
            {formatWeekRange(summary.weekStart, summary.weekEnd)}
          </Text>
          <View style={{
            backgroundColor: summary.coreCompletionRate >= 80
              ? '#4ADE8020'
              : summary.coreCompletionRate >= 50
              ? '#FBBF2420'
              : '#64748B20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}>
            <Text style={{
              color: summary.coreCompletionRate >= 80
                ? '#4ADE80'
                : summary.coreCompletionRate >= 50
                ? '#FBBF24'
                : '#64748B',
              fontSize: 12,
              fontWeight: '600',
            }}>
              {summary.coreCompletionRate}%
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#60A5FA', fontSize: 18, fontWeight: '700' }}>
              {summary.daysCompleted}/7
            </Text>
            <Text style={{ color: '#64748B', fontSize: 10 }}>days</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FBBF24', fontSize: 18, fontWeight: '700' }}>
              +{summary.xpEarned}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 10 }}>XP</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#4ADE80', fontSize: 18, fontWeight: '700' }}>
              {summary.perfectDays}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 10 }}>perfect</Text>
          </View>
        </View>

        {/* Achievements count */}
        {summary.achievements.length > 0 && (
          <View style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#1E293B',
          }}>
            <Text style={{ color: '#64748B', fontSize: 11 }}>
              {summary.achievements.length} achievement{summary.achievements.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </SystemWindow>
    </Pressable>
  );
}

export default WeeklySummaryModal;
