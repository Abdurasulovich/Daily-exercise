import { state, exercise } from '../store.js';
import { GROUPS } from '../seed.js';
import { illustration } from '../illustrations.js';
import { esc, icon, openSheet } from '../ui.js';
import { normalize } from '../logic.js';

const list = (items, cls = '') => `<ul class="${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

export function guideHTML(id) {
  const ex = exercise(id);
  const g = ex.guide;
  const hero = `<div class="guide-hero">${illustration(id, { label: ex.name })}
    <div class="legend"><span><i style="background:var(--fig-mus)"></i>ishlovchi mushak</span><span><i style="background:var(--fig-arrow)"></i>harakat</span></div></div>`;
  const chips = `<div class="chips">${ex.muscles.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>`;
  if (!g) {
    return `${hero}${chips}<p class="muted">Bu mashqni o‘zingiz qo‘shgansiz — unga yo‘riqnoma va rasm yo‘q.</p>`;
  }
  return `<div class="guide">${hero}${chips}
    <h3>${icon.person}Boshlang‘ich holat</h3>${list(g.position)}
    <h3>${icon.steps}Bajarilishi</h3><ol>${g.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    <h3>${icon.breath}Nafas olish</h3>${list(g.breathing)}
    <h3>${icon.warn}Ko‘p uchraydigan xatolar</h3>${list(g.mistakes, 'mistakes')}
    <div class="safety"><b>Xavfsizlik:</b> ${esc(g.safety)}</div></div>`;
}

export function openGuide(id) {
  const ex = exercise(id);
  openSheet(guideHTML(id), { title: ex.name });
}

export function render(root, params) {
  if (params.id) return renderDetail(root, params.id);
  root.innerHTML = `
    <h1 style="font-size:24px;margin:6px 2px 4px">Mashqlar</h1>
    <div class="search"><input type="search" placeholder="Qidirish: nomi yoki mushak…" aria-label="Qidirish"></div>
    <div class="lib-list"></div>`;
  const input = root.querySelector('input');
  const out = root.querySelector('.lib-list');
  const draw = () => {
    const q = normalize(input.value.trim());
    const all = [...state.exercises.values()];
    const groups = [...GROUPS, ...new Set(all.map((e) => e.group).filter((g) => !GROUPS.includes(g)))];
    let html = '';
    for (const g of groups) {
      const items = all.filter((e) => e.group === g).filter((e) => !q || normalize(`${e.name} ${e.gymName} ${e.group} ${e.muscles.join(' ')}`).includes(q));
      if (!items.length) continue;
      html += `<div class="section-title">${esc(g)}</div>` + items.map((e) => `
        <a class="lib-item" href="#/mashqlar/${encodeURIComponent(e.id)}">
          <div class="thumb">${illustration(e.id, { still: true })}</div>
          <div><h3>${esc(e.name)}</h3><p>${esc(e.gymName)}</p><p>${esc(e.muscles.join(' · '))}</p></div>
          <span class="chev">${icon.right}</span></a>`).join('');
    }
    out.innerHTML = html || '<p class="empty">Hech narsa topilmadi.</p>';
  };
  input.addEventListener('input', draw);
  draw();
}

function renderDetail(root, id) {
  const ex = exercise(id);
  root.innerHTML = `
    <div class="row" style="margin:4px 0 10px">
      <a class="icon-btn" href="#/mashqlar" aria-label="Orqaga">${icon.left}</a>
      <div><h1 style="font-size:20px">${esc(ex.name)}</h1><div class="muted" style="font-size:14px">${esc(ex.gymName)}</div></div>
    </div>${guideHTML(id)}`;
}
