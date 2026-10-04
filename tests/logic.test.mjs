// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  weekday, addDays, mondayOf, dayStatus, computeStreaks, sessionStatus, shouldProgress,
  buildItem, sessionTotals, lastPerformance, fmtNum,
} from '../js/logic.js';
import { defaultPlan, EXERCISES } from '../js/seed.js';
import { ILLUSTRATIONS } from '../js/illustrations.js';

const plan = defaultPlan();

// A session where `doneCount` of `total` exercises are completed.
function session(date, doneCount, total = 7) {
  const items = [];
  for (let i = 0; i < total; i++) {
    items.push({ exerciseId: `e${i}`, kind: 'weight', sets: [{ w: 20, r: 10, done: i < doneCount }, { w: 20, r: 10, done: i < doneCount }], manual: false });
  }
  return { date, items };
}

test('calendar basics', () => {
  assert.equal(weekday('2026-09-27'), 0, '27 Sep 2026 is a Sunday');
  assert.equal(weekday('2026-09-28'), 1);
  assert.equal(addDays('2026-09-30', 1), '2026-10-01');
  assert.equal(addDays('2026-03-28', 2), '2026-03-30', 'DST-safe');
  assert.equal(mondayOf('2026-10-04'), '2026-09-28');
});

test('80% threshold', () => {
  assert.equal(sessionStatus(session('x', 6, 7)), 'done'); // 85.7%
  assert.equal(sessionStatus(session('x', 5, 7)), 'partial'); // 71.4%
  assert.equal(sessionStatus(session('x', 0, 7)), 'missed');
  const manual = session('x', 0, 5);
  manual.items.forEach((i) => { i.manual = true; });
  assert.equal(sessionStatus(manual), 'done', 'manually checked exercises count');
});

test('streak continues across a Sunday', () => {
  const s = {
    '2026-09-25': session('2026-09-25', 7), // Fri
    '2026-09-26': session('2026-09-26', 6), // Sat
    // 27 Sunday: rest, no session
    '2026-09-28': session('2026-09-28', 7), // Mon
  };
  assert.deepEqual(computeStreaks(s, plan, '2026-09-28', '2026-09-25'), { current: 3, best: 3 });
  assert.equal(dayStatus('2026-09-27', undefined, plan, '2026-09-28'), 'rest');
});

test('missed training day resets the streak', () => {
  const s = {
    '2026-09-28': session('2026-09-28', 7), // Mon
    '2026-09-29': session('2026-09-29', 7), // Tue
    // Wed missing
    '2026-10-01': session('2026-10-01', 7), // Thu
  };
  assert.deepEqual(computeStreaks(s, plan, '2026-10-01', '2026-09-28'), { current: 1, best: 2 });
});

test('partial day resets the streak', () => {
  const s = {
    '2026-09-28': session('2026-09-28', 7),
    '2026-09-29': session('2026-09-29', 3),
    '2026-09-30': session('2026-09-30', 7),
  };
  assert.deepEqual(computeStreaks(s, plan, '2026-09-30', '2026-09-28'), { current: 1, best: 1 });
});

test('today pending does not break the streak; Sunday today is rest', () => {
  const s = { '2026-09-28': session('2026-09-28', 7), '2026-09-29': session('2026-09-29', 1) };
  assert.equal(computeStreaks(s, plan, '2026-09-29', '2026-09-28').current, 1);
  assert.equal(dayStatus('2026-09-29', s['2026-09-29'], plan, '2026-09-29'), 'today');
  const week = {};
  for (let d = '2026-09-28'; d <= '2026-10-03'; d = addDays(d, 1)) week[d] = session(d, 7);
  assert.equal(computeStreaks(week, plan, '2026-10-04', '2026-09-28').current, 6);
  assert.equal(dayStatus('2026-10-04', undefined, plan, '2026-10-04'), 'rest');
});

test('days before first launch are not counted as missed', () => {
  const s = { '2026-10-01': session('2026-10-01', 7) };
  assert.deepEqual(computeStreaks(s, plan, '2026-10-01', '2026-10-01'), { current: 1, best: 1 });
});

test('progression hint only when every set hit the top of the range', () => {
  const planItem = { sets: 3, repMin: 8, repMax: 12 };
  const mk = (reps) => ({ item: { sets: reps.map((r) => ({ w: 20, r, done: true })) } });
  assert.equal(shouldProgress(mk([12, 12, 12]), planItem, 'weight'), true);
  assert.equal(shouldProgress(mk([12, 12, 11]), planItem, 'weight'), false);
  assert.equal(shouldProgress(mk([12, 12]), planItem, 'weight'), false);
  assert.equal(shouldProgress(mk([12, 12, 12]), planItem, 'time'), false);
});

test('prefill from last performance', () => {
  const planItem = { exerciseId: 'bench', sets: 3, repMin: 8, repMax: 12, weight: 20 };
  const fresh = buildItem(planItem, 'weight', null);
  assert.deepEqual(fresh.sets.map((s) => [s.w, s.r]), [[20, 8], [20, 8], [20, 8]]);
  const sessions = [{ date: '2026-09-28', items: [{ exerciseId: 'bench', sets: [{ w: 22.5, r: 12, done: true }, { w: 22.5, r: 10, done: true }] }] }];
  const last = lastPerformance(sessions, 'bench', '2026-10-01');
  const pre = buildItem(planItem, 'weight', last);
  assert.deepEqual(pre.sets.map((s) => [s.w, s.r, s.done]), [[22.5, 12, false], [22.5, 10, false], [22.5, 10, false]]);
});

test('totals', () => {
  const s = {
    startedAt: 0, finishedAt: 45 * 60000,
    items: [
      { kind: 'cardio', sets: [{ r: 10, done: true }] },
      { kind: 'weight', sets: [{ w: 20, r: 10, done: true }, { w: 20, r: 8, done: false }] },
      { kind: 'time', sets: [{ w: 0, r: 40, done: true }] },
    ],
  };
  assert.deepEqual(sessionTotals(s), { sets: 2, volume: 200, minutes: 45 });
  assert.equal(fmtNum(12345.5), '12 345,5');
});

test('service worker precaches every app file (full offline use)', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  const assets = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]);
  const walk = (dir) => readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  for (const f of [...walk('js'), ...walk('css'), ...walk('icons'), 'index.html', 'manifest.json']) {
    assert.ok(assets.includes(f), `${f} missing from sw.js ASSETS`);
  }
});

test('every exercise has a guide and an illustration; plan references are valid', () => {
  for (const ex of EXERCISES) {
    assert.ok(ILLUSTRATIONS[ex.id], `illustration for ${ex.id}`);
    for (const k of ['position', 'steps', 'breathing', 'mistakes']) assert.ok(ex.guide[k]?.length, `${ex.id}.${k}`);
    assert.ok(ex.guide.mistakes.length >= 3, `${ex.id} has 3+ mistakes`);
    assert.ok(ex.guide.safety, `${ex.id}.safety`);
  }
  const ids = new Set(EXERCISES.map((e) => e.id));
  for (const day of plan) for (const it of day.items) assert.ok(ids.has(it.exerciseId), it.exerciseId);
  assert.deepEqual(plan.map((d) => d.day), [1, 2, 3, 4, 5, 6]);
  assert.ok(plan.every((d) => d.items[0].exerciseId === 'treadmill'), 'every day starts with warm-up');
});
