/* Mashq Kundaligi service worker.
 * Bump VERSION on every deploy (and APP_VERSION in js/version.js): the new worker
 * precaches everything under a new cache name and deletes the old one on activate. */
const VERSION = '1.0.0';
const CACHE = `mashq-${VERSION}`;
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/backup.js',
  'js/charts.js',
  'js/db.js',
  'js/figure.js',
  'js/illustrations.js',
  'js/install.js',
  'js/logic.js',
  'js/notify.js',
  'js/seed.js',
  'js/store.js',
  'js/timer.js',
  'js/ui.js',
  'js/version.js',
  'js/views/library.js',
  'js/views/progress.js',
  'js/views/settings.js',
  'js/views/today.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/badge-96.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))),
  );
  // First install activates immediately; updates wait for the user's "Yangilash" tap.
  if (!self.registration.active) self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('mashq-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Cache-first for our own files; the app shell answers every navigation offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('index.html').then((r) => r || fetch(req)));
    return;
  }
  event.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const c = await caches.open(CACHE);
      c.put(req, res.clone());
    }
    return res;
  })());
});

// ---------------- reminders ----------------
// Minimal read-only access to the app's IndexedDB (no upgrades from here).
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('mashq-kundaligi');
    req.onupgradeneeded = () => req.transaction.abort(); // DB doesn't exist yet: don't create it
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const get = (db, store, key) => new Promise((res, rej) => {
  const r = db.transaction(store).objectStore(store).get(key);
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const put = (db, store, value) => new Promise((res, rej) => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(value);
  tx.oncomplete = res;
  tx.onerror = () => rej(tx.error);
});
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const itemDone = (i) => !!i.manual || (i.sets.length > 0 && i.sets.every((s) => s.done));

async function checkReminder() {
  let db;
  try { db = await openDB(); } catch { return; }
  const setting = async (k, d) => ((await get(db, 'settings', k)) || { value: d }).value;
  if (!(await setting('reminderEnabled', false))) return;
  const now = new Date();
  const today = ymd(now);
  const wd = now.getDay();
  if (wd === 0 || !(await setting('reminderDays', [1, 2, 3, 4, 5, 6])).includes(wd)) return;
  if ((await setting('lastReminderDate', null)) === today) return;
  const [h, m] = (await setting('reminderTime', '17:00')).split(':').map(Number);
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  const plan = await get(db, 'plan', wd);
  if (!plan || !plan.items.length) return;
  const session = await get(db, 'sessions', today);
  if (session && session.items.filter(itemDone).length / session.items.length >= 0.8) return;
  const gym = await setting('gymTime', '18:00');
  await self.registration.showNotification('Mashq Kundaligi', {
    body: `Bugun ${plan.title} kuni — ${gym} da zalda ko‘rishamiz!`,
    tag: 'daily-reminder',
    icon: 'icons/icon-192.png',
    badge: 'icons/badge-96.png',
    data: { url: './#/bugun' },
  });
  await put(db, 'settings', { key: 'lastReminderDate', value: today });
}

// Android Chrome, installed PWA: fires roughly every 12+ hours at the browser's discretion.
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') event.waitUntil(checkReminder());
});

// Ready for a future Web Push backend: payload {title, body, url}.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'Mashq Kundaligi', {
    body: data.body || 'Bugungi mashg‘ulotni unutmang!',
    tag: data.tag || 'push',
    icon: 'icons/icon-192.png',
    badge: 'icons/badge-96.png',
    data: { url: data.url || './#/bugun' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || './#/bugun', self.registration.scope).href;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        await w.focus();
        return w.navigate?.(url);
      }
    }
    return self.clients.openWindow(url);
  })());
});
