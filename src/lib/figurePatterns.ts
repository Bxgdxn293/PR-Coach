import { pose, type Equip, type Pattern } from './figure';

// Movement patterns for the animated exercise figure. Every library exercise maps to one of these (see patternFor).
const FLOOR = { k: 'ankle' as const, x: 0, y: -0.035 };
const BENCH_Y = -0.24;
const flatBench: Equip[] = [
  { k: 'rect', x0: -0.5, y0: BENCH_Y, x1: 0.12, y1: BENCH_Y + 0.05, r: 0.02 },
  { k: 'line', x0: -0.4, y0: BENCH_Y + 0.05, x1: -0.4, y1: 0, w: 0.016 },
  { k: 'line', x0: 0.02, y0: BENCH_Y + 0.05, x1: 0.02, y1: 0, w: 0.016 },
];
const seat: Equip[] = [
  { k: 'rect', x0: -0.14, y0: -0.255, x1: 0.1, y1: -0.21, r: 0.02 },
  { k: 'line', x0: -0.02, y0: -0.21, x1: -0.02, y1: 0, w: 0.016 },
];

const P: Record<string, Pattern> = {};
const def = (p: Pattern) => (P[p.id] = p);

// ---------------------------------------------------------------- chest
def({
  id: 'bench',
  anchor: { k: 'pelvis', x: 0, y: -0.325 },
  A: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 180, fa: 180 }),
  B: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 85, fa: 172 }),
  equip: [...flatBench, { k: 'hand', kind: 'plate' }],
});
def({
  id: 'bench_db',
  anchor: { k: 'pelvis', x: 0, y: -0.325 },
  A: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 180, fa: 180 }),
  B: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 85, fa: 178 }),
  equip: [...flatBench, { k: 'hand', kind: 'db' }],
});
def({
  id: 'incline',
  anchor: { k: 'pelvis', x: 0.04, y: -0.3 },
  A: pose({ tor: 222, th: 85, sh: -3, foot: 100, ua: 178, fa: 178 }),
  B: pose({ tor: 222, th: 85, sh: -3, foot: 100, ua: 100, fa: 178 }),
  equip: [
    { k: 'quad', pts: [[0.12, -0.255], [-0.12, -0.255], [-0.12, -0.21], [0.12, -0.21]] },
    { k: 'quad', pts: [[-0.1, -0.24], [-0.17, -0.23], [-0.43, -0.58], [-0.33, -0.64]] },
    { k: 'line', x0: 0, y0: -0.21, x1: 0, y1: 0, w: 0.016 },
    { k: 'hand', kind: 'plate' },
  ],
});
def({
  id: 'fly',
  anchor: { k: 'pelvis', x: 0, y: -0.325 },
  A: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 178, fa: 180 }),
  B: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 120, fa: 145 }),
  equip: [...flatBench, { k: 'hand', kind: 'db' }],
});
def({
  id: 'chestpress_seated',
  anchor: { k: 'pelvis', x: -0.04, y: -0.3 },
  A: pose({ tor: 186, th: 85, sh: -2, ua: 55, fa: 100 }),
  B: pose({ tor: 186, th: 85, sh: -2, ua: 82, fa: 92 }),
  equip: [
    ...seat,
    { k: 'rect', x0: -0.2, y0: -0.62, x1: -0.14, y1: -0.22, r: 0.03 },
    { k: 'hand', kind: 'bar' },
  ],
});
def({
  id: 'pushup',
  anchor: { k: 'wrist', x: 0.3, y: -0.04 },
  A: pose({ tor: 114, head: 6, ua: 0, fa: 0, th: -66, sh: -66, foot: 20 }),
  B: pose({ tor: 98, head: 6, ua: -80, fa: 65, th: -82, sh: -82, foot: 20 }),
  equip: [],
});
def({
  id: 'dip',
  anchor: { k: 'wrist', x: 0.05, y: -0.55 },
  A: pose({ tor: 176, ua: 0, fa: 0, th: 10, sh: -25, foot: 90 }),
  B: pose({ tor: 160, ua: -40, fa: 25, th: 10, sh: -25, foot: 90 }),
  equip: [
    { k: 'line', x0: -0.1, y0: -0.55, x1: 0.2, y1: -0.55, w: 0.014 },
    { k: 'line', x0: 0.05, y0: -0.55, x1: 0.05, y1: 0, w: 0.012 },
  ],
});
def({
  id: 'benchdip',
  anchor: { k: 'wrist', x: -0.2, y: -0.3 },
  A: pose({ tor: 205, ua: 0, fa: 0, th: 62, sh: 0, foot: 100 }),
  B: pose({ tor: 205, ua: -55, fa: 20, th: 62, sh: 0, foot: 100 }),
  equip: [{ k: 'rect', x0: -0.55, y0: -0.27, x1: -0.1, y1: -0.22, r: 0.02 }, { k: 'line', x0: -0.45, y0: -0.22, x1: -0.45, y1: 0, w: 0.016 }, { k: 'line', x0: -0.15, y0: -0.22, x1: -0.15, y1: 0, w: 0.016 }],
});

// ---------------------------------------------------------------- back
def({
  id: 'pullup',
  anchor: { k: 'wrist', x: 0.12, y: -1.05 },
  anchorB: { k: 'wrist', x: 0.12, y: -1.05 },
  A: pose({ tor: 182, head: 0, ua: 178, fa: 178, th: 4, sh: -20, foot: 80 }),
  B: pose({ tor: 178, head: -10, ua: 140, fa: 195, th: 4, sh: -24, foot: 80 }),
  equip: [{ k: 'line', x0: -0.25, y0: -1.05, x1: 0.45, y1: -1.05, w: 0.016 }, { k: 'line', x0: -0.25, y0: -1.05, x1: -0.25, y1: 0, w: 0.012 }],
});
def({
  id: 'pulldown',
  anchor: { k: 'pelvis', x: 0, y: -0.3 },
  A: pose({ tor: 190, th: 82, sh: 0, ua: 175, fa: 170 }),
  B: pose({ tor: 188, th: 82, sh: 0, ua: 120, fa: 215 }),
  equip: [
    ...seat,
    { k: 'line', x0: 0.05, y0: -1.05, x1: 0.05, y1: -1.1, w: 0.01 },
    { k: 'cable', x: 0.1, y: -1.1 },
    { k: 'hand', kind: 'bar' },
  ],
});
def({
  id: 'row_bent',
  anchor: FLOOR,
  A: pose({ tor: 128, head: 12, th: 20, sh: -22, ua: 10, fa: 5 }),
  B: pose({ tor: 128, head: 12, th: 20, sh: -22, ua: -55, fa: 80 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'row_seated',
  anchor: { k: 'pelvis', x: -0.1, y: -0.3 },
  A: pose({ tor: 180, th: 75, sh: -20, ua: 95, fa: 92 }),
  B: pose({ tor: 195, th: 75, sh: -20, ua: -10, fa: 90 }),
  equip: [...seat, { k: 'cable', x: 0.6, y: -0.33 }, { k: 'hand', kind: 'bar' }],
});
def({
  id: 'row_db',
  anchor: { k: 'ankle', x: 0, y: -0.035 },
  A: pose({ tor: 120, head: 14, th: 20, sh: -22, ua: 0, fa: 0, ua2: 70, fa2: 70 }),
  B: pose({ tor: 120, head: 14, th: 20, sh: -22, ua: -60, fa: 70, ua2: 70, fa2: 70 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'deadlift',
  anchor: FLOOR,
  A: pose({ tor: 140, head: 20, th: 42, sh: -28, ua: 0, fa: 0 }),
  B: pose({ tor: 180, head: 0, th: 0, sh: 0, ua: 0, fa: 0 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'rdl',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 0, sh: 0, ua: 0, fa: 0 }),
  B: pose({ tor: 122, head: 22, th: 22, sh: -4, ua: 5, fa: 5 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'backext',
  anchor: { k: 'ankle', x: 0, y: -0.035 },
  A: pose({ tor: 118, head: 12, th: 0, sh: 0, ua: 40, fa: 130 }),
  B: pose({ tor: 175, head: 0, th: 0, sh: 0, ua: 40, fa: 130 }),
  equip: [],
});
def({
  id: 'shrug',
  anchor: FLOOR,
  A: pose({ tor: 180, ua: 0, fa: 0, sho: 0 }),
  B: pose({ tor: 180, ua: 0, fa: 0, sho: 0.035 }),
  equip: [{ k: 'hand', kind: 'db' }],
});

// ---------------------------------------------------------------- legs
def({
  id: 'squat',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 3, sh: -3, ua: -40, fa: 155 }),
  B: pose({ tor: 138, head: 10, th: 100, sh: -30, ua: -40, fa: 155 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'goblet',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 3, sh: -3, ua: 25, fa: 150 }),
  B: pose({ tor: 150, head: 6, th: 100, sh: -30, ua: 25, fa: 150 }),
  equip: [{ k: 'hand', kind: 'kb' }],
});
def({
  id: 'bwsquat',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 3, sh: -3, ua: 25, fa: 120 }),
  B: pose({ tor: 148, head: 6, th: 100, sh: -30, ua: 85, fa: 90 }),
  equip: [],
});
def({
  id: 'legpress',
  anchor: { k: 'pelvis', x: -0.25, y: -0.25 },
  A: pose({ tor: 235, th: 155, sh: 80, foot: 35, ua: 60, fa: 60 }),
  B: pose({ tor: 235, th: 128, sh: 128, foot: 35, ua: 60, fa: 60 }),
  equip: [
    { k: 'quad', pts: [[-0.38, -0.2], [-0.15, -0.2], [-0.3, -0.5], [-0.6, -0.78], [-0.68, -0.7], [-0.45, -0.4]] },
    { k: 'footpad' },
  ],
});
def({
  id: 'lunge',
  anchor: { k: 'ankle', x: 0.1, y: -0.035 },
  A: pose({ tor: 180, th: 10, sh: -5, th2: -10, sh2: -12, ua: 0, fa: 0 }),
  B: pose({ tor: 178, th: 95, sh: -2, th2: -45, sh2: -100, ua: 0, fa: 0 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'legext',
  anchor: { k: 'pelvis', x: -0.02, y: -0.29 },
  A: pose({ tor: 190, th: 90, sh: 0, ua: 40, fa: 80 }),
  B: pose({ tor: 190, th: 90, sh: 85, ua: 40, fa: 80 }),
  equip: [...seat, { k: 'rect', x0: -0.2, y0: -0.6, x1: -0.14, y1: -0.22, r: 0.03 }],
});
def({
  id: 'legcurl',
  anchor: { k: 'pelvis', x: -0.1, y: -0.3 },
  A: pose({ tor: 186, th: 90, sh: 85, ua: 40, fa: 80 }),
  B: pose({ tor: 186, th: 90, sh: 0, ua: 40, fa: 80 }),
  equip: seat,
});
def({
  id: 'calf',
  anchor: FLOOR,
  anchorB: { k: 'ankle', x: 0, y: -0.095 },
  A: pose({ tor: 180, th: 0, sh: 0, foot: 90, ua: 0, fa: 0 }),
  B: pose({ tor: 180, th: 0, sh: 0, foot: 40, ua: 0, fa: 0 }),
  equip: [{ k: 'hand', kind: 'db' }, { k: 'rect', x0: -0.14, y0: -0.03, x1: 0.2, y1: 0, r: 0.01 }],
});
def({
  id: 'hipthrust',
  anchor: { k: 'ankle', x: 0.18, y: -0.035 },
  A: pose({ tor: 255, head: -10, th: 100, sh: 0, foot: 90, ua: 5, fa: 5 }),
  B: pose({ tor: 285, head: -8, th: 70, sh: 0, foot: 90, ua: 5, fa: 5 }),
  equip: [{ k: 'rect', x0: -0.55, y0: -0.4, x1: -0.3, y1: -0.35, r: 0.02 }, { k: 'line', x0: -0.45, y0: -0.35, x1: -0.45, y1: 0, w: 0.016 }],
});
def({
  id: 'bridge',
  anchor: { k: 'ankle', x: 0.2, y: -0.035 },
  A: pose({ tor: 270, head: 0, th: 85, sh: -25, foot: 90, ua: 80, fa: 85 }),
  B: pose({ tor: 288, head: 0, th: 65, sh: -2, foot: 90, ua: 80, fa: 85 }),
  equip: [],
});
def({
  id: 'kickback',
  anchor: { k: 'ankle', x: 0, y: -0.035 },
  A: pose({ tor: 140, head: 10, th: 10, sh: -10, th2: 40, sh2: 10, ua: 70, fa: 100 }),
  B: pose({ tor: 140, head: 10, th: 10, sh: -10, th2: -45, sh2: -50, ua: 70, fa: 100 }),
  equip: [],
});

// ---------------------------------------------------------------- shoulders
def({
  id: 'ohp',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 60, fa: 175 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 178, fa: 180 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'ohp_db',
  anchor: { k: 'pelvis', x: -0.02, y: -0.3 },
  A: pose({ tor: 184, th: 85, sh: -2, ua: 60, fa: 175 }),
  B: pose({ tor: 184, th: 85, sh: -2, ua: 178, fa: 180 }),
  equip: [...seat, { k: 'rect', x0: -0.2, y0: -0.7, x1: -0.14, y1: -0.22, r: 0.03 }, { k: 'hand', kind: 'db' }],
});
def({
  id: 'lateral',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 8, fa: 20 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 86, fa: 92 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'upright',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 5, fa: 5 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 80, fa: 190 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'facepull',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 95, fa: 92 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 65, fa: 195, head: 0 }),
  equip: [{ k: 'cable', x: 0.6, y: -0.85 }, { k: 'hand', kind: 'rope' }],
});
def({
  id: 'reardelt',
  anchor: FLOOR,
  A: pose({ tor: 125, head: 14, th: 22, sh: -20, ua: 5, fa: 5 }),
  B: pose({ tor: 125, head: 14, th: 22, sh: -20, ua: 40, fa: 40 }),
  equip: [{ k: 'hand', kind: 'db' }],
});

// ---------------------------------------------------------------- arms
def({
  id: 'curl',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 4, fa: 6 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 14, fa: 148 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'curl_bar',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 4, fa: 6 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 14, fa: 148 }),
  equip: [{ k: 'hand', kind: 'plate' }],
});
def({
  id: 'preacher',
  anchor: { k: 'pelvis', x: -0.05, y: -0.3 },
  A: pose({ tor: 186, th: 85, sh: -2, ua: 55, fa: 100 }),
  B: pose({ tor: 186, th: 85, sh: -2, ua: 55, fa: 215 }),
  equip: [...seat, { k: 'quad', pts: [[0.1, -0.52], [0.0, -0.36], [0.2, -0.3], [0.24, -0.48]] }, { k: 'hand', kind: 'db' }],
});
def({
  id: 'pushdown',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 5, fa: 110 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 5, fa: 15 }),
  equip: [{ k: 'cable', x: 0.12, y: -1.05 }, { k: 'hand', kind: 'bar' }],
});
def({
  id: 'skull',
  anchor: { k: 'pelvis', x: 0, y: -0.325 },
  A: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 180, fa: 180 }),
  B: pose({ tor: 270, th: 80, sh: -5, foot: 100, ua: 180, fa: 270 }),
  equip: [...flatBench, { k: 'hand', kind: 'plate' }],
});
def({
  id: 'overheadtri',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 178, fa: 278 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 178, fa: 180 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'trikick',
  anchor: FLOOR,
  A: pose({ tor: 125, head: 12, th: 20, sh: -20, ua: -75, fa: 10 }),
  B: pose({ tor: 125, head: 12, th: 20, sh: -20, ua: -75, fa: -75 }),
  equip: [{ k: 'hand', kind: 'db' }],
});

// ---------------------------------------------------------------- core
def({
  id: 'crunch',
  anchor: { k: 'pelvis', x: 0.0, y: -0.09 },
  A: pose({ tor: 262, head: 0, th: 125, sh: 20, foot: 90, ua: 100, fa: 100 }),
  B: pose({ tor: 225, head: 12, th: 125, sh: 20, foot: 90, ua: 120, fa: 120 }),
  equip: [],
});
def({
  id: 'situp',
  anchor: { k: 'pelvis', x: 0.0, y: -0.09 },
  A: pose({ tor: 262, head: 0, th: 125, sh: 20, foot: 90, ua: 100, fa: 100 }),
  B: pose({ tor: 195, head: 8, th: 125, sh: 20, foot: 90, ua: 120, fa: 110 }),
  equip: [],
});
def({
  id: 'cablecrunch',
  anchor: { k: 'pelvis', x: 0, y: -0.275 },
  A: pose({ tor: 190, th: 0, sh: -92, foot: 250, ua: 150, fa: 130 }),
  B: pose({ tor: 140, head: 20, th: 0, sh: -92, foot: 250, ua: 150, fa: 130 }),
  equip: [{ k: 'cable', x: 0.1, y: -1.1 }],
});
def({
  id: 'plank',
  anchor: { k: 'wrist', x: 0.3, y: -0.04 },
  A: pose({ tor: 102, head: 4, ua: 0, fa: 90, th: -78, sh: -78, foot: 20 }),
  B: pose({ tor: 101, head: 4, ua: 0, fa: 90, th: -79, sh: -79, foot: 20 }),
  equip: [],
});
def({
  id: 'legraise',
  anchor: { k: 'wrist', x: 0.1, y: -1.05 },
  A: pose({ tor: 180, ua: 178, fa: 178, th: 3, sh: 0, foot: 90 }),
  B: pose({ tor: 180, ua: 178, fa: 178, th: 88, sh: 72, foot: 120 }),
  equip: [{ k: 'line', x0: -0.2, y0: -1.05, x1: 0.4, y1: -1.05, w: 0.016 }, { k: 'line', x0: -0.2, y0: -1.05, x1: -0.2, y1: 0, w: 0.012 }],
});
def({
  id: 'pallof',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 35, fa: 120 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 90, fa: 90 }),
  equip: [{ k: 'cable', x: 0.6, y: -0.62 }, { k: 'hand', kind: 'bar' }],
});
def({
  id: 'woodchop',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 8, sh: -4, ua: 150, fa: 150 }),
  B: pose({ tor: 165, th: 18, sh: -8, ua: 30, fa: 40 }),
  equip: [{ k: 'cable', x: 0.5, y: -1.0 }, { k: 'hand', kind: 'bar' }],
});
def({
  id: 'rollout',
  anchor: { k: 'pelvis', x: 0, y: -0.275 },
  A: pose({ tor: 140, head: 10, th: 0, sh: -92, foot: 250, ua: 100, fa: 100 }),
  B: pose({ tor: 98, head: 6, th: 0, sh: -92, foot: 250, ua: 112, fa: 100 }),
  equip: [{ k: 'hand', kind: 'db' }],
});
def({
  id: 'twist',
  anchor: { k: 'pelvis', x: 0, y: -0.09 },
  A: pose({ tor: 218, head: 0, th: 125, sh: 20, foot: 90, ua: 80, fa: 100 }),
  B: pose({ tor: 218, head: 0, th: 125, sh: 20, foot: 90, ua: 100, fa: 80 }),
  equip: [{ k: 'hand', kind: 'db' }],
});

// ---------------------------------------------------------------- cardio / full body
def({
  id: 'run',
  alt: true,
  anchor: { k: 'pelvis', x: 0, y: -0.5 },
  A: pose({ tor: 170, th: 72, sh: -20, foot: 100, ua: 62, fa: 125 }),
  B: pose({ tor: 170, th: -30, sh: -72, foot: 60, ua: -45, fa: 70 }),
  ms: 650,
  equip: [],
});
def({
  id: 'climber',
  alt: true,
  anchor: { k: 'wrist', x: 0.3, y: -0.04 },
  A: pose({ tor: 114, head: 6, ua: 0, fa: 0, th: -66, sh: -66, foot: 20 }),
  B: pose({ tor: 114, head: 6, ua: 0, fa: 0, th: 40, sh: -50, foot: 20 }),
  ms: 900,
  equip: [],
});
def({
  id: 'swing',
  anchor: FLOOR,
  A: pose({ tor: 128, head: 14, th: 38, sh: -22, ua: 25, fa: 25 }),
  B: pose({ tor: 176, head: 0, th: 5, sh: -3, ua: 92, fa: 92 }),
  equip: [{ k: 'hand', kind: 'kb' }],
});
def({
  id: 'bike',
  alt: true,
  anchor: { k: 'pelvis', x: -0.12, y: -0.56 },
  A: pose({ tor: 138, head: 20, th: 82, sh: 25, foot: 100, ua: 55, fa: 100 }),
  B: pose({ tor: 138, head: 20, th: 28, sh: 2, foot: 100, ua: 55, fa: 100 }),
  ms: 1100,
  equip: [
    { k: 'ring', x: -0.42, y: -0.28, r: 0.27 },
    { k: 'ring', x: 0.48, y: -0.28, r: 0.27 },
    { k: 'line', x0: -0.42, y0: -0.28, x1: -0.12, y1: -0.6, w: 0.014 },
    { k: 'line', x0: -0.12, y0: -0.6, x1: 0.3, y1: -0.7, w: 0.014 },
    { k: 'line', x0: -0.12, y0: -0.6, x1: 0.06, y1: -0.28, w: 0.014 },
    { k: 'line', x0: 0.06, y0: -0.28, x1: -0.42, y1: -0.28, w: 0.014 },
    { k: 'line', x0: 0.3, y0: -0.7, x1: 0.48, y1: -0.28, w: 0.014 },
  ],
});
def({
  id: 'rowmachine',
  anchor: { k: 'pelvis', x: -0.1, y: -0.3 },
  A: pose({ tor: 148, head: 12, th: 128, sh: 52, foot: 60, ua: 95, fa: 90 }),
  B: pose({ tor: 205, head: -4, th: 82, sh: 5, foot: 90, ua: -8, fa: 95 }),
  equip: [...seat, { k: 'hand', kind: 'bar' }],
});
def({
  id: 'jump',
  anchor: { k: 'ankle', x: 0, y: -0.035 },
  anchorB: { k: 'ankle', x: 0, y: -0.2 },
  A: pose({ tor: 150, head: 10, th: 70, sh: -35, ua: -20, fa: 20 }),
  B: pose({ tor: 180, head: 0, th: 2, sh: 0, ua: 150, fa: 150, foot: 40 }),
  ms: 900,
  equip: [],
});
def({
  id: 'stand',
  anchor: FLOOR,
  A: pose({ tor: 180, th: 2, sh: 0, ua: 5, fa: 12 }),
  B: pose({ tor: 180, th: 2, sh: 0, ua: 10, fa: 30 }),
  equip: [],
});

export const PATTERNS = P;

/** Maps a library exercise name to a movement pattern id. */
export function patternIdFor(name: string): string {
  const n = name.toLowerCase();
  const has = (re: RegExp) => re.test(n);
  if (has(/bench dip/)) return 'benchdip';
  if (has(/\bdip\b/)) return 'dip';
  if (has(/push-up|push up|pike/)) return 'pushup';
  if (has(/skull/)) return 'skull';
  if (has(/incline.*(fly)/) || has(/fly|pec deck(?!.*reverse)/)) return has(/rear|reverse/) ? 'reardelt' : 'fly';
  if (has(/reverse pec deck|rear delt/)) return 'reardelt';
  if (has(/machine chest press|smith machine bench|landmine press|chest press/)) return 'chestpress_seated';
  if (has(/incline/) && !has(/curl/)) return 'incline';
  if (has(/dumbbell bench/)) return 'bench_db';
  if (has(/bench press/)) return 'bench';
  if (has(/pull-up|chin-up|assisted pull/)) return 'pullup';
  if (has(/pulldown|straight-arm/)) return 'pulldown';
  if (has(/seated cable row|chest-supported/)) return 'row_seated';
  if (has(/one-arm|meadows/)) return 'row_db';
  if (has(/inverted row/)) return 'row_bent';
  if (has(/upright row/)) return 'upright';
  if (has(/row/)) return has(/rowing machine/) ? 'rowmachine' : 'row_bent';
  if (has(/romanian|stiff-leg|good morning/)) return 'rdl';
  if (has(/pull-through/)) return 'rdl';
  if (has(/deadlift|rack pull/)) return 'deadlift';
  if (has(/back extension/)) return 'backext';
  if (has(/shrug/)) return 'shrug';
  if (has(/swing/)) return 'swing';
  if (has(/goblet/)) return 'goblet';
  if (has(/bodyweight squat|sissy|wall sit/)) return 'bwsquat';
  if (has(/leg press|hack/)) return 'legpress';
  if (has(/lunge|split squat|step-up/)) return 'lunge';
  if (has(/squat/)) return 'squat';
  if (has(/leg extension/)) return 'legext';
  if (has(/leg curl|nordic/)) return 'legcurl';
  if (has(/adductor|abductor/)) return 'legext';
  if (has(/calf/)) return 'calf';
  if (has(/hip thrust|glute bridge|frog pump/)) return has(/hip thrust/) ? 'hipthrust' : 'bridge';
  if (has(/kickback/)) return has(/triceps/) ? 'trikick' : 'kickback';
  if (has(/arnold|seated.*press|machine shoulder/)) return 'ohp_db';
  if (has(/overhead press|push press|kettlebell press|landmine shoulder/)) return 'ohp';
  if (has(/raise/) && !has(/leg|knee/)) return 'lateral';
  if (has(/face pull|cable rear/)) return 'facepull';
  if (has(/preacher|concentration|spider/)) return 'preacher';
  if (has(/curl/) && !has(/leg/)) return has(/barbell|ez-bar|reverse|wrist/) ? 'curl_bar' : 'curl';
  if (has(/overhead triceps/)) return 'overheadtri';
  if (has(/pushdown/)) return 'pushdown';
  if (has(/close-grip bench/)) return 'bench';
  if (has(/cable crunch|machine crunch/)) return 'cablecrunch';
  if (has(/sit-up|decline sit/)) return 'situp';
  if (has(/crunch|dead bug|hollow|bicycle/)) return 'crunch';
  if (has(/russian/)) return 'twist';
  if (has(/plank|bird dog/)) return 'plank';
  if (has(/leg raise|knee raise|toes to bar/)) return 'legraise';
  if (has(/pallof/)) return 'pallof';
  if (has(/woodchop/)) return 'woodchop';
  if (has(/rollout/)) return 'rollout';
  if (has(/mountain/)) return 'climber';
  if (has(/stationary bike/)) return 'bike';
  if (has(/rowing machine/)) return 'rowmachine';
  if (has(/run|elliptical|stair/)) return 'run';
  if (has(/jump|burpee/)) return 'jump';
  return 'stand';
}

export const patternFor = (name: string): Pattern => PATTERNS[patternIdFor(name)] ?? PATTERNS.stand;
