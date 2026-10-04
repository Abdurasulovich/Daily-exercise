import { initStore, state, saveSetting, flushPending, allDone } from './store.js';
import { today as getToday, setTodayOverride, weekday, planFor, sessionRatio, DONE_THRESHOLD } from './logic.js';
import { toast, icon } from './ui.js';
import * as N from './notify.js';
import { stop as stopRest } from './timer.js';
import * as Today from './views/today.js';
import * as Library from './views/library.js';
import * as Progress from './views/progress.js';
import * as Settings from './views/settings.js';

// Dev/testing aid: ?today=2026-10-05 pretends that date is today.
setTodayOverride(new URLSearchParams(location.search).get('today'));

const ROUTES = [
  { re: /^#\/bugun$/, tab: 'bugun', view: Today },
  { re: /^#\/mashqlar\/(?<id>[^/]+)$/, tab: 'mashqlar', view: Library },
  { re: /^#\/mashqlar$/, tab: 'mashqlar', view: Library },
  { re: /^#\/natijalar\/kun\/(?<date>\d{4}-\d{2}-\d{2})$/, tab: 'natijalar', view: Progress },
  { re: /^#\/natijalar$/, tab: 'natijalar', view: Progress },
  { re: /^#\/sozlamalar$/, tab: 'sozlamalar', view: Settings },
];

const TABS = [
  ['bugun', 'Bugun', icon.today],
  ['mashqlar', 'Mashqlar', icon.dumbbell],
  ['natijalar', 'Natijalar', icon.chart],
  ['sozlamalar', 'Sozlamalar', icon.gear],
];

const app = document.getElementById('app');
const nav = document.querySelector('.tabbar');
nav.innerHTML = TABS.map(([id, label, ic]) => `<a href="#/${id}" data-tab="${id}">${ic}<span>${label}</span></a>`).join('');

let renderId = 0;
async function route() {
  const hash = location.hash || '#/bugun';
  const r = ROUTES.find((x) => x.re.test(hash));
  if (!r) { location.replace('#/bugun'); return; }
  const params = hash.match(r.re).groups || {};
  nav.querySelectorAll('a').forEach((a) => {
    if (a.dataset.tab === r.tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  flushPending();
  // Fresh container per render so old views' event listeners are dropped.
  const id = ++renderId;
  const view = document.createElement('div');
  await r.view.render(view, params);
  if (id !== renderId) return;
  app.replaceChildren(view);
  window.scrollTo(0, 0);
}

function reminderDue() {
  const t = getToday();
  const s = state.settings;
  if (!s.reminderDays.includes(weekday(t))) return null;
  const day = planFor(state.plan, weekday(t));
  if (!day || weekday(t) === 0) return null;
  const session = state.sessions[t];
  if (session && (allDone(session) || sessionRatio(session) >= DONE_THRESHOLD)) return null;
  return day;
}

async function maybeNotifyReminder() {
  const s = state.settings;
  if (!s.reminderEnabled || s.lastReminderDate === getToday()) return;
  const day = reminderDue();
  if (!day) return;
  if (await N.notify('Mashq Kundaligi', N.reminderText(day.title, s.gymTime), 'daily-reminder')) {
    await saveSetting('lastReminderDate', getToday());
  }
}

async function boot() {
  try {
    await initStore();
  } catch (e) {
    app.innerHTML = `<div class="card"><h2>Ma’lumotlar bazasi ochilmadi</h2><p class="muted">${String(e.message || e)}</p>
      <p>Brauzer “maxfiy rejim”da bo‘lsa, oddiy rejimda oching.</p></div>`;
    return;
  }

  // Ask the browser not to evict our data (first launch; harmless to repeat).
  if (navigator.storage?.persist && !state.settings.persisted) {
    try { await saveSetting('persisted', await navigator.storage.persist()); } catch { /* ignore */ }
  }

  window.addEventListener('hashchange', route);
  await route();

  // Save anything still being typed when the app goes to the background;
  // re-render if the app is resumed on a new day.
  let lastDay = getToday();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPending();
    else if (getToday() !== lastDay) { lastDay = getToday(); stopRest(); route(); }
  });
  window.addEventListener('pagehide', flushPending);

  // In-page reminder for while the app stays open in the background.
  N.scheduleInPage(state.settings.reminderTime, maybeNotifyReminder);
  if (state.settings.reminderEnabled && N.permission() === 'granted') N.registerPeriodicSync();

  registerSW();
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const offerUpdate = (w) => toast('Yangi versiya tayyor', {
      action: 'Yangilash', ms: 15000, onAction: () => w.postMessage({ type: 'SKIP_WAITING' }),
    });
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(w);
      });
    });
  }).catch((e) => console.warn('SW registration failed', e));
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
}

boot();
