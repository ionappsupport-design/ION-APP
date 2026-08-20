# ION — FINAL PRODUCTION TEST MATRIX

**Status:** `PENDING` (Requires Physical Android Device)

## 1. Storage & SAF (Storage Access Framework)
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| Initial Scan | Trigger main storage scan on device with >1000 files. | Accurate file count and total size via Native Bridge without OOM errors. | `PENDING` |
| Junk Strict Rules | Run junk detection. | Only files matching `/cache/`, `.tmp`, `.log`, etc., are marked as junk. | `PENDING` |
| Physical Deletion | Delete a batch of junk files. | Files are physically removed from device via `MediaStore` or `DocumentFile`. | `PENDING` |
| WhatsApp SAF | Scan WhatsApp folder using SAF. | Nested statuses, voice notes, and sent videos are accurately categorized. | `PENDING` |

## 2. Advanced Media Processing
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| Image Blur Detection | Run duplicate/similar scanner on identical and blurry photos. | `getBlurScore` uses Laplacian variance; `getPerceptualHash` identifies duplicates. | `PENDING` |
| Video Compression | Trigger compression on a large video file (>50MB). | `LightCompressor` processes the video. Output size is significantly reduced; original is intact until explicit deletion. | `PENDING` |

## 3. Background Services & Workers
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| Auto-Clean Schedule | Enable Smart Auto-Clean from settings. | `WorkManager` enqueues the task. Periodic background cleanup executes successfully. | `PENDING` |
| Doze Mode Resilience | Put device to sleep, simulate Doze mode. | Scheduled worker respects network/battery constraints and runs during maintenance windows. | `PENDING` |
| 30-Day Backup Expiry | Advance system clock by 31 days with items in Recycle Bin. | Worker triggers recursive physical deletion of expired backups. | `PENDING` |
| Local Notifications | Trigger an expiry sweep event. | Capacitor Local Notifications dispatches a genuine Android push notification. | `PENDING` |

## 4. Cloud Integration (Firebase)
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| Authentication | Sign in with Email and Google. | Firebase Auth processes request. Session persists. Automatic 3-day trial is issued via Firestore hook. | `PENDING` |
| Payment Flow | Trigger a payment checkout. | `paymentService` triggers Firebase Functions to securely verify the Razorpay order ID in Firestore. | `PENDING` |
| Support Ticketing | Submit a support ticket from Help & Support. | A new document is successfully written to the `support_tickets` Firestore collection securely. | `PENDING` |
| Analytics & Crashlytics | Perform key app events; trigger a forced exception. | Firebase Analytics logs events in real-time. Crashlytics uploads non-fatal and fatal exception reports natively. | `PENDING` |

## 5. Security & Permissions
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| App Scanner | Run the Security & Privacy app scan. | `PackageManager` returns a list of installed apps. Apps with excessive permissions are flagged. | `PENDING` |
| Permission Request | Fresh install, request storage permissions. | Android 13+ prompts for POST_NOTIFICATIONS and media. Legacy Android prompts for READ_EXTERNAL_STORAGE. | `PENDING` |

## 6. Monetization
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| Native AdMob | View Dashboard screen without Pro entitlement. | Real AdMob banner loads at the bottom of the screen using `.env` configured Publisher IDs. | `PENDING` |
