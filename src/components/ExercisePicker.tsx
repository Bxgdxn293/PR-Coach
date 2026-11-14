import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from './Screen';
import { EXERCISES, MUSCLES, type LibraryExercise } from '../data/exercises';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
export type PickerSort = 'alpha' | 'muscle';

const byName = (a: LibraryExercise, b: LibraryExercise) => a.name.localeCompare(b.name);

/** Exercises sorted A-Z (one section "All"), or grouped by muscle group (groups A-Z, exercises A-Z inside). */
export function sortExercises(list: LibraryExercise[], sort: PickerSort): { title: string; data: LibraryExercise[] }[] {
  if (sort === 'alpha') return [{ title: '', data: [...list].sort(byName) }];
  const groups = new Map<string, LibraryExercise[]>();
  for (const e of list) groups.set(e.muscle, [...(groups.get(e.muscle) ?? []), e]);
  return [...groups.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((m) => ({ title: m, data: groups.get(m)!.sort(byName) }));
}

// Remembered for the rest of the session so it does not reset every time the picker opens.
let lastSort: PickerSort = 'alpha';

export function ExercisePicker({
  visible,
  onPick,
  onClose,
  title,
}: {
  visible: boolean;
  onPick: (name: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [sort, setSort] = useState<PickerSort>(lastSort);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = EXERCISES.filter(
      (e) => (muscle === 'All' || e.muscle === muscle) && (!q || e.name.toLowerCase().includes(q) || tr(e.name).toLowerCase().includes(q)),
    );
    return sortExercises(list, sort);
  }, [sort, query, muscle]);

  const toggle = () => {
    const next: PickerSort = sort === 'alpha' ? 'muscle' : 'alpha';
    lastSort = next;
    setSort(next);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen hideCredits>
        <View style={styles.head}>
          <Text accessibilityRole="header" style={styles.title}>
            {title ?? tr("Add exercise")}
          </Text>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={sort === 'alpha' ? tr("Sorted A to Z. Switch to sort by muscle group") : tr("Sorted by muscle group. Switch to sort A to Z")}
            style={styles.sortBtn}
          >
            <Feather name={sort === 'alpha' ? 'type' : 'layers'} size={16} color={colors.accent} />
            <Text style={styles.sortText}>{sort === 'alpha' ? 'A–Z' : tr("Muscle")}</Text>
          </Pressable>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tr("Close")} style={styles.close}>
            <Feather name="x" size={20} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.search}>
          <Feather name="search" size={20} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={tr("Search exercises")}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel={tr("Search exercises")}
            returnKeyType="search"
          />
        </View>
        <View style={styles.chipsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {MUSCLES.map((m) => {
              const on = m === muscle;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setMuscle(m)}
                  style={[styles.chip, on && { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{tr(m)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <SectionList
          sections={sections}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>{tr("No exercises found")}</Text>}
          keyExtractor={(e) => e.name}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
          renderSectionHeader={({ section }) =>
            section.title ? <Text style={styles.section}>{tr(section.title).toUpperCase()}</Text> : null
          }
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" style={styles.row} onPress={() => onPick(item.name)}>
              <View style={styles.flex}>
                <Text style={styles.name}>{tr(item.name)}</Text>
                <Text style={styles.meta}>
                  {tr(item.muscle)} · {tr(item.equipment)}
                </Text>
              </View>
              <Feather name="plus" size={20} color={colors.accent} />
            </Pressable>
          )}
        />
      </Screen>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    title: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
    sortBtn: {
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
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
    search: {
      height: 52,
      borderRadius: 26,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    searchInput: { flex: 1, height: 48, color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
    chipsWrap: { height: 44, marginBottom: 10 },
    chips: { gap: 8 },
    chip: {
      height: 44,
      paddingHorizontal: 18,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    empty: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center', paddingVertical: 32 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 8 },
    row: {
      minHeight: 68,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  });
