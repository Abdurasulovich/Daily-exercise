// App state + persistence. Everything is saved to IndexedDB as soon as it changes.
import { db, getSettings, setSetting, DB_VERSION } from './db.js';
import { EXERCISES, defaultPlan, DEFAULT_SETTINGS } from './seed.js';
import { ymd, today as getToday, weekday, planFor, buildItem, lastPerformance, computeStreaks, itemDone } from './logic.js';

export const APP_ID = 'mashq-kundaligi';
export const EXPORT_VERSION = 1;

export const state = {
  exercises: new Map(), // id -> record (+ guide for built-ins)
  plan: [],
  settings: { ...DEFAULT_SETTINGS },
  sessions: {}, // date -> session
  bodyWeights: [],
};

const toRecord = (e) => ({
  id: e.id, name: e.name, gymName: e.gymName, group: e.group, kind: e.kind,
  muscles: e.muscles, step: e.step ?? 2.5, perSide: !!e.perSide, builtin: true,
});

export async function initStore() {
  // Seed / top up built-in exercises (new app versions may add more).
  const stored = await db.all('exercises');
  const have = new Set(stored.map((e) => e.id));
  const missing = EXERCISES.filter((e) => !have.has(e.id)).map(toRecord);
  if (missing.length) await db.putMany('exercises', missing);

  let plan = await db.all('plan');
  if (!plan.length) {
    plan = defaultPlan();
    await db.putMany('plan', plan);
  }
  state.settings = await getSettings(DEFAULT_SETTINGS);
  if (!state.settings.firstLaunch) await saveSetting('firstLaunch', ymd());
  await reload();
}

export async function reload() {
  const [exs, plan, sessions, bw, settings] = await Promise.all([
    db.all('exercises'), db.all('plan'), db.all('sessions'), db.all('bodyWeights'), getSettings(DEFAULT_SETTINGS),
  ]);
  state.exercises = new Map(exs.map((e) => {
    const builtin = EXERCISES.find((b) => b.id === e.id);
    return [e.id, builtin ? { ...e, guide: builtin.guide } : e];
  }));
  state.plan = plan.sort((a, b) => a.day - b.day);
  state.sessions = Object.fromEntries(sessions.map((s) => [s.date, s]));
  state.bodyWeights = bw.sort((a, b) => a.date.localeCompare(b.date));
  state.settings = settings;
}

export const exercise = (id) => state.exercises.get(id) || { id, name: id, gymName: '', group: 'Boshqa', kind: 'weight', muscles: [], step: 2.5 };

export async function saveSetting(key, value) {
  state.settings[key] = value;
  await setSetting(key, value);
}

// ---------- sessions ----------
const sessionsDesc = () => Object.values(state.sessions).sort((a, b) => b.date.localeCompare(a.date));
export const sessionsAsc = () => Object.values(state.sessions).sort((a, b) => a.date.localeCompare(b.date));

export function lastFor(exerciseId, beforeDate) {
  return lastPerformance(sessionsDesc(), exerciseId, beforeDate);
}

function buildSession(date) {
  const day = planFor(state.plan, weekday(date));
  if (!day || weekday(date) === 0) return null;
  return {
    date,
    type: day.type,
    title: day.title,
    items: day.items.map((pi) => {
      const kind = exercise(pi.exerciseId).kind;
      return buildItem(pi, kind, lastFor(pi.exerciseId, date));
    }),
    notes: '',
    startedAt: null,
    finishedAt: null,
    celebrated: false,
  };
}

/** Today's session, created from the plan (and saved) the first time it is opened. */
export async function ensureSession(date) {
  if (state.sessions[date]) return state.sessions[date];
  const s = buildSession(date);
  if (!s) return null;
  await saveSession(s);
  return s;
}

/** After a plan edit, rebuild today's session if nothing has been logged yet. */
export async function refreshUntouched(date) {
  const s = state.sessions[date];
  if (!s) return;
  const touched = s.items.some((i) => i.manual || i.sets.some((x) => x.done)) || s.notes;
  if (touched) return;
  delete state.sessions[date];
  await db.del('sessions', date);
  await ensureSession(date);
}

const pending = new Map();
/** Save immediately, or debounced (for typing) when `delay` is given. */
export function saveSession(session, delay = 0) {
  state.sessions[session.date] = session;
  clearTimeout(pending.get(session.date)?.t);
  if (!delay) {
    pending.delete(session.date);
    return db.put('sessions', session);
  }
  const t = setTimeout(() => { pending.delete(session.date); db.put('sessions', session); }, delay);
  pending.set(session.date, { t, session });
  return Promise.resolve();
}
export function flushPending() {
  for (const [date, { t, session }] of pending) {
    clearTimeout(t);
    db.put('sessions', session);
    pending.delete(date);
  }
}

export const streaks = (today = getToday()) => computeStreaks(state.sessions, state.plan, today, state.settings.firstLaunch);
export const allDone = (s) => s.items.length > 0 && s.items.every(itemDone);

// ---------- plan ----------
export async function savePlanDay(day) {
  const i = state.plan.findIndex((p) => p.day === day.day);
  if (i >= 0) state.plan[i] = day; else state.plan.push(day);
  await db.put('plan', day);
}
export async function resetPlan() {
  const plan = defaultPlan();
  await db.putMany('plan', plan);
  state.plan = plan;
}
export async function addCustomExercise({ name, group, kind }) {
  const rec = { id: `c-${Date.now().toString(36)}`, name, gymName: '', group, kind, muscles: [], step: 2.5, perSide: false, builtin: false };
  await db.put('exercises', rec);
  state.exercises.set(rec.id, rec);
  return rec;
}

// ---------- body weight ----------
export async function saveBodyWeight(date, kg) {
  await db.put('bodyWeights', { date, kg });
  state.bodyWeights = [...state.bodyWeights.filter((b) => b.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date));
}
export async function deleteBodyWeight(date) {
  await db.del('bodyWeights', date);
  state.bodyWeights = state.bodyWeights.filter((b) => b.date !== date);
}

// ---------- backup ----------
export async function exportData() {
  flushPending();
  const data = await db.dump();
  return { app: APP_ID, exportVersion: EXPORT_VERSION, dbVersion: DB_VERSION, exportedAt: new Date().toISOString(), data };
}

export function validateImport(json) {
  if (!json || json.app !== APP_ID || typeof json.data !== 'object') throw new Error('Bu fayl Mashq Kundaligi zaxira nusxasi emas.');
  if (json.exportVersion > EXPORT_VERSION) throw new Error('Fayl ilovaning yangiroq versiyasida yaratilgan. Avval ilovani yangilang.');
  const d = json.data;
  for (const k of ['plan', 'sessions', 'settings']) if (!Array.isArray(d[k])) throw new Error(`Faylda “${k}” bo‘limi yo‘q.`);
  if (!d.sessions.every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date) && Array.isArray(s.items))) throw new Error('Mashg‘ulot yozuvlari buzilgan.');
  return d;
}

export async function importData(json) {
  const d = validateImport(json);
  await db.replaceAll({ exercises: d.exercises || [], plan: d.plan, sessions: d.sessions, bodyWeights: d.bodyWeights || [], settings: d.settings });
  await initStore(); // re-seed anything missing (e.g. built-in exercises)
}

export async function clearAll() {
  await db.replaceAll({});
  state.sessions = {};
  await initStore();
}
