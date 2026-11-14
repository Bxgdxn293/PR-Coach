// Side-view animated exercise figure: pure geometry, no React. Used by ExerciseFigure (app) and the design canvas.
// Units: body height ~ 1. x to the right (the figure faces right), y down, floor at y = 0 (so the body is at negative y).
// Angles are in degrees. dir(a) = (sin a, cos a): 0 = down, 90 = forward, 180 = up, -90 (=270) = backward.

export type Pose = {
  tor: number; // torso direction, hip -> shoulder (180 = upright, <180 leans forward)
  head: number; // extra head tilt
  ua: number; // upper arm, shoulder -> elbow
  fa: number; // forearm, elbow -> wrist
  th: number; // thigh, hip -> knee
  sh: number; // shin, knee -> ankle
  foot: number; // foot direction, ankle -> toe (90 = flat, pointing forward)
  sho?: number; // shoulder lift along the torso (shrugs)
  // far (second) side; defaults to the same as the near side
  ua2?: number;
  fa2?: number;
  th2?: number;
  sh2?: number;
};

export type Anchor =
  | { k: 'ankle'; x: number; y: number }
  | { k: 'pelvis'; x: number; y: number }
  | { k: 'wrist'; x: number; y: number };

export type Prim =
  | { t: 'path'; d: string; f: string; o?: number; s?: string; sw?: number }
  | { t: 'circle'; x: number; y: number; r: number; f: string; o?: number; s?: string; sw?: number };

export type Equip =
  | { k: 'rect'; x0: number; y0: number; x1: number; y1: number; r?: number; f?: string }
  | { k: 'line'; x0: number; y0: number; x1: number; y1: number; w?: number; f?: string }
  | { k: 'hand'; kind: 'plate' | 'db' | 'kb' | 'bar' | 'rope' }
  | { k: 'cable'; x: number; y: number } // line from a fixed pulley to the hand
  | { k: 'quad'; pts: number[][]; f?: string } // free polygon
  | { k: 'ring'; x: number; y: number; r: number; w?: number } // wheel outline
  | { k: 'footpad' }; // foot plate that follows the ankle (leg press)

export type Pattern = {
  id: string;
  A: Pose;
  B: Pose;
  anchor: Anchor;
  anchorB?: Anchor; // optional different anchor at the end pose (e.g. pull-up)
  equip: Equip[];
  alt?: boolean; // far limbs move in opposition (running, climbers)
  ms?: number; // loop duration
};

// ---------------------------------------------------------------- dimensions
const L = { torso: 0.3, neck: 0.075, head: 0.062, ua: 0.17, fa: 0.15, hand: 0.05, th: 0.245, sh: 0.245, foot: 0.12 };
const rad = (a: number) => (a * Math.PI) / 180;
const dir = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: number[], d: number[], k = 1): [number, number] => [p[0] + d[0] * k, p[1] + d[1] * k];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f2 = (n: number) => (Math.round(n * 1000) / 1000).toString();

const base: Pose = { tor: 180, head: 0, ua: 0, fa: 0, th: 0, sh: 0, foot: 90 };
export const pose = (o: Partial<Pose>): Pose => ({ ...base, ...o });

// ---------------------------------------------------------------- kinematics
type Joints = {
  pelvis: [number, number];
  shoulder: [number, number];
  neckTop: [number, number];
  headC: [number, number];
  elbow: [number, number];
  wrist: [number, number];
  handEnd: [number, number];
  knee: [number, number];
  ankle: [number, number];
  toe: [number, number];
  heel: [number, number];
  elbow2: [number, number];
  wrist2: [number, number];
  knee2: [number, number];
  ankle2: [number, number];
  toe2: [number, number];
  heel2: [number, number];
};

function solve(p: Pose, anchor: Anchor): Joints {
  const ua2 = p.ua2 ?? p.ua, fa2 = p.fa2 ?? p.fa, th2 = p.th2 ?? p.th, sh2 = p.sh2 ?? p.sh;
  let pelvis: [number, number] = [0, 0];
  const torsoV = (): [number, number] => [dir(p.tor)[0] * L.torso, dir(p.tor)[1] * L.torso];
  if (anchor.k === 'pelvis') pelvis = [anchor.x, anchor.y];
  else if (anchor.k === 'ankle') {
    const a = add(add([0, 0], dir(p.th), L.th), dir(p.sh), L.sh);
    pelvis = [anchor.x - a[0], anchor.y - a[1]];
  } else {
    const a = add(add([torsoV()[0] + dir(p.tor)[0] * (p.sho ?? 0), torsoV()[1] + dir(p.tor)[1] * (p.sho ?? 0)], dir(p.ua), L.ua), dir(p.fa), L.fa);
    pelvis = [anchor.x - a[0], anchor.y - a[1]];
  }
  const shoulder = add(pelvis, dir(p.tor), L.torso + (p.sho ?? 0));
  const neckTop = add(shoulder, dir(p.tor + p.head * 0.5), L.neck);
  const headC = add(neckTop, dir(p.tor + p.head), L.head * 0.9);
  const elbow = add(shoulder, dir(p.ua), L.ua);
  const wrist = add(elbow, dir(p.fa), L.fa);
  const handEnd = add(wrist, dir(p.fa), L.hand);
  const knee = add(pelvis, dir(p.th), L.th);
  const ankle = add(knee, dir(p.sh), L.sh);
  const toe = add(ankle, dir(p.foot), L.foot);
  const heel = add(ankle, dir(p.foot), -0.035);
  const elbow2 = add(shoulder, dir(ua2), L.ua);
  const wrist2 = add(elbow2, dir(fa2), L.fa);
  const knee2 = add(pelvis, dir(th2), L.th);
  const ankle2 = add(knee2, dir(sh2), L.sh);
  const toe2 = add(ankle2, dir(p.foot), L.foot);
  const heel2 = add(ankle2, dir(p.foot), -0.035);
  return { pelvis, shoulder, neckTop, headC, elbow, wrist, handEnd, knee, ankle, toe, heel, elbow2, wrist2, knee2, ankle2, toe2, heel2 };
}

// ---------------------------------------------------------------- shapes
type Prof = number[]; // half-widths at 5 stations along a segment

/** Smooth closed path through points (Catmull-Rom -> cubic Bezier). */
function smooth(pts: number[][]): string {
  const n = pts.length;
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d + 'Z';
}

const sample = (prof: Prof, t: number): number => {
  const x = Math.min(0.9999, Math.max(0, t)) * (prof.length - 1);
  const i = Math.floor(x), k = x - i;
  const s = k * k * (3 - 2 * k);
  return lerp(prof[i], prof[i + 1], s);
};

type Seg = {
  a: [number, number];
  b: [number, number];
  ang: number; // direction a->b
  front: Prof;
  back: Prof;
  fsign: 1 | -1; // which perpendicular is "front" (anterior)
};

const normal = (ang: number, fsign: 1 | -1): [number, number] => {
  const d = dir(ang);
  return [(d[1] as number) * fsign, -(d[0] as number) * fsign];
};

function segPoint(s: Seg, t: number, side: 'f' | 'b' | 'c', k = 1): [number, number] {
  const d = dir(s.ang);
  const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
  const c: [number, number] = [s.a[0] + d[0] * len * t, s.a[1] + d[1] * len * t];
  const n = normal(s.ang, s.fsign);
  if (side === 'c') return c;
  if (side === 'f') return add(c, n, sample(s.front, t) * k);
  return add(c, n, -sample(s.back, t) * k);
}

function segOutline(s: Seg): string {
  const ts = [0, 0.25, 0.5, 0.75, 1];
  const d = dir(s.ang);
  const pts: number[][] = [];
  const cap = (t: number, sgn: number) => {
    const w = (sample(s.front, t) + sample(s.back, t)) / 2;
    const c = segPoint(s, t, 'c');
    pts.push(add(c, d, sgn * w * 0.95));
  };
  cap(0, -1);
  ts.forEach((t) => pts.push(segPoint(s, t, 'f')));
  cap(1, 1);
  [...ts].reverse().forEach((t) => pts.push(segPoint(s, t, 'b')));
  return smooth(pts);
}

/** Highlight on one face of a segment between t0 and t1; inset = how far toward the other face it reaches. */
function segMuscle(s: Seg, side: 'f' | 'b' | 'both', t0: number, t1: number, inset = 0.78): string {
  const us = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const ts = us.map((u) => lerp(t0, t1, u));
  const g = (u: number) => 0.18 + 0.82 * Math.pow(Math.sin(Math.PI * u), 0.6); // lens-shaped ends
  const pts: number[][] = [];
  const n = normal(s.ang, s.fsign);
  if (side === 'both') {
    ts.forEach((t, i) => pts.push(add(segPoint(s, t, 'c'), n, sample(s.front, t) * 0.9 * g(us[i]))));
    ts.map((t, i) => [t, i] as const).reverse().forEach(([t, i]) => pts.push(add(segPoint(s, t, 'c'), n, -sample(s.back, t) * 0.9 * g(us[i]))));
    return smooth(pts);
  }
  const k = side === 'f' ? 1 : -1;
  ts.forEach((t, i) => {
    const w = sample(side === 'f' ? s.front : s.back, t);
    pts.push(add(segPoint(s, t, 'c'), n, k * w * 0.97 * g(us[i])));
  });
  ts.map((t, i) => [t, i] as const).reverse().forEach(([t, i]) => {
    const w = sample(side === 'f' ? s.front : s.back, t);
    pts.push(add(segPoint(s, t, 'c'), n, k * w * -0.42 * g(us[i])));
  });
  return smooth(pts);
}

const P_THIGH_F: Prof = [0.052, 0.074, 0.083, 0.07, 0.05];
const P_THIGH_B: Prof = [0.06, 0.068, 0.062, 0.05, 0.044];
const P_SHIN_F: Prof = [0.046, 0.05, 0.043, 0.034, 0.028];
const P_SHIN_B: Prof = [0.046, 0.066, 0.058, 0.04, 0.028];
const P_UA_F: Prof = [0.052, 0.054, 0.05, 0.04, 0.035];
const P_UA_B: Prof = [0.05, 0.054, 0.05, 0.04, 0.035];
const P_FA_F: Prof = [0.038, 0.043, 0.036, 0.029, 0.021];
const P_FA_B: Prof = [0.038, 0.04, 0.034, 0.027, 0.021];
// torso: t = 0 at the hip, 1 at the shoulder
const P_TO_F: Prof = [0.082, 0.072, 0.092, 0.114, 0.09];
const P_TO_B: Prof = [0.09, 0.074, 0.088, 0.1, 0.088];

// ---------------------------------------------------------------- muscles
type MuscleDef =
  | { seg: 'torso' | 'uarm' | 'farm' | 'thigh' | 'shin'; side: 'f' | 'b' | 'both'; t0: number; t1: number; inset?: number }
  | { seg: 'delt'; off: number }
  | { seg: 'glute' }
  | { seg: 'neck' };

export const MUSCLE_SHAPES: Record<string, MuscleDef> = {
  chest: { seg: 'torso', side: 'f', t0: 0.5, t1: 0.94, inset: 0.55 },
  abs: { seg: 'torso', side: 'f', t0: 0.06, t1: 0.5, inset: 0.6 },
  obliques: { seg: 'torso', side: 'both', t0: 0.14, t1: 0.46 },
  traps: { seg: 'torso', side: 'b', t0: 0.84, t1: 1, inset: 0.4 },
  upper_back: { seg: 'torso', side: 'b', t0: 0.6, t1: 0.92, inset: 0.5 },
  lats: { seg: 'torso', side: 'b', t0: 0.3, t1: 0.78, inset: 0.45 },
  lower_back: { seg: 'torso', side: 'b', t0: 0.0, t1: 0.36, inset: 0.5 },
  biceps: { seg: 'uarm', side: 'f', t0: 0.12, t1: 0.82, inset: 0.4 },
  triceps: { seg: 'uarm', side: 'b', t0: 0.08, t1: 0.86, inset: 0.4 },
  forearms: { seg: 'farm', side: 'both', t0: 0.02, t1: 0.8 },
  quads: { seg: 'thigh', side: 'f', t0: 0.1, t1: 0.92, inset: 0.45 },
  hamstrings: { seg: 'thigh', side: 'b', t0: 0.08, t1: 0.88, inset: 0.45 },
  adductors: { seg: 'thigh', side: 'both', t0: 0.15, t1: 0.7 },
  calves: { seg: 'shin', side: 'b', t0: 0.06, t1: 0.7, inset: 0.4 },
  delts_front: { seg: 'delt', off: 1 },
  delts_side: { seg: 'delt', off: 0 },
  delts_rear: { seg: 'delt', off: -1 },
  glutes: { seg: 'glute' },
};

// ---------------------------------------------------------------- colours
export const COL = {
  skinA: '#454a5e',
  skinB: '#2c2f3d',
  far: '#20222c',
  line: '#5a5f76',
  hi1: '#ff5a52',
  hi2: '#d4202c',
  equip: '#c9ccd8',
  equipDark: '#8a8da0',
  furn: '#3a3d4d',
  floor: '#2a2c38',
};

// ---------------------------------------------------------------- frame
export type Frame = { prims: Prim[]; floorY: number };

export const easeLoop = (t: number) => (1 - Math.cos(2 * Math.PI * t)) / 2; // 0 -> 1 -> 0 over t in [0,1]

const mix = (a: Pose, b: Pose, s: number): Pose => {
  const o: any = {};
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    const x = a[k] as number | undefined, y = b[k] as number | undefined;
    if (x === undefined && y === undefined) return;
    o[k] = lerp(x ?? (y as number), y ?? (x as number), s);
  });
  return o as Pose;
};

/** Build all shapes for one moment. `s` in [0,1] = progress between pose A and pose B. */
export function buildFrame(pat: Pattern, s: number, primary: string[], secondary: string[]): Frame {
  const pose2 = mix(pat.A, pat.B, s);
  if (pat.alt) {
    // far limbs follow the opposite phase
    const o = mix(pat.A, pat.B, 1 - s);
    pose2.ua2 = o.ua; pose2.fa2 = o.fa; pose2.th2 = o.th; pose2.sh2 = o.sh;
  }
  const anchor: Anchor = pat.anchorB
    ? { ...pat.anchor, x: lerp(pat.anchor.x, pat.anchorB.x, s), y: lerp(pat.anchor.y, pat.anchorB.y, s) } as Anchor
    : pat.anchor;
  const j = solve(pose2, anchor);
  const prims: Prim[] = [];
  const push = (p: Prim) => prims.push(p);

  const seg = (a: [number, number], b: [number, number], ang: number, front: Prof, back: Prof, fsign: 1 | -1): Seg => ({ a, b, ang, front, back, fsign });
  const p = pose2;
  const farUa = p.ua2 ?? p.ua, farFa = p.fa2 ?? p.fa, farTh = p.th2 ?? p.th, farSh = p.sh2 ?? p.sh;

  const torso = seg(j.pelvis, j.shoulder, p.tor, P_TO_F, P_TO_B, -1);
  const thigh = seg(j.pelvis, j.knee, p.th, P_THIGH_F, P_THIGH_B, 1);
  const shin = seg(j.knee, j.ankle, p.sh, P_SHIN_F, P_SHIN_B, 1);
  const uarm = seg(j.shoulder, j.elbow, p.ua, P_UA_F, P_UA_B, 1);
  const farm = seg(j.elbow, j.wrist, p.fa, P_FA_F, P_FA_B, 1);
  const thigh2 = seg(j.pelvis, j.knee2, farTh, P_THIGH_F, P_THIGH_B, 1);
  const shin2 = seg(j.knee2, j.ankle2, farSh, P_SHIN_F, P_SHIN_B, 1);
  const uarm2 = seg(j.shoulder, j.elbow2, farUa, P_UA_F, P_UA_B, 1);
  const farm2 = seg(j.elbow2, j.wrist2, farFa, P_FA_F, P_FA_B, 1);

  const footPath = (heel: [number, number], toe: [number, number], ankle: [number, number], foot: number) => {
    const n = normal(foot, 1); // points down for foot=90 (sole side)
    const up = [-n[0], -n[1]];
    return smooth([
      add(heel, up, 0.012), add(ankle, up, 0.03), add(add(ankle, dir(foot), 0.07), up, 0.02),
      add(toe, up, 0.004), add(toe, n, 0.012), add(add(ankle, dir(foot), 0.05), n, 0.04), add(heel, n, 0.03), add(heel, n, 0.005),
    ]);
  };

  // equipment that sits behind the body (benches, pads, pulleys)
  const drawEquip = (behind: boolean) => {
    pat.equip.forEach((e) => {
      if (e.k === 'rect' && behind) {
        const r = e.r ?? 0.02;
        push({ t: 'path', d: `M${f2(e.x0 + r)} ${f2(e.y0)}H${f2(e.x1 - r)}Q${f2(e.x1)} ${f2(e.y0)} ${f2(e.x1)} ${f2(e.y0 + r)}V${f2(e.y1 - r)}Q${f2(e.x1)} ${f2(e.y1)} ${f2(e.x1 - r)} ${f2(e.y1)}H${f2(e.x0 + r)}Q${f2(e.x0)} ${f2(e.y1)} ${f2(e.x0)} ${f2(e.y1 - r)}V${f2(e.y0 + r)}Q${f2(e.x0)} ${f2(e.y0)} ${f2(e.x0 + r)} ${f2(e.y0)}Z`, f: e.f ?? COL.furn });
      } else if (e.k === 'quad' && behind) {
        push({ t: 'path', d: 'M' + e.pts.map((q) => `${f2(q[0])} ${f2(q[1])}`).join('L') + 'Z', f: e.f ?? COL.furn });
      } else if (e.k === 'ring' && behind) {
        push({ t: 'circle', x: e.x, y: e.y, r: e.r, f: 'none', s: COL.furn, sw: e.w ?? 0.014 });
      } else if (e.k === 'footpad' && !behind) {
        const d = dir(p.sh);
        const c = add(j.ankle, d, 0.075);
        const nn: [number, number] = [d[1], -d[0]];
        push({ t: 'path', d: `M${f2(c[0] + nn[0] * 0.17)} ${f2(c[1] + nn[1] * 0.17)}L${f2(c[0] - nn[0] * 0.17)} ${f2(c[1] - nn[1] * 0.17)}`, f: 'none', s: COL.equip, sw: 0.022 });
      } else if (e.k === 'line' && behind) {
        push({ t: 'path', d: `M${f2(e.x0)} ${f2(e.y0)}L${f2(e.x1)} ${f2(e.y1)}`, f: 'none', s: e.f ?? COL.furn, sw: e.w ?? 0.012 });
      } else if (e.k === 'cable' && behind) {
        push({ t: 'path', d: `M${f2(e.x)} ${f2(e.y)}L${f2(j.wrist[0])} ${f2(j.wrist[1])}`, f: 'none', s: COL.equipDark, sw: 0.006 });
        push({ t: 'circle', x: e.x, y: e.y, r: 0.025, f: COL.furn, s: COL.equipDark, sw: 0.006 });
      } else if (e.k === 'hand' && !behind) {
        const [hx, hy] = j.wrist;
        if (e.kind === 'plate') {
          push({ t: 'circle', x: hx, y: hy, r: 0.088, f: '#1c1e27', s: COL.equipDark, sw: 0.008 });
          push({ t: 'circle', x: hx, y: hy, r: 0.054, f: '#2a2d3a' });
          push({ t: 'circle', x: hx, y: hy, r: 0.02, f: COL.equip });
        } else if (e.kind === 'db') {
          push({ t: 'circle', x: hx, y: hy, r: 0.05, f: '#1c1e27', s: COL.equipDark, sw: 0.007 });
          push({ t: 'circle', x: hx, y: hy, r: 0.016, f: COL.equip });
        } else if (e.kind === 'kb') {
          push({ t: 'circle', x: hx, y: hy + 0.05, r: 0.06, f: '#1c1e27', s: COL.equipDark, sw: 0.007 });
        } else if (e.kind === 'bar') {
          push({ t: 'circle', x: hx, y: hy, r: 0.018, f: COL.equip });
        } else if (e.kind === 'rope') {
          push({ t: 'circle', x: hx, y: hy, r: 0.014, f: COL.equip });
        }
      }
    });
  };

  // floor
  push({ t: 'path', d: 'M-0.9 0.01H0.9', f: 'none', s: COL.floor, sw: 0.012 });
  drawEquip(true);

  const body = (segm: Seg, fill: string) => push({ t: 'path', d: segOutline(segm), f: fill, s: COL.line, sw: 0.003 });
  const skin = 'url(#fgSkin)';

  // far side
  body(thigh2, COL.far);
  body(shin2, COL.far);
  push({ t: 'path', d: footPath(j.heel2, j.toe2, j.ankle2, p.foot), f: COL.far });
  body(uarm2, COL.far);
  body(farm2, COL.far);

  // torso + neck + head
  body(torso, skin);
  push({ t: 'path', d: smooth([add(j.shoulder, dir(p.tor), -0.0), add(j.neckTop, normal(p.tor, -1), 0.034), add(j.neckTop, normal(p.tor, -1), -0.034), add(j.shoulder, normal(p.tor, -1), -0.05)]), f: skin });
  const hr = L.head;
  push({ t: 'circle', x: j.headC[0], y: j.headC[1], r: hr, f: skin, s: COL.line, sw: 0.003 });
  // nose hint so the facing direction is clear
  const hd = dir(p.tor + p.head + 90 * -1);
  void hd;
  push({ t: 'circle', x: j.headC[0] + Math.cos(0) * hr * 0.98, y: j.headC[1] + hr * 0.1, r: 0.012, f: skin });

  // near leg + arm
  body(thigh, skin);
  body(shin, skin);
  push({ t: 'path', d: footPath(j.heel, j.toe, j.ankle, p.foot), f: skin, s: COL.line, sw: 0.003 });
  body(uarm, skin);
  body(farm, skin);
  // hand
  push({ t: 'circle', x: j.handEnd[0], y: j.handEnd[1], r: 0.026, f: skin, s: COL.line, sw: 0.003 });
  // shoulder + hip joints blend
  push({ t: 'circle', x: j.shoulder[0], y: j.shoulder[1], r: 0.052, f: skin });
  push({ t: 'circle', x: j.pelvis[0], y: j.pelvis[1], r: 0.07, f: skin });

  // muscle highlights
  const segs: Record<string, Seg> = { torso, uarm, farm, thigh, shin };
  const hi = (id: string, strong: boolean) => {
    const m = MUSCLE_SHAPES[id];
    if (!m) return;
    const o = strong ? 1 : 0.5;
    if (m.seg === 'delt') {
      const n = normal(p.tor, -1);
      const c = add(j.shoulder, n, 0.02 * m.off);
      push({ t: 'circle', x: c[0], y: c[1], r: 0.056, f: 'url(#fgHi)', o });
    } else if (m.seg === 'glute') {
      const n = normal(p.tor, -1);
      const c = add(j.pelvis, n, -0.03);
      push({ t: 'circle', x: c[0], y: c[1], r: 0.074, f: 'url(#fgHi)', o });
    } else if (m.seg === 'neck') {
      /* unused */
    } else {
      push({ t: 'path', d: segMuscle(segs[m.seg], m.side, m.t0, m.t1, m.inset), f: 'url(#fgHi)', o });
    }
  };
  secondary.forEach((id) => hi(id, false));
  primary.forEach((id) => hi(id, true));

  drawEquip(false);
  return { prims, floorY: 0 };
}

export const FIGURE_VIEWBOX = '-0.62 -1.32 1.24 1.4';

/** Tight view box (padded, fixed aspect) around everything a pattern draws, so every exercise fills its frame. */
const boxCache: Record<string, string> = {};
export function figureBox(pat: Pattern, aspect = 1.25): string {
  if (boxCache[pat.id]) return boxCache[pat.id];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const see = (x: number, y: number, r = 0) => {
    if (!isFinite(x) || !isFinite(y)) return;
    x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
  };
  [0, 0.25, 0.5, 0.75, 1].forEach((s) => {
    buildFrame(pat, s, [], []).prims.forEach((p) => {
      if (p.t === 'circle') see(p.x, p.y, p.r);
      else if (p.f !== 'none' || (p.sw ?? 0) < 0.02) {
        const nums = p.d.match(/-?\d*\.?\d+/g) ?? [];
        for (let i = 0; i + 1 < nums.length; i += 2) see(parseFloat(nums[i]), parseFloat(nums[i + 1]));
      }
    });
  });
  // keep the floor line in view and pad
  y1 = Math.max(y1, 0.03);
  const pad = 0.08;
  x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < aspect) { const nw = h * aspect; x0 -= (nw - w) / 2; w = nw; }
  else { const nh = w / aspect; y0 -= (nh - h); h = nh; } // extra room goes above the figure
  return (boxCache[pat.id] = `${f2(x0)} ${f2(y0)} ${f2(w)} ${f2(h)}`);
}
