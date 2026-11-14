import React, { createContext, Fragment, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Unit } from '../types';
import { detectLang, isLang, setCurrentLang, type Lang } from '../lib/i18n';

type SettingsCtx = { unit: Unit; setUnit: (u: Unit) => void; lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<SettingsCtx>({ unit: 'kg', setUnit: () => {}, lang: 'en', setLang: () => {} });
export const useSettings = () => useContext(Ctx);

const KEY = 'settings.unit';
const LANG_KEY = 'settings.lang';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<Unit>('kg');
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (alive && (v === 'kg' || v === 'lb')) setUnitState(v);
      } catch {}
      let l: Lang = detectLang();
      try {
        const stored = await AsyncStorage.getItem(LANG_KEY);
        if (isLang(stored)) l = stored;
      } catch {}
      setCurrentLang(l);
      if (alive) {
        setLangState(l);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setUnit = (u: Unit) => {
    setUnitState(u);
    AsyncStorage.setItem(KEY, u).catch(() => {});
  };

  const setLang = (l: Lang) => {
    setCurrentLang(l);
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  };

  if (!ready) return null;

  // The key remounts everything below, so every screen re-reads the texts.
  return (
    <Ctx.Provider value={{ unit, setUnit, lang, setLang }}>
      <Fragment key={lang}>{children}</Fragment>
    </Ctx.Provider>
  );
}
