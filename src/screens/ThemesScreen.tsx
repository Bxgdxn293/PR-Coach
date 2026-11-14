import React, { useMemo, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useCredits } from '../context/CreditsContext';
import { useSettings } from '../context/SettingsContext';
import { fonts, paletteOf, type AnyThemeId, type Palette, type ThemeId } from '../theme';
import { useColors, useTheme } from '../context/ThemeContext';
import { toDisplay } from '../lib/units';

import { tr } from '../lib/i18n';
/** Interface colours: opened from Settings > Interface colors. */
export function ThemesScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { unit } = useSettings();
  const credits = useCredits();
  const { themeId } = useTheme();
  const seq = useRef<{ ids: AnyThemeId[]; at: number }>({ ids: [], at: 0 });
  const minMin = Math.round(credits.config.theme_min_duration_sec / 60);
  const needFor: Record<ThemeId, number> = {
    lime: 0,
    blue: credits.config.theme_blue_weeks,
    red: credits.config.theme_red_weeks,
    purple: credits.config.theme_purple_weeks,
    gold: 0,
    shadow: 0,
  };
  const goldKg = toDisplay(credits.config.theme_gold_bench_kg, unit);
  const ThemeLabel: Record<AnyThemeId, string> = { lime: tr('Lime'), blue: tr('Blue'), red: tr('Red'), purple: tr('Purple'), gold: tr('Gold'), shadow: tr('Shadow') };

  // Secret: press and hold the colour cards in this order (no hint anywhere in the app). Pauses over 8 s start over.
  const SECRET_COMBO: AnyThemeId[] = ['gold', 'purple', 'lime', 'purple', 'blue'];
  const secretPress = (id: AnyThemeId) => {
    const now = Date.now();
    const cur = seq.current;
    if (now - cur.at > 8000) cur.ids = [];
    cur.at = now;
    cur.ids = [...cur.ids, id].slice(-SECRET_COMBO.length);
    if (cur.ids.length === SECRET_COMBO.length && cur.ids.every((x, i) => x === SECRET_COMBO[i])) {
      cur.ids = [];
      credits.unlockShadow().then((err) => {
        if (err) Alert.alert(tr("Theme"), err);
      });
    }
  };

  const pickTheme = async (id: AnyThemeId) => {
    if (!credits.themeUnlocked.includes(id)) {
      if (id === 'gold') {
        Alert.alert(tr("Gold is locked"), tr("Log a Barbell Bench Press set of {0} {1} or more for at least 1 rep to unlock it.", [goldKg, unit]));
        return;
      }
      Alert.alert(tr("{0} is locked", [ThemeLabel[id]]), tr("Train {0}x a week, at least {1} minutes each, for {2} weeks in a row without a missed week to unlock it.", [credits.config.weekly_goal, minMin, needFor[id]]));
      return;
    }
    const err = await credits.setTheme(id);
    if (err) Alert.alert(tr("Theme"), tr("{0} The previous theme was restored.", [err]));
  };


  return (
    <Screen>
      <Header title={tr("Interface colors")} />
      <ScrollView contentContainerStyle={styles.list}>
        {([...(['lime', 'blue', 'red', 'purple', 'gold'] as AnyThemeId[]), ...(credits.themeUnlocked.includes('shadow') ? (['shadow'] as AnyThemeId[]) : [])]).map((id) => {
          const unlocked = credits.themeUnlocked.includes(id);
          const selected = themeId === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !unlocked }}
              accessibilityLabel={tr("{0} theme{1}", [ThemeLabel[id], unlocked ? '' : tr(', locked')])}
              onPress={() => pickTheme(id)}
              onLongPress={() => secretPress(id)}
              delayLongPress={450}
              style={[styles.card, selected && { borderColor: colors.accent }]}
            >
              <View style={[styles.swatch, { backgroundColor: paletteOf(id).accent }]} />
              <View style={styles.flex}>
                <Text style={styles.label}>{ThemeLabel[id]}</Text>
                {!unlocked && id === 'gold' && (
                  <Text style={styles.sub}>{tr("Bench press {0} {1} for 1 rep", [goldKg, unit])}</Text>
                )}
                {!unlocked && id !== 'gold' && (
                  <Text style={styles.sub}>
                    {tr("{0}x a week, {1}+ min each, {2} weeks in a row ({3}/{2})", [credits.config.weekly_goal, minMin, needFor[id as ThemeId], Math.min(credits.themeStreakWeeks, needFor[id as ThemeId])])}
                  </Text>
                )}
              </View>
              {!unlocked ? (
                <Feather name="lock" size={20} color={colors.muted} />
              ) : selected ? (
                <Feather name="check" size={22} color={colors.accent} />
              ) : null}
            </Pressable>
          );
        })}

      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 24 },
    swatch: { width: 28, height: 28, borderRadius: 14 },
    card: {
      minHeight: 76,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    label: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  });
