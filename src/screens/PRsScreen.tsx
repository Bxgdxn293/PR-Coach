import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { formatDate } from '../lib/dates';
import { bestE1rm } from '../lib/coach';
import { formatWeight } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
export function PRsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { records, workouts } = useData();
  const { unit } = useSettings();
  const [top, ...rest] = records;

  return (
    <Screen>
      <Header title={tr("PR Records")} />
      {!top ? (
        <View style={styles.empty}>
          <Feather name="award" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>{tr("No records yet. Finish a workout and your best lifts show up here.")}</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(r) => r.exercise}
          contentContainerStyle={{ gap: 12 }}
          ListHeaderComponent={
            <View style={[styles.hero, { marginBottom: 12 }]}>
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>{tr("HEAVIEST LIFT")}</Text>
                <Feather name="award" size={32} color={colors.onAccent} />
              </View>
              <View style={styles.heroBottom}>
                <View style={styles.flex}>
                  <Text style={styles.heroName}>{tr(top.exercise)}</Text>
                  <Text style={styles.heroDate}>
                    {formatDate(top.date)} · {top.reps} {tr("reps")}
                  </Text>
                  {bestE1rm(top.exercise, workouts) > 0 && (
                    <Text style={styles.heroDate}>{tr("Est. 1RM")} {formatWeight(bestE1rm(top.exercise, workouts), unit)}</Text>
                  )}
                </View>
                <Text style={styles.heroValue}>{formatWeight(top.kg, unit)}</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>{tr(item.exercise)}</Text>
                <Text style={styles.sub}>{formatDate(item.date)}</Text>
                {bestE1rm(item.exercise, workouts) > 0 && (
                  <Text style={styles.e1rm}>{tr("Est. 1RM")} {formatWeight(bestE1rm(item.exercise, workouts), unit)}</Text>
                )}
              </View>
              <View style={styles.right}>
                <Text style={styles.value}>{formatWeight(item.kg, unit)}</Text>
                <Text style={styles.sub}>{item.reps} {tr("reps")}</Text>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  emptyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center' },
  hero: { borderRadius: 28, padding: 22, minHeight: 170, backgroundColor: colors.accent, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
  heroBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  heroName: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 26 },
  heroDate: { color: colors.onAccent, fontFamily: fonts.medium, fontSize: 14 },
  heroValue: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 36, letterSpacing: -1 },
  row: {
    minHeight: 84,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 19 },
  sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  e1rm: { color: colors.accent, fontFamily: fonts.medium, fontSize: 13 },
  right: { alignItems: 'flex-end' },
  value: { color: colors.accent, fontFamily: fonts.bold, fontSize: 26 },
});
