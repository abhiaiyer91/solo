/**
 * AsyncStorage Mock
 * Provides in-memory storage for testing
 */

const store: Record<string, string> = {}

export const mockAsyncStorage = {
  getItem: jest.fn((key: string) => {
    return Promise.resolve(store[key] || null)
  }),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value
    return Promise.resolve()
  }),
  removeItem: jest.fn((key: string) => {
    delete store[key]
    return Promise.resolve()
  }),
  clear: jest.fn(() => {
    Object.keys(store).forEach((key) => delete store[key])
    return Promise.resolve()
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(store))
  }),
  multiGet: jest.fn((keys: string[]) => {
    return Promise.resolve(keys.map((key) => [key, store[key] || null]))
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      store[key] = value
    })
    return Promise.resolve()
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => delete store[key])
    return Promise.resolve()
  }),
}

// Helper to reset store between tests
export function clearMockStorage() {
  Object.keys(store).forEach((key) => delete store[key])
  jest.clearAllMocks()
}

// Helper to pre-populate storage
export function seedMockStorage(data: Record<string, string>) {
  Object.entries(data).forEach(([key, value]) => {
    store[key] = value
  })
}
