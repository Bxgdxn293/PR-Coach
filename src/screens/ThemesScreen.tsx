import React, { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useCredits } from '../context/CreditsContext';
import { useSettings } from '../context/SettingsContext';
import { fonts, THEMES, type Palette, type ThemeId } from '../theme';
import { useColors, useTheme } from '../context/ThemeContext';
import { toDisplay } from '../lib/units';

/** Interface colours: opened from Settings > Interface colors. */
export function ThemesScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { unit } = useSettings();
  const credits = useCredits();
  const { themeId } = useTheme();
  const minMin = Math.round(credits.config.theme_min_duration_sec / 60);
  const needFor: Record<ThemeId, number> = {
    lime: 0,
    blue: credits.config.theme_blue_weeks,
    red: credits.config.theme_red_weeks,
    purple: credits.config.theme_purple_weeks,
    gold: 0,
  };
  const goldKg = toDisplay(credits.config.theme_gold_bench_kg, unit);
  const ThemeLabel: Record<ThemeId, string> = { lime: 'Lime', blue: 'Blue', red: 'Red', purple: 'Purple', gold: 'Gold' };

  const pickTheme = async (id: ThemeId) => {
    if (!credits.themeUnlocked.includes(id)) {
      if (id === 'gold') {
        Alert.alert('Gold is locked', `Log a Barbell Bench Press set of ${goldKg} ${unit} or more for at least 1 rep to unlock it.`);
        return;
      }
      Alert.alert(`${ThemeLabel[id]} is locked`, `Train ${credits.config.weekly_goal}x a week, at least ${minMin} minutes each, for ${needFor[id]} weeks in a row without a missed week to unlock it.`);
      return;
    }
    const err = await credits.setTheme(id);
    if (err) Alert.alert('Theme', `${err} The previous theme was restored.`);
  };


  return (
    <Screen>
      <Header title="Interface colors" />
      <ScrollView contentContainerStyle={styles.list}>
        {(['lime', 'blue', 'red', 'purple', 'gold'] as ThemeId[]).map((id) => {
          const unlocked = credits.themeUnlocked.includes(id);
          const selected = themeId === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !unlocked }}
              accessibilityLabel={`${ThemeLabel[id]} theme${unlocked ? '' : ', locked'}`}
              onPress={() => pickTheme(id)}
              style={[styles.card, selected && { borderColor: colors.accent }]}
            >
              <View style={[styles.swatch, { backgroundColor: THEMES[id].accent }]} />
              <View style={styles.flex}>
                <Text style={styles.label}>{ThemeLabel[id]}</Text>
                {!unlocked && id === 'gold' && (
                  <Text style={styles.sub}>Bench press {goldKg} {unit} for 1 rep</Text>
                )}
                {!unlocked && id !== 'gold' && (
                  <Text style={styles.sub}>
                    {credits.config.weekly_goal}x a week, {minMin}+ min each, {needFor[id]} weeks in a row ({Math.min(credits.themeStreakWeeks, needFor[id])}/{needFor[id]})
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
