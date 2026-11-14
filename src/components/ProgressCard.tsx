import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ProPill } from './ProPill';
import { bestE1rm, detectPlateau, e1rmHistory, forecastPR } from '../lib/coach';
import { formatWeight } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { Unit, Workout } from '../types';

type Props = {
  exercise: string;
  workouts: Workout[];
  unit: Unit;
  isPremium: boolean;
  onUpgrade: () => void;
};

// Free: estimated 1RM + plateau status. Premium: plateau remedies + PR forecast.
export function ProgressCard({ exercise, workouts, unit, isPremium, onUpgrade }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { history, plateau, forecast } = useMemo(() => {
    const history = e1rmHistory(exercise, workouts);
    return { history, plateau: detectPlateau(history), forecast: forecastPR(history) };
  }, [exercise, workouts]);

  const status =
    plateau.status === 'plateau'
      ? `Plateau: no new best e1RM in ${plateau.sessionsSinceBest} sessions`
      : plateau.status === 'progressing'
        ? plateau.sessionsSinceBest === 0
          ? 'New best e1RM in your last session'
          : `${plateau.sessionsSinceBest} session${plateau.sessionsSinceBest === 1 ? '' : 's'} since your best e1RM`
        : plateau.status === 'building'
          ? 'Log a few more sessions to detect plateaus'
          : 'No data yet';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={styles.name}>{exercise}</Text>
          <Text style={[styles.status, plateau.status === 'plateau' && { color: colors.warn }]}>{status}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.value}>{plateau.bestE1rm > 0 ? formatWeight(bestE1rm(exercise, workouts), unit) : '–'}</Text>
          <Text style={styles.label}>EST. 1RM</Text>
        </View>
      </View>

      {isPremium ? (
        <>
          <View style={styles.line}>
            <Feather name="calendar" size={16} color={colors.accent} />
            <Text style={styles.lineText}>{forecast.message}</Text>
          </View>
          {plateau.remedies.map((r) => (
            <View key={r.kind} style={styles.remedy}>
              <Text style={styles.remedyTitle}>
                {r.title}
                {r.kg ? ` (${formatWeight(r.kg, unit)})` : ''}
              </Text>
              <Text style={styles.remedyText}>{r.detail}</Text>
            </View>
          ))}
        </>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="PR forecast and plateau fixes, Premium" onPress={onUpgrade} style={styles.lock}>
          <Text style={styles.lockText}>PR forecast &amp; plateau fixes</Text>
          <ProPill />
          <Feather name="lock" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 20, padding: 16, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  status: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  right: { alignItems: 'flex-end' },
  value: { color: colors.accent, fontFamily: fonts.bold, fontSize: 22 },
  label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  remedy: { borderRadius: 14, padding: 12, gap: 2, backgroundColor: colors.cardAlt },
  remedyTitle: { color: colors.warn, fontFamily: fonts.bold, fontSize: 15 },
  remedyText: { color: colors.text, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  lock: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 12, backgroundColor: colors.cardAlt },
  lockText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
});
