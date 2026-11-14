import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ExercisePicker } from '../components/ExercisePicker';
import { usePremium } from '../context/PremiumContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { usePrGoals } from '../lib/prGoalStore';
import { SECOND_SESSION_MULT, checkGoal, etaDate, suggestedCurrent, weeksToGoal } from '../lib/prGoal';
import { fromDisplay, parseNumber, toDisplay } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { tr, dateLocale } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PrGoalEditScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { isPremium, ready } = usePremium();
  useEffect(() => {
    if (ready && !isPremium) navigation.replace('Paywall');
  }, [ready, isPremium, navigation]);
  const id = useRoute<RouteProp<RootStackParamList, 'PrGoalEdit'>>().params?.id ?? null;
  const { workouts } = useData();
  const { unit } = useSettings();
  const { goals, loaded, add, update } = usePrGoals();

  const [exercise, setExercise] = useState('Barbell Bench Press');
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [perWeek, setPerWeek] = useState<1 | 2>(2);
  const [picker, setPicker] = useState(false);
  const [filled, setFilled] = useState(false);
  const [estimated, setEstimated] = useState(false);

  // Editing: fill from the stored goal once loaded.
  useEffect(() => {
    if (!loaded || filled || !id) return;
    const g = goals.find((x) => x.id === id);
    if (g) {
      setExercise(g.exercise);
      setCurrent(String(toDisplay(g.current_kg, unit)));
      setTarget(String(toDisplay(g.target_kg, unit)));
      setPerWeek(g.sessions_per_week);
    }
    setFilled(true);
  }, [loaded, filled, id, goals, unit]);

  // New goal: prefill the current max from the logged lifts.
  const prefill = (name: string) => {
    const s = suggestedCurrent(name, workouts);
    setEstimated(!!s?.estimated);
    setCurrent(s ? String(toDisplay(s.kg, unit)) : '');
  };
  useEffect(() => {
    if (!id) prefill(exercise);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curKg = fromDisplay(parseNumber(current), unit);
  const tgtKg = fromDisplay(parseNumber(target), unit);
  const check = checkGoal(curKg, tgtKg);
  const weeks = check.ok ? weeksToGoal(curKg, tgtKg, perWeek === 2 ? SECOND_SESSION_MULT : 1) : null;
  const eta = check.ok ? etaDate(curKg, tgtKg, new Date(), perWeek === 2 ? SECOND_SESSION_MULT : 1) : null;

  const save = async () => {
    if (!check.ok) {
      Alert.alert(tr("Check your numbers"), check.error);
      return;
    }
    if (id) await update(id, { exercise, current_kg: curKg, target_kg: tgtKg, sessions_per_week: perWeek, ...(perWeek === 1 ? { pace: 'steady' as const } : {}) });
    else await add({ exercise, current_kg: curKg, target_kg: tgtKg, sessions_per_week: perWeek });
    navigation.goBack();
  };

  return (
    <Screen>
      <Header title={id ? tr("Edit goal") : tr("New goal")} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{tr("LIFT")}</Text>
        <Pressable accessibilityRole="button" onPress={() => !id && setPicker(true)} style={styles.card}>
          <Text style={styles.value}>{tr(exercise)}</Text>
          {!id && <Feather name="chevron-down" size={20} color={colors.muted} />}
        </Pressable>

        <View style={styles.two}>
          <View style={styles.flex}>
            <Text style={styles.label}>{tr("CURRENT 1-REP MAX ({0})", [unit.toUpperCase()])}</Text>
            <TextInput
              value={current}
              onChangeText={(t) => {
                setCurrent(t);
                setEstimated(false);
              }}
              keyboardType="decimal-pad"
              accessibilityLabel={tr("Current one rep max")}
              placeholder="120"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.flex}>
            <Text style={styles.label}>{tr("GOAL ({0})", [unit.toUpperCase()])}</Text>
            <TextInput
              value={target}
              onChangeText={setTarget}
              keyboardType="decimal-pad"
              accessibilityLabel={tr("Goal one rep max")}
              placeholder="150"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.accent }]}
            />
          </View>
        </View>
        {estimated && <Text style={styles.hint}>{tr("Estimated from your logged sets. Change it if you know your real 1-rep max.")}</Text>}

        <Text style={styles.label}>{tr("SESSIONS PER WEEK FOR THIS LIFT")}</Text>
        <View style={styles.seg}>
          {([1, 2] as const).map((n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityState={{ selected: perWeek === n }}
              onPress={() => setPerWeek(n)}
              style={[styles.segBtn, perWeek === n && { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.segText, perWeek === n && { color: colors.onAccent }]}>
                {n === 1 ? tr("1 (main)") : tr("2 (main + support)")}
              </Text>
            </Pressable>
          ))}
        </View>

        {check.error && current !== '' && target !== '' && <Text style={styles.error}>{check.error}</Text>}
        {check.ok && (
          <View style={styles.card}>
            <View style={styles.flex}>
              <Text style={styles.value}>
                {weeks === null ? tr("More than 3 years") : tr("About {0} weeks", [weeks])}
              </Text>
              <Text style={styles.hint}>
                {eta ? tr("Around {0}. ", [eta.toLocaleDateString(dateLocale(), { month: 'long', year: 'numeric' })]) : ''}
                {tr("An estimate at a normal pace, not a promise. Sleep, food and form decide the real speed.")}
              </Text>
            </View>
          </View>
        )}
        {check.warning && <Text style={styles.hint}>{check.warning}</Text>}
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={save} style={styles.primary}>
        <Text style={styles.primaryText}>{id ? tr("Save goal") : tr("Start my plan")}</Text>
      </Pressable>
      <ExercisePicker
        visible={picker}
        title={tr("Choose the lift")}
        onClose={() => setPicker(false)}
        onPick={(n) => {
          setExercise(n);
          prefill(n);
          setPicker(false);
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    body: { gap: 10, paddingBottom: 12 },
    label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.2, marginTop: 6 },
    card: {
      minHeight: 56,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    value: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    two: { flexDirection: 'row', gap: 12 },
    input: {
      height: 64,
      marginTop: 6,
      borderRadius: 20,
      paddingHorizontal: 18,
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: 28,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
    error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14 },
    seg: { flexDirection: 'row', padding: 4, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    segBtn: { flex: 1, height: 44, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    segText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
    primary: { height: 60, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 },
  });
