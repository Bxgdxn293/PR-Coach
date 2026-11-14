import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { usePremium } from '../context/PremiumContext';
import { FREE_TEMPLATE_LIMIT, PREMIUM_TEMPLATE_LIMIT, lastUsedLabel, useTemplates, type WorkoutTemplate } from '../lib/templates';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { tr } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

/** First stop after "Workout": pick today's template (with when it was last used) or start empty. */
export function TemplatesScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { isPremium } = usePremium();
  const { templates, presets, loaded, remove, removePreset } = useTemplates();
  const limit = isPremium ? PREMIUM_TEMPLATE_LIMIT : FREE_TEMPLATE_LIMIT;
  const savedCount = templates.filter((t) => !t.once).length;
  const full = savedCount >= limit;

  // Most recently used first, never-used ones after, by name.
  const sorted = useMemo(
    () =>
      [...presets, ...[...templates].sort((a, b) => {
        const ta = a.last_used_at ? Date.parse(a.last_used_at) : 0;
        const tb = b.last_used_at ? Date.parse(b.last_used_at) : 0;
        return tb - ta || a.name.localeCompare(b.name);
      })],
    [templates, presets],
  );

  const newTemplate = () => {
    if (full) {
      Alert.alert(
        tr("Template limit reached"),
        isPremium ? tr("You can keep up to {0} templates. Delete one first.", [limit]) : tr("The free plan keeps {0} templates. Delete one, or upgrade to Premium for up to {1}.", [limit, PREMIUM_TEMPLATE_LIMIT]),
        isPremium ? [{ text: tr("OK") }] : [{ text: tr("Not now"), style: 'cancel' }, { text: tr("See Premium"), onPress: () => navigation.navigate('Paywall') }],
      );
      return;
    }
    navigation.navigate('TemplateEdit');
  };

  const confirmDelete = (t: WorkoutTemplate) =>
    Alert.alert(tr("Delete template?"), tr("\"{0}\" will be removed from this device.", [t.name]), [
      { text: tr("Cancel"), style: 'cancel' },
      { text: tr("Delete"), style: 'destructive', onPress: () => (t.preset ? removePreset(t.id) : remove(t.id)) },
    ]);

  return (
    <Screen>
      <Header title={tr("Workout")} />
      <Text style={styles.sub}>
        {tr("Choose today's template ·")} {savedCount}/{limit}
      </Text>
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr("Start {0}. {1}", [item.name, lastUsedLabel(item.last_used_at)])}
              style={styles.flex}
              onPress={() => navigation.navigate('Workout', { templateId: item.id })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.used}>{item.preset ? tr("Built-in") : item.once ? tr("Coach · one time") : lastUsedLabel(item.last_used_at)}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {tr("Exercises: {0} · Sets: {1} ·", [item.exercises.length, item.exercises.reduce((n, e) => n + e.sets, 0)])}{' '}
                {item.exercises.map((e) => tr(e.name)).join(', ')}
              </Text>
            </Pressable>
            {!item.once && !item.preset && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr("Edit template {0}", [item.name])}
                onPress={() => navigation.navigate('TemplateEdit', { id: item.id })}
                style={styles.iconBtn}
              >
                <Feather name="edit-2" size={18} color={colors.muted} />
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr("Delete template {0}", [item.name])}
              onPress={() => confirmDelete(item)}
              style={styles.iconBtn}
            >
              <Feather name="trash-2" size={18} color={colors.muted} />
            </Pressable>
          </View>
        )}
      />
      <Pressable accessibilityRole="button" onPress={newTemplate} style={styles.primary}>
        <Feather name="plus" size={22} color={colors.onAccent} />
        <Text style={styles.primaryText}>{tr("New template")}</Text>
      </Pressable>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, marginLeft: 4 },
    list: { gap: 10, paddingBottom: 8 },
    empty: { color: colors.muted, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, padding: 8 },
    card: {
      minHeight: 96,
      borderRadius: 24,
      paddingLeft: 20,
      paddingRight: 4,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    name: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
    used: { color: colors.accent, fontFamily: fonts.medium, fontSize: 14, marginTop: 2 },
    meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, marginTop: 2 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
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
    primary: { height: 60, borderRadius: 24, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 },
  });
