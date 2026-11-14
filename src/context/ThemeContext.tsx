import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, type Palette, type ThemeId } from '../theme';

type ThemeCtx = { themeId: ThemeId; setTheme: (id: ThemeId) => void; colors: Palette };

const KEY = 'settings.theme';
const DEFAULT_THEME: ThemeId = 'lime';

/** Reine Hilfsfunktion: Palette zu einer Theme-ID (z. B. fuer Freunde-Profile). Unbekannte IDs fallen auf lime zurueck. */
export function paletteFor(id: ThemeId | string | null | undefined): Palette {
  return id && id in THEMES ? THEMES[id as ThemeId] : THEMES[DEFAULT_THEME];
}

const Ctx = createContext<ThemeCtx>({
  themeId: DEFAULT_THEME,
  setTheme: () => {},
  colors: THEMES[DEFAULT_THEME],
});

export const useTheme = () => useContext(Ctx);
export const useColors = (): Palette => useContext(Ctx).colors;

/** Shows a subtree in another palette (e.g. a friend's profile in the friend's colour). Does not change the user's own theme. */
export function ThemeOverride({ palette, children }: { palette: Palette; children: React.ReactNode }) {
  const parent = useTheme();
  const value = useMemo<ThemeCtx>(() => ({ themeId: parent.themeId, setTheme: parent.setTheme, colors: palette }), [parent.themeId, parent.setTheme, palette]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'lime' || v === 'blue' || v === 'red' || v === 'purple' || v === 'gold') setThemeId(v);
      })
      .catch(() => {});
  }, []);

  // Stable identity; switches the whole app synchronously (state first, persistence after).
  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem(KEY, id).catch(() => {});
  }, []);

  const value = useMemo<ThemeCtx>(() => ({ themeId, colors: THEMES[themeId], setTheme }), [themeId, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
