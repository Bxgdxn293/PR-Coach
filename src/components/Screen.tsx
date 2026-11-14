import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Palette } from '../theme';
import { useColors, useTheme } from '../context/ThemeContext';
import { ShadowBackdrop } from './ShadowBackdrop';
import { CreditsChip } from './CreditsChip';

export function Screen({
  children,
  style,
  hideCredits = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Hide the credits chip (login, onboarding, credits, paywall, modals, camera). */
  hideCredits?: boolean;
}) {
  const colors = useColors();
  const { themeId } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <SafeAreaView style={styles.safe}>
      {themeId === 'shadow' && <ShadowBackdrop />}
      {!hideCredits && (
        <View style={styles.chipRow}>
          <CreditsChip />
        </View>
      )}
      <View style={[styles.body, hideCredits ? null : styles.bodyUnderChip, style]}>{children}</View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  chipRow: { paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-start' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 12 },
  bodyUnderChip: { paddingTop: 8 },
});
