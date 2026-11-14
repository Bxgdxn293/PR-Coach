import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
export function ProPill() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.pill} accessibilityLabel={tr("Premium feature")}>
      <Text style={styles.text}>{tr("PRO")}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  pill: { height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: colors.accent, justifyContent: 'center' },
  text: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
});
