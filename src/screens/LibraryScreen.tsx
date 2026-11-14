import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { EXERCISES, MUSCLES } from '../data/exercises';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import { ExerciseMini } from '../components/ExerciseMini';
import { ExerciseInfoModal } from '../components/ExerciseInfoModal';

export function LibraryScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [info, setInfo] = useState<string | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (e) => (muscle === 'All' || e.muscle === muscle) && e.name.toLowerCase().includes(q),
    );
  }, [query, muscle]);

  return (
    <Screen>
      <Header title="Exercise Library" />
      <View style={styles.search}>
        <Feather name="search" size={20} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search exercises"
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
                <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{m}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(e) => e.name}
        contentContainerStyle={{ gap: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No exercises found</Text>}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, how to do it`}
            onPress={() => setInfo(item.name)}
            style={styles.row}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.muscle} · {item.equipment}
              </Text>
            </View>
            <ExerciseMini name={item.name} height={48} />
          </Pressable>
        )}
      />
      <ExerciseInfoModal name={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
  },
  searchInput: { flex: 1, height: 48, color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
  chipsWrap: { height: 44 },
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
  row: {
    minHeight: 72,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: { flex: 1 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  empty: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center', paddingVertical: 32 },
});
