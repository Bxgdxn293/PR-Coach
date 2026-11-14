import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { bestE1rm, warmupSets } from '../lib/coach';
import { coachTemplate, useTemplates } from '../lib/templates';
import { usePremium } from '../context/PremiumContext';
import { usePrGoals } from '../lib/prGoalStore';
import { CYCLE_WEEKS, WEEK_NAMES, cycleInfo, etaDate, goalMult, paceStatus, progressPct, sessionPlan, sessionsForWeek, speedUps, weeksToGoal, type Session, type SpeedUp } from '../lib/prGoal';
import { fromDisplay, parseNumber, toDisplay } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PrGoalScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<RouteProp<RootStackParamList, 'PrGoal'>>().params;
  const { workouts } = useData();
  const { unit } = useSettings();
  const { goals, loaded, update, remove } = usePrGoals();
  const { addOnce } = useTemplates();
  const { isPremium, ready } = usePremium();
  const [maxModal, setMaxModal] = useState(false);
  const [newMax, setNewMax] = useState('');

  const goal = goals.find((g) => g.id === id);
  const w = (kg: number) => `${toDisplay(kg, unit)} ${unit}`;

  if (ready && !isPremium) {
    return (
      <Screen>
        <Header title="PR Coach" />
        <Text style={styles.hint}>The PR Coach is part of Premium.</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.replace('Paywall')} style={styles.startBtn}>
          <Text style={styles.startText}>See Premium</Text>
        </Pressable>
      </Screen>
    );
  }

  if (!goal) {
    return (
      <Screen>
        <Header title="Goal" />
        <Text style={styles.hint}>{loaded ? 'This goal no longer exists.' : 'Loading…'}</Text>
      </Screen>
    );
  }

  const { week, cycle } = cycleInfo(goal.cycle_start);
  const pct = progressPct(goal.start_kg, goal.current_kg, goal.target_kg);
  const mult = goalMult(goal);
  const weeks = weeksToGoal(goal.current_kg, goal.target_kg, mult);
  const eta = etaDate(goal.current_kg, goal.target_kg, new Date(), mult);
  const status = paceStatus(goal);
  const faster = speedUps(goal);
  const est = bestE1rm(goal.exercise, workouts);
  const sessions = sessionsForWeek(goal, week);

  // Starting a session builds a brand-new one-time template: warm-up ladder + exactly the sets the coach prescribes.
  const start = async (s: Session) => {
    const top = Math.max(...s.sets.map((x) => x.kg));
    const warm = warmupSets(toDisplay(top, unit), unit).map((x) => ({ kg: fromDisplay(x.weight, unit), reps: x.reps }));
    const t = coachTemplate(
      goal.id,
      goal.exercise,
      `${WEEK_NAMES[week]} · ${s.title}`,
      [...warm, ...s.sets.map((x) => ({ kg: x.kg, reps: x.reps }))],
    );
    await addOnce(t);
    navigation.navigate('Workout', { templateId: t.id });
  };

  const saveMax = async () => {
    const kg = fromDisplay(parseNumber(newMax), unit);
    if (!(kg > 0) || kg > 800) {
      Alert.alert('Check the number', 'Enter your new 1-rep max.');
      return;
    }
    const reached = kg >= goal.target_kg;
    await update(goal.id, {
      current_kg: kg,
      history: [...goal.history, { date: new Date().toISOString(), kg }],
      ...(reached ? { achieved_at: new Date().toISOString() } : { achieved_at: undefined }),
    });
    setMaxModal(false);
    setNewMax('');
  };

  const applySpeedUp = (o: SpeedUp) => {
    const text =
      o.id === 'second_session'
        ? 'You add a short support session each week. Do it only if you can recover: sleep, food and no pain in joints.'
        : 'Two sessions per week with harder weeks and a higher max-test attempt. Do it only if you recover well; you can switch back any time.';
    Alert.alert(
      o.id === 'second_session' ? 'Add the support session?' : 'Switch to fast pace?',
      `${text}\n\nEstimate: about ${o.weeksSaved} weeks sooner. This is a planning estimate, not a promise.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => update(goal.id, o.patch) },
      ],
    );
  };

  const confirmDelete = () =>
    Alert.alert('Delete goal?', `The plan for ${goal.exercise} will be removed from this device. Your workouts stay.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(goal.id);
          navigation.goBack();
        },
      },
    ]);

  return (
    <Screen>
      <Header title={goal.exercise} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{goal.achieved_at ? 'GOAL REACHED' : 'YOUR 1-REP MAX'}</Text>
          <View style={styles.nums}>
            <Text style={styles.now}>{toDisplay(goal.current_kg, unit)}</Text>
            <Feather name="arrow-right" size={26} color={colors.onAccent} />
            <Text style={styles.target}>
              {toDisplay(goal.target_kg, unit)}
              <Text style={styles.unit}> {unit}</Text>
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(3, pct)}%` }]} />
          </View>
          <Text style={styles.heroSub}>
            {pct}% from {w(goal.start_kg)}
            {!goal.achieved_at && weeks !== null && weeks > 0 && eta
              ? ` · about ${weeks} weeks left (${eta.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})`
              : ''}
          </Text>
        </View>

        {est > goal.current_kg + 2.5 && !goal.achieved_at && (
          <Text style={styles.hint}>
            Your logged sets point to roughly {w(est)} for one rep. If you know you can lift that once, log it as your new max.
          </Text>
        )}

        {!goal.achieved_at && goal.pace === 'fast' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fast pace is on. Switch back to steady pace"
            onPress={() => update(goal.id, { pace: 'steady' })}
            style={styles.paceChip}
          >
            <Feather name="zap" size={16} color={colors.accent} />
            <Text style={styles.paceChipText}>Fast pace on · tap to go back to steady</Text>
          </Pressable>
        )}

        {status === 'ahead' && !goal.achieved_at && (
          <Text style={styles.hint}>You are ahead of the plan. Good: the options below fit your pace.</Text>
        )}
        {status === 'behind' && !goal.achieved_at && (
          <Text style={styles.hint}>
            Progress is slower than planned. Do not rush it: keep the steady plan, protect your sleep and protein, and log your sessions. The faster options appear again when you are back on track.
          </Text>
        )}

        {faster.length > 0 && (
          <View style={styles.fasterCard}>
            <Text style={styles.fasterTitle}>Reach it faster</Text>
            {faster.map((o) => (
              <View key={o.id} style={styles.fasterRow}>
                <View style={styles.flex}>
                  <Text style={styles.sessionTitle}>{o.id === 'second_session' ? 'Add a support session' : 'Fast pace'}</Text>
                  <Text style={styles.hint}>
                    About {o.weeksSaved} weeks sooner · {o.eta.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Switch: ${o.id === 'second_session' ? 'add a support session' : 'fast pace'}`} onPress={() => applySpeedUp(o)} style={styles.startBtn}>
                  <Text style={styles.startText}>Switch</Text>
                </Pressable>
              </View>
            ))}
            <Text style={styles.hint}>Estimates from training rules of thumb, not measurements. Never more than about 1.25% of your max per week.</Text>
          </View>
        )}

        {goal.achieved_at ? (
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('PrGoalEdit', { id: goal.id })} style={styles.primary}>
            <Text style={styles.primaryText}>Raise the goal</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.section}>
              THIS WEEK · CYCLE {cycle} · WEEK {week + 1} OF {CYCLE_WEEKS}: {WEEK_NAMES[week].toUpperCase()}
            </Text>
            {sessions.map((s) => (
              <View key={s.kind} style={styles.session}>
                <View style={styles.flex}>
                  <Text style={styles.sessionTitle}>
                    {s.kind === 'main' ? 'Main session' : 'Support session'} · {s.title}
                  </Text>
                  <Text style={styles.sessionSets}>
                    {s.attempt
                      ? `Singles up to ${w(s.attempt)}`
                      : `${s.sets.length} × ${s.sets[0].reps} @ ${w(s.sets[0].kg)}`}
                  </Text>
                  {s.attempt && (
                    <Text style={styles.hint}>
                      {s.sets.map((x) => `${toDisplay(x.kg, unit)}×${x.reps}`).join('  ·  ')}
                    </Text>
                  )}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Start ${s.title}`} onPress={() => start(s)} style={styles.startBtn}>
                  <Text style={styles.startText}>Start</Text>
                </Pressable>
              </View>
            ))}

            <Pressable accessibilityRole="button" onPress={() => setMaxModal(true)} style={styles.secondary}>
              <Feather name="award" size={20} color={colors.accent} />
              <Text style={styles.secondaryText}>I lifted a new max</Text>
            </Pressable>

            <Text style={styles.section}>THE 4-WEEK CYCLE</Text>
            <View style={styles.road}>
              {WEEK_NAMES.map((name, i) => {
                const p = sessionPlan(goal, i, 'main');
                const on = i === week;
                return (
                  <View key={name} style={[styles.roadRow, on && styles.roadRowOn]}>
                    <Text style={[styles.roadWeek, on && { color: colors.accent }]}>W{i + 1}</Text>
                    <Text style={styles.roadName}>{name}</Text>
                    <Text style={styles.roadScheme}>
                      {p.attempt ? `up to ${w(p.attempt)}` : `${p.sets.length}×${p.sets[0].reps} @ ${w(p.sets[0].kg)}`}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.hint}>
              After the max test week the plan starts again from your new max. Weights are recalculated whenever you log a new max. This is a training guide, not medical advice: warm up, use safety arms or a spotter, and stop if something hurts.
            </Text>
          </>
        )}

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('PrGoalEdit', { id: goal.id })} style={styles.link}>
            <Text style={styles.linkText}>Edit goal</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.link}>
            <Text style={[styles.linkText, { color: colors.danger }]}>Delete goal</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={maxModal} transparent animationType="fade" onRequestClose={() => setMaxModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.box} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.boxTitle}>
              New 1-rep max
            </Text>
            <Text style={styles.hint}>The weight you lifted once with good form ({unit}).</Text>
            <TextInput
              value={newMax}
              onChangeText={setNewMax}
              keyboardType="decimal-pad"
              autoFocus
              accessibilityLabel="New one rep max"
              placeholder={String(toDisplay(goal.current_kg, unit))}
              placeholderTextColor={colors.muted}
              style={styles.boxInput}
            />
            <Pressable accessibilityRole="button" onPress={saveMax} style={styles.primary}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setMaxModal(false)} style={styles.link}>
              <Text style={styles.linkText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    body: { gap: 12, paddingBottom: 16 },
    hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
    hero: { borderRadius: 28, padding: 22, gap: 8, backgroundColor: colors.accent },
    heroLabel: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
    nums: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
    now: { color: colors.onAccent, opacity: 0.7, fontFamily: fonts.bold, fontSize: 30 },
    target: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 46, letterSpacing: -1.5 },
    unit: { fontSize: 20 },
    track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.2)' },
    fill: { height: 10, borderRadius: 5, backgroundColor: colors.onAccent },
    heroSub: { color: colors.onAccent, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.3, marginTop: 4 },
    session: {
      borderRadius: 24,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
    sessionSets: { color: colors.accent, fontFamily: fonts.bold, fontSize: 20, marginTop: 2 },
    startBtn: { height: 48, paddingHorizontal: 22, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    startText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 16 },
    primary: { height: 56, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 17 },
    secondary: {
      height: 52,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
    paceChip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent },
    paceChipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
    fasterCard: { borderRadius: 24, padding: 16, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    fasterTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    fasterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    road: { borderRadius: 24, padding: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    roadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 12, borderRadius: 16 },
    roadRowOn: { backgroundColor: colors.cardAlt },
    roadWeek: { width: 30, color: colors.muted, fontFamily: fonts.bold, fontSize: 14 },
    roadName: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    roadScheme: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
    link: { minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
    linkText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    box: { borderRadius: 28, padding: 22, gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    boxTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 24 },
    boxInput: {
      height: 64,
      borderRadius: 20,
      paddingHorizontal: 18,
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: 30,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
