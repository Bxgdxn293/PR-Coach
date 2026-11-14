import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DraftExercise } from '../types';

/**
 * The workout that is running right now. It lives outside the Workout screen, so leaving the screen (menu, another
 * tab) or closing the app does not end it. The timer is derived from startedAt, so it keeps counting while away.
 */
export type ActiveWorkout = {
  uid: string;
  title: string;
  /** ms since epoch */
  startedAt: number;
  drafts: DraftExercise[];
  fromTemplate: string | null;
  fromTemplateId: string | null;
};

const KEY = 'workout.active.v1';
const MAX_AGE_MS = 24 * 3600 * 1000; // a forgotten workout from yesterday is dropped instead of showing "27 h"

let current: ActiveWorkout | null = null;
let loaded = false;
let loading: Promise<void> | null = null;
const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

const isActive = (x: unknown): x is ActiveWorkout => {
  const a = x as ActiveWorkout;
  return (
    !!a &&
    typeof a.uid === 'string' &&
    typeof a.title === 'string' &&
    Number.isFinite(a.startedAt) &&
    Array.isArray(a.drafts) &&
    a.drafts.every((e) => typeof e?.name === 'string' && Array.isArray(e.sets))
  );
};

export function loadActiveWorkout(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (isActive(parsed) && Date.now() - parsed.startedAt < MAX_AGE_MS) current = parsed;
        else if (raw) await AsyncStorage.removeItem(KEY);
      } catch {
        current = null;
      }
      loaded = true;
      notify();
    })();
  }
  return loading;
}

export const getActiveWorkout = () => current;

let writeTimer: ReturnType<typeof setTimeout> | null = null;
const writeNow = () => {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = null;
  const snapshot = current;
  const op = snapshot ? AsyncStorage.setItem(KEY, JSON.stringify(snapshot)) : AsyncStorage.removeItem(KEY);
  op.catch(() => {});
};

/** Replace (or clear with null) the running workout. Written to storage shortly after, and at once when the app goes to the background. */
export function setActiveWorkout(next: ActiveWorkout | null): void {
  current = next;
  loaded = true;
  notify();
  if (!writeTimer) writeTimer = setTimeout(writeNow, 400);
}

// Never lose the last edit: write immediately when the app leaves the foreground.
AppState.addEventListener('change', (s) => {
  if (s !== 'active' && writeTimer) writeNow();
});

/** The running workout of this user, kept in sync across screens. */
export function useActiveWorkout(uid: string | undefined): { active: ActiveWorkout | null; loaded: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    subs.add(f);
    void loadActiveWorkout();
    return () => void subs.delete(f);
  }, []);
  const mine = current && uid && current.uid === uid ? current : null;
  return { active: mine, loaded };
}
