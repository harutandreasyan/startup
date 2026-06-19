# 09 — Mobile App (React Native + Expo)

## Tech Stack
- React Native + Expo SDK 52+
- Expo Router (file-based routing — same mental model as web)
- NativeWind (Tailwind CSS for React Native)
- Zustand (shared state logic with web)
- TanStack Query (same API hooks as web)
- RevenueCat (in-app purchases)
- Expo Image (performant image rendering)
- Expo AV (video playback)

## Why Expo?
- Managed build pipeline (EAS Build) — no need for Xcode/Android Studio for builds
- OTA updates (push JS updates without App Store review)
- Push notifications
- Built-in native module support (camera, gallery, share sheet)
- Free for solo developers

## Project Structure

```
apps/mobile/
├── app/                         # Expo Router (file-based routes)
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Landing / redirect
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── _layout.tsx          # Tab bar config
│   │   ├── home.tsx             # Dashboard / feed
│   │   ├── generate.tsx         # Generation screen
│   │   ├── gallery.tsx          # User's creations
│   │   └── profile.tsx          # Settings + credits
│   ├── generation/
│   │   └── [id].tsx             # Generation detail/result
│   └── credits/
│       └── index.tsx            # Purchase credits
├── components/
│   ├── generation/
│   │   ├── PromptInput.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── ResultView.tsx
│   │   └── ProgressOverlay.tsx
│   ├── credits/
│   │   ├── CreditBadge.tsx
│   │   └── PurchaseSheet.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── BottomSheet.tsx
├── lib/
│   ├── supabase.ts              # Supabase client (with AsyncStorage)
│   ├── api.ts                   # Same pattern as web
│   ├── purchases.ts             # RevenueCat setup
│   └── websocket.ts
├── stores/                      # Can import from packages/shared
│   └── (reuse web stores via packages/ui)
├── assets/
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── package.json
└── tsconfig.json
```

## Navigation Structure

```
App
├── (auth)                  # Unauthenticated stack
│   ├── Login
│   ├── Register
│   └── Forgot Password
│
└── (tabs)                  # Authenticated tab bar
    ├── Home                # Recent generations, quick actions
    ├── Generate            # Main creation tool
    │   └── [model select → params → generate → result]
    ├── Gallery             # Grid of all creations
    │   └── Generation Detail (push)
    └── Profile             # Settings, credits, subscription
        └── Credits Purchase (push)
```

## Shared Code with Web

Things shared via `packages/shared` and `packages/api-client`:
- TypeScript types (User, Generation, Credit, etc.)
- API client functions (all endpoint calls)
- Constants (credit costs, plan definitions)
- Zustand store logic (can share store shape, not React-specific parts)

Things NOT shared (platform-specific):
- UI components (different primitives: `<div>` vs `<View>`)
- Navigation
- Storage (localStorage vs AsyncStorage)
- Purchase flow (Stripe vs RevenueCat)
- Native features (camera, share sheet, haptics)

## Key Screens

### Generate Screen
```
┌─────────────────────────┐
│  Generate          💎450│
│─────────────────────────│
│                         │
│  ┌───────────────────┐  │
│  │ Flux Schnell  ▾   │  │
│  │ 2 credits         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Describe what you │  │
│  │ want to create... │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  [📷 Upload]  [⚙ Opts] │
│                         │
│  [════════ Generate ═══]│
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   [Result Image]    ││
│  │                     ││
│  │ [💾] [📤] [🔄] [✂] ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
│  🏠  │  ✨  │  🖼  │  👤 │  ← Tab bar
```

## RevenueCat Setup

```typescript
// lib/purchases.ts
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

export async function initPurchases(userId: string) {
  Purchases.configure({
    apiKey: Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    }),
    appUserID: userId,
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchaseCredits(packageToPurchase: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
  // Server webhook handles credit granting
  // Refresh credit balance from API
  return customerInfo;
}
```

## Expo Config

```json
// app.json
{
  "expo": {
    "name": "CreatorAI",
    "slug": "creatorai",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "creatorai",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.creatorai.app",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Save generated images to your gallery",
        "NSPhotoLibraryAddUsageDescription": "Save generated images to your gallery"
      }
    },
    "android": {
      "package": "com.creatorai.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "permissions": ["WRITE_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-router",
      "expo-image",
      ["expo-av", { "microphonePermission": false }]
    ]
  }
}
```

## EAS Build Config

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

## App Store Submission Checklist

### Apple App Store
- [ ] Apple Developer account ($99/year)
- [ ] App icons (1024x1024)
- [ ] Screenshots for all required device sizes
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] NSFW content moderation (Apple will reject without it)
- [ ] Sign in with Apple (required if you offer any social login)
- [ ] App Review guidelines compliance
- [ ] In-app purchases configured in App Store Connect

### Google Play Store
- [ ] Google Developer account ($25 one-time)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots
- [ ] Privacy policy
- [ ] Content rating questionnaire
- [ ] In-app products configured in Play Console
- [ ] Data safety section filled out

## Steps

- [ ] Initialize Expo project with TypeScript template
- [ ] Set up Expo Router with file-based routing
- [ ] Set up NativeWind (Tailwind for RN)
- [ ] Build auth screens (login, register)
- [ ] Integrate Supabase auth with AsyncStorage
- [ ] Build tab navigation (home, generate, gallery, profile)
- [ ] Build generate screen with prompt input
- [ ] Build gallery screen with image grid
- [ ] Integrate RevenueCat for purchases
- [ ] Build credits purchase bottom sheet
- [ ] Add push notifications (Expo Notifications)
- [ ] Test on iOS simulator + Android emulator
- [ ] Build with EAS Build (development profile)
- [ ] Test on physical devices
- [ ] Prepare App Store assets (icons, screenshots, metadata)
- [ ] Submit to App Store (TestFlight first)
- [ ] Submit to Google Play (internal testing first)

## Next Step
Proceed to [10-DEPLOYMENT.md](./10-DEPLOYMENT.md)
