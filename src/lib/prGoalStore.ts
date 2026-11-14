import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { newGoal, type PrGoal } from './prGoal';

const key = (userId: string | undefined) => `pr.goals.v1:${userId ?? 'anon'}`;

const isGoal = (g: unknown): g is PrGoal => {
  const x = g as PrGoal;
  return (
    !!x &&
    typeof x.id === 'string' &&
    typeof x.exercise === 'string' &&
    Number.isFinite(x.current_kg) &&
    Number.isFinite(x.target_kg) &&
    Number.isFinite(x.start_kg) &&
    typeof x.cycle_start === 'string' &&
    Array.isArray(x.history)
  );
};

async function load(userId: string | undefined): Promise<PrGoal[]> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isGoal) : [];
  } catch {
    return [];
  }
}

async function persist(userId: string | undefined, list: PrGoal[]) {
  try {
    await AsyncStorage.setItem(key(userId), JSON.stringify(list));
  } catch {
    // best effort
  }
}

/** Goals are stored on the device, separately per account. */
export function usePrGoals() {
  const { user } = useAuth();
  const uid = user?.id;
  const [goals, setGoals] = useState<PrGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    load(uid).then((l) => {
      if (alive) {
        setGoals(l);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [uid]);

  const mutate = useCallback(
    async (fn: (list: PrGoal[]) => PrGoal[]) => {
      const next = fn(await load(uid));
      setGoals(next);
      await persist(uid, next);
      return next;
    },
    [uid],
  );

  const add = useCallback(
    (p: Parameters<typeof newGoal>[0]) => mutate((l) => [newGoal(p), ...l]),
    [mutate],
  );
  const update = useCallback(
    (id: string, patch: Partial<PrGoal>) => mutate((l) => l.map((g) => (g.id === id ? { ...g, ...patch } : g))),
    [mutate],
  );
  const remove = useCallback((id: string) => mutate((l) => l.filter((g) => g.id !== id)), [mutate]);
  /** Used after a workout: reads the stored list fresh, applies fn, saves. */
  const replaceAll = useCallback((fn: (list: PrGoal[]) => PrGoal[]) => mutate(fn), [mutate]);

  return { goals, loaded, add, update, remove, replaceAll };
}
