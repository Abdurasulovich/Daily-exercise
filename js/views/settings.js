import {
  state, exercise, saveSetting, savePlanDay, resetPlan, addCustomExercise, refreshUntouched, importData, clearAll,
} from '../store.js';
import { GROUPS } from '../seed.js';
import { today as getToday, DAY_SHORT, DAY_NAMES, fmtDate, fmtClock } from '../logic.js';
import { esc, icon, confirmDialog, toast, openSheet } from '../ui.js';
import * as N from '../notify.js';
import { canPrompt, promptInstall, isIOS, isStandalone, onInstallChange } from '../install.js';
import { exportToFile } from '../backup.js';
import { APP_VERSION } from '../version.js';

let editDay = 1;

export function render(root) {
  root.innerHTML = `
    <h1 style="font-size:24px;margin:6px 2px 4px">Sozlamalar</h1>
    <div class="install-box"></div>
    <div class="section-title">Mashg‘ulot rejasi</div>
    <div class="card plan-box"></div>
    <div class="section-title">Eslatma</div>
    <div class="card notif-box"></div>
    <div class="section-title">Dam olish taymeri</div>
    <div class="card rest-box"></div>
    <div class="section-title">Ma’lumotlar</div>
    <div class="card data-box"></div>
    <p class="muted" style="text-align:center;font-size:13px">Mashq Kundaligi · versiya ${APP_VERSION}</p>`;
  drawInstall(root.querySelector('.install-box'));
  drawPlan(root.querySelector('.plan-box'));
  drawNotif(root.querySelector('.notif-box'));
  drawRest(root.querySelector('.rest-box'));
  drawData(root.querySelector('.data-box'));
}

// ---------- install ----------
let unsubInstall;
function drawInstall(box) {
  unsubInstall?.();
  const draw = () => {
    if (isStandalone()) { box.innerHTML = ''; return; }
    if (canPrompt()) {
      box.innerHTML = `<div class="card"><p style="margin:0 0 10px">Ilovani bosh ekranga o‘rnating — internet bo‘lmasa ham ishlaydi.</p>
        <button class="btn btn-primary btn-block" data-install>${icon.download} Ilovani o‘rnatish</button></div>`;
      box.querySelector('[data-install]').onclick = async () => {
        if ((await promptInstall()) === 'accepted') toast('Ilova o‘rnatildi!');
      };
    } else if (isIOS()) {
      box.innerHTML = `<div class="card"><b>iPhone’ga o‘rnatish</b><ol class="ios-steps">
        <li>Safari’da pastdagi <b>Ulashish</b> ${icon.share.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"')} tugmasini bosing.</li>
        <li><b>“На экран «Домой»” / “Add to Home Screen”</b> bandini tanlang.</li>
        <li><b>Qo‘shish (Add)</b> ni bosing va ilovani bosh ekrandan oching.</li></ol>
        <p class="muted" style="margin:6px 0 0;font-size:14px">Bildirishnomalar iPhone’da faqat shunday o‘rnatilganda ishlaydi (iOS 16.4+).</p></div>`;
    } else {
      box.innerHTML = `<div class="card muted" style="font-size:14px">O‘rnatish uchun brauzer menyusidan (⋮) <b>“Ilovani o‘rnatish”</b> yoki <b>“Bosh ekranga qo‘shish”</b> ni tanlang.</div>`;
    }
  };
  // The view is built detached and attached afterwards, so only later events check isConnected.
  unsubInstall = onInstallChange(() => (box.isConnected ? draw() : unsubInstall?.()));
  draw();
}

// ---------- plan editor ----------
function drawPlan(box) {
  const day = state.plan.find((p) => p.day === editDay) || { day: editDay, type: 'custom', title: '', items: [] };
  const exOptions = [...state.exercises.values()]
    .map((e) => `<option value="${e.id}">${esc(e.group)} — ${esc(e.name)}</option>`).join('');
  box.innerHTML = `
    <div class="day-tabs">${[1, 2, 3, 4, 5, 6].map((d) => `<button data-day="${d}" aria-pressed="${d === editDay}">${DAY_SHORT[d]}</button>`).join('')}</div>
    <label class="field"><span>${DAY_NAMES[editDay]} kuni nomi</span><input type="text" data-title value="${esc(day.title)}" placeholder="Masalan: Itarish"></label>
    <div class="items">${day.items.map((it, i) => planItemHTML(it, i, day.items.length)).join('') || '<p class="empty">Bu kunda mashq yo‘q — dam olish kuni hisoblanadi.</p>'}</div>
    <div class="row" style="margin-top:10px"><select data-new aria-label="Mashq tanlash">${exOptions}</select>
      <button class="btn btn-primary" data-add aria-label="Qo‘shish">${icon.plus}</button></div>
    <div class="row wrap" style="margin-top:10px">
      <button class="btn btn-sm" data-custom>${icon.plus} Yangi mashq yaratish</button>
      <span class="spacer"></span>
      <button class="btn btn-sm btn-ghost" data-reset>Standart rejani tiklash</button></div>
    <p class="muted" style="font-size:13px;margin:10px 0 0">Bo‘sh “takror” = max. Dam olish bo‘sh bo‘lsa, umumiy sozlama ishlatiladi. Yakshanba har doim dam olish kuni.</p>`;

  const commit = async (redraw = true) => {
    await savePlanDay(day);
    await refreshUntouched(getToday());
    if (redraw) drawPlan(box);
  };

  box.querySelectorAll('[data-day]').forEach((b) => { b.onclick = () => { editDay = Number(b.dataset.day); drawPlan(box); }; });
  box.querySelector('[data-title]').onchange = (e) => { day.title = e.target.value.trim() || DAY_NAMES[editDay]; commit(false); };
  box.querySelector('[data-add]').onclick = () => {
    const id = box.querySelector('[data-new]').value;
    const kind = exercise(id).kind;
    day.items.push(kind === 'cardio'
      ? { exerciseId: id, sets: 1, repMin: 8, repMax: 10, weight: 0, rest: 0 }
      : { exerciseId: id, sets: 3, repMin: kind === 'time' ? 30 : 10, repMax: kind === 'time' ? 45 : 12, weight: 0, rest: null });
    commit();
  };
  box.querySelector('[data-reset]').onclick = async () => {
    if (!(await confirmDialog('Butun reja boshlang‘ich holatga qaytarilsinmi? Yozilgan mashg‘ulotlar saqlanib qoladi.', { ok: 'Tiklash' }))) return;
    await resetPlan();
    await refreshUntouched(getToday());
    drawPlan(box);
    toast('Reja tiklandi');
  };
  box.querySelector('[data-custom]').onclick = () => customExerciseSheet(() => drawPlan(box));

  box.querySelector('.items').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = Number(b.closest('[data-idx]').dataset.idx);
    if (b.matches('[data-up]') && i > 0) [day.items[i - 1], day.items[i]] = [day.items[i], day.items[i - 1]];
    else if (b.matches('[data-down]') && i < day.items.length - 1) [day.items[i + 1], day.items[i]] = [day.items[i], day.items[i + 1]];
    else if (b.matches('[data-remove]')) day.items.splice(i, 1);
    else return;
    commit();
  });
  box.querySelector('.items').addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-k]');
    if (!inp) return;
    const it = day.items[Number(inp.closest('[data-idx]').dataset.idx)];
    const v = inp.value.trim() === '' ? null : Number(inp.value.replace(',', '.'));
    const k = inp.dataset.k;
    if (v != null && (Number.isNaN(v) || v < 0)) { toast('Musbat son kiriting'); inp.value = it[k] ?? ''; return; }
    if (k === 'sets') it.sets = Math.max(1, Math.min(10, Math.round(v ?? 1)));
    else it[k] = v;
    if (it.repMin != null && it.repMax == null) it.repMax = it.repMin;
    if (it.repMax != null && it.repMin == null) it.repMin = it.repMax;
    if (it.repMin > it.repMax) [it.repMin, it.repMax] = [it.repMax, it.repMin];
    commit(false);
  });
}

function planItemHTML(it, i, n) {
  const ex = exercise(it.exerciseId);
  const f = (k, label, val, ph = '') => `<label class="field"><span>${label}</span><input type="text" inputmode="decimal" data-k="${k}" value="${val ?? ''}" placeholder="${ph}"></label>`;
  const fields = ex.kind === 'cardio'
    ? f('repMin', 'min, daq', it.repMin) + f('repMax', 'max, daq', it.repMax)
    : f('sets', 'setlar', it.sets)
      + f('repMin', ex.kind === 'time' ? 'min, s' : 'min', it.repMin, 'max')
      + f('repMax', ex.kind === 'time' ? 'max, s' : 'max', it.repMax, 'max')
      + (ex.kind === 'time' ? '' : f('weight', 'kg', it.weight))
      + f('rest', 'dam, s', it.rest, String(state.settings.restDefault));
  return `<div class="plan-item" data-idx="${i}">
    <div class="top"><b>${i + 1}. ${esc(ex.name)}</b>
      <button class="icon-btn" data-up aria-label="Yuqoriga" ${i === 0 ? 'disabled' : ''}>${icon.up}</button>
      <button class="icon-btn" data-down aria-label="Pastga" ${i === n - 1 ? 'disabled' : ''}>${icon.down}</button>
      <button class="icon-btn" data-remove aria-label="O‘chirish">${icon.trash}</button></div>
    <div class="grid">${fields}</div></div>`;
}

function customExerciseSheet(onDone) {
  const { root, close } = openSheet(`
    <div class="stack">
      <label class="field"><span>Nomi</span><input type="text" data-name placeholder="Masalan: Gantel bilan o‘tirib-turish"></label>
      <label class="field"><span>Mushak guruhi</span><select data-group>${GROUPS.map((g) => `<option>${esc(g)}</option>`).join('')}</select></label>
      <label class="field"><span>Turi</span><select data-kind>
        <option value="weight">Og‘irlik × takror</option><option value="reps">Takror (o‘z vazni)</option>
        <option value="time">Vaqt (soniya)</option><option value="cardio">Kardio (daqiqa)</option></select></label>
      <button class="btn btn-primary btn-block" data-save>Saqlash</button></div>`, { title: 'Yangi mashq' });
  root.querySelector('[data-save]').onclick = async () => {
    const name = root.querySelector('[data-name]').value.trim();
    if (!name) return toast('Nomini kiriting');
    const rec = await addCustomExercise({ name, group: root.querySelector('[data-group]').value, kind: root.querySelector('[data-kind]').value });
    close();
    toast(`“${rec.name}” qo‘shildi — endi uni rejaga qo‘shishingiz mumkin`);
    onDone();
  };
}

// ---------- notifications ----------
function drawNotif(box) {
  const s = state.settings;
  const perm = N.permission();
  const permText = { granted: 'ruxsat berilgan', denied: 'taqiqlangan (brauzer sozlamalaridan yoqing)', default: 'hali so‘ralmagan', unsupported: 'bu brauzerda qo‘llab-quvvatlanmaydi' }[perm];
  box.innerHTML = `
    <div class="kv"><span>Bildirishnoma</span><span>${permText}</span></div>
    ${perm !== 'granted' && perm !== 'unsupported' && perm !== 'denied' ? `<button class="btn btn-primary btn-block" data-perm style="margin:8px 0">${icon.bell} Bildirishnomaga ruxsat berish</button>` : ''}
    ${perm === 'unsupported' && isIOS() && !isStandalone() ? '<p class="muted" style="font-size:14px">iPhone’da avval ilovani bosh ekranga o‘rnating.</p>' : ''}
    <label class="row" style="margin:10px 0;min-height:48px"><input type="checkbox" data-enabled ${s.reminderEnabled ? 'checked' : ''} style="width:24px;height:24px"> <span>Kunlik eslatmani yoqish</span></label>
    <div class="row">
      <label class="field" style="flex:1"><span>Eslatma vaqti</span><input type="time" data-time value="${s.reminderTime}"></label>
      <label class="field" style="flex:1"><span>Zalga borish vaqti</span><input type="time" data-gym value="${s.gymTime}"></label>
    </div>
    <div class="field" style="margin-top:10px"><span class="muted" style="font-size:14px;font-weight:600">Kunlar</span>
      <div class="toggle-days" style="margin-top:6px">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button data-rday="${d}" aria-pressed="${s.reminderDays.includes(d)}">${DAY_SHORT[d]}</button>`).join('')}</div></div>
    <button class="btn btn-block" data-test style="margin-top:12px">Sinov bildirishnomasi</button>
    <p class="muted" style="font-size:13px;margin:10px 0 0">Eslatma: veb-ilova yopiq bo‘lsa, aniq vaqtda bildirishnoma kafolatlanmaydi (server kerak). Android Chrome’da o‘rnatilgan ilova kuniga bir-ikki marta fon tekshiruvi qiladi; ilova ochilganda esa eslatma har doim ko‘rsatiladi. Batafsil — README.</p>`;

  const sync = async () => {
    if (state.settings.reminderEnabled && N.permission() === 'granted') {
      const r = await N.registerPeriodicSync();
      return r;
    }
    await N.unregisterPeriodicSync();
    return null;
  };
  box.querySelector('[data-perm]')?.addEventListener('click', async () => {
    const r = await N.requestPermission();
    if (r === 'granted') { await saveSetting('reminderEnabled', true); await sync(); toast('Bildirishnomalar yoqildi'); }
    drawNotif(box);
  });
  box.querySelector('[data-enabled]').onchange = async (e) => {
    if (e.target.checked && N.permission() === 'default') await N.requestPermission();
    await saveSetting('reminderEnabled', e.target.checked);
    const r = await sync();
    if (e.target.checked) toast(r === 'registered' ? 'Fon eslatmasi yoqildi' : 'Eslatma ilova ochilganda ko‘rsatiladi');
    drawNotif(box);
  };
  box.querySelector('[data-time]').onchange = (e) => saveSetting('reminderTime', e.target.value || '17:00');
  box.querySelector('[data-gym]').onchange = (e) => saveSetting('gymTime', e.target.value || '18:00');
  box.querySelectorAll('[data-rday]').forEach((b) => {
    b.onclick = async () => {
      const d = Number(b.dataset.rday);
      const days = new Set(state.settings.reminderDays);
      if (days.has(d)) days.delete(d); else days.add(d);
      await saveSetting('reminderDays', [...days].sort());
      b.setAttribute('aria-pressed', String(days.has(d)));
    };
  });
  box.querySelector('[data-test]').onclick = async () => {
    if (N.permission() !== 'granted') {
      const r = await N.requestPermission();
      if (r !== 'granted') return toast('Bildirishnomaga ruxsat berilmagan');
    }
    const day = state.plan.find((p) => p.day === new Date().getDay()) || state.plan[0];
    await N.notify('Mashq Kundaligi', N.reminderText(day.title, state.settings.gymTime), 'test');
    drawNotif(box);
  };
}

// ---------- rest timer ----------
function drawRest(box) {
  const opts = [45, 60, 75, 90, 120, 150, 180];
  box.innerHTML = `<label class="field"><span>Standart dam olish vaqti (setlar orasida)</span>
    <select data-rest>${opts.map((o) => `<option value="${o}" ${o === state.settings.restDefault ? 'selected' : ''}>${fmtClock(o)}</option>`).join('')}</select></label>
    <p class="muted" style="font-size:13px;margin:8px 0 0">Har bir mashq uchun alohida vaqtni rejada belgilash mumkin (masalan, bench press — 2:00).</p>`;
  box.querySelector('[data-rest]').onchange = (e) => saveSetting('restDefault', Number(e.target.value));
}

// ---------- data ----------
async function drawData(box) {
  const s = state.settings;
  let persisted = s.persisted;
  try { persisted = await navigator.storage?.persisted?.(); } catch { /* ignore */ }
  let usage = '';
  try {
    const est = await navigator.storage?.estimate?.();
    if (est?.usage != null) usage = `${(est.usage / 1024 / 1024).toFixed(1)} MB`;
  } catch { /* ignore */ }
  box.innerHTML = `
    <div class="kv"><span>Oxirgi zaxira</span><span>${s.lastBackupAt ? fmtDate(s.lastBackupAt) : 'hali yo‘q'}</span></div>
    <div class="kv"><span>Doimiy saqlash</span><span>${persisted ? 'yoqilgan' : 'brauzer qaroriga bog‘liq'}</span></div>
    ${usage ? `<div class="kv"><span>Egallangan joy</span><span>${usage}</span></div>` : ''}
    <div class="row" style="margin-top:12px">
      <button class="btn" data-export style="flex:1">${icon.download} Eksport (JSON)</button>
      <label class="btn" style="flex:1">${icon.upload} Import<input type="file" accept="application/json,.json" data-import class="sr-only"></label>
    </div>
    <button class="btn btn-danger btn-block" data-clear style="margin-top:12px">${icon.trash} Barcha ma’lumotlarni o‘chirish</button>`;

  box.querySelector('[data-export]').onclick = async () => { if (await exportToFile()) drawData(box); };
  box.querySelector('[data-import]').onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let json;
    try { json = JSON.parse(await file.text()); } catch { return toast('Fayl o‘qilmadi: JSON emas'); }
    const n = json?.data?.sessions?.length ?? 0;
    if (!(await confirmDialog(`Joriy ma’lumotlar fayldagilar bilan <b>almashtiriladi</b> (${n} ta mashg‘ulot). Davom etilsinmi?`, { ok: 'Import qilish', danger: true }))) return;
    try {
      await importData(json);
      toast('Ma’lumotlar tiklandi');
      location.hash = '#/bugun';
    } catch (err) {
      toast(err.message || 'Import muvaffaqiyatsiz');
    }
  };
  box.querySelector('[data-clear]').onclick = async () => {
    if (!(await confirmDialog('Barcha mashg‘ulotlar, vazn yozuvlari va sozlamalar o‘chiriladi. Ishonchingiz komilmi?', { ok: 'Ha, o‘chirish', danger: true }))) return;
    if (!(await confirmDialog('<b>Oxirgi ogohlantirish.</b> Bu amalni qaytarib bo‘lmaydi. Avval eksport qilmoqchimisiz? Agar yo‘q bo‘lsa — “O‘chirish”.', { ok: 'O‘chirish', cancel: 'Yo‘q, to‘xtash', danger: true }))) return;
    await clearAll();
    toast('Barcha ma’lumotlar o‘chirildi');
    location.hash = '#/bugun';
  };
}
