/**
 * ReconciliationItem - Swipeable item for reconciliation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReconciliationItem as ReconciliationItemType } from '../hooks/useReconciliation';

interface ReconciliationItemProps {
  item: ReconciliationItemType;
  onSubmit: (questId: string, data: Record<string, number | boolean>) => void;
  isSubmitting: boolean;
}

/**
 * Numeric input item with quick percentage buttons
 */
function NumericInput({
  item,
  onSubmit,
  isSubmitting,
}: ReconciliationItemProps) {
  const [value, setValue] = useState<string>(
    item.currentValue?.toString() ?? '0'
  );

  const handleQuickValue = useCallback((percent: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = Math.floor(item.targetValue * percent);
    setValue(newValue.toString());
  }, [item.targetValue]);

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const numValue = parseInt(value) || 0;
    onSubmit(item.questId, { [item.metric]: numValue });
  }, [value, item.questId, item.metric, onSubmit]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.questName}>{item.questName}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.numericInput}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            editable={!isSubmitting}
            selectTextOnFocus
          />
          <Text style={styles.targetText}>/ {item.targetValue}</Text>
        </View>

        <View style={styles.quickButtons}>
          <Pressable
            style={styles.quickButton}
            onPress={() => handleQuickValue(0.5)}
            disabled={isSubmitting}
          >
            <Text style={styles.quickButtonText}>50%</Text>
          </Pressable>
          <Pressable
            style={styles.quickButton}
            onPress={() => handleQuickValue(0.75)}
            disabled={isSubmitting}
          >
            <Text style={styles.quickButtonText}>75%</Text>
          </Pressable>
          <Pressable
            style={[styles.quickButton, styles.quickButtonActive]}
            onPress={() => handleQuickValue(1)}
            disabled={isSubmitting}
          >
            <Text style={[styles.quickButtonText, styles.quickButtonTextActive]}>
              100%
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Recording...' : 'Confirm'}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Boolean input item with YES/NO buttons
 */
function BooleanInput({
  item,
  onSubmit,
  isSubmitting,
}: ReconciliationItemProps) {
  const [value, setValue] = useState<boolean | null>(null);

  const handleSelect = useCallback((selected: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue(selected);
  }, []);

  const handleSubmit = useCallback(() => {
    if (value === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(item.questId, { [item.metric]: value });
  }, [value, item.questId, item.metric, onSubmit]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.questName}>{item.questName}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.booleanButtons}>
        <Pressable
          style={[
            styles.booleanButton,
            value === true && styles.booleanButtonYes,
          ]}
          onPress={() => handleSelect(true)}
          disabled={isSubmitting}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={value === true ? '#4ADE80' : '#64748B'}
          />
          <Text
            style={[
              styles.booleanButtonText,
              value === true && styles.booleanButtonTextYes,
            ]}
          >
            YES
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.booleanButton,
            value === false && styles.booleanButtonNo,
          ]}
          onPress={() => handleSelect(false)}
          disabled={isSubmitting}
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={value === false ? '#EF4444' : '#64748B'}
          />
          <Text
            style={[
              styles.booleanButtonText,
              value === false && styles.booleanButtonTextNo,
            ]}
          >
            NO
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.submitButton,
          (isSubmitting || value === null) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting || value === null}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Recording...' : 'Confirm'}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Main ReconciliationItem component
 */
export function ReconciliationItemCard(props: ReconciliationItemProps) {
  if (props.item.type === 'numeric') {
    return <NumericInput {...props} />;
  }
  return <BooleanInput {...props} />;
}

/**
 * Completed item row
 */
export function CompletedItemRow({ item }: { item: ReconciliationItemType }) {
  return (
    <View style={styles.completedRow}>
      <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
      <Text style={styles.completedText}>{item.questName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 15, 20, 0.8)',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  questName: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputSection: {
    gap: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numericInput: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#E2E8F0',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  targetText: {
    color: '#64748B',
    fontSize: 16,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quickButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 6,
  },
  quickButtonActive: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  quickButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#60A5FA',
  },
  booleanButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  booleanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 8,
  },
  booleanButtonYes: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  booleanButtonNo: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  booleanButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  booleanButtonTextYes: {
    color: '#4ADE80',
  },
  booleanButtonTextNo: {
    color: '#EF4444',
  },
  submitButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 1,
    borderColor: '#60A5FA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  completedText: {
    color: '#4ADE80',
    fontSize: 14,
  },
});

export default ReconciliationItemCard;
