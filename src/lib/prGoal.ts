import type { SavedExercise, Workout } from '../types';
import { bestE1rm } from './coach';

/**
 * 1-rep-max goals: "I can bench 120 kg for one rep, I want 150 kg".
 * Pure functions only (no React / storage), so the plan logic can be tested.
 * All weights are kg. The plan is a function of (current max, week of the 4-week cycle); there is no stored plan to go stale.
 */

export type PrGoal = {
  id: string;
  exercise: string;
  start_kg: number;
  current_kg: number;
  target_kg: number;
  /** ISO time the current 4-week cycle started (week 1 = Volume). */
  cycle_start: string;
  sessions_per_week: 1 | 2;
  /** 'fast' = push the weekly progress a bit harder (only offered when it looks safe). Missing = steady. */
  pace?: 'steady' | 'fast';
  created_at: string;
  achieved_at?: string;
  /** New max entries, oldest first. */
  history: { date: string; kg: number }[];
};

export const PLATE_STEP = 2.5;
export const CYCLE_WEEKS = 4;
export const MAX_WEEKS_FORECAST = 156;
/** The PR Coach is Premium-only. */
export const FREE_GOAL_LIMIT = 0;
export const PREMIUM_GOAL_LIMIT = 5;

export const roundTo = (kg: number, step = PLATE_STEP) => Math.round(kg / step) * step;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Rule-of-thumb multipliers (assumptions, not measurements). */
export const SECOND_SESSION_MULT = 1.15;
export const FAST_PACE_MULT = 1.3;
/** Safety cap: never plan more than 1.25% of the max per week. */
export const MAX_REL_GAIN = 0.0125;

/**
 * Expected gain per week: 0.75% of the max, slowing to 0.4% for the last 5% to the target (never below 0.25 kg).
 * `mult` speeds the plan up (see goalMult), but never above MAX_REL_GAIN of the max per week.
 */
export function weeklyGain(current: number, target: number, mult = 1): number {
  const nearTarget = (target - current) / current <= 0.05;
  const base = Math.max(0.25, current * (nearTarget ? 0.004 : 0.0075));
  return Math.min(base * mult, Math.max(0.25, current * MAX_REL_GAIN));
}

/** Pace multiplier of a goal: second session +15%, fast pace +30%. */
export function goalMult(g: Pick<PrGoal, 'sessions_per_week'> & Partial<Pick<PrGoal, 'pace'>>): number {
  return (g.sessions_per_week === 2 ? SECOND_SESSION_MULT : 1) * (g.pace === 'fast' ? FAST_PACE_MULT : 1);
}

/** Weeks until the target at the expected pace, or null if it takes longer than MAX_WEEKS_FORECAST. */
export function weeksToGoal(current: number, target: number, mult = 1): number | null {
  if (!(current > 0) || !(target > current)) return 0;
  let c = current;
  let w = 0;
  while (c < target && w < MAX_WEEKS_FORECAST) {
    c += weeklyGain(c, target, mult);
    w += 1;
  }
  return c >= target ? w : null;
}

export function etaDate(current: number, target: number, now = new Date(), mult = 1): Date | null {
  const w = weeksToGoal(current, target, mult);
  if (w === null) return null;
  return new Date(now.getTime() + w * 7 * 86400000);
}

export function progressPct(start: number, current: number, target: number): number {
  if (current >= target) return 100;
  if (target <= start) return 0;
  return Math.max(0, Math.min(100, Math.round(((current - start) / (target - start)) * 100)));
}

export type GoalCheck = { ok: boolean; error?: string; warning?: string };

export function checkGoal(current: number, target: number): GoalCheck {
  if (!(current > 0)) return { ok: false, error: 'Enter your current 1-rep max.' };
  if (current > 600 || target > 800) return { ok: false, error: 'These numbers look too high.' };
  if (!(target > current)) return { ok: false, error: 'The target has to be higher than your current max.' };
  if (target / current > 1.5) {
    return { ok: true, warning: 'That is more than +50%. Consider a first goal closer to your current max, you can raise it later.' };
  }
  return { ok: true };
}

export function cycleInfo(cycleStartISO: string, now = new Date()): { week: number; cycle: number } {
  const start = new Date(cycleStartISO).getTime();
  const weeks = Math.max(0, Math.floor((now.getTime() - start) / (7 * 86400000)));
  return { week: weeks % CYCLE_WEEKS, cycle: Math.floor(weeks / CYCLE_WEEKS) + 1 };
}

export const WEEK_NAMES = ['Volume', 'Strength', 'Heavy', 'Max test'] as const;

export type PlanSet = { kg: number; reps: number };
export type Session = { kind: 'main' | 'support'; title: string; scheme: string; sets: PlanSet[]; attempt?: number };

const repeat = (n: number, kg: number, reps: number): PlanSet[] => Array.from({ length: n }, () => ({ kg, reps }));

/** The attempt for the test week: at least one plate step above the current max, capped at the target. */
export function attemptKg(goal: Pick<PrGoal, 'current_kg' | 'target_kg'> & Partial<Pick<PrGoal, 'pace'>>): number {
  const raw = roundTo(goal.current_kg + weeklyGain(goal.current_kg, goal.target_kg, goal.pace === 'fast' ? FAST_PACE_MULT : 1) * CYCLE_WEEKS);
  const atLeast = Math.max(raw, goal.current_kg + PLATE_STEP);
  return Math.min(atLeast, goal.target_kg);
}

export function sessionPlan(goal: Pick<PrGoal, 'current_kg' | 'target_kg'> & Partial<Pick<PrGoal, 'pace'>>, week: number, kind: 'main' | 'support'): Session {
  const m = goal.current_kg;
  const w = ((week % CYCLE_WEEKS) + CYCLE_WEEKS) % CYCLE_WEEKS;
  const at = (pct: number) => roundTo(m * pct);
  if (kind === 'support') {
    if (w === 3) return { kind, title: 'Light support', scheme: '3 x 6 @ 60%', sets: repeat(3, at(0.6), 6) };
    return { kind, title: 'Support', scheme: '3 x 8 @ 65%', sets: repeat(3, at(0.65), 8) };
  }
  if (w === 0) return { kind, title: 'Volume', scheme: '5 x 5 @ 78%', sets: repeat(5, at(0.78), 5) };
  if (w === 1) return { kind, title: 'Strength', scheme: '4 x 3 @ 85%', sets: repeat(4, at(0.85), 3) };
  if (w === 2) return { kind, title: 'Heavy', scheme: '3 x 2 @ 91%', sets: repeat(3, at(0.91), 2) };
  const attempt = attemptKg(goal);
  return {
    kind,
    title: 'Max test',
    scheme: `Singles up to ${attempt} kg`,
    sets: [
      { kg: at(0.8), reps: 2 },
      { kg: at(0.9), reps: 1 },
      { kg: at(0.95), reps: 1 },
      { kg: attempt, reps: 1 },
    ],
    attempt,
  };
}

export function sessionsForWeek(goal: PrGoal, week: number): Session[] {
  const out = [sessionPlan(goal, week, 'main')];
  if (goal.sessions_per_week === 2) out.push(sessionPlan(goal, week, 'support'));
  return out;
}

/** Best logged single (reps = 1) for a lift, 0 if none. */
export function bestLoggedSingle(exercise: string, workouts: Workout[]): number {
  let best = 0;
  for (const w of workouts) for (const e of w.entries) if (e.name === exercise) for (const s of e.sets) if (Math.round(s.reps) === 1 && s.kg > best) best = s.kg;
  return best;
}

/** Prefill for the goal form: logged single, otherwise an estimate from the best set (rounded down to a plate step). */
export function suggestedCurrent(exercise: string, workouts: Workout[]): { kg: number; estimated: boolean } | null {
  const single = bestLoggedSingle(exercise, workouts);
  if (single > 0) return { kg: single, estimated: false };
  const est = bestE1rm(exercise, workouts);
  if (est > 0) return { kg: Math.floor(est / PLATE_STEP) * PLATE_STEP, estimated: true };
  return null;
}

/**
 * After a workout: a logged single above the current max becomes the new max (it is a real 1-rep PR).
 * Returns the updated goals and what changed. Reaching the target marks the goal achieved.
 */
export function applySingles(
  goals: PrGoal[],
  entries: SavedExercise[],
  now = new Date(),
): { goals: PrGoal[]; hits: { exercise: string; kg: number; reached: boolean }[] } {
  const hits: { exercise: string; kg: number; reached: boolean }[] = [];
  const next = goals.map((g) => {
    if (g.achieved_at) return g;
    let best = 0;
    for (const e of entries) if (e.name === g.exercise) for (const s of e.sets) if (Math.round(s.reps) === 1 && s.kg > best) best = s.kg;
    if (best <= g.current_kg) return g;
    const reached = best >= g.target_kg;
    hits.push({ exercise: g.exercise, kg: best, reached });
    return {
      ...g,
      current_kg: r2(best),
      ...(reached ? { achieved_at: now.toISOString() } : {}),
      history: [...g.history, { date: now.toISOString(), kg: r2(best) }],
    };
  });
  return { goals: next, hits };
}


export type PaceStatus = 'too_early' | 'ahead' | 'on_track' | 'behind';

/** Compares the real progress since the start with the plan. Needs at least 3 weeks of history. */
export function paceStatus(g: PrGoal, now = new Date()): PaceStatus {
  const weeks = (now.getTime() - new Date(g.created_at).getTime()) / (7 * 86400000);
  if (weeks < 3 || g.achieved_at) return 'too_early';
  const gained = g.current_kg - g.start_kg;
  const expected = weeklyGain(g.start_kg, g.target_kg, goalMult(g)) * weeks;
  if (gained >= Math.max(PLATE_STEP, expected * 1.25)) return 'ahead';
  if (gained < expected * 0.5) return 'behind';
  return 'on_track';
}

export type SpeedUp = {
  id: 'second_session' | 'fast_pace';
  /** What changes on the goal when the user accepts. */
  patch: Partial<Pick<PrGoal, 'sessions_per_week' | 'pace'>>;
  weeks: number;
  weeksSaved: number;
  eta: Date;
};

/**
 * Ways to reach the goal sooner, only when it is realistic: not when the goal is a single test cycle away, not when
 * the real progress is far behind the plan (then rushing is the wrong advice). Each option is worth at least 2 weeks.
 */
export function speedUps(g: PrGoal, now = new Date()): SpeedUp[] {
  if (g.achieved_at) return [];
  const base = weeksToGoal(g.current_kg, g.target_kg, goalMult(g));
  if (base === null || base <= CYCLE_WEEKS) return [];
  if (paceStatus(g, now) === 'behind') return [];
  const out: SpeedUp[] = [];
  const consider = (id: SpeedUp['id'], patch: SpeedUp['patch'], next: Pick<PrGoal, 'sessions_per_week'> & Partial<Pick<PrGoal, 'pace'>>) => {
    const weeks = weeksToGoal(g.current_kg, g.target_kg, goalMult(next));
    if (weeks === null || base - weeks < 2) return;
    out.push({ id, patch, weeks, weeksSaved: base - weeks, eta: new Date(now.getTime() + weeks * 7 * 86400000) });
  };
  if (g.sessions_per_week === 1) consider('second_session', { sessions_per_week: 2 }, { sessions_per_week: 2, pace: g.pace });
  if (g.pace !== 'fast') consider('fast_pace', { sessions_per_week: 2, pace: 'fast' }, { sessions_per_week: 2, pace: 'fast' });
  return out;
}

export function newGoal(
  p: { exercise: string; current_kg: number; target_kg: number; sessions_per_week: 1 | 2 },
  now = new Date(),
): PrGoal {
  return {
    id: `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    exercise: p.exercise,
    start_kg: p.current_kg,
    current_kg: p.current_kg,
    target_kg: p.target_kg,
    cycle_start: now.toISOString(),
    sessions_per_week: p.sessions_per_week,
    created_at: now.toISOString(),
    history: [{ date: now.toISOString(), kg: p.current_kg }],
  };
}
