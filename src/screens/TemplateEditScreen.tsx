import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ExercisePicker } from '../components/ExercisePicker';
import { ExerciseMini } from '../components/ExerciseMini';
import { ExerciseInfoModal } from '../components/ExerciseInfoModal';
import { usePremium } from '../context/PremiumContext';
import { useTemplates, type TemplateExercise } from '../lib/templates';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function TemplateEditScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const id = useRoute<RouteProp<RootStackParamList, 'TemplateEdit'>>().params?.id ?? null;
  const { isPremium } = usePremium();
  const { templates, loaded, saveEdit } = useTemplates();

  const [name, setName] = useState('');
  const [items, setItems] = useState<TemplateExercise[]>([]);
  const [picker, setPicker] = useState(false);
  const [filled, setFilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  // Load the template once the stored list is available.
  useEffect(() => {
    if (!loaded || filled) return;
    const t = id ? templates.find((x) => x.id === id) : undefined;
    if (t) {
      setName(t.name);
      setItems(t.exercises);
    }
    setFilled(true);
  }, [loaded, filled, id, templates]);

  const patch = (i: number, p: Partial<TemplateExercise>) =>
    setItems((prev) => prev.map((e, j) => (j === i ? { ...e, ...p } : e)));

  const save = async () => {
    if (items.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise.');
      return;
    }
    setSaving(true);
    const err = await saveEdit(id, name, items, isPremium);
    setSaving(false);
    if (err === 'name_taken') Alert.alert('Name already used', 'Pick another name for this template.');
    else if (err === 'limit') Alert.alert('Template limit reached', 'Delete a template first or upgrade to Premium.');
    else navigation.goBack();
  };

  const Stepper = ({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) => (
    <View style={styles.stepper} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Fewer ${label}`} onPress={() => onChange(clamp(value - 1, min, max))} style={styles.stepBtn}>
        <Feather name="minus" size={16} color={colors.text} />
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`More ${label}`} onPress={() => onChange(clamp(value + 1, min, max))} style={styles.stepBtn}>
        <Feather name="plus" size={16} color={colors.text} />
      </Pressable>
    </View>
  );

  return (
    <Screen>
      <Header title={id ? 'Edit template' : 'New template'} />
      <TextInput
        value={name}
        onChangeText={setName}
        accessibilityLabel="Template name"
        placeholder="Template name, e.g. Push Day"
        placeholderTextColor={colors.muted}
        maxLength={40}
        style={styles.nameInput}
      />
      <ScrollView style={styles.flex} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {items.map((e, i) => (
          <View key={`${e.name}-${i}`} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.exName}>{e.name}</Text>
              <ExerciseMini name={e.name} onPress={() => setInfo(e.name)} height={44} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`} onPress={() => setItems((p) => p.filter((_, j) => j !== i))} style={styles.iconBtn}>
                <Feather name="trash-2" size={18} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.steppers}>
              <Stepper label="Sets" value={e.sets} min={1} max={20} onChange={(n) => patch(i, { sets: n })} />
              <Stepper label="Reps" value={e.reps} min={1} max={100} onChange={(n) => patch(i, { reps: n })} />
            </View>
          </View>
        ))}
        <Pressable accessibilityRole="button" onPress={() => setPicker(true)} style={styles.add}>
          <Feather name="plus" size={20} color={colors.text} />
          <Text style={styles.addText}>Add exercise</Text>
        </Pressable>
      </ScrollView>
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={styles.primary}>
        <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save template'}</Text>
      </Pressable>
      <ExerciseInfoModal name={info} onClose={() => setInfo(null)} />
      <ExercisePicker
        visible={picker}
        onClose={() => setPicker(false)}
        onPick={(n) => {
          setItems((prev) => [...prev, { name: n, sets: 3, reps: 8 }]);
          setPicker(false);
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    nameInput: {
      height: 52,
      borderRadius: 20,
      paddingHorizontal: 18,
      color: colors.text,
      fontFamily: fonts.bold,
      fontSize: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    list: { gap: 10, paddingBottom: 8 },
    card: { borderRadius: 24, padding: 16, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    cardHead: { flexDirection: 'row', alignItems: 'center' },
    exName: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    steppers: { flexDirection: 'row', gap: 12 },
    stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
    stepLabel: { flex: 1, color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepValue: { minWidth: 26, textAlign: 'center', color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
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
    primary: { height: 60, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 },
  });
