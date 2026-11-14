import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Profile } from '../types';

import { tr } from '../lib/i18n';
type ProfileCtx = {
  profile: Profile | null;
  loaded: boolean;
  save: (p: Profile) => Promise<string | null>;
};

const Ctx = createContext<ProfileCtx>(null as unknown as ProfileCtx);
export const useProfile = () => useContext(Ctx);

const cacheKey = (userId: string) => `profile.${userId}`;

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [state, setState] = useState<{ userId: string | null; profile: Profile | null }>({ userId: null, profile: null });
  // Only trust state that belongs to the current user: no stale profile/"loaded" flag after logout/login switches.
  const mine = state.userId === (user?.id ?? null);
  const profile = user && mine ? state.profile : null;
  const loaded = !user || (mine && loadedFor === user.id);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setState({ userId: null, profile: null });
        setLoadedFor(null);
        return;
      }
      const uid = user.id;
      setState({ userId: uid, profile: null });
      // 1) local cache, so the app works without a connection
      try {
        const raw = await AsyncStorage.getItem(cacheKey(user.id));
        if (raw && !cancelled) setState({ userId: uid, profile: JSON.parse(raw) as Profile });
      } catch {
        // ignore a broken cache
      }
      // 2) the server copy wins when it exists
      try {
        const { data } = await supabase.from('user_settings').select('goal, level, days, focus').maybeSingle();
        if (data && !cancelled) {
          const p = data as Profile;
          setState({ userId: uid, profile: p });
          AsyncStorage.setItem(cacheKey(user.id), JSON.stringify(p)).catch(() => {});
        }
      } catch {
        // offline: keep the cache
      }
      if (!cancelled) setLoadedFor(uid);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = useCallback(
    async (p: Profile) => {
      if (!user) return tr("Not signed in.");
      setState({ userId: user.id, profile: p });
      AsyncStorage.setItem(cacheKey(user.id), JSON.stringify(p)).catch(() => {});
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...p, updated_at: new Date().toISOString() });
      return error ? error.message : null;
    },
    [user],
  );

  return <Ctx.Provider value={{ profile, loaded, save }}>{children}</Ctx.Provider>;
}
