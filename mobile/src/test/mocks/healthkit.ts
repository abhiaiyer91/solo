/**
 * HealthKit Mock
 * Simulates HealthKit API for testing
 */

export interface MockHealthSample {
  uuid: string
  quantity: number
  startDate: string
  endDate: string
  sourceId: string
  sourceName: string
}

// Sample health data
const mockStepData: MockHealthSample[] = [
  {
    uuid: 'step-1',
    quantity: 5000,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    sourceId: 'com.apple.health',
    sourceName: 'iPhone',
  },
]

const mockWorkoutData: MockHealthSample[] = [
  {
    uuid: 'workout-1',
    quantity: 30, // minutes
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    sourceId: 'com.apple.health',
    sourceName: 'Apple Watch',
  },
]

export const mockHealthKit = {
  // Availability
  isHealthDataAvailable: jest.fn().mockResolvedValue(true),

  // Authorization
  requestAuthorization: jest.fn().mockResolvedValue(true),
  authorizationStatusFor: jest.fn().mockResolvedValue(2), // 2 = Authorized

  // Query functions
  queryQuantitySamples: jest.fn((identifier: string) => {
    switch (identifier) {
      case 'HKQuantityTypeIdentifierStepCount':
        return Promise.resolve(mockStepData)
      case 'HKQuantityTypeIdentifierActiveEnergyBurned':
        return Promise.resolve([{ quantity: 250, ...mockStepData[0] }])
      default:
        return Promise.resolve([])
    }
  }),

  queryCategorySamples: jest.fn().mockResolvedValue([]),
  
  queryWorkouts: jest.fn().mockResolvedValue(mockWorkoutData),

  // Statistics
  queryStatisticsForQuantity: jest.fn((identifier: string) => {
    if (identifier === 'HKQuantityTypeIdentifierStepCount') {
      return Promise.resolve({ sumQuantity: 8500 })
    }
    return Promise.resolve({ sumQuantity: 0 })
  }),

  // Enable background delivery
  enableBackgroundDelivery: jest.fn().mockResolvedValue(true),
  disableBackgroundDelivery: jest.fn().mockResolvedValue(true),

  // Subscriptions
  subscribeToChanges: jest.fn().mockReturnValue(() => {}),

  // Save data
  saveQuantitySample: jest.fn().mockResolvedValue(true),
  saveWorkout: jest.fn().mockResolvedValue(true),
}

// Helper to mock specific step count
export function mockStepCount(steps: number) {
  mockHealthKit.queryStatisticsForQuantity.mockResolvedValue({ sumQuantity: steps })
  mockHealthKit.queryQuantitySamples.mockResolvedValue([
    { ...mockStepData[0], quantity: steps },
  ])
}

// Helper to simulate no health data access
export function mockHealthUnavailable() {
  mockHealthKit.isHealthDataAvailable.mockResolvedValue(false)
  mockHealthKit.requestAuthorization.mockRejectedValue(new Error('HealthKit unavailable'))
}

// Helper to simulate denied authorization
export function mockHealthDenied() {
  mockHealthKit.isHealthDataAvailable.mockResolvedValue(true)
  mockHealthKit.requestAuthorization.mockResolvedValue(false)
  mockHealthKit.authorizationStatusFor.mockResolvedValue(1) // 1 = Denied
}
