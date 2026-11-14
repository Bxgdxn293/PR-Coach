import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { tr } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FormResultScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'FormResult'>>();
  const { exercise, result, frames } = params;

  const flagged = result.items.find((i) => i.status === 'issue' && i.frame !== null);
  const shownFrame = flagged?.frame ?? Math.floor(frames.length / 2);
  const caption = flagged ? `${flagged.area} · frame ${shownFrame + 1}` : `Frame ${shownFrame + 1}`;

  return (
    <Screen>
      <Header title={tr("Your Set")} />
      <ScrollView contentContainerStyle={styles.list}>
        {frames[shownFrame] ? (
          <View style={styles.frame}>
            <Image
              source={{ uri: frames[shownFrame] }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessibilityLabel={tr("Frame from your {0} set", [exercise])}
            />
            <View style={styles.caption}>
              <Text style={[styles.captionText, flagged && { color: colors.warn }]}>{caption}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.scoreCard}>
          <Text style={styles.score}>
            {result.score}
            <Text style={styles.scoreOf}> / 100</Text>
          </Text>
          <Text style={styles.summary}>
            {tr(exercise)}. {result.summary}
          </Text>
        </View>

        {result.items.map((item, i) => {
          const good = item.status === 'good';
          return (
            <View key={i} style={styles.item}>
              <View style={[styles.icon, { backgroundColor: good ? colors.accent : colors.warn }]}>
                <Feather name={good ? 'check' : 'alert-triangle'} size={20} color={colors.onAccent} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.itemHead}>{item.area}</Text>
                <Text style={styles.itemText}>{item.note}</Text>
              </View>
            </View>
          );
        })}

        {result.safety ? <Text style={styles.safety}>{result.safety}</Text> : null}
        <Text style={styles.disclaimer}>
          {tr("AI feedback from a few still frames (confidence: {0}). It is a guide, not a replacement for a qualified coach. Stop if something hurts.", [tr(result.confidence)])}
        </Text>
      </ScrollView>

      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" onPress={() => navigation.replace('FormCheck')} style={styles.secondary}>
          <Text style={styles.secondaryText}>{tr("Record again")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.popToTop()} style={styles.primary}>
          <Text style={styles.primaryText}>{tr("Done")}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: 12, paddingBottom: 8 },
  frame: { height: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: '#12141b', borderWidth: 1, borderColor: colors.border },
  caption: { position: 'absolute', left: 14, top: 14, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.bg },
  captionText: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  scoreCard: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  score: { color: colors.accent, fontFamily: fonts.bold, fontSize: 44, letterSpacing: -1 },
  scoreOf: { color: colors.muted, fontFamily: fonts.medium, fontSize: 18, letterSpacing: 0 },
  summary: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  item: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  itemHead: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  itemText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  safety: { color: colors.warn, fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
  disclaimer: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, lineHeight: 17 },
  buttons: { flexDirection: 'row', gap: 10 },
  secondary: { flex: 1, height: 56, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  primary: { flex: 1, height: 56, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 16 },
});
