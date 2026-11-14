import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { FREE_WEEKLY_LIMIT, useData } from '../context/DataContext';
import { usePremium } from '../context/PremiumContext';
import { useSettings } from '../context/SettingsContext';
import { WarmupModal } from '../components/WarmupModal';
import { ExercisePicker } from '../components/ExercisePicker';
import { SwipeToDelete } from '../components/SwipeToDelete';
import { ExerciseMini } from '../components/ExerciseMini';
import { ExerciseInfoModal } from '../components/ExerciseInfoModal';
import { isBarbell, warmupSets } from '../lib/coach';
import { applySingles } from '../lib/prGoal';
import { NOTE_MAX, useExerciseNotes } from '../lib/exerciseNotes';
import { usePrGoals } from '../lib/prGoalStore';
import { canSaveTemplate, FREE_TEMPLATE_LIMIT, PREMIUM_TEMPLATE_LIMIT, templateFromEntries, useTemplates, type WorkoutTemplate } from '../lib/templates';
import { formatClock } from '../lib/dates';
import { fromDisplay, parseNumber, toDisplay } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { DraftExercise, DraftSet, RootStackParamList, SavedExercise } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REST_STEP = 15;
const REST_MIN = 15;
const REST_MAX = 600;
// remembered between workouts while the app is open
let lastRestTotal = 90;

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export function WorkoutScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const params = useRoute<RouteProp<RootStackParamList, 'Workout'>>().params;
  const target = params && 'exercise' in params ? params : undefined;
  const { templates, loaded: templatesLoaded, save: saveTemplate, touch: touchTemplate, remove: removeTemplate } = useTemplates();
  const startTemplateId = params && 'templateId' in params ? params.templateId : null;
  const session = params && 'session' in params ? params.session : undefined;
  const saved = templates.filter((x) => !x.once);
  const { replaceAll: replaceGoals } = usePrGoals();
  const { notes, update: updateNote, persist: persistNotes } = useExerciseNotes();
  const { unit } = useSettings();
  const { isPremium, ready } = usePremium();
  const { weeklyCount, lastSetFor, saveWorkout } = useData();

  const makeSet = (name: string): DraftSet => {
    const last = lastSetFor(name);
    return { kg: last ? String(toDisplay(last.kg, unit)) : '', reps: last ? String(last.reps) : '', done: false };
  };
  const makeExercise = (name: string): DraftExercise => ({
    name,
    sets: [makeSet(name), makeSet(name), makeSet(name)],
  });

  const [title, setTitle] = useState(session ? `${session.exercise} · ${session.title}` : target?.exercise ?? 'Workout');
  const [tplPicker, setTplPicker] = useState(false);
  const [fromTemplate, setFromTemplate] = useState<string | null>(null);
  const [fromTemplateId, setFromTemplateId] = useState<string | null>(null);
  const appliedStart = useRef(false);
  const [drafts, setDrafts] = useState<DraftExercise[]>(() =>
    session
      ? [
          {
            name: session.exercise,
            sets: [
              // warm-up ladder up to the first working weight, then the planned sets (all in the display unit)
              ...warmupSets(toDisplay(Math.max(...session.sets.map((s) => s.kg)), unit), unit).map((x) => ({
                kg: String(x.weight),
                reps: String(x.reps),
                done: false,
              })),
              ...session.sets.map((s) => ({ kg: String(toDisplay(s.kg, unit)), reps: String(s.reps), done: false })),
            ],
          },
        ]
      : target
      ? [
          {
            name: target.exercise,
            sets: [0, 1, 2].map(() => ({ kg: String(toDisplay(target.kg, unit)), reps: String(target.reps), done: false })),
          },
        ]
      : [],
  );
  const [picker, setPicker] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [warm, setWarm] = useState<{ name: string; weight: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(new Date());
  // Set while/after saving: the weekly count rises with this very workout and must not trigger the paywall redirect.
  const finishing = useRef(false);
  const leaving = useRef(false);
  const hasProgress = drafts.some((ex) => ex.sets.some((s) => s.done));
  // Back arrow / Android back button: ask before throwing away ticked sets.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (!hasProgress || finishing.current || leaving.current) return;
        e.preventDefault();
        Alert.alert('Discard workout?', 'Your logged sets will be lost.', [
          { text: 'Keep going', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              leaving.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, hasProgress],
  );
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startedAt.current.getTime()) / 1000), 1000);
    return () => clearInterval(id);
  }, []);

  // Free plan: show the paywall instead of starting another workout once the weekly limit is used.
  useEffect(() => {
    if (ready && !isPremium && !finishing.current && weeklyCount >= FREE_WEEKLY_LIMIT) {
      navigation.replace('Paywall');
    }
  }, [ready, isPremium, weeklyCount, navigation]);

  useEffect(() => () => void persistNotes(), [persistNotes]);

  const patchSet = (ei: number, si: number, patch: Partial<DraftSet>) =>
    setDrafts((prev) =>
      prev.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => (j !== si ? s : { ...s, ...patch })) },
      ),
    );

  const changeRest = (ei: number, si: number, delta: number) => {
    const cur = drafts[ei]?.sets[si]?.rest;
    if (!cur) return;
    const total = Math.min(REST_MAX, Math.max(REST_MIN, cur.total + delta));
    lastRestTotal = total;
    patchSet(ei, si, { rest: { ...cur, total } });
  };

  // Swipe a set away; the last remaining set stays (remove the exercise instead).
  const removeSet = (ei: number, si: number) =>
    setDrafts((prev) =>
      prev
        .map((ex, i) => (i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }))
        .filter((ex, i) => i !== ei || ex.sets.length > 0), // deleting the only set removes the exercise
    );

  const addSet = (ei: number) =>
    setDrafts((prev) =>
      prev.map((ex, i) => {
        if (i !== ei) return ex;
        const lastDraft = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { kg: lastDraft?.kg ?? '', reps: lastDraft?.reps ?? '', done: false }] };
      }),
    );

  const removeExercise = (ei: number) => setDrafts((prev) => prev.filter((_, i) => i !== ei));

  const applyTemplate = (t: WorkoutTemplate) => {
    setTitle(t.name);
    setFromTemplate(t.name);
    setFromTemplateId(t.id);
    setDrafts(
      t.exercises.map((e) => {
        if (e.plan && e.plan.length > 0) {
          // coach template: exact prescribed sets, no override from the last workout
          return { name: e.name, sets: e.plan.map((x) => ({ kg: String(toDisplay(x.kg, unit)), reps: String(x.reps), done: false })) };
        }
        const last = lastSetFor(e.name);
        const base: DraftSet = {
          kg: last ? String(toDisplay(last.kg, unit)) : '',
          reps: String(last?.reps ?? e.reps),
          done: false,
        };
        return { name: e.name, sets: Array.from({ length: e.sets }, () => ({ ...base })) };
      }),
    );
    setTplPicker(false);
  };

  const confirmApplyTemplate = (t: WorkoutTemplate) => {
    if (drafts.some((ex) => ex.sets.some((s) => s.done))) {
      Alert.alert('Replace current workout?', 'Your ticked sets will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: () => applyTemplate(t) },
      ]);
    } else {
      applyTemplate(t);
    }
  };

  // Started from the Templates screen: load that template as soon as the stored list is available.
  useEffect(() => {
    if (!startTemplateId || appliedStart.current || !templatesLoaded) return;
    appliedStart.current = true;
    const t = templates.find((x) => x.id === startTemplateId);
    if (t) applyTemplate(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTemplateId, templatesLoaded, templates]);

  const confirmRemoveTemplate = (t: WorkoutTemplate) =>
    Alert.alert('Delete template?', `"${t.name}" will be removed from this device.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTemplate(t.id) },
    ]);

  const finish = async () => {
    const entries: SavedExercise[] = drafts
      .map((ex) => ({
        name: ex.name,
        sets: ex.sets
          .filter((s) => s.done)
          .map((s) => ({ kg: fromDisplay(parseNumber(s.kg), unit), reps: Math.round(parseNumber(s.reps)) })),
      }))
      .filter((ex) => ex.sets.length > 0);

    if (entries.length === 0) {
      Alert.alert('Nothing logged', 'Tick at least one set before finishing the workout.');
      return;
    }
    setSaving(true);
    finishing.current = true;
    const err = await saveWorkout({
      name: title.trim() || 'Workout',
      started_at: startedAt.current.toISOString(),
      duration_sec: Math.round((Date.now() - startedAt.current.getTime()) / 1000),
      entries,
    });
    setSaving(false);
    if (err) finishing.current = false;
    if (err?.includes('free_limit_reached')) {
      navigation.replace('Paywall');
    } else if (err) {
      Alert.alert('Could not save workout', err);
    } else {
      const fromOnce = !!fromTemplateId && !!templates.find((x) => x.id === fromTemplateId)?.once;
      if (fromTemplateId) await (fromOnce ? removeTemplate(fromTemplateId) : touchTemplate(fromTemplateId));
      // A logged single above a goal's current max is a new 1-rep max for that goal.
      let hits: { exercise: string; kg: number; reached: boolean }[] = [];
      await replaceGoals((list) => {
        const res = applySingles(list, entries);
        hits = res.hits;
        return res.goals;
      });
      const proceed = async () => {
      if (fromOnce) {
        navigation.navigate('Menu');
        return;
      }
      const name = title.trim() || 'Workout';
      const exists = saved.some((t) => t.name.toLowerCase() === name.toLowerCase());
      if (!canSaveTemplate(saved, name, isPremium)) {
        const limit = isPremium ? PREMIUM_TEMPLATE_LIMIT : FREE_TEMPLATE_LIMIT;
        Alert.alert(
          'Template limit reached',
          isPremium
            ? `You can keep up to ${limit} templates. Delete one to save a new one.`
            : `The free plan keeps ${limit} templates. Delete one in the Templates list, or upgrade to Premium for up to ${PREMIUM_TEMPLATE_LIMIT}.`,
          [
            { text: 'Not now', style: 'cancel', onPress: () => navigation.navigate('Menu') },
            ...(isPremium ? [] : [{ text: 'See Premium', onPress: () => navigation.replace('Paywall') }]),
          ],
          { cancelable: false },
        );
        return;
      }
      Alert.alert(
        exists ? 'Update template?' : 'Save as template?',
        exists
          ? `Replace the template "${name}" with this workout.`
          : `Next time you can start "${name}" with one tap instead of building it again.`,
        [
          { text: 'Not now', style: 'cancel', onPress: () => navigation.navigate('Menu') },
          {
            text: exists ? 'Update' : 'Save',
            onPress: async () => {
              await saveTemplate(name, templateFromEntries(entries));
              navigation.navigate('Menu');
            },
          },
        ],
        { cancelable: false },
      );
      };
      if (hits.length > 0) {
        const h = hits[0];
        Alert.alert(
          h.reached ? 'Goal reached!' : 'New 1-rep max!',
          h.reached
            ? `${h.exercise}: ${toDisplay(h.kg, unit)} ${unit}. You hit your goal. Raise it in PR Coach.`
            : `${h.exercise}: ${toDisplay(h.kg, unit)} ${unit}. Your plan now uses this as your max.`,
          [{ text: 'Nice', onPress: () => void proceed() }],
          { cancelable: false },
        );
      } else {
        await proceed();
      }
    }
  };

  const confirmDiscard = () =>
    Alert.alert('Discard workout?', 'Your logged sets will be lost.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          leaving.current = true;
          navigation.goBack();
        },
      },
    ]);

  return (
    <Screen>
      <Header title="Workout" />
      <View style={styles.timerCard}>
        <View style={styles.flex}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            accessibilityLabel="Workout name"
            style={styles.titleInput}
            placeholder="Workout name"
            placeholderTextColor={colors.muted}
            maxLength={40}
          />
          <Text style={styles.timer}>{formatClock(elapsed)}</Text>
        </View>
        <Pressable onPress={confirmDiscard} accessibilityRole="button" accessibilityLabel="Discard workout" style={styles.discard}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => setTplPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={`Templates, ${saved.length} saved`}
        style={styles.tplBtn}
      >
        <Feather name="bookmark" size={18} color={colors.accent} />
        <Text style={styles.tplBtnText}>
          {fromTemplate ? `Template: ${fromTemplate}` : saved.length > 0 ? `Start from a template (${saved.length})` : 'Templates'}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <ScrollView style={styles.flex} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {drafts.map((ex, ei) => {
          const prev = lastSetFor(ex.name);
          return (
            <View key={`${ex.name}-${ei}`} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={[styles.exName, styles.flex]}>{ex.name}</Text>
                <ExerciseMini name={ex.name} onPress={() => setInfo(ex.name)} height={46} />
                {isBarbell(ex.name) && (
                  <Pressable
                    onPress={() => {
                      const top = Math.max(0, ...ex.sets.map((s) => parseNumber(s.kg)));
                      setWarm({ name: ex.name, weight: top > 0 ? String(top) : '' });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Warm-up and plates for ${ex.name}`}
                    style={styles.warmBtn}
                  >
                    <Text style={styles.warmBtnText}>Warm-up &amp; plates</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => removeExercise(ei)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${ex.name}`}
                  style={styles.iconBtn}
                >
                  <Feather name="trash-2" size={18} color={colors.muted} />
                </Pressable>
              </View>
              <View style={styles.noteBox}>
                <Feather name="edit-3" size={14} color={colors.muted} />
                <TextInput
                  value={notes[ex.name] ?? ''}
                  onChangeText={(v) => updateNote(ex.name, v)}
                  onBlur={() => void persistNotes()}
                  accessibilityLabel={`Note for ${ex.name}`}
                  placeholder="Note (seat, grip, cue…)"
                  placeholderTextColor={colors.muted}
                  maxLength={NOTE_MAX}
                  multiline
                  style={styles.noteInput}
                />
              </View>
              <View style={styles.row}>
                <Text style={[styles.th, styles.colSet]}>SET</Text>
                <Text style={[styles.th, styles.flex]}>PREVIOUS</Text>
                <Text style={[styles.th, styles.colInput]}>{unit.toUpperCase()}</Text>
                <Text style={[styles.th, styles.colInput]}>REPS</Text>
                <View style={styles.colCheck} />
                <View style={{ width: 30 }} />
              </View>
              {ex.sets.map((s, si) => (
                <View key={si}>
                <SwipeToDelete enabled onDelete={() => removeSet(ei, si)}>
                <View style={[styles.row, styles.setRow, s.done && styles.setRowDone]}>
                  <Text style={[styles.cell, styles.colSet]}>{si + 1}</Text>
                  <Text style={[styles.cell, styles.flex, { color: colors.muted }]}>
                    {prev ? `${toDisplay(prev.kg, unit)} × ${prev.reps}` : '–'}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.colInput]}
                    value={s.kg}
                    onChangeText={(t) => patchSet(ei, si, { kg: t })}
                    keyboardType="decimal-pad"
                    accessibilityLabel={`${ex.name} set ${si + 1} weight`}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                  />
                  <TextInput
                    style={[styles.input, styles.colInput]}
                    value={s.reps}
                    onChangeText={(t) => patchSet(ei, si, { reps: t })}
                    keyboardType="number-pad"
                    accessibilityLabel={`${ex.name} set ${si + 1} reps`}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                  />
                  <Pressable
                    onPress={() => patchSet(ei, si, s.done ? { done: false, rest: undefined } : { done: true, rest: { total: lastRestTotal, startedAt: Date.now() } })}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: s.done }}
                    accessibilityLabel={`${ex.name} set ${si + 1} done`}
                    style={[styles.check, s.done && { backgroundColor: colors.accent }]}
                  >
                    <Feather name="check" size={18} color={s.done ? colors.onAccent : colors.muted} />
                  </Pressable>
                  <Pressable
                    onPress={() => removeSet(ei, si)}
                    accessibilityRole="button"
                    accessibilityLabel={`${ex.name} delete set ${si + 1}`}
                    hitSlop={6}
                    style={styles.delSet}
                  >
                    <Feather name="trash-2" size={16} color={colors.muted} />
                  </Pressable>
                </View>
                </SwipeToDelete>
                {s.done && s.rest && (() => {
                  const passed = Math.max(0, (Date.now() - s.rest.startedAt) / 1000);
                  const left = Math.max(0, s.rest.total - passed);
                  const pct = Math.min(1, passed / s.rest.total);
                  const over = passed >= s.rest.total;
                  return (
                    <View style={styles.restBox} accessibilityLabel={over ? `Rest done, ${clock(s.rest.total)}` : `Rest, ${clock(left)} left`}>
                      <View style={styles.restTrack}>
                        <View style={[styles.restFill, { width: `${pct * 100}%` }]} />
                      </View>
                      <View style={styles.restRow}>
                        <Text style={[styles.restText, over && { color: colors.accent }]}>
                          {over ? `Rest done · ${clock(s.rest.total)}` : `Rest ${clock(left)} / ${clock(s.rest.total)}`}
                        </Text>
                        <Pressable
                          onPress={() => changeRest(ei, si, -REST_STEP)}
                          accessibilityRole="button"
                          accessibilityLabel="Rest 15 seconds shorter"
                          hitSlop={8}
                          style={styles.restBtn}
                        >
                          <Text style={styles.restBtnText}>−15s</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => changeRest(ei, si, REST_STEP)}
                          accessibilityRole="button"
                          accessibilityLabel="Rest 15 seconds longer"
                          hitSlop={8}
                          style={styles.restBtn}
                        >
                          <Text style={styles.restBtnText}>+15s</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })()}
                </View>
              ))}
              <Pressable onPress={() => addSet(ei)} accessibilityRole="button" style={styles.addSet}>
                <Feather name="plus" size={18} color={colors.accent} />
                <Text style={styles.addSetText}>Add set</Text>
              </Pressable>
            </View>
          );
        })}
        <Pressable onPress={() => setPicker(true)} accessibilityRole="button" style={styles.addExercise}>
          <Feather name="plus" size={20} color={colors.text} />
          <Text style={styles.addExerciseText}>Add exercise</Text>
        </Pressable>
      </ScrollView>

      <Pressable onPress={finish} disabled={saving} accessibilityRole="button" style={styles.finish}>
        <Text style={styles.finishText}>{saving ? 'Saving…' : 'Finish Workout'}</Text>
      </Pressable>

      <WarmupModal
        visible={warm !== null}
        exercise={warm?.name ?? ''}
        workingWeight={warm?.weight ?? ''}
        unit={unit}
        onClose={() => setWarm(null)}
      />

      <Modal visible={tplPicker} animationType="slide" onRequestClose={() => setTplPicker(false)}>
        <Screen hideCredits>
          <View style={styles.pickerHead}>
            <Text style={styles.pickerTitle}>Templates</Text>
            <Text style={styles.meta}>
              {saved.length}/{isPremium ? PREMIUM_TEMPLATE_LIMIT : FREE_TEMPLATE_LIMIT}
            </Text>
            <Pressable onPress={() => setTplPicker(false)} accessibilityRole="button" accessibilityLabel="Close" style={styles.discard}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>
          {saved.length === 0 ? (
            <Text style={styles.meta}>
              No templates yet. Build a workout, finish it and choose "Save as template" - it shows up here.
            </Text>
          ) : (
            <FlatList
              data={saved}
              keyExtractor={(t) => t.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <View style={styles.pickRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Start ${item.name}`}
                    style={styles.flex}
                    onPress={() => confirmApplyTemplate(item)}
                  >
                    <Text style={styles.exName}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.exercises.length} exercises · {item.exercises.reduce((n, e) => n + e.sets, 0)} sets
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {item.exercises.map((e) => e.name).join(', ')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit template ${item.name}`}
                    onPress={() => {
                      setTplPicker(false);
                      navigation.navigate('TemplateEdit', { id: item.id });
                    }}
                    style={styles.iconBtn}
                  >
                    <Feather name="edit-2" size={18} color={colors.muted} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete template ${item.name}`}
                    onPress={() => confirmRemoveTemplate(item)}
                    style={styles.iconBtn}
                  >
                    <Feather name="trash-2" size={18} color={colors.muted} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </Screen>
      </Modal>

      <ExerciseInfoModal name={info} onClose={() => setInfo(null)} />
      <ExercisePicker
        visible={picker}
        onClose={() => setPicker(false)}
        onPick={(n) => {
          setDrafts((prev) => [...prev, makeExercise(n)]);
          setPicker(false);
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleInput: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, letterSpacing: 1, padding: 0, height: 24 },
  timer: { color: colors.accent, fontFamily: fonts.bold, fontSize: 40, letterSpacing: -1 },
  discard: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: 12, paddingBottom: 8 },
  card: {
    borderRadius: 24,
    padding: 12,
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 6 },
  exName: { color: colors.text, fontFamily: fonts.bold, fontSize: 19, flexShrink: 1 },
  warmBtn: { height: 44, paddingHorizontal: 12, borderRadius: 22, backgroundColor: colors.cardAlt, justifyContent: 'center', marginLeft: 'auto' },
  warmBtnText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 13 },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.cardAlt },
  noteInput: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14, padding: 0, minHeight: 20, maxHeight: 80 },
  restBox: { marginHorizontal: 8, marginTop: 4, marginBottom: 2, gap: 6 },
  restTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  restFill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restText: { flex: 1, color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  restBtn: { height: 32, minWidth: 52, paddingHorizontal: 10, borderRadius: 16, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  restBtnText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 13 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  th: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1 },
  setRow: { height: 52, borderRadius: 14, backgroundColor: colors.cardAlt },
  setRowDone: { backgroundColor: colors.doneBg },
  cell: { color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
  colSet: { width: 32 },
  colInput: { width: 64, textAlign: 'center' },
  colCheck: { width: 44 },
  delSet: { width: 30, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: {
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  check: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSet: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addSetText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
  addExercise: {
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addExerciseText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  finish: {
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 20 },
  tplBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tplBtnText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  pickerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pickerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
  pickRow: {
    minHeight: 68,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
});
