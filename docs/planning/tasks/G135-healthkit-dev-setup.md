# G135: HealthKit Development Environment Setup

## Overview
Configure the development environment for HealthKit integration, including EAS build setup, physical device provisioning, and local development workflow for testing health data sync.

## Context
**Source:** Retrospective analysis 2026-01-18
**Current State:** Mobile app foundation exists (G55 complete), but HealthKit cannot be tested in simulator
**Rationale:** HealthKit requires physical iOS device and proper Apple Developer provisioning

## Acceptance Criteria
- [ ] EAS CLI installed and configured
- [ ] iOS development provisioning profile created with HealthKit entitlement
- [ ] eas.json configured for development builds
- [ ] Physical iOS device registered in Apple Developer account
- [ ] Development build successfully installed on physical device
- [ ] HealthKit permission request appears when app launches
- [ ] README updated with device testing instructions

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/eas.json | Create | EAS build configuration |
| mobile/app.json | Modify | Add HealthKit config plugin |
| mobile/ios/.gitignore | Create | Ignore generated iOS files |
| docs/mobile/device-testing.md | Create | Physical device setup guide |

## Implementation Notes

### Prerequisites
1. Apple Developer account ($99/year)
2. Physical iOS device (iPhone)
3. USB cable for initial provisioning
4. Xcode installed (for device registration)

### EAS Configuration
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### HealthKit Entitlements
```json
// app.json additions
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "The System requires access to your health data to track your fitness progress.",
        "NSHealthUpdateUsageDescription": "The System may write workout data to Health."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.background-delivery": true
      }
    },
    "plugins": [
      "@kingstinct/react-native-healthkit"
    ]
  }
}
```

### Device Registration
1. Connect device via USB
2. Trust computer on device
3. In Xcode: Window → Devices and Simulators
4. Register device UDID in Apple Developer portal

### Build Command
```bash
eas build --profile development --platform ios
```

## Definition of Done
- [ ] Development build runs on physical device
- [ ] HealthKit permission dialog appears
- [ ] No provisioning errors in build logs
- [ ] Documentation complete for other developers
