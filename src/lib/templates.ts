import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedExercise } from '../types';

/** A saved workout layout: exercise order and number of sets. Weights are prefilled from the last logged set. */
export type TemplateExercise = {
  name: string;
  sets: number;
  reps: number;
  /** Exact sets (kg) from the PR Coach. When present they replace the "last logged weight" prefill. */
  plan?: { kg: number; reps: number }[];
};
export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  updated_at: string;
  /** ISO time of the last finished workout that was started from this template. */
  last_used_at?: string;
  /** Created by the PR Coach for exactly one workout: removed when that workout is saved. Does not count toward the limit. */
  once?: boolean;
};

const KEY = 'workout.templates.v1';
export const FREE_TEMPLATE_LIMIT = 2;
export const PREMIUM_TEMPLATE_LIMIT = 30;

/** Can another template be added? Updating an existing name is always allowed. */
export function canSaveTemplate(list: WorkoutTemplate[], name: string, isPremium: boolean): boolean {
  const clean = name.trim().toLowerCase() || 'workout';
  if (list.some((t) => t.name.toLowerCase() === clean)) return true;
  return list.filter((t) => !t.once).length < (isPremium ? PREMIUM_TEMPLATE_LIMIT : FREE_TEMPLATE_LIMIT);
}

export const isTemplate = (t: unknown): t is WorkoutTemplate => {
  const x = t as WorkoutTemplate;
  return (
    !!x &&
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    Array.isArray(x.exercises) &&
    x.exercises.every((e) => typeof e?.name === 'string' && Number.isFinite(e.sets) && Number.isFinite(e.reps) && (e.plan === undefined || (Array.isArray(e.plan) && e.plan.every((p) => Number.isFinite(p?.kg) && Number.isFinite(p?.reps)))))
  );
};

export async function loadTemplates(): Promise<WorkoutTemplate[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isTemplate) : [];
  } catch {
    return [];
  }
}

async function persist(list: WorkoutTemplate[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // best effort: templates are a convenience, never block a workout
  }
}

/** Turns the logged exercises of a finished workout into a template (set count and reps of the last logged set). */
export function templateFromEntries(entries: SavedExercise[]): TemplateExercise[] {
  return entries
    .filter((e) => e.sets.length > 0)
    .map((e) => ({
      name: e.name,
      sets: Math.min(e.sets.length, 20),
      reps: Math.max(1, e.sets[e.sets.length - 1].reps || 1),
    }));
}

/** Same name (case-insensitive) replaces the existing template, so there is one per name. */
export function upsertTemplate(list: WorkoutTemplate[], name: string, exercises: TemplateExercise[], now = new Date()): WorkoutTemplate[] {
  const clean = name.trim().slice(0, 40) || 'Workout';
  const existing = list.find((t) => t.name.toLowerCase() === clean.toLowerCase());
  const entry: WorkoutTemplate = {
    id: existing?.id ?? `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: clean,
    exercises,
    updated_at: now.toISOString(),
    ...(existing?.last_used_at ? { last_used_at: existing.last_used_at } : {}),
  };
  const rest = list.filter((t) => t.id !== entry.id);
  const once = rest.filter((t) => t.once);
  return [entry, ...rest.filter((t) => !t.once).slice(0, PREMIUM_TEMPLATE_LIMIT - 1), ...once];
}

export type EditResult = { list: WorkoutTemplate[]; error?: 'name_taken' | 'limit' };

/** Create (id = null) or edit a template by id. A new name must not collide with another template. */
export function saveTemplateEdit(
  list: WorkoutTemplate[],
  id: string | null,
  name: string,
  exercises: TemplateExercise[],
  isPremium: boolean,
  now = new Date(),
): EditResult {
  const clean = name.trim().slice(0, 40) || 'Workout';
  if (list.some((t) => t.id !== id && t.name.toLowerCase() === clean.toLowerCase())) return { list, error: 'name_taken' };
  const current = id ? list.find((t) => t.id === id) : undefined;
  if (!current && list.filter((t) => !t.once).length >= (isPremium ? PREMIUM_TEMPLATE_LIMIT : FREE_TEMPLATE_LIMIT)) return { list, error: 'limit' };
  const entry: WorkoutTemplate = {
    id: current?.id ?? `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: clean,
    exercises,
    updated_at: now.toISOString(),
    ...(current?.last_used_at ? { last_used_at: current.last_used_at } : {}),
  };
  return { list: current ? list.map((t) => (t.id === current.id ? entry : t)) : [entry, ...list] };
}

export const COACH_PREFIX = 'coach-';

/**
 * A brand-new one-time template for a PR Coach session: the exact sets the coach prescribes (warm-up ladder first).
 * The id is fixed per goal, so starting the same goal twice replaces the unfinished template instead of piling up.
 */
export function coachTemplate(
  goalId: string,
  exercise: string,
  title: string,
  sets: { kg: number; reps: number }[],
  now = new Date(),
): WorkoutTemplate {
  const clean = sets.filter((x) => x.kg > 0 && x.reps > 0);
  return {
    id: `${COACH_PREFIX}${goalId}`,
    name: `${exercise} · ${title}`.slice(0, 40),
    exercises: [{ name: exercise, sets: clean.length, reps: clean[clean.length - 1]?.reps ?? 1, plan: clean }],
    updated_at: now.toISOString(),
    once: true,
  };
}

/** Insert or replace a template by id (used for one-time coach templates). */
export function putTemplate(list: WorkoutTemplate[], t: WorkoutTemplate): WorkoutTemplate[] {
  return [t, ...list.filter((x) => x.id !== t.id)];
}

export function markUsed(list: WorkoutTemplate[], id: string, now = new Date()): WorkoutTemplate[] {
  return list.map((t) => (t.id === id ? { ...t, last_used_at: now.toISOString() } : t));
}

/** "Never used", "Today", "Yesterday", "5 days ago" (up to 13 days), otherwise the date. */
export function lastUsedLabel(iso: string | undefined, now = new Date()): string {
  if (!iso) return 'Not used yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Not used yet';
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (days <= 0) return 'Used today';
  if (days === 1) return 'Used yesterday';
  if (days < 14) return `Used ${days} days ago`;
  return `Used ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadTemplates().then((l) => {
      if (alive) {
        setTemplates(l);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(async (name: string, exercises: TemplateExercise[]) => {
    const current = await loadTemplates();
    const next = upsertTemplate(current, name, exercises);
    setTemplates(next);
    await persist(next);
  }, []);

  const saveEdit = useCallback(async (id: string | null, name: string, exercises: TemplateExercise[], isPremium: boolean) => {
    const current = await loadTemplates();
    const res = saveTemplateEdit(current, id, name, exercises, isPremium);
    if (!res.error) {
      setTemplates(res.list);
      await persist(res.list);
    }
    return res.error ?? null;
  }, []);

  const touch = useCallback(async (id: string) => {
    const current = await loadTemplates();
    const next = markUsed(current, id);
    setTemplates(next);
    await persist(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    const current = await loadTemplates();
    const next = current.filter((t) => t.id !== id);
    setTemplates(next);
    await persist(next);
  }, []);

  const addOnce = useCallback(async (t: WorkoutTemplate) => {
    const current = await loadTemplates();
    const next = putTemplate(current, t);
    setTemplates(next);
    await persist(next);
  }, []);

  return { templates, loaded, save, saveEdit, touch, remove, addOnce };
}
