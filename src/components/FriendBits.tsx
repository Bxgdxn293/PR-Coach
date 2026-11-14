import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, type Palette } from '../theme';
import { paletteFor, useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
/** Small circle in the friend's accent colour. */
export function ColorDot({ theme, size = 14 }: { theme: string; size?: number }) {
  const accent = paletteFor(theme).accent;
  return (
    <View
      accessibilityLabel={tr("Accent colour {0}", [theme])}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: accent }}
    />
  );
}

/** Streak badge: flame + number of weeks. */
export function StreakBadge({ weeks }: { weeks: number }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const on = weeks > 0;
  return (
    <View
      style={[styles.badge, on && styles.badgeOn]}
      accessibilityLabel={tr("{0} week streak", [weeks])}
    >
      <Feather name="zap" size={13} color={on ? colors.onAccent : colors.muted} />
      <Text style={[styles.badgeText, on && styles.badgeTextOn]}>{weeks}</Text>
    </View>
  );
}

/** Extra badge for friends who earned a special colour (blue: 1 month, red: half a year, purple: 1 year, gold: 100 kg bench press). */
export function ThemeBadge({ theme }: { theme: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const text =
    theme === 'purple' ? tr("1 year streak") : theme === 'red' ? tr("6 month streak") : theme === 'blue' ? tr("1 month streak") : theme === 'gold' ? tr("100 kg bench") : theme === 'shadow' ? tr("Secret theme") : null;
  if (!text) return null;
  return (
    <View style={styles.month} accessibilityLabel={text}>
      <Text style={styles.monthText}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    badge: {
      minWidth: 44,
      height: 28,
      paddingHorizontal: 9,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.cardAlt,
    },
    badgeOn: { backgroundColor: colors.accent },
    badgeText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
    badgeTextOn: { color: colors.onAccent },
    month: {
      height: 22,
      paddingHorizontal: 8,
      borderRadius: 11,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
    },
    monthText: { color: colors.text, fontFamily: fonts.medium, fontSize: 11 },
  });
