// Flat SVG figure rig: forward kinematics on a skeleton of segments, animated
// between a start pose (A) and an end pose (B) with generated CSS keyframes.
//
// Angles are absolute, in SVG degrees: 0 = right, 90 = down, -90 = up, 180 = left.
// Every segment is drawn along its local +x axis. With the figure facing right,
// local +y is the FRONT of the torso and the BACK of the limbs.

const RAD = Math.PI / 180;
let uid = 0;

const SIDE = [
  { id: 'thF', parent: null, at: [0, 0], len: 33, w: 13, far: true, z: -1, kind: 'limb' },
  { id: 'shF', parent: 'thF', at: 'end', len: 32, w: 10, far: true, kind: 'limb' },
  { id: 'ftF', parent: 'shF', at: 'end', len: 11, w: 6, far: true, kind: 'foot' },
  { id: 'torso', parent: null, at: [0, 0], len: 20, w: 19, kind: 'limb' },
  { id: 'chest', parent: 'torso', at: 'end', len: 24, w: 21, kind: 'limb' },
  { id: 'uaF', parent: 'chest', at: [21, 0], len: 27, w: 10, far: true, z: -1, kind: 'limb' },
  { id: 'faF', parent: 'uaF', at: 'end', len: 25, w: 8, far: true, kind: 'arm' },
  { id: 'head', parent: 'chest', at: 'end', len: 0, kind: 'head' },
  { id: 'uaN', parent: 'chest', at: [21, 0], len: 27, w: 10, kind: 'limb' },
  { id: 'faN', parent: 'uaN', at: 'end', len: 25, w: 8, kind: 'arm' },
  { id: 'thN', parent: null, at: [0, 0], len: 33, w: 13, kind: 'limb' },
  { id: 'shN', parent: 'thN', at: 'end', len: 32, w: 10, kind: 'limb' },
  { id: 'ftN', parent: 'shN', at: 'end', len: 11, w: 6, kind: 'foot' },
];

// Front view: N = figure's left (viewer's right), F = mirrored side.
const FRONT = [
  { id: 'thF', parent: null, at: [-8, 0], len: 33, w: 13, kind: 'limb' },
  { id: 'shF', parent: 'thF', at: 'end', len: 32, w: 10, kind: 'limb' },
  { id: 'ftF', parent: 'shF', at: 'end', len: 7, w: 7, kind: 'limb' },
  { id: 'thN', parent: null, at: [8, 0], len: 33, w: 13, kind: 'limb' },
  { id: 'shN', parent: 'thN', at: 'end', len: 32, w: 10, kind: 'limb' },
  { id: 'ftN', parent: 'shN', at: 'end', len: 7, w: 7, kind: 'limb' },
  { id: 'torso', parent: null, at: [0, 0], len: 20, kind: 'ftorso' },
  { id: 'chest', parent: 'torso', at: 'end', len: 24, kind: 'fchest' },
  { id: 'head', parent: 'chest', at: 'end', len: 0, kind: 'fhead' },
  { id: 'uaN', parent: 'chest', at: [21, 15], len: 27, w: 10, kind: 'limb' },
  { id: 'faN', parent: 'uaN', at: 'end', len: 25, w: 8, kind: 'arm' },
  { id: 'uaF', parent: 'chest', at: [21, -15], len: 27, w: 10, kind: 'limb' },
  { id: 'faF', parent: 'uaF', at: 'end', len: 25, w: 8, kind: 'arm' },
];

const RIGS = { side: SIDE, front: FRONT };

// Working-muscle overlays: [segment, x, y, rx, ry] in segment-local coordinates.
const MUSCLES = {
  side: {
    chest: [['chest', 13, 5.5, 9, 4.5]],
    upperChest: [['chest', 17, 5.5, 7, 4.5]],
    abs: [['torso', 11, 5.5, 10, 3.5], ['chest', 5, 6, 6, 3.5]],
    lats: [['chest', 10, -5.5, 11, 4]],
    midBack: [['chest', 18, -6, 6, 4]],
    glutes: [['torso', 2, -5.5, 6, 5]],
    delt: [['uaN', 4, 0, 6.5, 5]],
    frontDelt: [['uaN', 4, -2, 6, 4]],
    rearDelt: [['uaN', 4, 2, 6, 4]],
    biceps: [['uaN', 15, -2, 8, 3]],
    triceps: [['uaN', 14, 2, 9, 3]],
    forearm: [['faN', 10, 0, 7, 3]],
    quads: [['thN', 17, -3, 12, 4]],
    hams: [['thN', 17, 3, 12, 4]],
    adductors: [['thN', 15, 0, 10, 3]],
    calves: [['shN', 10, 3, 8, 3.5]],
  },
  front: {
    sideDelt: [['uaN', 3, 0, 7, 6], ['uaF', 3, 0, 7, 6]],
    lats: [['chest', 9, 13, 10, 3.5], ['chest', 9, -13, 10, 3.5]],
    biceps: [['uaN', 15, 0, 8, 3.5], ['uaF', 15, 0, 8, 3.5]],
  },
};

const rot = ([x, y], deg) => {
  const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
  return [x * c - y * s, x * s + y * c];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const lerp = (a, b, t) => a + (b - a) * t;
const f2 = (n) => Math.round(n * 100) / 100;

function fillDefaults(P, view) {
  const p = { ...P, s: { ...(P.s || {}) } };
  const front = view === 'front';
  p.chest ??= p.torso;
  p.head ??= p.chest;
  for (const [n, f] of [['uaN', 'uaF'], ['faN', 'faF'], ['thN', 'thF'], ['shN', 'shF']]) {
    if (p[f] == null) {
      p[f] = front ? 180 - p[n] : p[n];
      if (p.s[n] != null) p.s[f] ??= p.s[n];
    }
  }
  p.ftN ??= front ? 75 : p.shN - 90;
  p.ftF ??= front ? 180 - p.ftN : p.shF - 90;
  return p;
}

function lerpPose(a, b, t) {
  const out = { s: {} };
  for (const k of Object.keys(a)) {
    if (k === 'root') out.root = [lerp(a.root[0], b.root[0], t), lerp(a.root[1], b.root[1], t)];
    else if (k !== 's') out[k] = lerp(a[k], b[k], t);
  }
  for (const k of new Set([...Object.keys(a.s), ...Object.keys(b.s)])) {
    out.s[k] = lerp(a.s[k] ?? 1, b.s[k] ?? 1, t);
  }
  return out;
}

function solve(rig, p) {
  const out = {};
  for (const g of rig) {
    const abs = p[g.id];
    const s = p.s[g.id] ?? 1;
    let place, joint, rel;
    if (!g.parent) {
      place = g.at;
      joint = add(p.root, g.at);
      rel = abs;
    } else {
      const par = out[g.parent];
      const pg = rig.find((x) => x.id === g.parent);
      place = g.at === 'end' ? [pg.len * par.s, 0] : [g.at[0] * par.s, g.at[1]];
      joint = add(par.joint, rot(place, par.abs));
      rel = abs - par.abs;
    }
    out[g.id] = { abs, s, place, joint, rel };
  }
  return out;
}

function pointOn(rig, sol, segId, at) {
  const g = rig.find((x) => x.id === segId);
  const so = sol[segId];
  const local = at === 'end' ? [g.len, 0] : at;
  return add(so.joint, rot([local[0] * so.s, local[1]], so.abs));
}

// Keyframe timeline: [percent, s] where s=0 is pose A and s=1 is pose B.
// The working (concentric) phase is quicker than the lowering phase.
function timeline(def) {
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  let seq;
  if (def.hold === false) seq = [[0, 0], [50, 1], [100, 0]];
  else {
    const ab = def.work === 'BA' ? 42 : 30;
    const ba = def.work === 'BA' ? 30 : 42;
    seq = [[0, 0], [10, 0], [10 + ab, 1], [18 + ab, 1], [18 + ab + ba, 0], [100, 0]];
  }
  const pts = [];
  const steps = 8;
  for (let i = 0; i < seq.length - 1; i++) {
    const [p0, s0] = seq[i], [p1, s1] = seq[i + 1];
    pts.push([p0, s0]);
    if (s0 !== s1) {
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        pts.push([p0 + (p1 - p0) * t, s0 + (s1 - s0) * ease(t)]);
      }
    }
  }
  pts.push(seq[seq.length - 1]);
  return pts;
}

/** Resolve the full pose at progress s (0..1) including mid pose and anchor. */
function poseAt(def, rig, s) {
  const A = def._A, B = def._B, M = def._M;
  let p;
  if (M) p = s <= 0.5 ? lerpPose(A, M, s * 2) : lerpPose(M, B, (s - 0.5) * 2);
  else p = lerpPose(A, B, s);
  if (def.anchor) {
    const probe = { ...p, root: [0, 0] };
    const pt = pointOn(rig, solve(rig, probe), def.anchor.seg, def.anchor.at || 'end');
    const target = def.anchor.point;
    p.root = [def.anchor.axes === 'y' ? p.root[0] : target[0] - pt[0], target[1] - pt[1]];
  }
  return p;
}

export function figureSVG(def, opts = {}) {
  const view = def.view || 'side';
  const rig = RIGS[view];
  def._A ??= fillDefaults(def.A, view);
  def._B ??= fillDefaults(def.B || def.A, view);
  if (def.M) def._M ??= fillDefaults(def.M, view);
  const pfx = `fx${++uid}`;
  const dur = def.dur || 3.6;
  const tl = timeline(def);
  const frames = tl.map(([pct, s]) => {
    const pose = poseAt(def, rig, s);
    return { pct, s, pose, sol: solve(rig, pose) };
  });

  const css = [];
  const animate = (name, values) => {
    if (values.every((v) => v === values[0])) return `style="transform:${values[0]}"`;
    const cls = `${pfx}-${name}`;
    const kf = frames.map((f, i) => `${f2(f.pct)}%{transform:${values[i]}}`).join('');
    css.push(`@keyframes ${cls}{${kf}}.${cls}{animation:${cls} ${dur}s linear infinite}`);
    return `class="${cls}"`;
  };
  const tr = (x, y, r) => `translate(${f2(x)}px,${f2(y)}px) rotate(${f2(r)}deg)`;

  const muscleSet = {};
  for (const m of def.muscles || []) {
    for (const [seg, x, y, rx, ry] of MUSCLES[view][m] || []) {
      (muscleSet[seg] ||= []).push(`<ellipse class="mus" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`);
    }
  }

  const attachFor = (segId, z) =>
    (def.attach || [])
      .map((a, i) => ({ ...a, i }))
      .filter((a) => a.seg === segId && (a.z || 1) === z)
      .map((a) => {
        const g = rig.find((x) => x.id === segId);
        const vals = frames.map((f) => {
          const so = f.sol[segId];
          const local = a.at === 'end' ? [g.len, 0] : a.at;
          const r = a.fixed != null ? a.fixed - so.abs : 0;
          return tr(local[0] * so.s, local[1], r);
        });
        return `<g ${animate(`a${a.i}`, vals)}>${a.svg}</g>`;
      })
      .join('');

  const shape = (g) => {
    const far = g.far ? ' far' : '';
    switch (g.kind) {
      case 'limb':
        return `<line class="limb${far}" x2="${g.len}" stroke-width="${g.w}"/>`;
      case 'arm':
        return `<line class="limb${far}" x2="${g.len}" stroke-width="${g.w}"/><circle class="hand${far}" cx="${g.len}" r="4.6"/>`;
      case 'foot':
        return `<line class="limb${far}" x1="-3" x2="${g.len}" stroke-width="${g.w}"/>`;
      case 'head':
        return `<line class="limb" x1="-4" x2="6" stroke-width="8"/><circle class="hand" cx="12" r="10"/><circle class="eye" cx="14.5" cy="5" r="1.6"/>`;
      case 'fhead':
        return `<line class="limb" x1="-4" x2="6" stroke-width="9"/><circle class="hand" cx="12" r="10"/>`;
      case 'ftorso':
        return `<polygon class="poly" points="0,-11 20,-12.5 20,12.5 0,11"/>`;
      case 'fchest':
        return `<polygon class="poly" points="0,-12.5 21,-17 25,-11 25,11 21,17 0,12.5"/>`;
      default:
        return '';
    }
  };

  const children = (id) => rig.filter((g) => g.parent === id);
  const renderSeg = (g) => {
    const vals = frames.map((f) => {
      const so = f.sol[g.id];
      return tr(so.place[0], so.place[1], so.rel);
    });
    const scaleVals = frames.map((f) => `scaleX(${f2(f.sol[g.id].s)})`);
    const kids = children(g.id);
    const back = kids.filter((k) => (k.z || 0) < 0).map(renderSeg).join('');
    const front = kids.filter((k) => (k.z || 0) >= 0).map(renderSeg).join('');
    const scaled = scaleVals.some((v) => v !== 'scaleX(1)');
    const body = `${shape(g)}${(muscleSet[g.id] || []).join('')}`;
    return `<g ${animate(g.id, vals)}>${back}${attachFor(g.id, -1)}${
      scaled ? `<g ${animate(`s${g.id}`, scaleVals)}>${body}</g>` : body
    }${attachFor(g.id, 1)}${front}</g>`;
  };

  const rootVals = frames.map((f) => `translate(${f2(f.pose.root[0])}px,${f2(f.pose.root[1])}px)`);
  const figure = `<g ${animate('root', rootVals)}>${rig.filter((g) => !g.parent).map(renderSeg).join('')}</g>`;

  const cables = (z) =>
    (def.cables || [])
      .filter((c) => (c.z || 1) === z)
      .map((c, i) => {
        const vals = frames.map((f) => {
          const p = pointOn(rig, f.sol, c.seg, c.at || 'end');
          const dx = p[0] - c.from[0], dy = p[1] - c.from[1];
          return `${tr(c.from[0], c.from[1], Math.atan2(dy, dx) / RAD)} scaleX(${f2(Math.hypot(dx, dy))})`;
        });
        return `<g ${animate(`c${z}${i}`, vals)}><rect class="cable" y="-0.9" width="1" height="1.8"/></g>`;
      })
      .join('');

  let arrow = '';
  if (def.arrow) {
    const a = def.arrow;
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const s = k / 16;
      pts.push(pointOn(rig, solve(rig, poseAt(def, rig, s)), a.seg, a.at || 'end'));
    }
    if (def.work === 'BA') pts.reverse();
    const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len > 6) {
      const n = [-(y1 - y0) / len, (x1 - x0) / len];
      const off = a.off ?? 14;
      const shifted = pts.map(([x, y]) => [x + n[0] * off, y + n[1] * off]).slice(1, -1);
      const d = shifted.map(([x, y], i) => `${i ? 'L' : 'M'}${f2(x)} ${f2(y)}`).join(' ');
      arrow = `<path class="arrow" d="${d}" marker-end="url(#${pfx}-ah)"/>`;
    }
  }

  const label = opts.label ? ` aria-label="${opts.label}"` : ' aria-hidden="true"';
  const cablesBack = cables(-1), cablesFront = cables(1); // must run before css is serialized
  return `<svg class="fig${opts.still ? ' still' : ''}" viewBox="0 0 240 200" role="img"${label}>`
    + `<style>${css.join('')}</style>`
    + `<defs><marker id="${pfx}-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arrowhead"/></marker></defs>`
    + (def.bg || '') + cablesBack + figure + cablesFront + (def.fg || '') + arrow + (def.inset || '')
    + `</svg>`;
}

/** Generic picture for user-created exercises without an illustration. */
export function placeholderSVG() {
  return `<svg class="fig" viewBox="0 0 240 200" aria-hidden="true">
    <rect x="70" y="92" width="100" height="16" rx="4" class="eq2"/>
    <rect x="50" y="64" width="22" height="72" rx="6" class="plate"/>
    <rect x="168" y="64" width="22" height="72" rx="6" class="plate"/>
    <rect x="34" y="76" width="16" height="48" rx="5" class="plate"/>
    <rect x="190" y="76" width="16" height="48" rx="5" class="plate"/></svg>`;
}

// Helpers used by the illustration definitions.
export const geo = { rot, add, RAD };
