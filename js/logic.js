// Pure logic: dates, day status, streaks, totals, progression. No DOM, no DB.

export const DONE_THRESHOLD = 0.8;
export const DAY_NAMES = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
export const DAY_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
export const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

// ---------- dates (local time, 'YYYY-MM-DD') ----------
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// The app's notion of "today". Overridable for testing via ?today=YYYY-MM-DD.
let todayOverride = null;
export const setTodayOverride = (s) => { todayOverride = /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : null; };
export const today = () => todayOverride || ymd();
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
export const weekday = (s) => parseYmd(s).getDay(); // 0 = Sunday
export const mondayOf = (s) => addDays(s, -((weekday(s) + 6) % 7));
export const fmtDate = (s, withYear = true) => {
  const d = parseYmd(s);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}${withYear ? `, ${d.getFullYear()}` : ''}`;
};
export const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);

// ---------- formatting ----------
export const fmtNum = (n) => {
  const r = Math.round(n * 10) / 10;
  const [i, f] = String(r).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (f ? `,${f}` : '');
};
export const fmtKg = (n) => `${fmtNum(n)} kg`;
export const fmtClock = (sec) => `${Math.floor(sec / 60)}:${pad(Math.max(0, Math.floor(sec % 60)))}`;
export const fmtDuration = (min) => {
  if (!min || min < 1) return '—';
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? `${h} soat ${m} daq` : `${m} daq`;
};

// ---------- plan / items ----------
export const planFor = (plan, wd) => plan.find((p) => p.day === wd && p.items.length);
export const isTrainingWeekday = (plan, wd) => wd !== 0 && !!planFor(plan, wd);

export const itemDone = (item) => !!item.manual || (item.sets.length > 0 && item.sets.every((s) => s.done));

export function sessionRatio(session) {
  if (!session?.items?.length) return 0;
  return session.items.filter(itemDone).length / session.items.length;
}

export function sessionStatus(session) {
  const r = sessionRatio(session);
  if (r >= DONE_THRESHOLD) return 'done';
  const touched = r > 0 || session?.items?.some((i) => i.sets.some((s) => s.done));
  return touched ? 'partial' : 'missed';
}

/**
 * 'rest' | 'future' | 'today' (pending, not yet done) | 'done' | 'partial' | 'missed'
 * Sundays are always rest. Days without a session fall back to the current plan.
 */
export function dayStatus(date, session, plan, today) {
  if (date > today) return 'future';
  const wd = weekday(date);
  if (wd === 0) return 'rest';
  if (!session && !isTrainingWeekday(plan, wd)) return 'rest';
  if (session && !session.items.length) return 'rest';
  const st = session ? sessionStatus(session) : 'missed';
  if (date === today && st !== 'done') return 'today';
  return st;
}

/**
 * Streak = consecutive training days counted as done (≥80% of exercises).
 * Rest days (Sundays) are skipped and never break it. A missed or partial
 * training day resets it. Today doesn't break it while it is still pending.
 */
export function computeStreaks(sessions, plan, today, startDate) {
  const dates = Object.keys(sessions).sort();
  let start = startDate || today;
  if (dates.length && dates[0] < start) start = dates[0];
  let run = 0, best = 0;
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const st = dayStatus(d, sessions[d], plan, today);
    if (st === 'done') { run++; best = Math.max(best, run); }
    else if (st === 'partial' || st === 'missed') run = 0;
  }
  return { current: run, best };
}

export function countDone(sessions, plan, from, to, today) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (dayStatus(d, sessions[d], plan, today) === 'done') n++;
  }
  return n;
}

export const totalDone = (sessions) => Object.values(sessions).filter((s) => s.items.length && sessionStatus(s) === 'done').length;

// ---------- totals ----------
export function sessionTotals(session) {
  let sets = 0, volume = 0;
  for (const it of session?.items || []) {
    if (it.kind === 'cardio') continue;
    for (const s of it.sets) {
      if (!s.done) continue;
      sets++;
      if ((it.kind === 'weight' || it.kind === 'reps') && s.w > 0 && s.r > 0) volume += s.w * s.r;
    }
  }
  let minutes = 0;
  if (session?.startedAt != null && session?.finishedAt != null) minutes = (session.finishedAt - session.startedAt) / 60000;
  return { sets, volume, minutes };
}

// ---------- history / progression ----------
/** Most recent item for an exercise before `beforeDate` that has at least one done set. */
export function lastPerformance(sessionsDesc, exerciseId, beforeDate) {
  for (const s of sessionsDesc) {
    if (s.date >= beforeDate) continue;
    const it = s.items.find((i) => i.exerciseId === exerciseId && i.sets.some((x) => x.done));
    if (it) return { date: s.date, item: it };
  }
  return null;
}

/** True when every planned set hit the top of the rep range last time. */
export function shouldProgress(last, planItem, kind) {
  if (!last || kind !== 'weight' || !planItem.repMax) return false;
  const done = last.item.sets.filter((s) => s.done);
  return done.length >= planItem.sets && done.every((s) => Number(s.r) >= planItem.repMax);
}

export function defaultReps(planItem, kind) {
  if (kind === 'cardio') return planItem.repMax ?? 10;
  return planItem.repMin ?? '';
}

/** Build today's item from the plan, prefilled with the last values used. */
export function buildItem(planItem, kind, last) {
  const prev = last?.item.sets || [];
  const n = kind === 'cardio' ? 1 : planItem.sets;
  const sets = [];
  for (let i = 0; i < n; i++) {
    const src = prev[i] || prev[prev.length - 1];
    sets.push({
      w: src?.w ?? planItem.weight ?? 0,
      r: src?.r ?? defaultReps(planItem, kind),
      done: false,
    });
  }
  return {
    exerciseId: planItem.exerciseId,
    kind,
    target: { sets: planItem.sets, repMin: planItem.repMin, repMax: planItem.repMax, rest: planItem.rest },
    sets,
    manual: false,
  };
}

export function exerciseHistory(sessionsAsc, exerciseId) {
  const out = [];
  for (const s of sessionsAsc) {
    const it = s.items.find((i) => i.exerciseId === exerciseId);
    if (!it) continue;
    const done = it.sets.filter((x) => x.done);
    if (!done.length) continue;
    out.push({
      date: s.date,
      maxW: Math.max(...done.map((x) => Number(x.w) || 0)),
      volume: done.reduce((a, x) => a + (Number(x.w) || 0) * (Number(x.r) || 0), 0),
      bestReps: Math.max(...done.map((x) => Number(x.r) || 0)),
    });
  }
  return out;
}

export const normalize = (s) => s.toLowerCase().replace(/[‘’ʻʼ'`]/g, "'");
