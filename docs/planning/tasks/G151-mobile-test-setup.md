# G151: Mobile Test Infrastructure

## Overview
Set up testing infrastructure for the React Native mobile app. Currently there are 0 test files for mobile, leaving the app without automated quality assurance.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `mobile/`, `mobile/package.json`
**Current State:** Jest configured but no test files exist

## Acceptance Criteria
- [ ] Jest properly configured with jest-expo preset
- [ ] React Native Testing Library installed and working
- [ ] At least 3 example component tests
- [ ] At least 2 example hook tests
- [ ] Mock setup for AsyncStorage, HealthKit, navigation
- [ ] Test scripts in package.json working
- [ ] CI-ready test configuration

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/jest.config.js | Create | Jest configuration |
| mobile/jest.setup.js | Create | Test setup and mocks |
| mobile/src/test/mocks/healthkit.ts | Create | HealthKit mock |
| mobile/src/test/mocks/storage.ts | Create | AsyncStorage mock |
| mobile/src/test/mocks/navigation.ts | Create | Navigation mock |
| mobile/src/components/QuestCard.test.tsx | Create | Example component test |
| mobile/src/components/ProgressBar.test.tsx | Create | Example component test |
| mobile/src/hooks/useHealthData.test.ts | Create | Example hook test |
| mobile/src/hooks/useQuests.test.ts | Create | Example hook test |
| mobile/package.json | Modify | Add test dependencies |

## Implementation Notes

### Jest Configuration
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Required Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@testing-library/jest-native": "^5.4.0",
    "jest-expo": "~51.0.0"
  }
}
```

### HealthKit Mock Pattern
```typescript
export const mockHealthKit = {
  isHealthDataAvailable: jest.fn().mockResolvedValue(true),
  requestAuthorization: jest.fn().mockResolvedValue(true),
  queryQuantitySamples: jest.fn().mockResolvedValue([]),
  // etc.
}
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] `npm test` runs successfully in mobile directory
- [ ] Example tests demonstrate best practices
- [ ] Mocks properly isolate tests from native modules
- [ ] Documentation added for running mobile tests
