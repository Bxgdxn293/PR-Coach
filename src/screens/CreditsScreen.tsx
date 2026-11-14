import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useCredits } from '../context/CreditsContext';
import { usePremium } from '../context/PremiumContext';
import { describeReason } from '../lib/credits';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function CreditsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { isPremium } = usePremium();
  const c = useCredits();
  const wp = c.weeklyProgress;
  const cfg = c.config;
  const minutes = Math.round(cfg.qualify_min_duration_sec / 60);

  const share = async () => {
    if (!c.inviteCode) return;
    try {
      await Share.share({
        message: `Join me on my fitness app! Use my invite code ${c.inviteCode} when you sign up and we both get a head start.`,
      });
    } catch {
      // share sheet dismissed or unavailable
    }
  };

  if (!c.hasData) {
    return (
      <Screen hideCredits>
        <Header title="Credits" />
        <View style={styles.center}>
          {c.loading || !c.settled ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Feather name="wifi-off" size={40} color={colors.muted} />
              <Text style={styles.centerTitle}>Could not load credits</Text>
              <Text style={styles.muted}>{c.error ?? 'Check your connection and try again.'}</Text>
              <Pressable accessibilityRole="button" onPress={() => c.refresh()} style={styles.cta}>
                <Text style={styles.ctaText}>Retry</Text>
              </Pressable>
            </>
          )}
        </View>
      </Screen>
    );
  }

  const pct = Math.min(100, (wp.qualifying_this_week / Math.max(1, wp.goal)) * 100);

  return (
    <Screen hideCredits>
      <Header title="Credits" />
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={c.loading} onRefresh={() => c.refresh()} tintColor={colors.accent} />}
      >
        {c.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{c.error} Showing your last known balance.</Text>
          </View>
        )}

        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>YOUR CREDITS</Text>
          <Text accessibilityLabel={`${c.balance} credits`} style={styles.balance}>
            {c.balance}
          </Text>
        </View>

        {!isPremium && (
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Paywall')} style={styles.premium}>
            <Text style={styles.premiumText}>Go Premium · Form Checks without credits</Text>
            <Feather name="arrow-right" size={20} color={colors.accent} />
          </Pressable>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <Text style={styles.big}>
            {wp.qualifying_this_week} / {wp.goal} workouts this week → +{wp.bonus} credits
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.muted}>
            {wp.bonus_awarded ? 'Weekly bonus collected. Nice work!' : `A workout counts from ${minutes} minutes and ${cfg.qualify_min_sets} sets, one per day.`}
          </Text>
          <Text style={styles.muted}>
            Streak: {c.streakWeeks} {c.streakWeeks === 1 ? 'week' : 'weeks'} in a row
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to earn</Text>
          <Text style={styles.line}>
            <Text style={styles.strong}>+{wp.bonus}</Text> for reaching {wp.goal} workouts in a week
          </Text>
          <Text style={styles.line}>
            <Text style={styles.strong}>+{cfg.invite_reward}</Text> when a friend you invited completes {cfg.invite_reward_workouts} workouts
            in their first {cfg.invite_reward_window_days} days
          </Text>
          <Text style={styles.cardTitle}>How to spend</Text>
          <Text style={styles.line}>
            <Text style={styles.strong}>{cfg.form_check_cost}</Text> per Form Check
          </Text>
          <Text style={styles.muted}>Premium members do not need credits for Form Checks.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your invite code</Text>
          <Text selectable accessibilityLabel={`Invite code ${c.inviteCode ?? ''}`} style={styles.code}>
            {c.inviteCode ?? '--------'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={!c.inviteCode}
            onPress={share}
            style={[styles.cta, !c.inviteCode && { opacity: 0.5 }]}
          >
            <Text style={styles.ctaText}>Share code</Text>
          </Pressable>
          <Text style={styles.muted}>
            Friends can enter it during sign-up, up to {cfg.invite_redeem_window_days} days after creating their account.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>History</Text>
          {c.history.length === 0 ? (
            <Text style={styles.muted}>No credit activity yet.</Text>
          ) : (
            c.history.slice(0, 20).map((h) => (
              <View key={h.id} style={styles.histRow}>
                <View style={styles.flex}>
                  <Text style={styles.line}>{describeReason(h)}</Text>
                  <Text style={styles.muted}>{formatDate(h.created_at)}</Text>
                </View>
                <Text style={[styles.delta, { color: h.delta >= 0 ? colors.accent : colors.text }]}>
                  {h.delta >= 0 ? '+' : ''}
                  {h.delta}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.legal}>Credits have no cash value, cannot be bought or withdrawn.</Text>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 24 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
    centerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, textAlign: 'center' },
    errorBox: { borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.warn },
    errorText: { color: colors.warn, fontFamily: fonts.medium, fontSize: 14 },
    balanceCard: { borderRadius: 28, padding: 24, backgroundColor: colors.accent, gap: 4 },
    cardLabel: { color: colors.onAccent, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5 },
    balance: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 72, letterSpacing: -2 },
    premium: {
      minHeight: 52,
      borderRadius: 20,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    premiumText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15, flexShrink: 1 },
    card: { borderRadius: 24, padding: 20, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, marginTop: 2 },
    big: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
    track: { height: 12, borderRadius: 6, backgroundColor: colors.bg, overflow: 'hidden' },
    fill: { height: 12, borderRadius: 6, backgroundColor: colors.accent },
    muted: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    line: { color: colors.text, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
    strong: { color: colors.accent, fontFamily: fonts.bold },
    code: { color: colors.text, fontFamily: fonts.bold, fontSize: 38, letterSpacing: 6, textAlign: 'center', paddingVertical: 6 },
    cta: { height: 56, paddingHorizontal: 28, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 },
    histRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    delta: { fontFamily: fonts.bold, fontSize: 18 },
    legal: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, textAlign: 'center', marginTop: 4 },
  });
