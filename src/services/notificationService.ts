export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  type: 'storage_alert' | 'junk_warning' | 'performance' | 'trial';
  read: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'ion_notifications_history_v2';
const NUDGE_SCHEDULED_KEY = 'ion_15day_nudge_scheduled';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'web') {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  }

  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

export async function setupFCMAndScheduleNudge(freedBytes: number): Promise<void> {
  if (Capacitor.getPlatform() !== 'web') {
    try {
      // 1. Request FCM Permission (Android 13+ contextually)
      const permResult = await FirebaseMessaging.requestPermissions();
      if (permResult.receive === 'granted') {
        // 2. Get FCM Token (If a backend is added later, it will use this token)
        const { token } = await FirebaseMessaging.getToken();
        console.log('FCM Token generated:', token);

        // 3. Schedule 15-day delayed local notification (since no backend is provided)
        const hasScheduled = localStorage.getItem(NUDGE_SCHEDULED_KEY);
        if (!hasScheduled) {
          const freedGB = (freedBytes / (1024 * 1024 * 1024)).toFixed(1);
          
          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Unlock Lifetime Premium 👑',
                body: `You've freed ${freedGB} GB so far! Upgrade to Lifetime Premium for just ₹100 and keep your phone fast forever.`,
                id: 151515, // Unique ID for this specific nudge
                schedule: { at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }, // 15 days from now
                smallIcon: 'ic_stat_ion_notify',
              },
            ],
          });
          localStorage.setItem(NUDGE_SCHEDULED_KEY, 'true');
        }
      }
    } catch (e) {
      console.warn('Failed to setup FCM or schedule nudge:', e);
    }
  }
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function sendSmartNotification(
  title: string,
  body: string,
  type: AppNotification['type']
): Promise<void> {
  const note: AppNotification = {
    id: `notif_${Date.now()}`,
    title,
    body,
    timestamp: Date.now(),
    type,
    read: false,
  };

  const current = getStoredNotifications();
  const updated = [note, ...current].slice(0, 50);
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to store notification:', err);
  }

  if (Capacitor.getPlatform() !== 'web') {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Date.now() / 1000) % 2147483647, // Android requires int32 id
            channelId: 'ion_reminders',
            schedule: { at: new Date(Date.now() + 1000) }, // 1-second delay required by scheduler
            smallIcon: 'ic_stat_ion_notify',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  } else {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`ION: ${title}`, {
          body,
          icon: '/favicon.ico',
          tag: type,
        });
      } catch {
        // Fallback
      }
    }
  }
}
