import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Unit } from '../types';

type SettingsCtx = { unit: Unit; setUnit: (u: Unit) => void };

const Ctx = createContext<SettingsCtx>({ unit: 'kg', setUnit: () => {} });
export const useSettings = () => useContext(Ctx);

const KEY = 'settings.unit';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<Unit>('kg');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'kg' || v === 'lb') setUnitState(v);
    });
  }, []);

  const setUnit = (u: Unit) => {
    setUnitState(u);
    AsyncStorage.setItem(KEY, u).catch(() => {});
  };

  return <Ctx.Provider value={{ unit, setUnit }}>{children}</Ctx.Provider>;
}
