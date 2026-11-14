import React, { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useCredits } from '../context/CreditsContext';
import { useSettings } from '../context/SettingsContext';
import { fonts, THEMES, type Palette, type ThemeId } from '../theme';
import { useColors, useTheme } from '../context/ThemeContext';
import type { RootStackParamList, Unit } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD = Constants.nativeBuildVersion ?? '';

export function SettingsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { user, signOut, deleteAccount } = useAuth();
  const { isPremium, restore, configured } = usePremium();
  const { unit, setUnit } = useSettings();
  const credits = useCredits();
  const { themeId } = useTheme();
  const ThemeLabel: Record<ThemeId, string> = { lime: 'Lime', blue: 'Blue', red: 'Red', purple: 'Purple', gold: 'Gold' };

  const confirmDelete = () =>
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all workouts. An active subscription is not cancelled automatically: cancel it in your App Store / Google Play subscriptions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const err = await deleteAccount();
            if (err) Alert.alert('Could not delete account', err);
          },
        },
      ],
    );

  const doRestore = async () => {
    const err = await restore();
    Alert.alert(err ? 'Restore' : 'Restored', err ?? 'Your Premium subscription is active.');
  };

  return (
    <Screen>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.card}>
          <View style={styles.flex}>
            <Text style={styles.label}>Units</Text>
            <Text style={styles.sub}>Weight shown in workouts</Text>
          </View>
          <View style={styles.seg}>
            {(['kg', 'lb'] as Unit[]).map((u) => (
              <Pressable
                key={u}
                accessibilityRole="button"
                accessibilityState={{ selected: unit === u }}
                onPress={() => setUnit(u)}
                style={[styles.segBtn, unit === u && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.segText, unit === u && { color: colors.onAccent }]}>{u}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.section}>PROFILE</Text>
        <View style={[styles.card, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
          <View style={styles.profRow}>
            <Text style={styles.sub}>Username</Text>
            <Text style={styles.profVal}>{credits.username ? `@${credits.username}` : 'Not set'}</Text>
          </View>
          <View style={styles.profRow}>
            <Text style={styles.sub}>Email</Text>
            <Text style={styles.profVal} selectable numberOfLines={1}>{user?.email ?? '-'}</Text>
          </View>
          <View style={styles.profRow}>
            <Text style={styles.sub}>Plan</Text>
            <Text style={styles.profVal}>{isPremium ? 'Premium' : 'Free'}</Text>
          </View>
          <View style={styles.profRow}>
            <Text style={styles.sub}>App version</Text>
            <Text style={styles.profVal}>{APP_VERSION}{BUILD ? ` (${BUILD})` : ''}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Interface colors"
          onPress={() => navigation.navigate('Themes')}
          style={styles.card}
        >
          <View style={[styles.swatch, { backgroundColor: THEMES[themeId].accent }]} />
          <View style={styles.flex}>
            <Text style={styles.label}>Interface colors</Text>
            <Text style={styles.sub}>{ThemeLabel[themeId]} · change the look of the app</Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.muted} />
        </Pressable>

        <View style={styles.card}>
          <View style={styles.flex}>
            <Text style={styles.label}>{isPremium ? 'Premium' : 'Free plan'}</Text>
            <Text style={styles.sub}>
              {isPremium ? 'Unlimited workouts. Thank you!' : '3 workouts per week'}
            </Text>
          </View>
          {!isPremium && (
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Paywall')} style={styles.small}>
              <Text style={styles.smallText}>Upgrade</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.section}>FRIENDS & PRIVACY</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Blocked')} style={styles.rowBtn}>
          <Text style={styles.rowText}>Blocked users</Text>
        </Pressable>
        <Text style={styles.hint}>Whether friends can see your stats is set on the Friends page.</Text>

        {configured && (
          <Pressable accessibilityRole="button" onPress={doRestore} style={styles.rowBtn}>
            <Text style={styles.rowText}>Restore purchases</Text>
          </Pressable>
        )}
        {isPremium && (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions',
              )
            }
            style={styles.rowBtn}
          >
            <Text style={styles.rowText}>Manage subscription</Text>
          </Pressable>
        )}
        {PRIVACY_URL !== '' && (
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL)} style={styles.rowBtn}>
            <Text style={styles.rowText}>Privacy policy</Text>
          </Pressable>
        )}
        {TERMS_URL !== '' && (
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(TERMS_URL)} style={styles.rowBtn}>
            <Text style={styles.rowText}>Terms of use</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={signOut} style={styles.rowBtn}>
          <Text style={styles.rowText}>Sign out</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.rowBtn}>
          <Text style={[styles.rowText, { color: colors.danger }]}>Delete account</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 6, marginLeft: 4 },
  hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, marginLeft: 4 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  list: { gap: 12, paddingBottom: 24 },
  card: {
    minHeight: 76,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  seg: { flexDirection: 'row', padding: 4, borderRadius: 22, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  segBtn: { width: 56, height: 40, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  small: { height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  smallText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 15 },
  rowBtn: {
    minHeight: 56,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  rowText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  profRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  profVal: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, flexShrink: 1, textAlign: 'right' },
  account: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, marginTop: 8, marginLeft: 4 },
});
