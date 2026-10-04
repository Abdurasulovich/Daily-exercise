// Notifications. What works WITHOUT a server (see README for platform details):
//  1. In-app reminder banner when the app is opened and today's workout isn't done.
//  2. A timer while the app is open/backgrounded that fires at the reminder time.
//  3. Periodic Background Sync (Android Chrome, installed PWA) — the service worker
//     wakes up roughly every 12 h at the browser's discretion and checks the DB.
//  4. Rest-timer notifications.
// Web Push (reliable, scheduled reminders) needs a backend: see subscribePush().

export const supported = () => 'Notification' in window;
export const permission = () => (supported() ? Notification.permission : 'unsupported');

export async function requestPermission() {
  if (!supported()) return 'unsupported';
  return Notification.requestPermission();
}

export async function notify(title, body, tag = 'mashq') {
  if (permission() !== 'granted') return false;
  const opts = { body, tag, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', vibrate: [200, 100, 200], data: { url: './#/bugun' } };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(title, opts); return true; }
    new Notification(title, opts);
    return true;
  } catch (e) {
    console.warn('notification failed', e);
    return false;
  }
}

export const reminderText = (title, gymTime) => `Bugun ${title} kuni — ${gymTime} da zalda ko‘rishamiz!`;

/** Ask Chrome for a periodic wake-up (only works for installed PWAs on Chromium). */
export async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (!reg || !('periodicSync' in reg)) return 'unsupported';
    const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (st.state !== 'granted') return 'denied';
    await reg.periodicSync.register('daily-reminder', { minInterval: 12 * 60 * 60 * 1000 });
    return 'registered';
  } catch {
    return 'unsupported';
  }
}

export async function unregisterPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker?.ready;
    await reg?.periodicSync?.unregister('daily-reminder');
  } catch { /* ignore */ }
}

let pageTimer;
/** While the page is alive, fire the reminder at today's reminder time. */
export function scheduleInPage(reminderTime, fire) {
  clearTimeout(pageTimer);
  const [h, m] = reminderTime.split(':').map(Number);
  const at = new Date();
  at.setHours(h, m, 0, 0);
  const ms = at - Date.now();
  if (ms > 0 && ms < 24 * 3600 * 1000) pageTimer = setTimeout(fire, ms);
}

/**
 * Future: Web Push. Call this after adding a backend that stores subscriptions
 * and sends pushes on schedule (see README → “Web Push qo‘shish”).
 */
export async function subscribePush({ vapidPublicKey, endpoint }) {
  const reg = await navigator.serviceWorker.ready;
  const key = Uint8Array.from(atob(vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
  return sub;
}
