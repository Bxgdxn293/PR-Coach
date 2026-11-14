import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from './Screen';
import { MuscleMap } from './MuscleMap';
import { ExerciseFigure } from './ExerciseFigure';
import { EXERCISES } from '../data/exercises';
import { EXERCISE_INFO } from '../data/exerciseInfo';
import { MUSCLE_LABEL } from '../data/bodyPaths';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
/** Full-screen "how to" with front/back body map, steps and a tip. `name = null` keeps it closed. */
export function ExerciseInfoModal({ name, onClose }: { name: string | null; onClose: () => void }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const info = name ? EXERCISE_INFO[name] : undefined;
  const lib = name ? EXERCISES.find((e) => e.name === name) : undefined;
  const label = (ids: string[]) => ids.map((m) => MUSCLE_LABEL[m] ?? m).join(', ');

  return (
    <Modal visible={!!name} animationType="slide" onRequestClose={onClose}>
      <Screen hideCredits>
        <View style={styles.head}>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={2}>
            {name ? tr(name) : name}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tr("Close")} style={styles.close}>
            <Feather name="x" size={20} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {lib && (
            <Text style={styles.meta}>
              {tr(lib.muscle)} · {tr(lib.equipment)}
            </Text>
          )}
          {info ? (
            <>
              <View style={[styles.card, styles.mapCard]}>
                <ExerciseFigure name={name as string} primary={info.p} secondary={info.s} height={250} />
              </View>
              <View style={[styles.card, styles.mapCard]}>
                <MuscleMap primary={info.p} secondary={info.s} height={200} />
                <View style={styles.labels}>
                  <Text style={styles.label}>{tr("FRONT")}</Text>
                  <Text style={styles.label}>{tr("BACK")}</Text>
                </View>
              </View>
              <View style={styles.card}>
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { opacity: 1 }]} />
                  <Text style={styles.big}>{label(info.p) || '–'}</Text>
                </View>
                {info.s.length > 0 && (
                  <View style={styles.legendRow}>
                    <View style={[styles.dot, { opacity: 0.45 }]} />
                    <Text style={styles.meta}>{label(info.s)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{tr("How to do it")}</Text>
                {info.steps.map((t, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                    <Text style={styles.stepText}>{t}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{tr("Tip")}</Text>
                <Text style={styles.stepText}>{info.tip}</Text>
              </View>
              <Text style={styles.meta}>{tr("General guidance, not personal coaching. Start light and stop if something hurts.")}</Text>
            </>
          ) : (
            <Text style={styles.meta}>{tr("No description for this exercise yet.")}</Text>
          )}
        </ScrollView>
      </Screen>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    title: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
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
    body: { gap: 12, paddingBottom: 24 },
    meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    card: { borderRadius: 24, padding: 16, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    mapCard: { alignItems: 'center' },
    labels: { flexDirection: 'row', width: 210 * (260 / 200), justifyContent: 'space-around' },
    label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ff3b3b' },
    big: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    stepRow: { flexDirection: 'row', gap: 12 },
    stepNum: { width: 22, color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
    stepText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  });
