/**
 * Fitness Tests Hook
 * React Query hooks for mandatory fitness tests and fitness test records
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export type FitnessTestType = 'MILE_TIME' | 'BENCH_PRESS' | 'SQUAT' | 'DEADLIFT';
export type FitnessTestStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export interface FitnessTestMetadata {
  name: string;
  description: string;
  unit: string;
  unitLabel: string;
  icon: string;
  category: 'cardio' | 'strength';
  xpReward: number;
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC';
}

export interface FitnessTestRecord {
  id: string;
  testType: FitnessTestType;
  value: number;
  displayValue: string;
  unit?: string;
  isPersonalRecord: boolean;
  notes?: string;
  testDate: string;
  createdAt?: string;
}

export interface MandatoryFitnessTest {
  id: string;
  testType: FitnessTestType;
  status: FitnessTestStatus;
  xpAwarded?: number;
  completedAt?: string;
  metadata: FitnessTestMetadata;
  latestRecord: FitnessTestRecord | null;
}

interface MandatoryTestsResponse {
  tests: MandatoryFitnessTest[];
  message: string;
}

interface MandatoryTestsStatusResponse {
  total: number;
  completed: number;
  pending: number;
  skipped: number;
  allCompleted: boolean;
  tests: Array<{
    testType: FitnessTestType;
    status: FitnessTestStatus;
    name: string;
    description: string;
    xpReward: number;
  }>;
  message: string;
}

interface NextPendingTestResponse {
  test: {
    id: string;
    testType: FitnessTestType;
    status: FitnessTestStatus;
  } | null;
  metadata?: FitnessTestMetadata;
  allCompleted: boolean;
  message: string;
}

interface RecordFitnessTestResponse {
  record: FitnessTestRecord;
  mandatoryTestCompleted: boolean;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel: number;
  message: string;
}

interface SkipFitnessTestResponse {
  test: {
    id: string;
    testType: FitnessTestType;
    status: FitnessTestStatus;
  };
  message: string;
}

interface FitnessTestHistoryResponse {
  records: FitnessTestRecord[];
  total: number;
  message: string;
}

interface PersonalRecordsResponse {
  personalRecords: Record<FitnessTestType, {
    value: number;
    displayValue: string;
    testDate: string;
    recordedAt: string;
  } | null>;
  message: string;
}

interface FitnessTestStatsResponse {
  totalRecords: number;
  personalRecords: Record<FitnessTestType, {
    value: number;
    displayValue: string;
    testDate: string;
  } | null>;
  estimatedTotal: number;
  mandatoryTests: MandatoryTestsStatusResponse;
  message: string;
}

// Query keys
export const fitnessTestQueryKeys = {
  all: ['fitness-tests'] as const,
  mandatory: () => [...fitnessTestQueryKeys.all, 'mandatory'] as const,
  mandatoryStatus: () => [...fitnessTestQueryKeys.all, 'mandatory', 'status'] as const,
  nextPending: () => [...fitnessTestQueryKeys.all, 'mandatory', 'next'] as const,
  history: (testType?: FitnessTestType) => 
    [...fitnessTestQueryKeys.all, 'history', { testType }] as const,
  personalRecords: () => [...fitnessTestQueryKeys.all, 'personal-records'] as const,
  stats: () => [...fitnessTestQueryKeys.all, 'stats'] as const,
  metadata: () => [...fitnessTestQueryKeys.all, 'metadata'] as const,
};

/**
 * Hook for mandatory fitness tests
 */
export function useMandatoryFitnessTests() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: fitnessTestQueryKeys.mandatory(),
    queryFn: async () => {
      return api.get<MandatoryTestsResponse>('/api/fitness-tests/mandatory');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    tests: query.data?.tests ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for mandatory tests status
 */
export function useMandatoryTestsStatus() {
  const query = useQuery({
    queryKey: fitnessTestQueryKeys.mandatoryStatus(),
    queryFn: async () => {
      return api.get<MandatoryTestsStatusResponse>('/api/fitness-tests/mandatory/status');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    status: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for next pending mandatory test
 */
export function useNextPendingTest() {
  const query = useQuery({
    queryKey: fitnessTestQueryKeys.nextPending(),
    queryFn: async () => {
      return api.get<NextPendingTestResponse>('/api/fitness-tests/mandatory/next');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    nextTest: query.data?.test,
    metadata: query.data?.metadata,
    allCompleted: query.data?.allCompleted ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for recording fitness tests
 */
export function useRecordFitnessTest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      testType: FitnessTestType;
      value: number;
      unit?: string;
      notes?: string;
      testDate?: string;
    }) => {
      return api.post<RecordFitnessTestResponse>('/api/fitness-tests/record', data);
    },
    onSuccess: () => {
      // Invalidate all fitness test queries
      queryClient.invalidateQueries({ queryKey: fitnessTestQueryKeys.all });
      // Also invalidate player data for XP updates
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });

  return {
    recordTest: mutation.mutate,
    recordTestAsync: mutation.mutateAsync,
    isRecording: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook for skipping mandatory fitness tests
 */
export function useSkipFitnessTest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (testType: FitnessTestType) => {
      return api.post<SkipFitnessTestResponse>('/api/fitness-tests/skip', { testType });
    },
    onSuccess: () => {
      // Invalidate all fitness test queries
      queryClient.invalidateQueries({ queryKey: fitnessTestQueryKeys.all });
    },
  });

  return {
    skipTest: mutation.mutate,
    skipTestAsync: mutation.mutateAsync,
    isSkipping: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for fitness test history
 */
export function useFitnessTestHistory(options?: {
  testType?: FitnessTestType;
  limit?: number;
  offset?: number;
}) {
  const query = useQuery({
    queryKey: fitnessTestQueryKeys.history(options?.testType),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.testType) params.set('testType', options.testType);
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());
      
      const queryString = params.toString();
      const endpoint = `/api/fitness-tests/history${queryString ? `?${queryString}` : ''}`;
      
      return api.get<FitnessTestHistoryResponse>(endpoint);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    records: query.data?.records ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for personal records
 */
export function usePersonalRecords() {
  const query = useQuery({
    queryKey: fitnessTestQueryKeys.personalRecords(),
    queryFn: async () => {
      return api.get<PersonalRecordsResponse>('/api/fitness-tests/personal-records');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    personalRecords: query.data?.personalRecords,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fitness test stats
 */
export function useFitnessTestStats() {
  const query = useQuery({
    queryKey: fitnessTestQueryKeys.stats(),
    queryFn: async () => {
      return api.get<FitnessTestStatsResponse>('/api/fitness-tests/stats');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Combined hook for fitness tests with common operations
 */
export function useFitnessTests() {
  const queryClient = useQueryClient();
  
  const mandatoryTests = useMandatoryFitnessTests();
  const status = useMandatoryTestsStatus();
  const nextTest = useNextPendingTest();
  const recordTest = useRecordFitnessTest();
  const skipTest = useSkipFitnessTest();
  const personalRecords = usePersonalRecords();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: fitnessTestQueryKeys.all });
  };

  return {
    // Mandatory tests
    mandatoryTests: mandatoryTests.tests,
    mandatoryTestsLoading: mandatoryTests.isLoading,
    
    // Status
    status: status.status,
    statusLoading: status.isLoading,
    allCompleted: status.status?.allCompleted ?? false,
    pendingCount: status.status?.pending ?? 0,
    
    // Next test
    nextTest: nextTest.nextTest,
    nextTestMetadata: nextTest.metadata,
    
    // Personal records
    personalRecords: personalRecords.personalRecords,
    personalRecordsLoading: personalRecords.isLoading,
    
    // Mutations
    recordTest: recordTest.recordTest,
    recordTestAsync: recordTest.recordTestAsync,
    isRecording: recordTest.isRecording,
    recordSuccess: recordTest.isSuccess,
    recordData: recordTest.data,
    resetRecordState: recordTest.reset,
    
    skipTest: skipTest.skipTest,
    skipTestAsync: skipTest.skipTestAsync,
    isSkipping: skipTest.isSkipping,
    
    // Utilities
    invalidateAll,
    refetchAll: () => {
      mandatoryTests.refetch();
      status.refetch();
      nextTest.refetch();
      personalRecords.refetch();
    },
  };
}

/**
 * Helper to format mile time from seconds to MM:SS
 */
export function formatMileTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper to parse MM:SS to seconds
 */
export function parseMileTime(timeString: string): number {
  const [mins, secs] = timeString.split(':').map(Number);
  return (mins || 0) * 60 + (secs || 0);
}

/**
 * Helper to format test value for display
 */
export function formatTestValue(testType: FitnessTestType, value: number): string {
  if (testType === 'MILE_TIME') {
    return formatMileTime(value);
  }
  return `${Math.round(value)} lbs`;
}
