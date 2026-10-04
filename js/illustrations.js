// Pose + equipment definitions for every built-in exercise.
// Coordinates: viewBox 240×200, floor at y=190. See figure.js for angle conventions.
import { figureSVG, placeholderSVG } from './figure.js';

const FLOOR = '<line class="floor" x1="6" y1="190" x2="234" y2="190"/>';
const rrect = (cx, cy, ang, x, y, w, h, cls) =>
  `<rect transform="translate(${cx} ${cy}) rotate(${ang})" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="${cls}"/>`;
const line = (x1, y1, x2, y2, cls, w) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${w ? ` stroke-width="${w}"` : ''}/>`;
const pulley = (x, y) => `<circle cx="${x}" cy="${y}" r="5" class="pulley"/>`;

const PLATE = '<circle r="13" class="plate"/><circle r="3.2" class="bar"/>';
const SMALL_PLATE = '<circle r="11" class="plate"/><circle r="3" class="bar"/>';
const DUMBBELL = '<circle r="7.5" class="plate"/><circle r="2.6" class="bar"/>';
const HANDLE = '<circle r="3.6" class="bar"/>';

// Small top-view inset of the foot placement on the leg-press platform.
const SOLE = 'M0,-11C5,-11 6,-4 5,2C4.5,8 3,11 0,11C-3,11 -4.5,8 -5,2C-6,-4 -5,-11 0,-11Z';
const foot = (x, y, a) => `<path d="${SOLE}" transform="translate(${x} ${y}) rotate(${a})" class="sole"/>`;
function inset(kind) {
  let feet, text;
  if (kind === 'wide') {
    feet = foot(18, 26, -35) + foot(62, 26, 35);
    text = 'keng, panja tashqariga';
  } else if (kind === 'calf') {
    feet = foot(30, 30, -5) + foot(50, 30, 5);
    text = 'faqat panjalar';
  } else {
    feet = foot(28, 26, -8) + foot(52, 26, 8);
    text = 'yelka kengligida';
  }
  const plate = kind === 'calf'
    ? '<rect x="8" y="6" width="64" height="26" rx="2" class="insetplate"/>'
    : '<rect x="8" y="6" width="64" height="40" rx="2" class="insetplate"/>';
  return `<g transform="translate(6 6)"><rect width="80" height="62" rx="6" class="inset"/>${plate}${feet}`
    + `<text x="40" y="57" class="insettext">${text}</text></g>`;
}

// ---- Leg press machine (shared) -------------------------------------------------
const LP_ROOT = [90, 150];
const LP_BASE = {
  root: LP_ROOT, torso: -150, uaN: 70, faN: 20,
};
// Rail direction is perpendicular to the platform (platform plane at -120°).
const railDir = [Math.cos(-30 * Math.PI / 180), Math.sin(-30 * Math.PI / 180)];
const rail = (x, y, len) => line(x, y, (x + railDir[0] * len).toFixed(1), (y + railDir[1] * len).toFixed(1), 'rail', 6);
const LP_BG = FLOOR
  + rail(130, 106, 90)
  + line(208, 61, 214, 190, 'eq', 6)
  + line(60, 190, 216, 190, 'eq', 5)
  + line(92, 166, 92, 190, 'eq', 6)
  + rrect(LP_ROOT[0], LP_ROOT[1], -150, -18, -21, 80, 9, 'pad')
  + '<circle cx="86" cy="166" r="3.5" class="bar"/>';
const SLED = '<rect x="-22" y="0" width="40" height="6" rx="2" class="eq2"/><rect x="-12" y="6" width="20" height="14" rx="2" class="eq"/>';

export const ILLUSTRATIONS = {
  treadmill: {
    hold: false, dur: 1.1,
    A: { root: [118, 118], torso: -88, thN: 68, shN: 92, thF: 110, shF: 118, uaN: 110, faN: 30, uaF: 70, faF: -10 },
    B: { root: [118, 118], torso: -88, thN: 110, shN: 118, thF: 68, shF: 92, uaN: 70, faN: -10, uaF: 110, faF: 30 },
    muscles: ['quads', 'calves'],
    bg: FLOOR
      + line(206, 190, 194, 96, 'eq', 5)
      + '<rect x="176" y="84" width="34" height="14" rx="3" class="eq2"/>'
      + line(194, 116, 160, 116, 'eq2', 4)
      + '<rect x="32" y="186" width="178" height="9" rx="4.5" class="eq"/>'
      + line(38, 186.5, 204, 186.5, 'belt', 2),
  },

  bench: {
    work: 'BA',
    A: { root: [150, 145], torso: 180, uaN: -90, faN: -90, thN: 16, shN: 92, ftN: 0 },
    M: { root: [150, 145], torso: 180, uaN: -58, faN: -90, thN: 16, shN: 92, ftN: 0, s: { uaN: 0.35 } },
    B: { root: [150, 145], torso: 180, uaN: 48, faN: -90, thN: 16, shN: 92, ftN: 0, s: { uaN: 0.55 } },
    muscles: ['chest', 'frontDelt', 'triceps'],
    attach: [{ seg: 'faN', at: 'end', z: -1, svg: PLATE }],
    arrow: { seg: 'faN', off: -20 },
    bg: FLOOR
      + '<rect x="58" y="155" width="116" height="8" rx="3" class="pad"/>'
      + '<rect x="74" y="163" width="6" height="27" class="eq"/><rect x="152" y="163" width="6" height="27" class="eq"/>'
      + line(66, 190, 88, 190, 'eq', 4) + line(144, 190, 166, 190, 'eq', 4),
  },

  'incline-db': {
    work: 'BA',
    A: { root: [140, 145], torso: -145, uaN: -90, faN: -90, thN: 14, shN: 92, ftN: 0 },
    M: { root: [140, 145], torso: -145, uaN: -30, faN: -90, thN: 14, shN: 92, ftN: 0, s: { uaN: 0.25 } },
    B: { root: [140, 145], torso: -145, uaN: 64.8, faN: -90, thN: 14, shN: 92, ftN: 0, s: { uaN: 0.78 } },
    muscles: ['upperChest', 'frontDelt', 'triceps'],
    attach: [{ seg: 'faN', at: 'end', z: -1, svg: DUMBBELL }],
    arrow: { seg: 'faN', off: -18 },
    bg: FLOOR
      + rrect(140, 145, -145, -6, -21, 74, 9, 'pad')
      + '<rect x="116" y="155" width="48" height="8" rx="3" class="pad"/>'
      + line(140, 163, 140, 190, 'eq', 6) + line(104, 136, 100, 190, 'eq', 5)
      + line(92, 190, 160, 190, 'eq', 4),
  },

  'shoulder-press': {
    A: { root: [130, 145], torso: -95, uaN: 72.7, faN: -90, thN: 14, shN: 92, ftN: 0, s: { uaN: 0.57 } },
    M: { root: [130, 145], torso: -95, uaN: -73, faN: -90, thN: 14, shN: 92, ftN: 0, s: { uaN: 0.2 } },
    B: { root: [130, 145], torso: -95, uaN: -92, faN: -90, thN: 14, shN: 92, ftN: 0 },
    muscles: ['delt', 'triceps'],
    attach: [{ seg: 'faN', at: 'end', z: -1, svg: DUMBBELL }],
    arrow: { seg: 'faN', off: -18 },
    bg: FLOOR
      + rrect(130, 145, -95, -6, -21, 74, 9, 'pad')
      + '<rect x="104" y="155" width="50" height="8" rx="3" class="pad"/>'
      + line(126, 163, 126, 190, 'eq', 6) + line(108, 160, 104, 190, 'eq', 5)
      + line(96, 190, 156, 190, 'eq', 4),
  },

  'lateral-raise': {
    view: 'front',
    A: { root: [120, 122], torso: -90, uaN: 82, faN: 86, thN: 86, shN: 90 },
    B: { root: [120, 122], torso: -90, uaN: -2, faN: 8, thN: 86, shN: 90 },
    muscles: ['sideDelt'],
    attach: [
      { seg: 'faN', at: 'end', z: -1, svg: DUMBBELL },
      { seg: 'faF', at: 'end', z: -1, svg: DUMBBELL },
    ],
    arrow: { seg: 'faN', off: 14 },
    bg: FLOOR,
  },

  pushdown: {
    A: { root: [110, 122], torso: -84, uaN: 92, faN: -15, thN: 88, shN: 92, ftN: 0 },
    B: { root: [110, 122], torso: -84, uaN: 92, faN: 88, thN: 88, shN: 92, ftN: 0 },
    muscles: ['triceps'],
    attach: [{ seg: 'faN', at: 'end', z: 1, svg: HANDLE }],
    cables: [{ from: [196, 31], seg: 'faN' }],
    arrow: { seg: 'faN', off: -16 },
    bg: FLOOR
      + '<rect x="206" y="12" width="14" height="178" rx="2" class="eq"/>'
      + line(206, 26, 196, 26, 'eq2', 4) + pulley(196, 26),
  },

  'overhead-ext': {
    A: { root: [125, 123], torso: -60, chest: -58, uaN: -50, faN: 150, thN: 70, shN: 95, thF: 118, shF: 108 },
    B: { root: [125, 123], torso: -60, chest: -58, uaN: -50, faN: -45, thN: 70, shN: 95, thF: 118, shF: 108 },
    muscles: ['triceps'],
    attach: [{ seg: 'faN', at: 'end', z: 1, svg: HANDLE }],
    cables: [{ from: [32, 70], seg: 'faN', z: -1 }],
    arrow: { seg: 'faN', off: 16 },
    bg: FLOOR
      + '<rect x="12" y="12" width="14" height="178" rx="2" class="eq"/>'
      + line(26, 66, 32, 66, 'eq2', 4) + pulley(32, 66),
  },

  pullup: {
    view: 'front',
    A: { root: [120, 0], torso: -90, uaN: -60, faN: -57.3, thN: 88, shN: 92 },
    M: { root: [120, 0], torso: -90, uaN: -20, faN: -86.3, thN: 88, shN: 92 },
    B: { root: [120, 0], torso: -90, uaN: 40, faN: -75.4, thN: 88, shN: 92 },
    anchor: { seg: 'faN', point: [162, 24], axes: 'y' },
    muscles: ['lats', 'biceps'],
    arrow: { seg: 'chest', at: [24, 0], off: 52 },
    bg: FLOOR + line(30, 24, 30, 190, 'eq', 6) + line(210, 24, 210, 190, 'eq', 6),
    fg: line(24, 24, 216, 24, 'barline', 4),
  },

  'cable-row': {
    A: { root: [78, 148], torso: -72, uaN: 6, faN: 6, thN: -12, shN: 18, ftN: -72 },
    B: { root: [78, 148], torso: -90, uaN: 118.3, faN: -6.4, thN: -12, shN: 18, ftN: -72 },
    muscles: ['lats', 'midBack', 'biceps', 'rearDelt'],
    attach: [{ seg: 'faN', at: 'end', z: 1, svg: HANDLE }],
    cables: [{ from: [170, 150], seg: 'faN' }],
    arrow: { seg: 'faN', off: -16 },
    bg: FLOOR
      + '<rect x="32" y="158" width="76" height="8" rx="3" class="pad"/>'
      + line(46, 166, 46, 190, 'eq', 6) + line(98, 166, 98, 190, 'eq', 6)
      + rrect(140.7, 151, -72, -10, 4, 34, 6, 'eq2')
      + line(152, 162, 152, 190, 'eq', 5)
      + '<rect x="176" y="96" width="14" height="94" rx="2" class="eq"/>'
      + line(176, 150, 170, 150, 'eq2', 4) + pulley(170, 150)
      + line(30, 190, 190, 190, 'eq', 4),
  },

  'straight-arm': {
    // free (far) hand braced on the thigh just above the knee
    A: { root: [78, 122], torso: -8, uaN: -25, faN: -22, uaF: 142, faF: 148, thN: 95, shN: 85 },
    B: { root: [78, 122], torso: -8, uaN: 160, faN: 162, uaF: 142, faF: 148, thN: 95, shN: 85 },
    muscles: ['lats'],
    attach: [{ seg: 'faN', at: 'end', z: 1, svg: HANDLE }],
    cables: [{ from: [196, 32], seg: 'faN' }],
    arrow: { seg: 'faN', off: 18 },
    bg: FLOOR
      + '<rect x="208" y="12" width="14" height="178" rx="2" class="eq"/>'
      + line(208, 28, 196, 28, 'eq2', 4) + pulley(196, 28),
  },

  'barbell-curl': {
    A: { root: [110, 122], torso: -90, uaN: 92, faN: 86, thN: 90, shN: 90 },
    B: { root: [110, 122], torso: -90, uaN: 86, faN: -62, thN: 90, shN: 90 },
    muscles: ['biceps', 'forearm'],
    attach: [{ seg: 'faN', at: 'end', z: -1, svg: SMALL_PLATE }],
    arrow: { seg: 'faN', off: -20 },
    bg: FLOOR,
  },

  'db-curl': {
    A: { root: [110, 122], torso: -90, uaN: 92, faN: 86, thN: 90, shN: 90 },
    B: { root: [110, 122], torso: -90, uaN: 86, faN: -62, thN: 90, shN: 90 },
    muscles: ['biceps', 'forearm'],
    attach: [{ seg: 'faN', at: 'end', z: -1, svg: DUMBBELL }],
    arrow: { seg: 'faN', off: -20 },
    bg: FLOOR,
  },

  'leg-press': {
    work: 'BA',
    A: { ...LP_BASE, thN: -45, shN: -40, ftN: -120 },
    B: { ...LP_BASE, thN: -95, shN: 0, ftN: -120 },
    muscles: ['quads', 'glutes'],
    attach: [{ seg: 'ftN', at: [4, 5], z: 1, fixed: -120, svg: SLED }],
    arrow: { seg: 'ftN', at: [4, 0], off: 16 },
    bg: LP_BG,
    inset: inset('normal'),
  },

  'leg-press-wide': {
    work: 'BA',
    A: { ...LP_BASE, thN: -45, shN: -40, ftN: -120 },
    B: { ...LP_BASE, thN: -95, shN: 0, ftN: -120 },
    muscles: ['quads', 'adductors', 'glutes'],
    attach: [{ seg: 'ftN', at: [4, 5], z: 1, fixed: -120, svg: SLED }],
    arrow: { seg: 'ftN', at: [4, 0], off: 16 },
    bg: LP_BG,
    inset: inset('wide'),
  },

  'calf-press': {
    A: { ...LP_BASE, thN: -45, shN: -40, ftN: -150 },
    B: { ...LP_BASE, thN: -45, shN: -40, ftN: -95 },
    muscles: ['calves'],
    attach: [{ seg: 'ftN', at: [10, 4], z: 1, fixed: -120, svg: '<rect x="-6" y="0" width="40" height="6" rx="2" class="eq2"/><rect x="2" y="6" width="20" height="14" rx="2" class="eq"/>' }],
    arrow: { seg: 'ftN', at: 'end', off: 12 },
    bg: LP_BG,
    inset: inset('calf'),
  },

  'leg-curl': {
    A: { root: [110, 140], torso: 0, uaN: 60, faN: 0, thN: 180, shN: 180 },
    B: { root: [110, 140], torso: 0, uaN: 60, faN: 0, thN: 180, shN: 280 },
    muscles: ['hams'],
    attach: [{ seg: 'shN', at: [27, 11.5], z: 1, svg: '<circle r="6" class="roller"/>' }],
    arrow: { seg: 'shN', at: [27, 0], off: -16 },
    bg: FLOOR
      + '<circle cx="77" cy="140" r="5" class="eq2"/>'
      + line(77, 140, 66, 190, 'eq', 5)
      + '<rect x="82" y="150" width="122" height="9" rx="3" class="pad"/>'
      + '<rect x="94" y="159" width="6" height="31" class="eq"/><rect x="186" y="159" width="6" height="31" class="eq"/>'
      + '<circle cx="190" cy="164" r="3.5" class="bar"/>',
  },

  crunch: {
    A: { root: [130, 174], torso: 180, chest: 180, head: 180, uaN: -30, faN: 190, thN: -50, shN: 67, ftN: 0 },
    B: { root: [130, 174], torso: 180, chest: 208, head: 216, uaN: -2, faN: 218, thN: -50, shN: 67, ftN: 0 },
    muscles: ['abs'],
    arrow: { seg: 'chest', at: [24, 0], off: -16 },
    bg: '<rect x="20" y="184" width="200" height="6" rx="3" class="mat"/>' + FLOOR,
  },

  plank: {
    dur: 2.4,
    A: { root: [109.55, 165.7], torso: -9.4, uaN: 90, faN: 0, thN: 170.6, shN: 170.6 },
    muscles: ['abs', 'glutes'],
    bg: '<rect x="20" y="186" width="200" height="4" rx="2" class="mat"/>' + FLOOR,
    fg: '<line x1="40" y1="160.9" x2="166" y2="140" class="guide"/>',
  },
};

/** Returns the animated SVG markup for an exercise (or a placeholder). */
export function illustration(id, opts = {}) {
  const def = ILLUSTRATIONS[id];
  return def ? figureSVG(def, opts) : placeholderSVG();
}

export const hasIllustration = (id) => id in ILLUSTRATIONS;
