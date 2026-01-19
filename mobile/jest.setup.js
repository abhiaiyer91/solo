/**
 * Jest Setup File
 * Configures mocks and testing utilities for React Native testing
 */

import '@testing-library/jest-native/extend-expect'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./src/test/mocks/storage').mockAsyncStorage
)

// Mock HealthKit
jest.mock('@kingstinct/react-native-healthkit', () =>
  require('./src/test/mocks/healthkit').mockHealthKit
)

// Mock expo-router navigation
jest.mock('expo-router', () =>
  require('./src/test/mocks/navigation').mockExpoRouter
)

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}))

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}))

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    useCameraPermissions: jest.fn().mockReturnValue([{ status: 'granted' }, jest.fn()]),
  },
  CameraView: 'CameraView',
}))

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Silence console.warn/error during tests (optional)
// beforeAll(() => {
//   jest.spyOn(console, 'warn').mockImplementation(() => {})
//   jest.spyOn(console, 'error').mockImplementation(() => {})
// })

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
