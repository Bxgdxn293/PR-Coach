import { Alert } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { startOfWeek } from '../lib/dates';
import { useAuth } from './AuthContext';
import { useCredits } from './CreditsContext';
import type { SavedExercise, Workout } from '../types';

export const FREE_WEEKLY_LIMIT = 3;

export type PersonalRecord = { exercise: string; kg: number; reps: number; date: string };

type NewWorkout = { name: string; started_at: string; duration_sec: number; entries: SavedExercise[] };

type DataCtx = {
  workouts: Workout[];
  loading: boolean;
  weeklyCount: number;
  records: PersonalRecord[];
  refresh: () => Promise<void>;
  saveWorkout: (w: NewWorkout) => Promise<string | null>;
  deleteWorkout: (id: string) => Promise<string | null>;
  lastSetFor: (exercise: string) => { kg: number; reps: number } | null;
};

const Ctx = createContext<DataCtx>(null as unknown as DataCtx);
export const useData = () => useContext(Ctx);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const credits = useCredits();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('workouts').select('*').order('started_at', { ascending: false });
    // On a network/server error keep what we have instead of showing an empty history.
    if (!error) setWorkouts((data ?? []) as Workout[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setWorkouts([]); // never show the previous account's workouts
    refresh();
  }, [refresh]);

  const weeklyCount = useMemo(() => {
    const from = startOfWeek().getTime();
    return workouts.filter((w) => new Date(w.started_at).getTime() >= from).length;
  }, [workouts]);

  const records = useMemo(() => {
    const best = new Map<string, PersonalRecord>();
    // workouts are newest first; iterate oldest first so the earliest date of a record is kept
    for (const w of [...workouts].reverse()) {
      for (const ex of w.entries) {
        for (const s of ex.sets) {
          const cur = best.get(ex.name);
          if (!cur || s.kg > cur.kg) {
            best.set(ex.name, { exercise: ex.name, kg: s.kg, reps: s.reps, date: w.started_at });
          }
        }
      }
    }
    return [...best.values()].filter((r) => r.kg > 0).sort((a, b) => b.kg - a.kg);
  }, [workouts]);

  const lastSetFor = useCallback(
    (exercise: string) => {
      for (const w of workouts) {
        const ex = w.entries.find((e) => e.name === exercise);
        if (ex && ex.sets.length > 0) return ex.sets[ex.sets.length - 1];
      }
      return null;
    },
    [workouts],
  );

  const saveWorkout = async (w: NewWorkout) => {
    const { data, error } = await supabase.from('workouts').insert({ ...w, user_id: user?.id }).select('id,qualifying');
    if (error) return error.message;
    await refresh();
    // Credits, streak and theme unlocks are decided by the server: reload them.
    credits.refresh();
    const row = Array.isArray(data) ? (data[0] as { qualifying?: boolean } | undefined) : undefined;
    if (row && row.qualifying === false) {
      const cfg = credits.config;
      const sets = w.entries.reduce((n, e) => n + e.sets.filter((s) => s.reps >= 1 && s.reps <= 100 && s.kg >= 0 && s.kg <= 1000).length, 0);
      const minutes = Math.round(cfg.qualify_min_duration_sec / 60);
      let reason = 'You already have a counting workout today (1 per day).';
      if (w.duration_sec < cfg.qualify_min_duration_sec) reason = `It was shorter than ${minutes} minutes.`;
      else if (sets < cfg.qualify_min_sets) reason = `It had fewer than ${cfg.qualify_min_sets} sets.`;
      Alert.alert('Saved, but no credits', `This workout does not count towards your weekly goal. ${reason}`);
    }
    return null;
  };

  const deleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (error) return error.message;
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    return null;
  };

  return (
    <Ctx.Provider
      value={{ workouts, loading, weeklyCount, records, refresh, saveWorkout, deleteWorkout, lastSetFor }}
    >
      {children}
    </Ctx.Provider>
  );
}
