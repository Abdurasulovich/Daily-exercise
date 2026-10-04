import {
  state, exercise, ensureSession, saveSession, lastFor, streaks, allDone, saveSetting,
} from '../store.js';
import {
  ymd, today as getToday, weekday, fmtDate, DAY_NAMES, DAY_SHORT, itemDone, sessionRatio, sessionTotals, shouldProgress,
  fmtNum, fmtClock, fmtDuration, mondayOf, addDays, dayStatus, planFor, DONE_THRESHOLD,
} from '../logic.js';
import { illustration } from '../illustrations.js';
import { esc, icon, openSheet, el } from '../ui.js';
import { openGuide } from './library.js';
import { startRest } from '../timer.js';
import { backupDue, exportToFile } from '../backup.js';
import { reminderText } from '../notify.js';

const collapsed = new Set(); // per-render UI state: card indexes the user collapsed/expanded
const expanded = new Set();

export async function render(root) {
  const today = getToday();
  collapsed.clear();
  expanded.clear();
  const wd = weekday(today);
  const day = planFor(state.plan, wd);
  if (wd === 0 || !day) return renderRest(root, today);

  const session = await ensureSession(today);
  root.innerHTML = `<div class="today-head"></div><div class="banners"></div><div class="cards"></div>
    <div class="card"><label class="field"><span>Kun haqida eslatma (energiya, og‘riq, kayfiyat…)</span>
    <textarea data-notes placeholder="Masalan: yaxshi uxladim, chap yelkada biroz og‘riq">${esc(session.notes)}</textarea></label></div>
    <div class="finish-zone"></div>`;

  const head = root.querySelector('.today-head');
  const cards = root.querySelector('.cards');
  const finishZone = root.querySelector('.finish-zone');

  const drawHead = () => {
    const n = session.items.filter(itemDone).length;
    const total = session.items.length;
    const { current } = streaks(today);
    head.innerHTML = `
      <div class="date">${fmtDate(today)}</div>
      <h1>${DAY_NAMES[wd]} — ${esc(session.title)} kuni</h1>
      <div class="progress" aria-label="Bajarilgan mashqlar">
        <div class="bar"><span style="width:${(n / total) * 100}%"></span></div>
        <div class="count">${n} / ${total}</div></div>
      <div class="streak-pill">${icon.flame}${current} kun ketma-ket</div>`;
    const ratio = sessionRatio(session);
    finishZone.innerHTML = ratio >= DONE_THRESHOLD && !allDone(session) && !session.finishedAt
      ? `<button class="btn btn-ok btn-block" data-finish>${icon.check} Mashg‘ulotni yakunlash (${Math.round(ratio * 100)}%)</button>`
      : session.finishedAt ? `<button class="btn btn-block" data-summary>Bugungi natija</button>` : '';
  };

  const drawCard = (i) => {
    const html = cardHTML(session, i, today);
    const old = cards.querySelector(`[data-i="${i}"]`);
    const node = el(html);
    if (old) old.replaceWith(node); else cards.append(node);
  };

  drawHead();
  drawBanners(root.querySelector('.banners'), session, day);
  session.items.forEach((_, i) => drawCard(i));

  const save = (delay = 0) => saveSession(session, delay);

  const afterDoneChange = (i) => {
    drawCard(i);
    drawHead();
    if (allDone(session)) {
      if (!session.finishedAt) session.finishedAt = Date.now();
      if (!session.celebrated) {
        session.celebrated = true;
        save();
        drawHead();
        celebrate(session, today);
        return;
      }
    } else if (sessionRatio(session) < DONE_THRESHOLD) {
      session.finishedAt = null;
    }
    save();
  };

  root.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-toggle], [data-guide]');
    if (!t) return;
    const card = t.closest('[data-i]');
    const i = card ? Number(card.dataset.i) : -1;
    const item = session.items[i];

    if (t.matches('[data-set-check]')) {
      const j = Number(t.closest('[data-j]').dataset.j);
      const set = item.sets[j];
      if (doubleTap(set)) return;
      syncInputs(card, item);
      set.done = !set.done;
      if (set.done) {
        session.startedAt ??= Date.now();
        set.at = Date.now();
        if (item.kind !== 'cardio' && !allDone(session)) {
          const rest = item.target.rest ?? state.settings.restDefault;
          startRest(rest, itemDone(item) ? 'Keyingi mashqqa tayyorlaning' : `${j + 2}-set oldidan dam`);
        }
      }
      expanded.delete(i);
      afterDoneChange(i);
    } else if (t.matches('[data-ex-check]')) {
      if (doubleTap(item)) return;
      syncInputs(card, item);
      if (itemDone(item)) {
        item.manual = false;
        if (item.sets.every((s) => s.done)) item.sets.forEach((s) => { s.done = false; });
      } else {
        item.manual = true;
        session.startedAt ??= Date.now();
      }
      expanded.delete(i);
      afterDoneChange(i);
    } else if (t.matches('[data-step]')) {
      const j = Number(t.closest('[data-j]').dataset.j);
      const field = t.dataset.field;
      const input = card.querySelector(`[data-j="${j}"] input[data-field="${field}"]`);
      const v = Math.max(0, Math.round(((Number(input.value.replace(',', '.')) || 0) + Number(t.dataset.step)) * 100) / 100);
      input.value = fmtInput(v);
      setValue(card, item, j, field, v);
      save(400);
    } else if (t.matches('[data-add-set]')) {
      syncInputs(card, item);
      const last = item.sets[item.sets.length - 1] || { w: 0, r: '' };
      item.sets.push({ w: last.w, r: last.r, done: false });
      item.manual = false;
      afterDoneChange(i);
    } else if (t.matches('[data-rm-set]')) {
      syncInputs(card, item);
      if (item.sets.length > 1) item.sets.pop();
      afterDoneChange(i);
    } else if (t.matches('[data-guide]')) {
      openGuide(item.exerciseId);
    } else if (t.matches('[data-toggle]')) {
      syncInputs(card, item);
      const isCollapsed = card.classList.contains('collapsed');
      if (isCollapsed) { expanded.add(i); collapsed.delete(i); } else { collapsed.add(i); expanded.delete(i); }
      drawCard(i);
    } else if (t.matches('[data-finish]')) {
      session.finishedAt = Date.now();
      session.celebrated = true;
      save();
      drawHead();
      celebrate(session, today);
    } else if (t.matches('[data-summary]')) {
      celebrate(session, today);
    }
  });

  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-notes]')) {
      session.notes = t.value;
      save(500);
    } else if (t.matches('input[data-field]')) {
      const card = t.closest('[data-i]');
      const item = session.items[Number(card.dataset.i)];
      const j = Number(t.closest('[data-j]').dataset.j);
      setValue(card, item, j, t.dataset.field, parseNum(t.value), t);
      save(500);
    }
  });
}

/**
 * Set a value; a weight change also carries forward to the following unchecked
 * sets that still had the old weight (so you only adjust it once per exercise).
 */
function setValue(card, item, j, field, v, source) {
  const old = item.sets[j][field];
  item.sets[j][field] = v;
  if (field !== 'w' || v === '') return;
  for (let k = j + 1; k < item.sets.length; k++) {
    const s = item.sets[k];
    if (s.done || s.w !== old) break;
    s.w = v;
    const inp = card.querySelector(`[data-j="${k}"] input[data-field="w"]`);
    if (inp && inp !== source) inp.value = fmtInput(v);
  }
}

// Ignore accidental double taps on the same checkbox.
const lastTap = new WeakMap();
function doubleTap(obj) {
  const now = Date.now();
  const prev = lastTap.get(obj) || 0;
  lastTap.set(obj, now);
  return now - prev < 400;
}

const parseNum = (v) => {
  const n = Number(String(v).replace(',', '.'));
  return v === '' || Number.isNaN(n) ? '' : n;
};
const fmtInput = (v) => (v === '' || v == null ? '' : String(v));

function syncInputs(card, item) {
  card?.querySelectorAll('input[data-field]').forEach((inp) => {
    const j = Number(inp.closest('[data-j]').dataset.j);
    item.sets[j][inp.dataset.field] = parseNum(inp.value);
  });
}

function targetText(item, ex) {
  const t = item.target;
  const reps = t.repMin == null ? 'max' : t.repMin === t.repMax ? `${t.repMin}` : `${t.repMin}–${t.repMax}`;
  if (item.kind === 'cardio') return `${reps} daqiqa`;
  const unit = item.kind === 'time' ? ' s' : '';
  const rest = t.rest ?? state.settings.restDefault;
  return `${t.sets} × ${reps}${unit}${ex.perSide ? ' (har qo‘l)' : ''} · dam ${fmtClock(rest)}`;
}

function setRow(item, j, ex) {
  const s = item.sets[j];
  const check = `<button class="set-check" data-set-check aria-label="${j + 1}-set bajarildi" aria-pressed="${!!s.done}">${icon.check}</button>`;
  const stepper = (field, step, label) => `<div class="stepper">
      <button data-step="${-step}" data-field="${field}" aria-label="kamaytirish">−</button>
      <input inputmode="decimal" data-field="${field}" value="${esc(fmtInput(s[field]))}" aria-label="${label}">
      <button data-step="${step}" data-field="${field}" aria-label="ko‘paytirish">+</button></div>`;
  let mid;
  if (item.kind === 'cardio') mid = `${stepper('r', 1, 'daqiqa')}<span class="muted" style="text-align:center">daqiqa</span>`;
  else if (item.kind === 'time') mid = `${stepper('r', 5, 'soniya')}<span class="muted" style="text-align:center">soniya</span>`;
  else mid = `${stepper('w', ex.step || 2.5, 'kilogramm')}<input class="inp reps" inputmode="numeric" data-field="r" value="${esc(fmtInput(s.r))}" placeholder="${item.target.repMin == null ? 'max' : ''}" aria-label="takror">`;
  return `<div class="set-row${s.done ? ' done' : ''}" data-j="${j}"><span class="n">${j + 1}</span>${mid}${check}</div>`;
}

function cardHTML(session, i, today) {
  const item = session.items[i];
  const ex = exercise(item.exerciseId);
  const done = itemDone(item);
  const isCollapsed = (done && !expanded.has(i)) || collapsed.has(i);
  const last = lastFor(item.exerciseId, today);
  const hint = shouldProgress(last, item.target, item.kind)
    ? `<div class="hint">${icon.trendUp}Og‘irlikni 2.5 kg oshirib ko‘ring</div>` : '';
  const lastLine = last && item.kind !== 'cardio'
    ? `<p class="muted" style="font-size:13px;margin:0 0 8px">O‘tgan safar (${fmtDate(last.date, false)}): ${last.item.sets.filter((s) => s.done).map((s) => (item.kind === 'time' ? `${s.r} s` : s.w ? `${fmtNum(s.w)}×${s.r}` : `${s.r}`)).join(', ')}</p>` : '';
  const head = item.kind === 'cardio' ? '<span>#</span><span>Vaqt</span><span></span><span></span>'
    : item.kind === 'time' ? '<span>#</span><span>Vaqt</span><span></span><span></span>'
    : `<span>#</span><span>${item.kind === 'reps' ? 'kg (+/−)' : 'kg'}</span><span>takror</span><span></span>`;
  const doneSets = item.sets.filter((s) => s.done).length;
  return `<article class="card ex-card${done ? ' done' : ''}${isCollapsed ? ' collapsed' : ''}" data-i="${i}">
    <div class="ex-head">
      <button class="ex-check" data-ex-check aria-pressed="${done}" aria-label="Mashq bajarildi">${icon.check}</button>
      <button class="ex-title" data-toggle aria-expanded="${!isCollapsed}">
        <h3>${esc(ex.name)}${ex.gymName ? ` <small>(${esc(ex.gymName)})</small>` : ''}</h3>
        <div class="meta">${esc(ex.muscles.join(' · '))}</div>
        <div class="target">${targetText(item, ex)}</div>
      </button>
      <div class="ex-thumb" data-guide role="button" tabindex="0" aria-label="Yo‘riqnoma">${illustration(item.exerciseId, { still: isCollapsed })}</div>
    </div>
    <div class="ex-summary">${done ? `Bajarildi · ${doneSets}/${item.sets.length} set` : `${doneSets}/${item.sets.length} set`} — ochish uchun bosing</div>
    <div class="ex-body">
      ${hint}${lastLine}
      ${ex.perSide ? '<div class="per-side">Takrorlar har bir qo‘l uchun alohida</div>' : ''}
      <div class="set-head">${head}</div>
      ${item.sets.map((_, j) => setRow(item, j, ex)).join('')}
      <div class="ex-actions">
        ${item.kind === 'cardio' ? '' : `<button class="btn btn-sm" data-add-set>${icon.plus} Set</button><button class="btn btn-sm" data-rm-set ${item.sets.length < 2 ? 'disabled' : ''}>${icon.minus} Set</button>`}
        <button class="btn btn-sm" data-guide>${icon.info} Qanday bajariladi?</button>
      </div>
    </div></article>`;
}

function drawBanners(box, session, day) {
  const now = new Date();
  const [h, m] = state.settings.reminderTime.split(':').map(Number);
  const late = now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
  let html = '';
  if (late && !session.finishedAt && sessionRatio(session) < DONE_THRESHOLD) {
    html += `<div class="banner">${icon.bell}<p>${esc(reminderText(day.title, state.settings.gymTime))}</p></div>`;
  }
  if (backupDue()) {
    html += `<div class="banner info" data-backup>${icon.download}<p>Haftalik eslatma: ma’lumotlaringizni zaxira faylga saqlab qo‘ying.</p>
      <button class="btn btn-sm btn-primary" data-export>Eksport</button><button class="icon-btn" data-later aria-label="Keyinroq">${icon.x}</button></div>`;
  }
  box.innerHTML = html;
  box.querySelector('[data-export]')?.addEventListener('click', async () => {
    if (await exportToFile()) box.querySelector('[data-backup]')?.remove();
  });
  box.querySelector('[data-later]')?.addEventListener('click', async () => {
    await saveSetting('backupNagAt', getToday());
    box.querySelector('[data-backup]')?.remove();
  });
}

function celebrate(session, today) {
  const t = sessionTotals(session);
  const { current, best } = streaks(today);
  openSheet(`<div class="celebrate">
      <div class="big-check">${icon.check}</div>
      <h2>Barakalla! Mashg‘ulot yakunlandi</h2>
      <p class="muted">${esc(session.title)} kuni · ${fmtDate(today)}</p>
      <div class="stat-grid">
        <div class="stat"><b>${t.sets}</b><span>set</span></div>
        <div class="stat"><b>${fmtNum(t.volume)}</b><span>kg hajm</span></div>
        <div class="stat"><b>${fmtDuration(t.minutes)}</b><span>davomiylik</span></div>
      </div>
      <div class="stat hot" style="margin-bottom:14px"><b>${icon.flame.replace('<svg', '<svg style="width:22px;height:22px;vertical-align:-3px"')} ${current} kun ketma-ket</b>
        <span>${current >= best && current > 1 ? 'Bu sizning eng uzun seriyangiz!' : `Rekord: ${best} kun`}</span></div>
      <p>${current > 0 ? 'Ertangi mashg‘ulot seriyani davom ettiradi — kelishdik!' : 'Ajoyib boshlanish!'}</p>
      <button class="btn btn-primary btn-block" data-close>Yopish</button></div>`);
}

function renderRest(root, today) {
  const mon = mondayOf(today);
  const { current } = streaks(today);
  let doneDays = 0, sets = 0, volume = 0, minutes = 0;
  const cells = [];
  for (let k = 0; k < 7; k++) {
    const d = addDays(mon, k);
    const s = state.sessions[d];
    const st = dayStatus(d, s, state.plan, today);
    if (st === 'done') doneDays++;
    if (s) { const t = sessionTotals(s); sets += t.sets; volume += t.volume; minutes += t.minutes; }
    const color = { done: 'var(--ok)', partial: 'var(--partial)', missed: '#3a1d22', rest: 'transparent', today: 'var(--card2)', future: 'var(--card2)' }[st];
    cells.push(`<div>${DAY_SHORT[weekday(d)]}<i style="background:${color};${st === 'rest' ? 'border:1px solid #22324a' : ''}"></i></div>`);
  }
  const planned = state.plan.filter((p) => p.items.length).length;
  const tomorrow = planFor(state.plan, weekday(addDays(today, 1)));
  root.innerHTML = `
    <div class="today-head"><div class="date">${fmtDate(today)}</div>
      <h1>${DAY_NAMES[weekday(today)]} — Dam olish kuni</h1>
      <div class="streak-pill">${icon.flame}${current} kun ketma-ket</div></div>
    <div class="card"><p style="margin:0 0 4px;font-size:17px">Mushaklar dam olganda o‘sadi. Bugun yaxshi uxlang, ko‘proq suv iching va oqsilli ovqat yeng.</p>
      <p class="muted" style="margin:0">Dam olish kuni seriyani buzmaydi.</p></div>
    <div class="section-title">Bu hafta</div>
    <div class="card">
      <div class="week-strip">${cells.join('')}</div>
      <div class="stat-grid two">
        <div class="stat"><b>${doneDays} / ${planned}</b><span>mashg‘ulot</span></div>
        <div class="stat"><b>${sets}</b><span>set</span></div>
        <div class="stat"><b>${fmtNum(volume)}</b><span>kg hajm</span></div>
        <div class="stat"><b>${fmtDuration(minutes)}</b><span>zalda</span></div>
      </div>
      <p style="margin:0">${doneDays >= planned ? 'Mukammal hafta! Barcha mashg‘ulotlar bajarildi.' : doneDays >= planned / 2 ? 'Yaxshi hafta! Keyingisida yana bir qadam oldinga.' : 'Yangi hafta — yangi imkoniyat. Ertaga boshlaymiz!'}</p>
    </div>
    ${tomorrow ? `<div class="card"><b>Ertaga:</b> ${DAY_NAMES[weekday(addDays(today, 1))]} — ${esc(tomorrow.title)} kuni, ${tomorrow.items.length} ta mashq.</div>` : ''}`;
}
