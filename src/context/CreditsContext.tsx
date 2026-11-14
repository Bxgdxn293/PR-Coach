import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fonts, type Palette, type ThemeId } from '../theme';
import { useAuth } from './AuthContext';
import { useColors, useTheme } from './ThemeContext';
import {
  DEFAULT_CONFIG,
  describeCreditError,
  fetchAppConfig,
  fetchMyCredits,
  rpcRedeemInvite,
  rpcSetTheme,
  rpcUnlockShadow,
  rpcSetUsername,
  type AppConfig,
  type CreditsData,
  type LedgerEntry,
  type WeeklyProgress,
} from '../lib/credits';

import { tr } from '../lib/i18n';
const EMPTY_PROGRESS: WeeklyProgress = {
  qualifying_this_week: 0,
  goal: DEFAULT_CONFIG.weekly_goal,
  bonus: DEFAULT_CONFIG.weekly_bonus,
  week_start: '',
  bonus_awarded: false,
  qualified_today: false,
};

type CreditsCtx = {
  /** First load attempt (cache + server) is finished, successful or not. */
  settled: boolean;
  /** my_credits() has answered at least once for this user. */
  hasData: boolean;
  loading: boolean;
  error: string | null;
  balance: number;
  weeklyProgress: WeeklyProgress;
  streakWeeks: number;
  themeStreakWeeks: number;
  theme: ThemeId;
  themeUnlocked: ThemeId[];
  inviteCode: string | null;
  username: string | null;
  history: LedgerEntry[];
  referral: { redeemed: boolean; rewarded_count_30d: number };
  config: AppConfig;
  refresh: () => Promise<void>;
  /** Returns an error text or null. */
  setTheme: (id: ThemeId) => Promise<string | null>;
  setUsername: (name: string) => Promise<string | null>;
  /** Secret gesture finished: unlock the hidden Shadow theme on the server and switch to it. Returns an error text or null. */
  unlockShadow: () => Promise<string | null>;
  redeemInvite: (code: string) => Promise<string | null>;
};

const Ctx = createContext<CreditsCtx>(null as unknown as CreditsCtx);
export const useCredits = () => useContext(Ctx);

const isThemeId = (v: unknown): v is ThemeId => v === 'lime' || v === 'blue' || v === 'red' || v === 'purple' || v === 'gold' || v === 'shadow';
const nameKey = (uid: string) => `credits.username.${uid}`;

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { themeId, setTheme: setLocalTheme } = useTheme();
  const [data, setData] = useState<CreditsData | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [cachedName, setCachedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const [unlockedModal, setUnlockedModal] = useState<ThemeId | null>(null);

  const uid = user?.id ?? null;
  const uidRef = useRef<string | null>(uid);
  uidRef.current = uid;
  const reqId = useRef(0);
  const themeRef = useRef(themeId);
  themeRef.current = themeId;
  const prevUnlocked = useRef<string[] | null>(null);
  const themePending = useRef(false);

  const refresh = useCallback(async () => {
    const forUser = uidRef.current;
    if (!forUser) return;
    const id = ++reqId.current;
    setLoading(true);
    const res = await fetchMyCredits();
    // ignore stale answers (newer request, or the account changed meanwhile)
    if (id !== reqId.current || uidRef.current !== forUser) return;
    if (res.ok) {
      const { ok: _ok, ...rest } = res;
      const next = rest as CreditsData;
      const before = prevUnlocked.current;
      if (before) {
        const gained = next.theme_unlocked.find((t) => !before.includes(t) && isThemeId(t) && t !== 'lime' && t !== 'shadow');
        if (gained && isThemeId(gained)) setUnlockedModal(gained);
      }
      prevUnlocked.current = next.theme_unlocked;
      setData(next);
      setError(null);
      if (next.username) AsyncStorage.setItem(nameKey(forUser), next.username).catch(() => {});
    } else {
      // offline / error: keep the last known state
      setError(describeCreditError(res.error));
    }
    setLoading(false);
  }, []);

  // load after login, reset on account switch
  useEffect(() => {
    let cancelled = false;
    reqId.current++;
    setData(null);
    setCachedName(null);
    setError(null);
    setUnlockedModal(null);
    prevUnlocked.current = null;
    if (!uid) {
      setSettled(false);
      setLoading(false);
      return;
    }
    setSettled(false);
    (async () => {
      try {
        const n = await AsyncStorage.getItem(nameKey(uid));
        if (n && !cancelled) setCachedName(n);
      } catch {
        // no cache
      }
      const cfg = await fetchAppConfig();
      if (!cancelled && cfg.ok) {
        const { ok: _ok, ...rest } = cfg;
        setConfig({ ...DEFAULT_CONFIG, ...(rest as AppConfig) });
      }
      await refresh();
      if (!cancelled) setSettled(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, refresh]);

  // refresh when the app returns to the foreground
  useEffect(() => {
    if (!uid) return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [uid, refresh]);

  // server theme wins: sync it into the runtime theme when it differs
  const serverTheme = data?.theme;
  useEffect(() => {
    if (!themePending.current && isThemeId(serverTheme) && serverTheme !== themeRef.current) setLocalTheme(serverTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverTheme]);

  const setTheme = useCallback(
    async (id: ThemeId) => {
      // optimistic: recolor the whole app immediately, then confirm with the server
      const prev = themeRef.current;
      themePending.current = true;
      setLocalTheme(id);
      setData((d) => (d ? { ...d, theme: id } : d));
      try {
        const res = await rpcSetTheme(id);
        if (!res.ok) {
          setLocalTheme(prev);
          setData((d) => (d ? { ...d, theme: prev } : d));
          return describeCreditError(res.error);
        }
        return null;
      } catch {
        setLocalTheme(prev);
        setData((d) => (d ? { ...d, theme: prev } : d));
        return describeCreditError('network');
      } finally {
        themePending.current = false;
      }
    },
    [setLocalTheme],
  );

  const setUsername = useCallback(
    async (name: string) => {
      const res = await rpcSetUsername(name);
      if (!res.ok) return describeCreditError(res.error);
      setData((d) => (d ? { ...d, username: res.username } : d));
      setCachedName(res.username);
      if (uidRef.current) AsyncStorage.setItem(nameKey(uidRef.current), res.username).catch(() => {});
      refresh();
      return null;
    },
    [refresh],
  );

  const redeemInvite = useCallback(
    async (code: string) => {
      const res = await rpcRedeemInvite(code);
      if (!res.ok) return describeCreditError(res.error);
      refresh();
      return null;
    },
    [refresh],
  );

  const unlockShadow = useCallback(async () => {
    const res = await rpcUnlockShadow();
    if (!res.ok) return describeCreditError(res.error);
    await refresh();
    return setTheme('shadow');
  }, [refresh, setTheme]);

  const value = useMemo<CreditsCtx>(
    () => ({
      settled,
      hasData: !!data,
      loading,
      error,
      balance: data?.balance ?? 0,
      weeklyProgress: data?.weekly_progress ?? { ...EMPTY_PROGRESS, goal: config.weekly_goal, bonus: config.weekly_bonus },
      streakWeeks: data?.streak_weeks ?? 0,
      themeStreakWeeks: data?.theme_streak_weeks ?? 0,
      theme: isThemeId(data?.theme) ? data!.theme as ThemeId : 'lime',
      themeUnlocked: (data?.theme_unlocked ?? ['lime']).filter(isThemeId),
      inviteCode: data?.invite_code ?? null,
      username: data ? data.username : cachedName,
      history: data?.history ?? [],
      referral: data?.referral ?? { redeemed: false, rewarded_count_30d: 0 },
      config,
      refresh,
      setTheme,
      setUsername,
      unlockShadow,
      redeemInvite,
    }),
    [settled, data, loading, error, cachedName, config, refresh, setTheme, setUsername, unlockShadow, redeemInvite],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <UnlockModal
        theme={unlockedModal}
        onClose={() => setUnlockedModal(null)}
        onSwitch={async () => {
          const t = unlockedModal;
          setUnlockedModal(null);
          if (t) await setTheme(t);
        }}
      />
    </Ctx.Provider>
  );
}

function UnlockModal({ theme, onClose, onSwitch }: { theme: ThemeId | null; onClose: () => void; onSwitch: () => void }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const label = theme === 'blue' ? 'Blue' : theme === 'red' ? 'Red' : theme === 'purple' ? tr("Purple") : theme === 'gold' ? 'Gold' : theme ?? '';
  return (
    <Modal visible={!!theme} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.title}>
            {label} theme unlocked
          </Text>
          <Text style={styles.text}>Your friends can see it.</Text>
          <Pressable accessibilityRole="button" onPress={onSwitch} style={styles.cta}>
            <Text style={styles.ctaText}>Switch now</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.later}>
            <Text style={styles.laterText}>Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    box: { width: '100%', maxWidth: 380, borderRadius: 28, padding: 24, gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    title: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, textAlign: 'center' },
    text: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center', marginBottom: 8 },
    cta: { height: 56, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 },
    later: { height: 44, alignItems: 'center', justifyContent: 'center' },
    laterText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 15 },
  });
