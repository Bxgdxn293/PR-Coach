import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from './Screen';
import { BAR, plateBreakdown, warmupSets } from '../lib/coach';
import { parseNumber } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { Unit } from '../types';

import { tr } from '../lib/i18n';
type Props = {
  visible: boolean;
  exercise: string;
  /** Working weight in the display unit (string as typed in the workout). */
  workingWeight: string;
  unit: Unit;
  onClose: () => void;
};

const fmt = (n: number) => String(Math.round(n * 100) / 100);

export function WarmupModal({ visible, exercise, workingWeight, unit, onClose }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState(workingWeight);
  useEffect(() => {
    if (visible) setText(workingWeight);
  }, [visible, workingWeight]);

  const work = parseNumber(text);
  const warmups = warmupSets(work, unit);
  const plates = plateBreakdown(work, unit);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen hideCredits>
        <View style={styles.head}>
          <Text style={styles.title}>{tr("Warm-up & plates")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tr("Close")} style={styles.close}>
            <Feather name="x" size={20} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.exercise}>{tr(exercise)}</Text>
          <View style={styles.inputRow}>
            <Text style={styles.label}>{tr("WORKING WEIGHT ({0})", [unit.toUpperCase()])}</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              keyboardType="decimal-pad"
              accessibilityLabel={tr("Working weight")}
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          <Text style={styles.section}>{tr("WARM-UP SETS")}</Text>
          {warmups.length === 0 ? (
            <Text style={styles.hint}>
              {work > 0 ? tr("Working weight is at or below the empty bar ({0} {1}), no warm-up ladder needed.", [BAR[unit], unit]) : tr("Enter your working weight to see warm-up sets.")}
            </Text>
          ) : (
            warmups.map((s) => (
              <View key={s.pct} style={styles.card}>
                <Text style={styles.pct}>{s.pct}%</Text>
                <Text style={styles.big}>
                  {fmt(s.weight)} {unit} × {s.reps}
                </Text>
              </View>
            ))
          )}

          <Text style={styles.section}>{tr("PLATES PER SIDE")}</Text>
          {work <= 0 ? (
            <Text style={styles.hint}>{tr("Enter your working weight to see the plates.")}</Text>
          ) : plates.belowBar ? (
            <Text style={styles.hint}>
              {tr("Below the empty bar ({0} {1}).", [BAR[unit], unit])}
            </Text>
          ) : (
            <View style={styles.card}>
              <View style={styles.flex}>
                <Text style={styles.big}>
                  {plates.perSide.length === 0 ? tr("Empty bar") : plates.perSide.map((p) => `${p.count} × ${fmt(p.plate)}`).join(' + ')}
                </Text>
                <Text style={styles.hint}>
                  {tr("Bar {0} {1} · loaded {2} {1}", [BAR[unit], unit, fmt(plates.loaded)])}
                </Text>
                {plates.remainder > 0 && (
                  <Text style={styles.warn}>
                    {tr("{0} {1} short: not reachable with these plates, rounded down.", [fmt(plates.remainder), unit])}
                  </Text>
                )}
              </View>
            </View>
          )}
          <Text style={styles.hint}>
            {tr("Assumes a {0} {1} bar and the standard {1} plate set.", [BAR[unit], unit])}
          </Text>
        </ScrollView>
      </Screen>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { gap: 10, paddingBottom: 16 },
  exercise: { color: colors.accent, fontFamily: fonts.bold, fontSize: 19 },
  inputRow: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5 },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    paddingHorizontal: 12,
  },
  section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 6 },
  card: {
    minHeight: 64,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pct: { color: colors.accent, fontFamily: fonts.bold, fontSize: 18, width: 52 },
  big: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  warn: { color: colors.warn, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
});
