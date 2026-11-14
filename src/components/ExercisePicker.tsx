import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from './Screen';
import { EXERCISES, type LibraryExercise } from '../data/exercises';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

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
  title = 'Add exercise',
}: {
  visible: boolean;
  onPick: (name: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [sort, setSort] = useState<PickerSort>(lastSort);
  const sections = useMemo(() => sortExercises(EXERCISES, sort), [sort]);

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
            {title}
          </Text>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={sort === 'alpha' ? 'Sorted A to Z. Switch to sort by muscle group' : 'Sorted by muscle group. Switch to sort A to Z'}
            style={styles.sortBtn}
          >
            <Feather name={sort === 'alpha' ? 'type' : 'layers'} size={16} color={colors.accent} />
            <Text style={styles.sortText}>{sort === 'alpha' ? 'A–Z' : 'Muscle'}</Text>
          </Pressable>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
            <Feather name="x" size={20} color={colors.text} />
          </Pressable>
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(e) => e.name}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
          renderSectionHeader={({ section }) =>
            section.title ? <Text style={styles.section}>{section.title.toUpperCase()}</Text> : null
          }
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" style={styles.row} onPress={() => onPick(item.name)}>
              <View style={styles.flex}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.muscle} · {item.equipment}
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
