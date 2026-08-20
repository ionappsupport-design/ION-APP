# ION — REMEDIATION VERIFICATION MATRIX

## Legend
- ✅ VERIFIED — confirmed by tool output or static analysis
- 🔲 PENDING — requires physical device + google-services.json
- ⚠️ BLOCKER — must be resolved before runtime verification can proceed

---

| Defect | Description | Build-time ✅ | Runtime 🔲 | Remaining Blockers |
|---|---|---|---|---|
| **P0-1** | AdMob initialises with real SDK | ✅ Plugin in capacitor.plugins.json | 🔲 | Real Ad Unit IDs in .env |
| **P0-1** | `initializeForTesting` environment-controlled | ✅ `isTesting()` reads VITE_ADMOB_TESTING | 🔲 | Set `VITE_ADMOB_TESTING=false` in prod |
| **P0-1** | Banner shown to non-Pro users | ✅ `showBanner(user.isLifetimePro)` | 🔲 | Device test required |
| **P0-1** | Banner hidden on Pro upgrade | ✅ `hideBanner()` in upgrade callback | 🔲 | Device test required |
| **P0-2** | Crashlytics enabled at startup | ✅ `initializeCrashlytics()` called | 🔲 ⚠️ | **google-services.json MISSING** |
| **P0-2** | User ID associated with crash reports | ✅ `setCrashlyticsUser(user.id)` wired | 🔲 | Device + google-services.json |
| **P0-2** | Non-fatal errors recorded | ✅ `recordNonFatalError()` in catch | 🔲 | Device + google-services.json |
| **P0-3** | Analytics `isSupported()` race fixed | ✅ `getAnalyticsInstance()` is async | ✅ | — |
| **P0-3** | No events silently dropped | ✅ All `trackEvent()` await analytics | ✅ | — |
| **P0-3** | `app_open` event fired | ✅ Called in `useEffect` startup | 🔲 | google-services.json + measurementId |
| **P0-4** | Android notification channel created | ✅ `LocalNotifications.createChannel()` | 🔲 | Device test required |
| **P0-4** | Local notifications reach OS | ✅ `scheduleLocalNotification()` | 🔲 | Device test required |
| **P0-4** | FCM registration token acquired | ✅ `PushNotifications.register()` | 🔲 ⚠️ | **google-services.json MISSING** |
| **P0-4** | FCM delivery honest (PENDING) | ✅ Documented as token-only | — | Server push sender needed (P2) |
| **P0-5** | No setTimeout in upgrade loading | ✅ Zero `setTimeout` in src/ | ✅ | — |
| **P1-1** | No auto-grant trial on cold start | ✅ `loadTrialState()` returns expired | ✅ | — |
| **P1-1** | Server trial state overwrites cache | ✅ `syncTrialFromServer(user)` | 🔲 | Device + Firestore data |
| **P1-1** | Client cannot write entitlement fields | ✅ Firestore rules checked (unchanged) | ✅ | — |
| **P1-2** | No hardcoded Firebase fallbacks | ✅ `requireEnv()` throws in prod | ✅ | — |
| **P1-2** | Missing env vars fail loud in prod | ✅ Hard throw in PROD mode | ✅ | — |
| **P1-3** | Scanner claims only privacy/permissions | ✅ UI text verified | ✅ | — |
| **P1-4** | No synthetic scan progress | ✅ Zero `setTimeout` in scan screens | ✅ | — |

---

## Build Verification (All Passed)

| Command | Exit | Output |
|---|---|---|
| `npm run lint` | **0** | Zero TypeScript errors |
| `npm run build` | **0** | 2784 modules, 7.23s |
| `cd functions && npm run build` | **0** | Clean |
| `npx cap sync android` | **0** | 7 plugins confirmed |
| `./gradlew clean assembleDebug` | **0** | BUILD SUCCESSFUL in 23s, 320 tasks |

---

## Pre-Runtime Checklist

Before runtime verification can be declared:

- [ ] ⚠️ `android/app/google-services.json` — obtain from Firebase Console
- [ ] `VITE_FIREBASE_*` vars set in `.env` (all 6 required fields)
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` set (for Analytics activation)
- [ ] `VITE_ADMOB_BANNER_ANDROID` set to real Ad Unit ID
- [ ] `VITE_ADMOB_TESTING=false` in production `.env`
- [ ] Replace AdMob APPLICATION_ID in `AndroidManifest.xml` with real App ID
- [ ] Run `npx cap sync android` after env changes
- [ ] Install APK on physical Android device
- [ ] Verify Crashlytics dashboard receives startup event
- [ ] Verify Analytics dashboard receives `app_open` event
- [ ] Verify banner ad renders for non-Pro users
- [ ] Verify banner disappears on Pro purchase

---

## Final Verdict

> **ARCHITECTURALLY REMEDIATED — RUNTIME VERIFICATION PENDING**
>
> All P0/P1 defects have been addressed at the code architecture level.
> The Capacitor → native plugin integration chain is correctly wired for all 7 plugins.
> The Firebase credential race condition is fixed.
> The trial enforcement now uses server-authoritative values.
> No fake timers, hardcoded credentials, or HTML ad placeholders remain.
>
> This cannot be declared PRODUCTION READY until `google-services.json` is placed at
> `android/app/google-services.json` and all items in the Pre-Runtime Checklist are
> verified on a physical Android device.
