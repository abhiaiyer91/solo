/**
 * Test Fixtures for Route Tests
 * Shared mock data for API route testing
 */

// ═══════════════════════════════════════════════════════════
// HEALTH FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockHealthSyncData = {
  steps: 8500,
  activeMinutes: 45,
  caloriesBurned: 320,
  heartRate: { average: 72, resting: 58 },
  sleep: { duration: 7.5, quality: 'good' },
  syncedAt: new Date().toISOString(),
}

export const mockHealthHistory = [
  { date: '2026-01-18', steps: 8500, activeMinutes: 45, caloriesBurned: 320 },
  { date: '2026-01-17', steps: 10200, activeMinutes: 60, caloriesBurned: 400 },
  { date: '2026-01-16', steps: 7000, activeMinutes: 30, caloriesBurned: 280 },
]

// ═══════════════════════════════════════════════════════════
// STATS FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockPlayerStats = {
  str: 15,
  agi: 12,
  vit: 18,
  disc: 14,
  level: 5,
  totalXP: 500,
  currentStreak: 7,
  longestStreak: 14,
  perfectDays: 3,
}

export const mockLeaderboardEntry = {
  rank: 42,
  userId: 'user-123',
  displayName: 'Test Hunter',
  level: 5,
  totalXP: 500,
  currentStreak: 7,
}

export const mockLeaderboard = [
  { rank: 1, userId: 'user-1', displayName: 'Alpha Hunter', level: 15, totalXP: 5000, currentStreak: 30 },
  { rank: 2, userId: 'user-2', displayName: 'Beta Hunter', level: 12, totalXP: 4200, currentStreak: 21 },
  { rank: 3, userId: 'user-3', displayName: 'Gamma Hunter', level: 10, totalXP: 3500, currentStreak: 14 },
]

// ═══════════════════════════════════════════════════════════
// GUILD FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockGuild = {
  id: 'guild-123',
  name: 'Shadow Hunters',
  description: 'Elite hunters only',
  leaderId: 'user-leader',
  memberCount: 5,
  createdAt: '2026-01-01T00:00:00Z',
  isPrivate: false,
  weeklyXP: 2500,
}

export const mockGuildMember = {
  id: 'member-1',
  guildId: 'guild-123',
  userId: 'user-123',
  role: 'member',
  joinedAt: '2026-01-10T00:00:00Z',
  weeklyXP: 500,
}

export const mockGuildList = [
  mockGuild,
  { ...mockGuild, id: 'guild-456', name: 'Night Raiders', memberCount: 8 },
  { ...mockGuild, id: 'guild-789', name: 'Dawn Warriors', memberCount: 3 },
]

// ═══════════════════════════════════════════════════════════
// NOTIFICATION FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockNotificationPrefs = {
  pushEnabled: true,
  emailEnabled: false,
  questReminders: true,
  dailySummary: true,
  weeklyReport: true,
  guildActivity: false,
  quietHoursStart: 22,
  quietHoursEnd: 8,
}

export const mockPushToken = {
  token: 'expo-push-token-abc123',
  platform: 'ios',
  deviceId: 'device-xyz',
}

// ═══════════════════════════════════════════════════════════
// ONBOARDING FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockBaselineAssessment = {
  workoutFrequency: 'moderate',
  sleepQuality: 'good',
  stressLevel: 'medium',
  primaryGoal: 'strength',
  secondaryGoal: 'endurance',
  experience: 'intermediate',
}

export const mockOnboardingProgress = {
  step: 3,
  totalSteps: 5,
  completedSteps: ['welcome', 'assessment', 'goals'],
  remainingSteps: ['quests', 'complete'],
}

// ═══════════════════════════════════════════════════════════
// SEASON FIXTURES
// ═══════════════════════════════════════════════════════════

export const mockSeason = {
  id: 'season-2026-01',
  name: 'Winter Awakening',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  theme: 'ice',
  isActive: true,
  currentWeek: 3,
  totalWeeks: 13,
}

export const mockSeasonProgress = {
  seasonId: 'season-2026-01',
  userId: 'user-123',
  xpEarned: 1500,
  questsCompleted: 45,
  perfectWeeks: 2,
  rank: 'silver',
  rewards: [
    { id: 'reward-1', name: 'Winter Frame', type: 'cosmetic', claimed: true },
    { id: 'reward-2', name: 'Ice Title', type: 'title', claimed: false },
  ],
}

export const mockSeasonHistory = [
  { ...mockSeason, id: 'season-2025-04', name: 'Fall of Shadows', isActive: false },
  { ...mockSeason, id: 'season-2025-03', name: 'Summer Blaze', isActive: false },
]
