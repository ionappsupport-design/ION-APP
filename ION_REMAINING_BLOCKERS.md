# ION — REMAINING PRODUCTION BLOCKERS

The codebase logic and architecture have been thoroughly audited and remediated. The application relies on real native integrations, server-authoritative Firebase architecture, and genuine Android OS APIs. However, the application cannot be released to production until the following critical configuration and environment blockers are resolved.

## 🔴 P0 BLOCKERS (Must Fix Before Release)

### 1. Missing `google-services.json`
- **Location:** `android/app/google-services.json`
- **Impact:** CRITICAL. The Firebase Android SDK, Crashlytics, Analytics, and Push Notifications all require this file to initialize at build and runtime. Without it, the Android app will either fail to build (if the Gradle plugin is strictly enforced) or crash/silently fail at runtime when Firebase attempts to initialize.
- **Resolution:** Download the `google-services.json` file from the Firebase Console (Project Settings -> General -> Your Apps -> Android) and place it in the `android/app/` directory.

### 2. Missing Production `.env` File
- **Location:** `.env` (Root directory)
- **Impact:** CRITICAL. The `src/services/firebase.ts` file employs a strict `requireEnv` guard. In production builds, if variables like `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc., are missing, the app will throw a fatal error.
- **Resolution:** Duplicate `.env.example` to `.env` and populate it with the real Firebase Web App configuration from the Firebase Console.

## 🟠 P1 BLOCKERS (Highly Recommended Before Release)

### 3. Missing Production AdMob Unit IDs
- **Location:** `.env` (Root directory)
- **Impact:** HIGH. The app currently uses Google's test ad unit IDs. If released without production IDs, no ad revenue will be generated.
- **Resolution:** Create real AdMob Banner ad units and place their IDs in `VITE_ADMOB_BANNER_ANDROID` and `VITE_ADMOB_BANNER_IOS`. Ensure `VITE_ADMOB_TESTING=false` is set in production.

### 4. Code Signing & Release Keystore
- **Location:** `android/app/build.gradle`
- **Impact:** HIGH. The app currently builds a debug APK. To publish to the Google Play Store, a release build must be signed with a production Keystore.
- **Resolution:** Generate an upload keystore and configure the `release` signing config in `build.gradle` with the store file, store password, key alias, and key password.

## 🟡 P2 DEFERRED / KNOWN ISSUES

### 5. Malware Signature Scan (Feature 53)
- **Impact:** MODERATE. The "Security Scanner" currently only checks application permissions and package sources (identifying sideloaded apps and high-risk permissions). It does not perform actual malware signature (hash) comparisons against a live database.
- **Resolution:** Either re-label the feature as a "Privacy & Permission Advisor" to accurately reflect its capability, or integrate a third-party antivirus API (which may be cost-prohibitive or slow).

### 6. AdMob Interstitial (Feature 47)
- **Impact:** LOW. The 87 Feature Matrix lists Interstitial ads, but the codebase only contains Banner ad implementation (`adMobService.ts`).
- **Resolution:** If interstitials are desired for monetization, implement `showInterstitial()` in `adMobService.ts` using the `@capacitor-community/admob` plugin, triggered perhaps after cleaning completions. Otherwise, remove it from the product requirements.
