// Tiny inline-SVG line chart (time-scaled x axis). No libraries.
import { parseYmd, fmtNum, MONTHS } from './logic.js';

/**
 * points: [{ date: 'YYYY-MM-DD', y: number }] sorted by date.
 * opts: { color, unit, height }
 */
export function lineChart(points, { color = 'var(--accent)', unit = '', height = 170 } = {}) {
  if (!points.length) return '<p class="empty">Hali ma’lumot yo‘q.</p>';
  const W = 340, H = height, L = 38, R = 14, T = 16, B = 24;
  const xs = points.map((p) => parseYmd(p.date).getTime());
  const ys = points.map((p) => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  if (x0 === x1) { x0 -= 3 * 864e5; x1 += 3 * 864e5; }
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.15 || Math.max(1, y1 * 0.1);
  y0 = Math.max(0, y0 - pad); y1 += pad;
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const sy = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const pts = points.map((p, i) => [sx(xs[i]), sy(p.y)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)} ${H - B} L${pts[0][0].toFixed(1)} ${H - B}Z`;
  const grid = [0, 0.5, 1].map((t) => {
    const v = y0 + (y1 - y0) * t, y = sy(v);
    return `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="axis" x="${L - 6}" y="${y + 3}" text-anchor="end">${fmtNum(Math.round(v))}</text>`;
  }).join('');
  const lbl = (t) => { const dt = new Date(t); return `${dt.getDate()}-${MONTHS[dt.getMonth()].slice(0, 3)}`; };
  const xl = `<text class="axis" x="${L}" y="${H - 6}">${lbl(x0)}</text><text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${lbl(x1)}</text>`;
  const dots = pts.map(([x, y]) => `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${color}"/>`).join('');
  const [lx, ly] = pts[pts.length - 1];
  const last = `<text class="val" x="${Math.min(lx, W - R - 4)}" y="${Math.max(ly - 9, 11)}" text-anchor="end">${fmtNum(ys[ys.length - 1])}${unit ? ` ${unit}` : ''}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik">${grid}${xl}
    <path class="area" d="${area}" fill="${color}"/><path class="line" d="${d}" stroke="${color}"/>${dots}${last}</svg>`;
}
