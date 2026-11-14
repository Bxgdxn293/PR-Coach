// PR Coach: transparent, rule-based progressive overload. No AI, no network: it only reads the user's own history.
import { EXERCISES } from '../data/exercises';
import type { Goal, Profile, Unit, Workout } from '../types';

// Onboarding names -> exercise names used in workouts and the library.
export const FOCUS_LIFTS: Record<string, string> = {
  'Bench Press': 'Barbell Bench Press',
  Squat: 'Back Squat',
  Deadlift: 'Deadlift',
  'Overhead Press': 'Overhead Press',
};

const REP_TARGET: Record<Goal, number> = { Strength: 5, Muscle: 8, 'Fat loss': 12 };

export type WorkoutTarget = {
  exercise: string;
  kg: number;
  reps: number;
  last: { kg: number; reps: number; date: string };
  increment: number;
  reason: string;
};

export type PrTarget = {
  exercise: string;
  bestKg: number;
  targetKg: number;
  pct: number; // 0-100, how close the current best is to the next target
  workout: WorkoutTarget;
};

const roundHalf = (n: number) => Math.round(n * 2) / 2;
const fmt = (n: number) => String(Math.round(n * 10) / 10);

// Legs and deadlift lifts progress in bigger steps than upper-body lifts.
export function incrementFor(exercise: string): number {
  const lib = EXERCISES.find((e) => e.name === exercise);
  return lib?.muscle === 'Legs' || exercise === 'Deadlift' ? 5 : 2.5;
}

function sessionsOf(exercise: string, workouts: Workout[]) {
  return workouts
    .filter((w) => w.entries.some((e) => e.name === exercise && e.sets.length > 0))
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export function bestKg(exercise: string, workouts: Workout[]): number {
  let best = 0;
  for (const w of workouts) {
    for (const e of w.entries) {
      if (e.name !== exercise) continue;
      for (const s of e.sets) if (s.kg > best) best = s.kg;
    }
  }
  return best;
}

export function workoutTarget(exercise: string, workouts: Workout[], goal: Goal): WorkoutTarget | null {
  const sessions = sessionsOf(exercise, workouts);
  if (sessions.length === 0) return null;
  const last = sessions[0];
  const sets = last.entries.filter((e) => e.name === exercise).flatMap((e) => e.sets);
  // Top set: heaviest weight, then most reps.
  const top = sets.reduce((a, b) => (b.kg > a.kg || (b.kg === a.kg && b.reps > a.reps) ? b : a));
  if (top.kg <= 0) return null;
  const repTarget = REP_TARGET[goal];
  const increment = incrementFor(exercise);
  const lastInfo = { kg: top.kg, reps: top.reps, date: last.started_at };

  if (top.reps >= repTarget) {
    return {
      exercise,
      kg: roundHalf(top.kg + increment),
      reps: repTarget,
      last: lastInfo,
      increment,
      reason: `You did ${top.reps} reps at ${fmt(top.kg)} kg last time, so the next step is +${fmt(increment)} kg for ${repTarget} reps.`,
    };
  }
  const reps = Math.min(repTarget, top.reps + 1);
  return {
    exercise,
    kg: top.kg,
    reps,
    last: lastInfo,
    increment,
    reason: `Last time you did ${top.reps} reps at ${fmt(top.kg)} kg. Beat it by one rep before adding weight; at ${repTarget} reps you move up.`,
  };
}

function focusExercises(profile: Profile): string[] {
  return profile.focus.map((f) => FOCUS_LIFTS[f]).filter((n): n is string => !!n);
}

// Rotates through the lifts: the one trained longest ago (that has history) comes first.
export function todayTarget(profile: Profile, workouts: Workout[]): WorkoutTarget | null {
  const candidates = focusExercises(profile)
    .map((name) => {
      const t = workoutTarget(name, workouts, profile.goal);
      return t ? { t, at: new Date(t.last.date).getTime() } : null;
    })
    .filter((x): x is { t: WorkoutTarget; at: number } => x !== null);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.at - b.at);
  return candidates[0].t;
}

// Next PR target for every focus lift with history, closest to a new PR first.
export function prTargets(profile: Profile, workouts: Workout[]): PrTarget[] {
  const rows: PrTarget[] = [];
  for (const exercise of focusExercises(profile)) {
    const workout = workoutTarget(exercise, workouts, profile.goal);
    const best = bestKg(exercise, workouts);
    if (!workout || best <= 0) continue;
    const targetKg = roundHalf(best + incrementFor(exercise));
    rows.push({ exercise, bestKg: best, targetKg, pct: Math.round((best / targetKg) * 100), workout });
  }
  return rows.sort((a, b) => b.pct - a.pct);
}

// ---------------------------------------------------------------------------
// e1RM, plateau detection, PR forecast, warm-ups, plate maths.
// All rule-based and deterministic. Weights in the DB are kg; the warm-up and
// plate functions work in the DISPLAY unit (what the user types and sees).
// ---------------------------------------------------------------------------
const round1 = (n: number) => Math.round(n * 10) / 10;
const DAY_MS = 86_400_000;

// Epley is unreliable for high reps, so sets above this are ignored for e1RM.
export const E1RM_MAX_REPS = 12;
export const PLATEAU_SESSIONS = 3;
export const FORECAST_MIN_SESSIONS = 4;
export const FORECAST_MIN_SPAN_DAYS = 14;
export const FORECAST_MAX_WEEKS = 52;

// Epley: kg * (1 + reps / 30). One rep is the weight itself. Returns 0 for unusable input.
export function epley(kg: number, reps: number): number {
  if (!Number.isFinite(kg) || !Number.isFinite(reps) || kg <= 0 || reps < 1 || reps > E1RM_MAX_REPS) return 0;
  return round1(reps === 1 ? kg : kg * (1 + reps / 30));
}

export type E1rmPoint = { date: string; e1rm: number; topKg: number };

// One point per session (oldest first): the best e1RM of that session for this lift.
export function e1rmHistory(exercise: string, workouts: Workout[]): E1rmPoint[] {
  const points: E1rmPoint[] = [];
  for (const w of workouts) {
    let best = 0;
    let topKg = 0;
    for (const e of w.entries) {
      if (e.name !== exercise) continue;
      for (const s of e.sets) {
        const v = epley(s.kg, s.reps);
        if (v > best) {
          best = v;
          topKg = s.kg;
        }
      }
    }
    if (best > 0) points.push({ date: w.started_at, e1rm: best, topKg });
  }
  return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function bestE1rm(exercise: string, workouts: Workout[]): number {
  return e1rmHistory(exercise, workouts).reduce((m, p) => Math.max(m, p.e1rm), 0);
}

export type Remedy = { kind: 'deload' | 'rep-range'; title: string; detail: string; kg?: number; repRange?: [number, number] };
export type PlateauResult = {
  status: 'no-data' | 'building' | 'progressing' | 'plateau';
  sessions: number;
  bestE1rm: number;
  sessionsSinceBest: number;
  remedies: Remedy[]; // only filled when status === 'plateau'
};

// Plateau = the last PLATEAU_SESSIONS sessions all failed to beat the best e1RM set before them.
export function detectPlateau(history: E1rmPoint[]): PlateauResult {
  const n = history.length;
  if (n === 0) return { status: 'no-data', sessions: 0, bestE1rm: 0, sessionsSinceBest: 0, remedies: [] };
  let best = 0;
  let bestIdx = 0;
  history.forEach((p, i) => {
    if (p.e1rm > best + 0.05) {
      best = p.e1rm;
      bestIdx = i;
    }
  });
  const since = n - 1 - bestIdx;
  const base = { sessions: n, bestE1rm: best, sessionsSinceBest: since };
  if (since >= PLATEAU_SESSIONS) {
    return { status: 'plateau', ...base, remedies: remediesFor(history, bestIdx) };
  }
  return { status: n <= PLATEAU_SESSIONS ? 'building' : 'progressing', ...base, remedies: [] };
}

function remediesFor(history: E1rmPoint[], bestIdx: number): Remedy[] {
  const lastTop = history[history.length - 1].topKg;
  const bestTop = history[bestIdx].topKg;
  const deloadKg = Math.round((Math.max(lastTop, bestTop) * 0.9) / 2.5) * 2.5;
  const heavy = bestTop > 0 && history[bestIdx].e1rm / bestTop < 1.21; // best came from a low-rep set (<= 6 reps)
  const repRange: [number, number] = heavy ? [8, 10] : [3, 5];
  return [
    {
      kind: 'deload',
      title: 'Deload 10%',
      detail: 'Train one week at 90% of your top weight with the same sets and reps, then build up again.',
      kg: deloadKg,
    },
    {
      kind: 'rep-range',
      title: `Switch to ${repRange[0]}-${repRange[1]} reps`,
      detail: heavy
        ? 'Your best set was heavy and low-rep. Two to three weeks of moderate reps builds volume, then return to heavy sets.'
        : 'Your best set came from higher reps. Two to three weeks of heavy low-rep sets trains top-end strength, then return to higher reps.',
      repRange,
    },
  ];
}

export type Forecast =
  | { kind: 'insufficient'; message: string }
  | { kind: 'no-progress'; message: string }
  | { kind: 'too-far'; message: string }
  | { kind: 'ok'; weeks: number; slopePerWeek: number; confidence: 'low' | 'medium'; message: string };

// Least-squares line through the last (up to 8) session e1RMs vs. time. A "new PR" means beating the best e1RM so far.
export function forecastPR(history: E1rmPoint[]): Forecast {
  const insufficient = (message: string): Forecast => ({ kind: 'insufficient', message });
  if (history.length < FORECAST_MIN_SESSIONS) {
    return insufficient(`Not enough data yet: need at least ${FORECAST_MIN_SESSIONS} sessions of this lift, you have ${history.length}.`);
  }
  const pts = history.slice(-8);
  const t0 = new Date(pts[0].date).getTime();
  const xs = pts.map((p) => (new Date(p.date).getTime() - t0) / (7 * DAY_MS)); // weeks
  const spanDays = xs[xs.length - 1] * 7;
  if (spanDays < FORECAST_MIN_SPAN_DAYS) {
    return insufficient(`Not enough data yet: your sessions span only ${Math.floor(spanDays)} days, need ${FORECAST_MIN_SPAN_DAYS}.`);
  }
  const ys = pts.map((p) => p.e1rm);
  const n = pts.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const syy = ys.reduce((a, y) => a + (y - my) ** 2, 0);
  const slope = sxx > 0 ? sxy / sxx : 0;
  if (slope <= 0.05) {
    return { kind: 'no-progress', message: 'Your recent trend is flat or falling, so no honest PR date can be given.' };
  }
  const intercept = my - slope * mx;
  const r2 = syy > 0 ? (sxy * sxy) / (sxx * syy) : 0;
  const best = Math.max(...history.map((p) => p.e1rm));
  const lastX = xs[xs.length - 1];
  const targetX = (best + 0.1 - intercept) / slope; // week at which the trend line passes the best e1RM
  const weeks = Math.max(1, Math.ceil(targetX - lastX));
  if (weeks > FORECAST_MAX_WEEKS) {
    return { kind: 'too-far', message: 'At your current trend a new PR is more than a year away.' };
  }
  const confidence = r2 >= 0.5 && n >= 5 ? 'medium' : 'low';
  return {
    kind: 'ok',
    weeks,
    slopePerWeek: round1(slope),
    confidence,
    message: `At your current trend: new PR in about ${weeks} week${weeks === 1 ? '' : 's'} (${confidence} confidence).`,
  };
}

// ----- Plates & warm-ups ----------------------------------------------------

export const PLATES: Record<Unit, number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lb: [45, 35, 25, 10, 5, 2.5], // common US plate set
};
export const BAR: Record<Unit, number> = { kg: 20, lb: 45 };

export function isBarbell(exercise: string): boolean {
  return EXERCISES.find((e) => e.name === exercise)?.equipment === 'Barbell';
}

export type PlateResult = {
  bar: number;
  perSide: { plate: number; count: number }[];
  loaded: number; // what is actually on the bar
  target: number;
  remainder: number; // target - loaded, > 0 when the target cannot be built exactly
  belowBar: boolean;
};

// Greedy fill per side (exact for these plate sets). Integer maths in 1/100 units avoids float drift.
export function plateBreakdown(target: number, unit: Unit): PlateResult {
  const bar = BAR[unit];
  const t = Number.isFinite(target) ? Math.max(0, target) : 0;
  if (t < bar) return { bar, perSide: [], loaded: bar, target: t, remainder: 0, belowBar: true };
  let side = Math.floor(((t - bar) / 2) * 100 + 1e-6);
  const perSide: { plate: number; count: number }[] = [];
  for (const p of PLATES[unit]) {
    const c = Math.floor(side / Math.round(p * 100));
    if (c > 0) {
      perSide.push({ plate: p, count: c });
      side -= c * Math.round(p * 100);
    }
  }
  const used = perSide.reduce((a, x) => a + x.plate * x.count, 0);
  const loaded = Math.round((bar + 2 * used) * 100) / 100;
  return { bar, perSide, loaded, target: t, remainder: Math.round((t - loaded) * 100) / 100, belowBar: false };
}

export type WarmupSet = { pct: number; weight: number; reps: number };
const WARMUP_STEPS: { pct: number; reps: number }[] = [
  { pct: 40, reps: 8 },
  { pct: 60, reps: 5 },
  { pct: 80, reps: 3 },
];

// Warm-up ladder at 40/60/80% of the working weight (display unit), rounded to the nearest loadable weight.
// Steps below the empty bar are raised to the bar; duplicates and steps >= the working weight are dropped.
export function warmupSets(workWeight: number, unit: Unit): WarmupSet[] {
  if (!Number.isFinite(workWeight) || workWeight <= BAR[unit]) return [];
  const step = 2 * PLATES[unit][PLATES[unit].length - 1];
  const out: WarmupSet[] = [];
  for (const s of WARMUP_STEPS) {
    const w = BAR[unit] + Math.round((workWeight * (s.pct / 100) - BAR[unit]) / step) * step;
    const weight = Math.max(Math.round(w * 100) / 100, BAR[unit]);
    const prev = out[out.length - 1];
    if (weight >= workWeight || (prev && weight <= prev.weight)) continue;
    out.push({ pct: s.pct, weight, reps: s.reps });
  }
  return out;
}
