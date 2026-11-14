import React, { useContext, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import { useCredits } from '../context/CreditsContext';

import { tr } from '../lib/i18n';
/** Compact credits balance pill; tapping opens the Credits screen. Safe outside Credits/Navigation providers. */
export function CreditsChip() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const credits = useCredits() as ReturnType<typeof useCredits> | null;
  // NavigationContext is undefined outside a NavigationContainer (unlike useNavigation, it does not throw).
  const navigation = useContext(NavigationContext);

  const value = credits && credits.hasData ? String(credits.balance) : '–';

  const open = () => {
    if (!navigation) return;
    const state = navigation.getState();
    // already on the Credits screen: do not navigate to itself
    if (state?.routes?.[state.index]?.name === 'Credits') return;
    navigation.navigate('Credits' as never);
  };

  const weeks = credits && credits.hasData ? credits.streakWeeks : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr("Credits: {0}. Streak: {1} {2} in a row. Open credits", [value, weeks, weeks === 1 ? 'week' : 'weeks'])}
      onPress={open}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={({ pressed }) => [styles.chip, weeks > 0 && styles.chipOn, pressed && { opacity: 0.7 }]}
    >
      <Feather name="zap" size={16} color={colors.accent} />
      <Text style={styles.text} numberOfLines={1}>
        {value}
      </Text>
      <View style={styles.sep} />
      <MaterialCommunityIcons name="fire" size={18} color={weeks > 0 ? colors.accent : colors.muted} />
      <Text style={[styles.text, weeks === 0 && { color: colors.muted }]} numberOfLines={1}>
        {weeks}
        <Text style={styles.unit}> {tr("wk")}</Text>
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
    chipOn: { borderColor: colors.accent },
    chip: {
      alignSelf: 'flex-start',
      minWidth: 44,
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    unit: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
    sep: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: 2 },
  });
