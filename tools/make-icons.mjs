// Generates the PNG app icons without dependencies: `node tools/make-icons.mjs`
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [18, 22, 29, 255], ORANGE = [255, 122, 26, 255], GREEN = [52, 211, 153, 255], INK = [10, 30, 22, 255], WHITE = [255, 255, 255, 255];

// Shapes in a 512×512 design space. Each returns true if (x, y) is inside.
const rrect = (x0, y0, x1, y1, r) => (x, y) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};
const circle = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const segment = (ax, ay, bx, by, w) => (x, y) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= (w / 2) ** 2;
};

const dumbbell = [
  rrect(150, 234, 362, 270, 10),
  rrect(112, 160, 166, 344, 20), rrect(346, 160, 400, 344, 20),
  rrect(74, 194, 116, 310, 16), rrect(396, 194, 438, 310, 16),
];
const check = [circle(372, 372, 76), segment(336, 374, 362, 400, 22), segment(362, 400, 410, 348, 22)];

function layers({ maskable, mono }) {
  const s = maskable ? 0.78 : 1; // keep content inside the maskable safe zone
  const tf = (fn) => (x, y) => fn(256 + (x - 256) / s, 256 + (y - 256) / s);
  if (mono) return dumbbell.map((f) => [tf(f), WHITE]);
  return [
    [maskable ? () => true : rrect(0, 0, 512, 512, 112), BG],
    ...dumbbell.map((f) => [tf(f), ORANGE]),
    [tf(check[0]), GREEN], [tf(check[1]), INK], [tf(check[2]), INK],
  ];
}

function render(size, opts) {
  const L = layers(opts);
  const px = Buffer.alloc(size * size * 4);
  const N = 4; // 4×4 supersampling
  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      const acc = [0, 0, 0, 0];
      for (let sy = 0; sy < N; sy++) for (let sx = 0; sx < N; sx++) {
        const x = ((pxi + (sx + 0.5) / N) / size) * 512, y = ((py + (sy + 0.5) / N) / size) * 512;
        let c = [0, 0, 0, 0];
        for (const [f, col] of L) if (f(x, y)) c = col;
        acc[0] += c[0] * c[3]; acc[1] += c[1] * c[3]; acc[2] += c[2] * c[3]; acc[3] += c[3];
      }
      const i = (py * size + pxi) * 4;
      const a = acc[3];
      px[i] = a ? Math.round(acc[0] / a) : 0;
      px[i + 1] = a ? Math.round(acc[1] / a) : 0;
      px[i + 2] = a ? Math.round(acc[2] / a) : 0;
      px[i + 3] = Math.round(a / (N * N));
    }
  }
  return png(size, px);
}

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('icons', { recursive: true });
const out = [
  ['icon-192.png', 192, {}], ['icon-512.png', 512, {}],
  ['maskable-192.png', 192, { maskable: true }], ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }], ['favicon-32.png', 32, {}],
  ['badge-96.png', 96, { mono: true }],
];
for (const [name, size, opts] of out) {
  writeFileSync(`icons/${name}`, render(size, opts));
  console.log('wrote', name);
}
