import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { useData } from '../context/DataContext';
import { usePremium } from '../context/PremiumContext';
import { useSettings } from '../context/SettingsContext';
import { usePrGoals } from '../lib/prGoalStore';
import { CYCLE_WEEKS, PREMIUM_GOAL_LIMIT, WEEK_NAMES, cycleInfo, progressPct } from '../lib/prGoal';
import { toDisplay } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { tr } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

/** PR Coach: 1-rep-max goals (e.g. bench 120 kg now, 150 kg wanted) with a 4-week plan that leads there. */
export function CoachScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { workouts } = useData();
  const { isPremium, ready } = usePremium();
  const { unit } = useSettings();
  const { goals, loaded } = usePrGoals();

  const active = goals.filter((g) => !g.achieved_at);
  const done = goals.filter((g) => g.achieved_at);
  const limit = PREMIUM_GOAL_LIMIT;
  const w = (kg: number) => `${toDisplay(kg, unit)} ${unit}`;

  const addGoal = () => {
    if (active.length >= limit) {
      Alert.alert(
        tr("Goal limit reached"),
        isPremium ? tr("You can follow up to {0} goals at once.", [limit]) : tr("The PR Coach is part of Premium."),
        isPremium ? [{ text: tr("OK") }] : [{ text: tr("Not now"), style: 'cancel' }, { text: tr("See Premium"), onPress: () => navigation.navigate('Paywall') }],
      );
      return;
    }
    navigation.navigate('PrGoalEdit');
  };

  const progressLifts = useMemo(
    () => [...new Set(goals.map((g) => g.exercise))].filter((n) => workouts.some((x) => x.entries.some((e) => e.name === n && e.sets.length > 0))),
    [goals, workouts],
  );

  if (ready && !isPremium) {
    return (
      <Screen>
        <Header title={tr("PR Coach")} />
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{tr("PREMIUM")}</Text>
            <Feather name="lock" size={28} color={colors.onAccent} />
          </View>
          <Text style={styles.heroName}>{tr("The PR Coach is Premium")}</Text>
          <Text style={styles.heroSub}>
            {tr("Set a 1-rep-max goal and get a 4-week plan with the exact sets, warm-up included, as a fresh one-time template for every session. Plus faster-pace options and plateau checks.")}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Paywall')} style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>{tr("See Premium")}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={tr("PR Coach")} />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loaded && goals.length === 0 && (
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>{tr("YOUR GOAL")}</Text>
              <Feather name="target" size={28} color={colors.onAccent} />
            </View>
            <Text style={styles.heroName}>{tr("Lift more for 1 rep")}</Text>
            <Text style={styles.heroSub}>
              {tr("Tell the coach your current 1-rep max and the weight you want, for example 120 kg now and 150 kg next. You get a 4-week plan that repeats until you get there.")}
            </Text>
            <Pressable accessibilityRole="button" onPress={addGoal} style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>{tr("Set my first goal")}</Text>
            </Pressable>
          </View>
        )}

        {active.map((g) => {
          const { week, cycle } = cycleInfo(g.cycle_start);
          return (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityLabel={tr("{0}, {1} to {2}", [g.exercise, w(g.current_kg), w(g.target_kg)])}
              onPress={() => navigation.navigate('PrGoal', { id: g.id })}
              style={styles.goal}
            >
              <View style={styles.goalTop}>
                <Text style={styles.goalName}>{tr(g.exercise)}</Text>
                <Feather name="chevron-right" size={22} color={colors.muted} />
              </View>
              <View style={styles.goalNums}>
                <Text style={styles.now}>{toDisplay(g.current_kg, unit)}</Text>
                <Feather name="arrow-right" size={22} color={colors.accent} />
                <Text style={styles.target}>
                  {toDisplay(g.target_kg, unit)} <Text style={styles.unit}>{unit}</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.max(3, progressPct(g.start_kg, g.current_kg, g.target_kg))}%` }]} />
              </View>
              <Text style={styles.sub}>
                {tr("{0}% · Cycle {1} · Week {2} of {3}: {4}", [progressPct(g.start_kg, g.current_kg, g.target_kg), cycle, week + 1, CYCLE_WEEKS, tr(WEEK_NAMES[week])])}
              </Text>
            </Pressable>
          );
        })}

        {done.length > 0 && <Text style={styles.section}>{tr("REACHED")}</Text>}
        {done.map((g) => (
          <Pressable
            key={g.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('PrGoal', { id: g.id })}
            style={styles.doneRow}
          >
            <Feather name="check-circle" size={22} color={colors.accent} />
            <View style={styles.flex}>
              <Text style={styles.rowName}>{tr(g.exercise)}</Text>
              <Text style={styles.sub}>
                {w(g.start_kg)} → {w(g.target_kg)}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        ))}

        {goals.length > 0 && (
          <Pressable accessibilityRole="button" onPress={addGoal} style={styles.add}>
            <Feather name="plus" size={20} color={colors.text} />
            <Text style={styles.addText}>{tr("New goal")}</Text>
            <Text style={styles.sub}>{active.length}/{PREMIUM_GOAL_LIMIT}</Text>
          </Pressable>
        )}

        {progressLifts.length > 0 && <Text style={styles.section}>{tr("PROGRESS & PLATEAUS")}</Text>}
        {progressLifts.map((name) => (
          <ProgressCard
            key={name}
            exercise={name}
            workouts={workouts}
            unit={unit}
            isPremium={isPremium}
            onUpgrade={() => navigation.navigate('Paywall')}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 8 },
    hero: { borderRadius: 28, padding: 22, backgroundColor: colors.accent, gap: 6 },
    heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroLabel: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
    heroName: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 28 },
    heroSub: { color: colors.onAccent, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    heroBtn: { marginTop: 12, height: 52, borderRadius: 26, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
    heroBtnText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 17 },
    goal: { borderRadius: 28, padding: 20, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    goalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    goalName: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
    goalNums: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
    now: { color: colors.muted, fontFamily: fonts.bold, fontSize: 28 },
    target: { color: colors.accent, fontFamily: fonts.bold, fontSize: 40, letterSpacing: -1 },
    unit: { fontSize: 18 },
    track: { height: 10, borderRadius: 5, backgroundColor: colors.border },
    fill: { height: 10, borderRadius: 5, backgroundColor: colors.accent },
    sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 4 },
    doneRow: {
      minHeight: 64,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowName: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
    add: {
      height: 52,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
    },
    addText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  });
