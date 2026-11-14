import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { usePremium } from '../context/PremiumContext';
import { useAuth } from '../context/AuthContext';
import { useActiveWorkout } from '../lib/activeWorkout';
import { formatClock } from '../lib/dates';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { GlowPressable } from '../components/ShadowBackdrop';
import { tr } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

const TILES: { label: string; route: keyof RootStackParamList; icon: React.ComponentProps<typeof Feather>['name']; wide?: boolean }[] = [
  { label: 'PR Coach', route: 'Coach', icon: 'target' },
  { label: 'Form Check', route: 'FormCheck', icon: 'video' },
  { label: 'PR Records', route: 'PRs', icon: 'award' },
  { label: 'Progress', route: 'Progress', icon: 'trending-up' },
  { label: 'Exercise Library', route: 'Library', icon: 'book-open' },
  { label: 'Friends', route: 'Friends', icon: 'users' },
  { label: 'Settings', route: 'Settings', icon: 'sliders', wide: true },
];

export function MenuScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const { active } = useActiveWorkout(user?.id);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        {tr("Menu")}
      </Text>
      {active && active.drafts.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Workout running, {0}. Tap to continue", [active.title])}
          onPress={() => navigation.navigate('Workout')}
          style={styles.running}
        >
          <View style={styles.runDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.runTitle} numberOfLines={1}>{tr("Workout running · {0}", [active.title])}</Text>
            <Text style={styles.runTime}>{formatClock(Math.max(0, (now - active.startedAt) / 1000))} {tr("· tap to continue")}</Text>
          </View>
          <Feather name="arrow-right" size={22} color={colors.onAccent} />
        </Pressable>
      )}
      <GlowPressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Templates')}
        style={styles.hero}
        keepFill
      >
        <MaterialCommunityIcons name="dumbbell" size={34} color={colors.onAccent} />
        <View style={styles.heroRow}>
          <Text style={styles.heroText}>{tr("Workout")}</Text>
          <Feather name="arrow-right" size={32} color={colors.onAccent} />
        </View>
      </GlowPressable>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {TILES.map((t, i) => (
          <GlowPressable
            key={t.route}
            accessibilityRole="button"
            onPress={() => navigation.navigate(t.route as any)}
            style={[styles.tile, t.wide && styles.tileWide]}
          >
            <View style={styles.tileTop}>
              <Feather name={t.icon} size={28} color={colors.accent} />
            </View>
            <Text style={styles.tileText}>{tr(t.label)}</Text>
          </GlowPressable>
        ))}
      </ScrollView>
      {!isPremium && (
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Paywall')} style={styles.upgrade}>
          <Text style={styles.upgradeText} numberOfLines={1}>{tr("Go Premium · AI form check & full coach")}</Text>
          <Feather name="arrow-right" size={20} color={colors.accent} />
        </Pressable>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 44, letterSpacing: -1, marginBottom: 4, marginLeft: 4 },
  hero: {
    height: 112,
    borderRadius: 28,
    padding: 18,
    backgroundColor: colors.accent,
    justifyContent: 'space-between',
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 30 },
  running: { minHeight: 64, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', gap: 12 },
  runDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.onAccent },
  runTitle: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 16 },
  runTime: { color: colors.onAccent, fontFamily: fonts.medium, fontSize: 13, opacity: 0.8 },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 4 },
  tile: {
    width: '48%',
    flexGrow: 1,
    minHeight: 92,
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  tileWide: { width: '100%', flexBasis: '100%' },
  tileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', alignSelf: 'stretch' },
  tileText: { color: colors.text, fontFamily: fonts.bold, fontSize: 19 },
  upgrade: {
    height: 56,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 16 },
});
