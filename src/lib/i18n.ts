import { Platform, NativeModules } from 'react-native';
import { DE } from './i18n.de';
import { RU } from './i18n.ru';

export type Lang = 'en' | 'de' | 'ru';

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
];

let current: Lang = 'en';

export const getLang = (): Lang => current;
export const setCurrentLang = (l: Lang) => {
  current = l;
};

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'de' || v === 'ru';

/** Best guess from the device language; used until the user picks one. */
export function detectLang(): Lang {
  let code = '';
  try {
    if (Platform.OS === 'web') {
      code = (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
    } else {
      const s = NativeModules.SettingsManager?.settings;
      code = s?.AppleLocale || s?.AppleLanguages?.[0] || NativeModules.I18nManager?.localeIdentifier || '';
      if (!code) code = Intl.DateTimeFormat().resolvedOptions().locale || '';
    }
  } catch {
    code = '';
  }
  code = code.toLowerCase();
  if (code.startsWith('de')) return 'de';
  if (code.startsWith('ru')) return 'ru';
  return 'en';
}

/**
 * Translate an English UI string. The English text is the key; `{0}`, `{1}` are
 * replaced by params. Unknown keys fall back to English.
 */
export function tr(key: string, params?: ReadonlyArray<string | number>): string {
  const dict = current === 'de' ? DE : current === 'ru' ? RU : null;
  let s = (dict && dict[key]) || key;
  if (params && params.length > 0) {
    s = s.replace(/\{(\d+)\}/g, (m, i) => (params[Number(i)] !== undefined ? String(params[Number(i)]) : m));
  }
  return s;
}

/** Locale tag for date formatting; undefined = device default (English). */
export function dateLocale(): string | undefined {
  return current === 'de' ? 'de-DE' : current === 'ru' ? 'ru-RU' : undefined;
}
