/**
 * Reconciliation Screen - End of day quest confirmation
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SystemWindow } from '@/components/SystemWindow';
import {
  ReconciliationItemCard,
  CompletedItemRow,
} from '@/components/ReconciliationItem';
import {
  useReconciliation,
  formatTimeToMidnight,
  type ReconciliationItem,
} from '@/hooks/useReconciliation';

export default function ReconciliationScreen() {
  const router = useRouter();
  const {
    pendingItems,
    minutesToMidnight,
    phase,
    isClosed,
    isLoading,
    isSubmitting,
    isClosing,
    submitReconciliation,
    closeDay,
    refetch,
  } = useReconciliation();

  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Handle item submission
  const handleSubmit = useCallback(
    (questId: string, data: Record<string, number | boolean>) => {
      submitReconciliation(
        { questId, data },
        {
          onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCompletedItems((prev) => new Set(prev).add(questId));
          },
          onError: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          },
        }
      );
    },
    [submitReconciliation]
  );

  // Handle close day
  const handleCloseDay = useCallback(() => {
    const remainingItems = pendingItems.filter(
      (item) => !completedItems.has(item.questId)
    ).length;

    const message =
      remainingItems > 0
        ? `You have ${remainingItems} unconfirmed ${remainingItems === 1 ? 'item' : 'items'}. Close day anyway?`
        : 'Close today and record your progress?';

    Alert.alert('Close Day', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close Day',
        style: remainingItems > 0 ? 'destructive' : 'default',
        onPress: () => {
          closeDay(undefined, {
            onSuccess: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            },
            onError: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to close day. Please try again.');
            },
          });
        },
      },
    ]);
  }, [pendingItems, completedItems, closeDay, router]);

  // Separate pending and completed items
  const stillPending = pendingItems.filter(
    (item) => !completedItems.has(item.questId)
  );
  const completed = pendingItems.filter((item) =>
    completedItems.has(item.questId)
  );
  const allComplete = stillPending.length === 0;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingText}>Loading reconciliation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Day already closed
  if (isClosed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#E2E8F0" />
          </Pressable>
          <Text style={styles.headerTitle}>RECONCILIATION</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.closedContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4ADE80" />
          <Text style={styles.closedTitle}>Day Already Closed</Text>
          <Text style={styles.closedSubtitle}>
            Today's progress has been recorded.
            Check back tomorrow for new quests.
          </Text>
          <Pressable
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#E2E8F0" />
        </Pressable>
        <Text style={styles.headerTitle}>RECONCILIATION</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A855F7"
          />
        }
      >
        {/* Time Indicator */}
        <SystemWindow
          variant={minutesToMidnight < 60 ? 'warning' : 'default'}
          style={styles.timeCard}
        >
          <View style={styles.timeRow}>
            <View style={styles.timeLeft}>
              <Ionicons
                name={minutesToMidnight < 60 ? 'warning' : 'moon'}
                size={24}
                color={minutesToMidnight < 60 ? '#FBBF24' : '#A855F7'}
              />
              <View style={styles.timeText}>
                <Text style={styles.timeLabel}>
                  {phase === 'night' ? 'LATE NIGHT' : 'EVENING'}
                </Text>
                <Text style={styles.timeValue}>
                  {formatTimeToMidnight(minutesToMidnight)} until midnight
                </Text>
              </View>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>
                {completed.length}/{pendingItems.length}
              </Text>
            </View>
          </View>
        </SystemWindow>

        {/* System Message */}
        <SystemWindow variant="default" style={styles.messageCard}>
          <View style={styles.messageRow}>
            <View style={styles.messageDot} />
            <Text style={styles.messageText}>
              {allComplete
                ? 'All items confirmed. Ready to close the day.'
                : 'Confirm your remaining quests before midnight.'}
            </Text>
          </View>
        </SystemWindow>

        {/* Progress Dots */}
        {pendingItems.length > 0 && (
          <View style={styles.progressDots}>
            {pendingItems.map((item) => (
              <View
                key={item.questId}
                style={[
                  styles.dot,
                  completedItems.has(item.questId) && styles.dotComplete,
                ]}
              />
            ))}
          </View>
        )}

        {/* Pending Items */}
        {stillPending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PENDING ITEMS</Text>
            {stillPending.map((item) => (
              <ReconciliationItemCard
                key={item.questId}
                item={item}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            ))}
          </View>
        )}

        {/* Completed Items */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONFIRMED</Text>
            {completed.map((item) => (
              <CompletedItemRow key={item.questId} item={item} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {pendingItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>
              All quests have been recorded for today.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isClosing}
        >
          <Text style={styles.cancelButtonText}>Later</Text>
        </Pressable>

        <Pressable
          style={[
            styles.closeDayButton,
            !allComplete && styles.closeDayButtonWarning,
          ]}
          onPress={handleCloseDay}
          disabled={isClosing}
        >
          {isClosing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.closeDayButtonText}>
              {allComplete ? 'Close Day' : `Close (${stillPending.length} pending)`}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  timeCard: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    gap: 2,
  },
  timeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  timeValue: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  progressPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  messageCard: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A855F7',
    marginRight: 12,
    marginTop: 4,
  },
  messageText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  dotComplete: {
    backgroundColor: '#4ADE80',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  closeDayButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#A855F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeDayButtonWarning: {
    backgroundColor: '#FBBF24',
  },
  closeDayButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  closedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  closedTitle: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
  },
  closedSubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#60A5FA',
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
