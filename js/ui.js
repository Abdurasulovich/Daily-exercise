// Small UI toolkit: escaping, icons, bottom sheets, dialogs, toasts.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const P = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
export const icon = {
  check: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  flame: P('<path d="M12 22c4 0 7-2.7 7-6.8 0-3.3-2-5.6-3.6-7.4-.4 1.9-1.4 3.2-2.7 3.6.3-3.3-1-6.2-3.9-8.4.2 3.2-1.4 5.1-3 7C4.9 11.2 5 12.7 5 15.2 5 19.3 8 22 12 22z"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  minus: P('<path d="M5 12h14"/>'),
  info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  left: P('<path d="M15 5l-7 7 7 7"/>'),
  right: P('<path d="M9 5l7 7-7 7"/>'),
  up: P('<path d="M6 15l6-6 6 6"/>'),
  down: P('<path d="M6 9l6 6 6-6"/>'),
  x: P('<path d="M6 6l12 12M18 6L6 18"/>'),
  trash: P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  bell: P('<path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4"/>'),
  download: P('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  upload: P('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
  trendUp: P('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
  today: P('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8.5 15l2.2 2.2 4.6-4.6"/>'),
  dumbbell: P('<path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12"/>'),
  chart: P('<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>'),
  gear: P('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>'),
  skip: P('<path d="M5 5l9 7-9 7V5zM18 5v14"/>'),
  breath: P('<path d="M3 8h11a3 3 0 10-3-3M3 12h15a3 3 0 11-3 3M3 16h7"/>'),
  steps: P('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  person: P('<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 22l4-7 4 7M6 11h12"/>'),
  warn: P('<path d="M12 3l10 18H2L12 3zM12 10v5M12 18v.5"/>'),
  share: P('<path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7"/>'),
};

/** Parse an HTML string into a single element. */
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

let sheetStack = 0;
/** Bottom sheet. Returns { root, close }. onClose fires once. */
export function openSheet(innerHTML, { title = '', onClose, dialog = false } = {}) {
  const root = el(`<div class="overlay" role="dialog" aria-modal="true">
    <div class="${dialog ? 'dialog' : 'sheet'}">
      ${dialog ? '' : '<div class="sheet-grip"></div>'}
      ${title ? `<div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Yopish">${icon.x}</button></div>` : ''}
      <div class="sheet-content"></div>
    </div></div>`);
  root.querySelector('.sheet-content').innerHTML = innerHTML;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.remove();
    if (--sheetStack === 0) document.body.style.overflow = '';
    window.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-close]')) close();
  });
  window.addEventListener('keydown', onKey);
  document.body.append(root);
  sheetStack++;
  document.body.style.overflow = 'hidden';
  return { root, close };
}

/** Confirmation dialog. Resolves true/false. */
export function confirmDialog(message, { ok = 'Ha', cancel = 'Bekor qilish', danger = false } = {}) {
  return new Promise((resolve) => {
    let result = false;
    const { root, close } = openSheet(`
      <p style="font-size:17px;margin:4px 0 18px">${message}</p>
      <div class="row"><button class="btn btn-ghost" data-close style="flex:1">${esc(cancel)}</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok style="flex:1">${esc(ok)}</button></div>`,
    { dialog: true, onClose: () => resolve(result) });
    root.querySelector('[data-ok]').addEventListener('click', () => { result = true; close(); });
  });
}

let toastTimer;
export function toast(message, { action, onAction, ms = 3500 } = {}) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const t = el(`<div class="toast" role="status"><span>${esc(message)}</span>${action ? `<button class="btn btn-sm btn-primary">${esc(action)}</button>` : ''}</div>`);
  if (action) t.querySelector('button').addEventListener('click', () => { t.remove(); onAction?.(); });
  document.body.append(t);
  toastTimer = setTimeout(() => t.remove(), ms);
}

export function debounce(fn, ms) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.flush = (...a) => { clearTimeout(t); fn(...a); };
  return d;
}
