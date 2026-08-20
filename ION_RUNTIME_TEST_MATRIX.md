# ION — RUNTIME TEST MATRIX

This document outlines the mandatory physical device tests required to verify that the ION application correctly interfaces with Android native APIs and Firebase backend services. Since the codebase has been purged of mock simulations, **these tests must be run on a physical Android device** (API 29+ recommended, API 33+ for granular media permissions).

## 1. Storage Integration Tests (Physical Device)

| Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **System Storage Metrics** | Open Dashboard. | Circular gauge displays accurate used/total space (matches Android Settings -> Storage). | [ ] |
| **Media Scanning** | Grant media permissions (Images/Video/Audio) on Android 13+. Run a scan. | App successfully queries `MediaStore` and categorizes media correctly. | [ ] |
| **Direct File Deletion** | Select an image and tap Delete. | Image is removed from device storage (`ContentResolver.delete`). | [ ] |
| **SAF Directory Traversal** | Connect to WhatsApp / Telegram via SAF Folder Picker. | App successfully maps and reads the nested directory tree without crashing. | [ ] |
| **Video Compression** | Select a large video file and choose "Compress". | `LightCompressor` processes the video; a smaller file is generated and saved locally. | [ ] |
| **Recycle Bin Backups** | Delete a file with Recycle Bin enabled. | File is copied to the `ion_backups` hidden directory before deletion. | [ ] |

## 2. Authentication & Entitlement Tests (Firebase)

| Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **Google Sign-In** | Tap "Continue with Google". | User authenticates via Firebase; Firestore profile is created. | [ ] |
| **Trial Enforcement** | Change device date to > 3 days ahead. | App verifies via server timestamp (Firestore) that the trial is expired; locks premium features. | [ ] |
| **Entitlement Sync** | Log in on a second device. | Premium features unlock immediately based on the central Firestore user profile. | [ ] |

## 3. Payment Gateway Tests (Razorpay)

| Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **Order Creation** | Tap "Upgrade to Lifetime". | App calls Firebase Function; returns a valid Razorpay Order ID. | [ ] |
| **Checkout UI** | Wait for Razorpay SDK to load. | Razorpay bottom sheet appears natively (via Web SDK injected into Capacitor webview). | [ ] |
| **HMAC Signature** | Complete a test payment (using Razorpay test cards). | Firebase Function correctly verifies the `razorpay_signature` and updates Firestore to `lifetime`. | [ ] |

## 4. Diagnostics & Analytics Tests

| Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **AdMob Banner** | Open app as a free user. | Bottom banner ad displays. (Ensure `VITE_ADMOB_TESTING=true`). | [ ] |
| **Push Notification Registration** | Launch app for the first time. | FCM requests permission; token is stored locally without errors. | [ ] |
| **Crashlytics Verification** | Trigger a simulated fatal crash (via DEV tools if available). | Crash appears in the Firebase Crashlytics dashboard within 5 minutes. | [ ] |
| **Analytics Logging** | Perform a cleanup operation. | `clean_completed` event appears in Firebase Analytics / Google Analytics DebugView. | [ ] |
