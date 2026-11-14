import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Screen } from '../components/Screen';
import { FREE_WEEKLY_LIMIT, useData } from '../context/DataContext';
import { usePremium } from '../context/PremiumContext';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';

const FEATURES = ['AI Form Check for your lifts', 'Form Checks without credits', 'PR Coach: 4-week plans with a fresh template for every session', 'Unlimited workouts every week', 'Full training history'];

function packageLabel(p: PurchasesPackage): string {
  switch (p.packageType) {
    case 'MONTHLY':
      return tr("Monthly");
    case 'ANNUAL':
      return tr("Yearly");
    case 'LIFETIME':
      return tr("Lifetime");
    default:
      return p.product.title;
  }
}

export function PaywallScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  const { weeklyCount } = useData();
  const { isPremium, packages, buy, restore, configured, ready } = usePremium();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = packages.find((p) => p.identifier === selected) ?? packages.find((p) => p.packageType === 'ANNUAL') ?? packages[0];

  const close = () => (navigation.canGoBack() ? navigation.goBack() : undefined);

  const subscribe = async () => {
    if (!current) return;
    setBusy(true);
    const err = await buy(current);
    setBusy(false);
    if (err) Alert.alert(tr("Purchase failed"), err);
  };

  const doRestore = async () => {
    setBusy(true);
    const err = await restore();
    setBusy(false);
    if (err) Alert.alert(tr("Restore"), err);
  };

  return (
    <Screen hideCredits>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={tr("Close")} style={styles.close}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {isPremium ? (
          <>
            <Text style={styles.title}>{tr("You are Premium")}</Text>
            <Text style={styles.lead}>{tr("Unlimited workouts are unlocked. Enjoy!")}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{tr("Go Premium")}</Text>
            <Text style={styles.lead}>
              {tr("The free plan includes {0} workouts per week. You have logged {1} this week.", [FREE_WEEKLY_LIMIT, weeklyCount])}
            </Text>
            <View style={styles.features}>
              {FEATURES.map((f0) => { const f = tr(f0); return (
                <View key={f} style={styles.featureRow}>
                  <Feather name="check" size={20} color={colors.accent} />
                  <Text style={styles.feature}>{f}</Text>
                </View>
              ); })}
            </View>

            {!ready ? (
              <ActivityIndicator color={colors.accent} />
            ) : !configured || packages.length === 0 ? (
              <Text style={styles.note}>
                {tr("Subscriptions are not available right now. Please try again later.")}
              </Text>
            ) : (
              <View style={styles.packages}>
                {packages.map((p) => {
                  const on = current?.identifier === p.identifier;
                  return (
                    <Pressable
                      key={p.identifier}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      onPress={() => setSelected(p.identifier)}
                      style={[styles.pkg, on && { borderColor: colors.accent }]}
                    >
                      <Text style={styles.pkgName}>{packageLabel(p)}</Text>
                      <Text style={styles.pkgPrice}>{p.product.priceString}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!isPremium && (
        <View style={styles.bottom}>
          <Pressable
            onPress={subscribe}
            disabled={busy || !current}
            accessibilityRole="button"
            style={[styles.cta, (busy || !current) && { opacity: 0.5 }]}
          >
            <Text style={styles.ctaText}>{busy ? tr("Please wait…") : tr("Continue")}</Text>
          </Pressable>
          <Text style={styles.legal}>
            {tr("Payment is charged to your App Store or Google Play account. Subscriptions renew automatically at the price shown unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your store account settings.")}
          </Text>
          <View style={styles.links}>
            <Pressable onPress={doRestore} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>{tr("Restore")}</Text>
            </Pressable>
            {TERMS_URL !== '' && (
              <Pressable onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link" style={styles.link}>
                <Text style={styles.linkText}>{tr("Terms")}</Text>
              </Pressable>
            )}
            {PRIVACY_URL !== '' && (
              <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link" style={styles.link}>
                <Text style={styles.linkText}>{tr("Privacy")}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  top: { alignItems: 'flex-end' },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: 16, paddingBottom: 16 },
  title: { color: colors.accent, fontFamily: fonts.bold, fontSize: 44, letterSpacing: -1 },
  lead: { color: colors.text, fontFamily: fonts.medium, fontSize: 17, lineHeight: 24 },
  features: { gap: 12, marginVertical: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feature: { color: colors.text, fontFamily: fonts.medium, fontSize: 17, flexShrink: 1 },
  packages: { gap: 12 },
  pkg: {
    minHeight: 72,
    borderRadius: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pkgName: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  pkgPrice: { color: colors.accent, fontFamily: fonts.bold, fontSize: 20 },
  note: { color: colors.muted, fontFamily: fonts.medium, fontSize: 15 },
  bottom: { gap: 10 },
  cta: { height: 64, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 20 },
  legal: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  link: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  linkText: { color: colors.text, fontFamily: fonts.medium, fontSize: 14, textDecorationLine: 'underline' },
});
