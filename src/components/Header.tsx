import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

export function Header({ title, right }: { title: string; right?: React.ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={styles.back}
      >
        <Feather name="chevron-left" size={24} color={colors.text} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 32, letterSpacing: -0.5, flexShrink: 1, flexGrow: 1 },
});
