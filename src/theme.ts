export type Palette = {
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  doneBg: string;
  danger: string;
  warn: string;
};

/** 'shadow' is the hidden theme: unlocked by a secret gesture (see ThemesScreen), stored on the server like the others so friends see it. */
export type ThemeId = 'lime' | 'blue' | 'red' | 'purple' | 'gold' | 'shadow';
export type AnyThemeId = ThemeId;

const lime: Palette = {
  bg: '#0b0c10',
  card: '#171921',
  cardAlt: '#1e2029',
  border: '#2a2c38',
  text: '#ffffff',
  muted: '#a1a4b3',
  accent: '#c6f432',
  onAccent: '#0b0c10',
  doneBg: '#232b14',
  danger: '#ff7a7a',
  warn: '#ffb454',
};

// Kontrast onAccent (#04101c) auf accent (#3da5ff): 7.32:1 (WCAG AA >= 4.5 erfuellt)
const blue: Palette = {
  bg: '#0b0d14',
  card: '#171b26',
  cardAlt: '#1e2330',
  border: '#2a3040',
  text: '#ffffff',
  muted: '#a1a8b8',
  accent: '#3da5ff',
  onAccent: '#04101c',
  doneBg: '#142238',
  danger: '#ff7a7a',
  warn: '#ffb454',
};

// Kontrast onAccent (#1a0507) auf accent (#ff5a5f): ca. 6.6:1 (WCAG AA >= 4.5 erfuellt)
const red: Palette = {
  bg: '#110b0c',
  card: '#1f1416',
  cardAlt: '#291a1d',
  border: '#3c282c',
  text: '#ffffff',
  muted: '#b8a1a4',
  accent: '#ff5a5f',
  onAccent: '#1a0507',
  doneBg: '#3a1519',
  danger: '#ffb454',
  warn: '#ffd166',
};

// Purple: one year of weekly goals. Kontrast onAccent (#12061f) auf accent (#b57bff): ca. 7:1
const purple: Palette = {
  bg: '#0f0b16',
  card: '#1a1424',
  cardAlt: '#231b30',
  border: '#352a47',
  text: '#ffffff',
  muted: '#aaa1bd',
  accent: '#b57bff',
  onAccent: '#12061f',
  doneBg: '#2a1a44',
  danger: '#ff7a7a',
  warn: '#ffb454',
};

// Gold: bench press 100 kg for 1 rep. Kontrast onAccent (#1a1200) auf accent (#ffc02e): ca. 10:1
const gold: Palette = {
  bg: '#0f0d08',
  card: '#1b1810',
  cardAlt: '#252016',
  border: '#3a3322',
  text: '#ffffff',
  muted: '#b5ab94',
  accent: '#ffc02e',
  onAccent: '#1a1200',
  doneBg: '#33280d',
  danger: '#ff7a7a',
  warn: '#ff9f6b',
};

// Shadow (secret): near-black with deep purple. The screen background animates between black and dark purple (ShadowBackdrop);
// cards are slightly see-through so the movement shows through. Contrast white on accent #2563eb: ca. 5.2:1
export const SHADOW: Palette = {
  bg: '#02060f',
  card: 'rgba(8, 18, 40, 0.72)',
  cardAlt: 'rgba(12, 28, 60, 0.78)',
  border: '#1e3a6e',
  text: '#ffffff',
  muted: '#93a6c9',
  accent: '#2563eb',
  onAccent: '#ffffff',
  doneBg: '#0c1f4a',
  danger: '#ff7a7a',
  warn: '#ffb454',
};

export const THEMES: Record<ThemeId, Palette> = { lime, blue, red, purple, gold, shadow: SHADOW };

export const paletteOf = (id: ThemeId): Palette => THEMES[id];

export const fonts = {
  medium: 'SpaceGrotesk_500Medium',
  bold: 'SpaceGrotesk_700Bold',
};

export const radius = { card: 24, pill: 999, tile: 28 };
