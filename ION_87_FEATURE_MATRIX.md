# ION — 87 FEATURE MATRIX

| # | Feature | UI | Frontend Logic | Native/Backend | Real Data | Real Action | Error Handling | Security | Runtime Evidence | Status | Evidence | Risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Storage Size Calculation | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `IonNativeStoragePlugin.java` StatFs | Low |
| 2 | RAM Usage Metrics | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `ActivityManager.MemoryInfo` | Low |
| 3 | Battery Health / Level | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `BatteryManager` | Low |
| 4 | CPU Core Count | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `Runtime.getRuntime()` | Low |
| 5 | OS Version Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `Build.VERSION` | Low |
| 6 | Android 13+ Permission (Images) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `READ_MEDIA_IMAGES` | Low |
| 7 | Android 13+ Permission (Video) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `READ_MEDIA_VIDEO` | Low |
| 8 | Android 13+ Permission (Audio) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `READ_MEDIA_AUDIO` | Low |
| 9 | Legacy Storage Permission | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `READ_EXTERNAL_STORAGE` | Low |
| 10 | MediaStore Image Query | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `MediaStore.Images.Media` | Low |
| 11 | MediaStore Video Query | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `MediaStore.Video.Media` | Low |
| 12 | MediaStore Audio Query | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `MediaStore.Audio.Media` | Low |
| 13 | Cursor Pagination (Images) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Chunked `imgOffset` | Low |
| 14 | Cursor Pagination (Videos) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Chunked `vidOffset` | Low |
| 15 | Cursor Pagination (Audio) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Chunked `audOffset` | Low |
| 16 | UI Scanning Animation | Yes | Yes | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | `isNativeScanning` prop | Low |
| 17 | SAF Folder Picker (WhatsApp) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `ACTION_OPEN_DOCUMENT_TREE` | Low |
| 18 | SAF Folder Picker (Telegram) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `ACTION_OPEN_DOCUMENT_TREE` | Low |
| 19 | SAF Tree Traversal | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `DocumentFile.listFiles()` | Low |
| 20 | SAF Pagination | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Custom index offset | Low |
| 21 | Recursive Saf Directory Search | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Max depth 5 | Low |
| 22 | Scoped Storage Deletion (API 30+) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `createDeleteRequest` | Low |
| 23 | Direct Resolver Deletion (API < 30)| Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `resolver.delete` | Low |
| 24 | SAF Document Deletion | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `DocumentFile.delete()` | Low |
| 25 | Deletion UI Confirmation | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | `CleaningScreen.tsx` | Low |
| 26 | Fake Deletion Timers | Yes | Yes | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | `isBackendFinished` prop | Low |
| 27 | File Backup before Deletion | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Copies to `ion_backups` | Low |
| 28 | SHA-256 Checksum on Backup | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `MessageDigest("SHA-256")` | Low |
| 29 | File Restoration | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Copies back to `Downloads` | Low |
| 30 | Trash / Recycle Bin UI | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | `recycleBinManager.ts` | Low |
| 31 | 30-Day Auto Delete Worker | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `CleanupWorker.java` | Low |
| 32 | WorkManager Scheduling | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `enqueueUniquePeriodicWork`| Low |
| 33 | App Cache Deletion | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `getCacheDir().delete()` | Low |
| 34 | External Cache Deletion | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `getExternalCacheDir()` | Low |
| 35 | Duplicate File Detection (Hash) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `MessageDigest("MD5")` | Low |
| 36 | Similar Image Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | 9x8 Perceptual Hash | Low |
| 37 | Blurry Image Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Laplacian Variance | Low |
| 38 | Screenshot Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Keyword / Path check | Low |
| 39 | Large File Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Size > 50MB check | Low |
| 40 | Temp/Cache File Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Extension check | Low |
| 41 | APK/Residual File Detection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `.apk` extension check | Low |
| 42 | Video Compression Library | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `LightCompressor` | Low |
| 43 | Video Quality Selection | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Maps UI to Native enum | Low |
| 44 | Compression Async Progress | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `CompressionListener` | Low |
| 45 | Compressed File Save | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Saved to specific storage | Low |
| 46 | AdMob Banner UI | Yes | Yes | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | AdMob Capacitor Plugin | Low |
| 47 | AdMob Interstitial | No | No | No | No | No | No | N/A | No | ⚫ MISSING | Not in codebase | High |
| 48 | AdMob Native Init | No | No | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | Capacitor auto-registered | Low |
| 49 | Ads Pro Removal Logic | Yes | Yes | N/A | N/A | N/A | N/A | N/A | No | 🟠 PARTIAL | Frontend bool check | Med |
| 50 | Crashlytics Dependency | No | No | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | Firebase Crashlytics plugin | Low |
| 51 | Crashlytics Native Init | No | No | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | Capacitor auto-registered | Low |
| 52 | Security Scanner App List | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `getInstalledApplications` | Low |
| 53 | Malware Signature Scan | Yes | Yes | No | No | No | No | No | No | 🔴 FAILED | Only checks permissions | High |
| 54 | App Installer Source Check | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `getInstallSourceInfo` | Low |
| 55 | App Permission Risk Score | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Checks sensitive perms | Low |
| 56 | APK File Analysis | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `getPackageArchiveInfo` | Low |
| 57 | Firebase Email Signup | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Standard Firebase SDK | Low |
| 58 | Firebase Email Login | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Standard Firebase SDK | Low |
| 59 | Firebase Google Auth | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Standard Firebase SDK | Low |
| 60 | UI Auth Loading Timers | Yes | Yes | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | Firebase Auth SDK await | Low |
| 61 | User Profile Firestore | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `users/{userId}` | Low |
| 62 | Firestore Read Rules | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `auth.uid == userId` | Low |
| 63 | Firestore Write Rules | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Strict entitlement block | Low |
| 64 | Trial Expiry Enforcement | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Server & Client sync | Low |
| 65 | Trial Client Reset Vulnerability| Yes | Yes | N/A | N/A | N/A | N/A | No | No | 🟠 PARTIAL | Device wiping can reset | Med |
| 66 | Razorpay SDK Load | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `checkout.js` loading | Low |
| 67 | Create Payment Order | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Firebase HTTPS Callable | Low |
| 68 | Razorpay Order Creation | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Node Razorpay SDK | Low |
| 69 | Verify Payment Caller | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Firebase HTTPS Callable | Low |
| 70 | HMAC-SHA256 Signature | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `crypto.createHmac` | Low |
| 71 | Payment Fetch Verification | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Semantic verification | Low |
| 72 | Payment Amount Verification | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `payment.amount !== 15000` | Low |
| 73 | Payment Status Verification | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `payment.status !== 'captured'`| Low |
| 74 | Payment Idempotency | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Firestore Transaction | Low |
| 75 | Secure Profile Upgrade | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Server-side write only | Low |
| 76 | Support Ticket UI | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `HelpSupportScreen.tsx` | Low |
| 77 | Support Ticket Firestore | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Secure creation | Low |
| 78 | App Upgrade Modal | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | UI Component | Low |
| 79 | Fake Loading on Upgrade | Yes | Yes | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | Real Razorpay integration | Low |
| 80 | Category Details UI | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | UI Component | Low |
| 81 | Review Selection Filtering | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | Frontend array filter | Low |
| 82 | Native Bridge Check | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | `checkNativePlatform` | Low |
| 83 | Web Fallback Mode | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | Honest fallback states | Low |
| 84 | Push Notifications | No | No | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | @capacitor/push-notifications | Low |
| 85 | Analytics | No | No | No | No | No | No | N/A | No | 🟡 IMPLEMENTED | firebase/analytics SDK | Low |
| 86 | File Search by Name | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No | 🟡 IMPLEMENTED | Client-side filter | Low |
| 87 | Secret Isolation | No | No | Yes | Yes | Yes | Yes | Yes | No | 🟡 IMPLEMENTED | Env vars in Node.js | Low |
