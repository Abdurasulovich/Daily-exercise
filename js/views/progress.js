import { state, exercise, streaks, sessionsAsc, saveBodyWeight, deleteBodyWeight } from '../store.js';
import {
  today as getToday, ymd, parseYmd, addDays, weekday, mondayOf, dayStatus, countDone, totalDone, fmtDate,
  MONTHS, DAY_SHORT, DAY_NAMES, sessionTotals, sessionRatio, itemDone, exerciseHistory, fmtNum, fmtDuration, daysBetween,
} from '../logic.js';
import { lineChart } from '../charts.js';
import { esc, icon, confirmDialog, toast } from '../ui.js';

let month = null; // 'YYYY-MM' shown in the calendar
let chartExercise = 'bench';

const STATUS_LABEL = { done: 'Bajarildi', partial: 'Qisman', missed: 'O‘tkazib yuborildi', rest: 'Dam olish', today: 'Bugun', future: '' };

export function render(root, params) {
  if (params.date) return renderDay(root, params.date);
  const today = getToday();
  month ??= today.slice(0, 7);
  const { current, best } = streaks(today);
  const mon = mondayOf(today);
  const monthStart = `${today.slice(0, 7)}-01`;

  root.innerHTML = `
    <h1 style="font-size:24px;margin:6px 2px 10px">Natijalar</h1>
    <div class="stat-grid two">
      <div class="stat hot"><b>${current}</b><span>joriy seriya (kun)</span></div>
      <div class="stat"><b>${best}</b><span>eng uzun seriya</span></div>
    </div>
    <div class="stat-grid">
      <div class="stat"><b>${countDone(state.sessions, state.plan, mon, today, today)}</b><span>bu hafta</span></div>
      <div class="stat"><b>${countDone(state.sessions, state.plan, monthStart, today, today)}</b><span>bu oy</span></div>
      <div class="stat"><b>${totalDone(state.sessions)}</b><span>jami</span></div>
    </div>
    <div class="card cal-card"></div>
    <div class="section-title">Mashq bo‘yicha o‘sish</div>
    <div class="card ex-chart"></div>
    <div class="section-title">Tana vazni (haftada bir marta)</div>
    <div class="card bw"></div>`;

  drawCalendar(root.querySelector('.cal-card'), today);
  drawExerciseChart(root.querySelector('.ex-chart'));
  drawBodyWeight(root.querySelector('.bw'), today);
}

function drawCalendar(box, today) {
  const [y, m] = month.split('-').map(Number);
  const first = `${month}-01`;
  const daysIn = new Date(y, m, 0).getDate();
  const offset = (weekday(first) + 6) % 7; // Monday-first grid
  const dows = [1, 2, 3, 4, 5, 6, 0].map((d) => `<div class="dow">${DAY_SHORT[d]}</div>`).join('');
  let cells = '<div></div>'.repeat(offset);
  for (let d = 1; d <= daysIn; d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`;
    const s = state.sessions[date];
    let st = dayStatus(date, s, state.plan, today);
    if (st === 'today') st = s && sessionRatio(s) > 0 ? 'partial' : '';
    const beforeStart = date < (state.settings.firstLaunch || today) && !s && st === 'missed';
    if (beforeStart) st = '';
    const clickable = !!s;
    cells += `<button class="${st}${date === today ? ' today' : ''}" ${clickable ? `data-date="${date}"` : 'disabled'} aria-label="${fmtDate(date)} ${STATUS_LABEL[st] || ''}">${d}</button>`;
  }
  const isCurrent = month === today.slice(0, 7);
  box.innerHTML = `
    <div class="cal-head">
      <button class="icon-btn" data-prev aria-label="Oldingi oy">${icon.left}</button>
      <h3>${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${y}</h3>
      <button class="icon-btn" data-next aria-label="Keyingi oy" ${isCurrent ? 'disabled' : ''}>${icon.right}</button>
    </div>
    <div class="cal">${dows}${cells}</div>
    <div class="cal-legend">
      <span><i style="background:var(--ok)"></i>bajarildi (≥80%)</span>
      <span><i style="background:var(--partial)"></i>qisman</span>
      <span><i style="background:#3a1d22"></i>o‘tkazildi</span>
      <span><i style="border:1px solid #22324a"></i>dam olish</span>
    </div>`;
  box.querySelector('[data-prev]').onclick = () => { month = shiftMonth(month, -1); drawCalendar(box, today); };
  box.querySelector('[data-next]').onclick = () => { month = shiftMonth(month, 1); drawCalendar(box, today); };
  box.querySelectorAll('[data-date]').forEach((b) => { b.onclick = () => { location.hash = `#/natijalar/kun/${b.dataset.date}`; }; });
}

const shiftMonth = (mm, n) => {
  const [y, m] = mm.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function drawExerciseChart(box) {
  const used = new Set(sessionsAsc().flatMap((s) => s.items.map((i) => i.exerciseId)));
  const options = [...state.exercises.values()].filter((e) => e.kind !== 'cardio' && (used.has(e.id) || e.builtin));
  if (!options.some((o) => o.id === chartExercise)) chartExercise = options[0]?.id;
  const ex = exercise(chartExercise);
  const hist = exerciseHistory(sessionsAsc(), chartExercise);
  const isTime = ex.kind === 'time';
  const weighted = ex.kind === 'weight' || hist.some((h) => h.maxW > 0);
  box.innerHTML = `
    <select aria-label="Mashqni tanlang">${options.map((o) => `<option value="${o.id}" ${o.id === chartExercise ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>
    ${isTime || !weighted ? `
      <h3 style="font-size:15px;margin:16px 0 6px">${isTime ? 'Eng uzun vaqt (s)' : 'Eng ko‘p takror'}</h3>
      ${lineChart(hist.map((h) => ({ date: h.date, y: h.bestReps })), { color: 'var(--rest)', unit: isTime ? 's' : '' })}`
    : `
      <h3 style="font-size:15px;margin:16px 0 6px">Eng og‘ir set (kg)</h3>
      ${lineChart(hist.map((h) => ({ date: h.date, y: h.maxW })), { color: 'var(--accent)', unit: 'kg' })}
      <h3 style="font-size:15px;margin:16px 0 6px">Umumiy hajm (kg × takror)</h3>
      ${lineChart(hist.map((h) => ({ date: h.date, y: h.volume })), { color: 'var(--ok)' })}`}`;
  box.querySelector('select').onchange = (e) => { chartExercise = e.target.value; drawExerciseChart(box); };
}

function drawBodyWeight(box, today) {
  const list = state.bodyWeights;
  const last = list[list.length - 1];
  const due = !last || daysBetween(last.date, today) >= 7;
  box.innerHTML = `
    ${due ? `<p class="muted" style="margin:0 0 10px">${last ? 'Bu hafta vazn hali kiritilmagan.' : 'Haftada bir marta, ertalab nonushtadan oldin tortiling.'}</p>` : ''}
    <div class="row">
      <input type="date" value="${today}" max="${today}" aria-label="Sana" style="flex:1.2">
      <input type="text" inputmode="decimal" placeholder="kg" aria-label="Vazn, kg" style="flex:1" value="${last ? last.kg : ''}">
      <button class="btn btn-primary" data-add>Saqlash</button>
    </div>
    <div style="margin-top:14px">${lineChart(list.map((b) => ({ date: b.date, y: b.kg })), { color: 'var(--rest)', unit: 'kg' })}</div>
    <div>${list.slice(-6).reverse().map((b) => `<div class="list-row"><span style="flex:1">${fmtDate(b.date)}</span><b>${fmtNum(b.kg)} kg</b>
      <button class="icon-btn" data-del="${b.date}" aria-label="O‘chirish">${icon.trash}</button></div>`).join('')}</div>`;
  const [dateIn, kgIn] = box.querySelectorAll('input');
  box.querySelector('[data-add]').onclick = async () => {
    const kg = Number(kgIn.value.replace(',', '.'));
    if (!(kg >= 20 && kg <= 300) || !dateIn.value) return toast('Vaznni to‘g‘ri kiriting (20–300 kg)');
    await saveBodyWeight(dateIn.value, Math.round(kg * 10) / 10);
    toast('Vazn saqlandi');
    drawBodyWeight(box, today);
  };
  box.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = async () => {
      if (!(await confirmDialog(`${fmtDate(b.dataset.del)} dagi yozuv o‘chirilsinmi?`, { ok: 'O‘chirish', danger: true }))) return;
      await deleteBodyWeight(b.dataset.del);
      drawBodyWeight(box, today);
    };
  });
}

function renderDay(root, date) {
  const s = state.sessions[date];
  const back = `<div class="row" style="margin:4px 0 10px"><a class="icon-btn" href="#/natijalar" aria-label="Orqaga">${icon.left}</a>
    <div><h1 style="font-size:20px">${fmtDate(date)}</h1><div class="muted" style="font-size:14px">${DAY_NAMES[weekday(date)]}${s ? ` — ${esc(s.title)} kuni` : ''}</div></div></div>`;
  if (!s) { root.innerHTML = `${back}<p class="empty">Bu kunda yozuv yo‘q.</p>`; return; }
  const t = sessionTotals(s);
  const st = dayStatus(date, s, state.plan, getToday());
  const done = s.items.filter(itemDone).length;
  root.innerHTML = `${back}
    <div class="stat-grid">
      <div class="stat"><b>${done}/${s.items.length}</b><span>${STATUS_LABEL[st] || 'mashq'}</span></div>
      <div class="stat"><b>${t.sets}</b><span>set</span></div>
      <div class="stat"><b>${fmtNum(t.volume)}</b><span>kg hajm</span></div>
    </div>
    ${t.minutes ? `<p class="muted">Davomiylik: ${fmtDuration(t.minutes)}</p>` : ''}
    <div class="card">${s.items.map((it) => {
      const ex = exercise(it.exerciseId);
      const sets = it.sets.map((x, j) => {
        const v = it.kind === 'cardio' ? `${x.r} daqiqa` : it.kind === 'time' ? `${x.r} s` : `${x.w ? `${fmtNum(x.w)} kg × ` : ''}${x.r || '—'}`;
        return `<span style="${x.done ? '' : 'opacity:.45;text-decoration:line-through'}">${j + 1}) ${v}</span>`;
      }).join(' &nbsp; ');
      return `<div class="log-ex"><h4>${esc(ex.name)} <span class="badge ${itemDone(it) ? 'ok' : 'no'}">${itemDone(it) ? 'bajarildi' : 'bajarilmadi'}</span></h4><div class="sets">${sets}</div></div>`;
    }).join('')}</div>
    ${s.notes ? `<div class="card"><b>Eslatma:</b><p style="margin:6px 0 0;white-space:pre-wrap">${esc(s.notes)}</p></div>` : ''}`;
}
