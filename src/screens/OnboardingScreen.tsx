import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { useProfile } from '../context/ProfileContext';
import { useCredits } from '../context/CreditsContext';
import { USERNAME_RE } from '../lib/credits';
import { FOCUS_LIFTS } from '../lib/coach';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { Goal, Level, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? '';
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';

const GOALS: Goal[] = ['Strength', 'Muscle', 'Fat loss'];
const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS = [2, 3, 4, 5, 6];
const LIFTS = Object.keys(FOCUS_LIFTS);

function Chip({ label, on, onPress, round, height = 56 }: { label: string; on: boolean; onPress: () => void; round?: boolean; height?: number }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.chip, { height, borderRadius: round ? height / 2 : 18 }, on && { backgroundColor: colors.accent }]}
    >
      <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

export function OnboardingScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { profile, save } = useProfile();
  const credits = useCredits();
  const usernameOnly = useRoute<RouteProp<RootStackParamList, 'Onboarding'>>().params?.usernameOnly === true;
  // The account step is shown while no username exists (mandatory before the menu).
  const [needsAccount, setNeedsAccount] = useState(() => !credits.username);
  const [username, setUsername] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [invite, setInvite] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'Strength');
  const [level, setLevel] = useState<Level>(profile?.level ?? 'Intermediate');
  const [days, setDays] = useState(profile?.days ?? 4);
  const [focus, setFocus] = useState<string[]>(profile?.focus ?? ['Bench Press', 'Squat', 'Deadlift']);
  const [busy, setBusy] = useState(false);

  const toggle = (l: string) => setFocus((f) => (f.includes(l) ? f.filter((x) => x !== l) : [...f, l]));

  const finish = () => {
    if (usernameOnly) navigation.reset({ index: 0, routes: [{ name: 'Menu' }] });
    else if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 1, routes: [{ name: 'Menu' }, { name: 'Coach' }] });
  };

  const nameClean = username.trim().toLowerCase();
  const nameValid = USERNAME_RE.test(nameClean);

  const submitAccount = async () => {
    setAccountError(null);
    if (!nameValid) {
      setAccountError('Use 3 to 20 characters: letters, numbers and underscore.');
      return;
    }
    setBusy(true);
    const err = await credits.setUsername(nameClean);
    if (err) {
      setBusy(false);
      setAccountError(err);
      return;
    }
    const code = invite.replace(/\s/g, '').toUpperCase();
    let inviteErr: string | null = null;
    if (code) inviteErr = await credits.redeemInvite(code);
    setBusy(false);
    setNeedsAccount(false);
    if (inviteErr) {
      // not blocking: the account is ready, only the code was not applied
      Alert.alert('Invite code not applied', inviteErr, [{ text: 'Continue', onPress: () => (usernameOnly ? finish() : undefined) }], {
        onDismiss: () => (usernameOnly ? finish() : undefined),
      });
      return;
    }
    if (usernameOnly) finish();
  };

  const submit = async () => {
    setBusy(true);
    const err = await save({ goal, level, days, focus });
    setBusy(false);
    if (err) Alert.alert('Saved on this phone only', 'Your profile could not be synced yet. It will work offline; try again later.');
    finish();
  };

  if (needsAccount) {
    const canGo = nameValid && agreed && !busy;
    return (
      <Screen hideCredits>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={styles.title}>
              Pick a username
            </Text>
            <Text style={styles.sub}>Friends find you by this name.</Text>

            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              accessibilityLabel="Username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setAccountError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              placeholder="e.g. iron_anna"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Text style={styles.hint}>3 to 20 characters: a-z, 0-9 and _</Text>
            {accountError && <Text style={styles.error}>{accountError}</Text>}

            <Text style={styles.label}>INVITE CODE (OPTIONAL)</Text>
            <TextInput
              accessibilityLabel="Invite code"
              value={invite}
              onChangeText={setInvite}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              placeholder="Got a code from a friend?"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              onPress={() => setAgreed((a) => !a)}
              style={styles.agreeRow}
            >
              <View style={[styles.box, agreed && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                {agreed && <Feather name="check" size={16} color={colors.onAccent} />}
              </View>
              <Text style={styles.agreeText}>
                I agree to the{' '}
                {TERMS_URL !== '' ? (
                  <Text accessibilityRole="link" style={styles.link} onPress={() => Linking.openURL(TERMS_URL)}>
                    Terms
                  </Text>
                ) : (
                  'Terms'
                )}{' '}
                and{' '}
                {PRIVACY_URL !== '' ? (
                  <Text accessibilityRole="link" style={styles.link} onPress={() => Linking.openURL(PRIVACY_URL)}>
                    Privacy Policy
                  </Text>
                ) : (
                  'Privacy Policy'
                )}
                .
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
        <Pressable accessibilityRole="button" disabled={!canGo} onPress={submitAccount} style={[styles.cta, !canGo && { opacity: 0.5 }]}>
          {busy ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.ctaText}>Continue</Text>}
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen hideCredits>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Make it yours
        </Text>
        <Text style={styles.sub}>Your plan adapts to your goal, level and schedule.</Text>

        <Text style={styles.label}>GOAL</Text>
        <View style={styles.row}>
          {GOALS.map((g) => (
            <Chip key={g} label={g} on={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>

        <Text style={styles.label}>EXPERIENCE</Text>
        <View style={styles.row}>
          {LEVELS.map((l) => (
            <Chip key={l} label={l} on={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>

        <Text style={styles.label}>DAYS PER WEEK</Text>
        <View style={styles.row}>
          {DAYS.map((d) => (
            <Chip key={d} label={String(d)} on={days === d} onPress={() => setDays(d)} round height={52} />
          ))}
        </View>

        <Text style={styles.label}>LIFTS TO IMPROVE</Text>
        <View style={styles.grid}>
          {LIFTS.map((l) => (
            <View key={l} style={styles.gridItem}>
              <Chip label={l} on={focus.includes(l)} onPress={() => toggle(l)} height={52} />
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        disabled={busy || focus.length === 0}
        onPress={submit}
        style={[styles.cta, (busy || focus.length === 0) && { opacity: 0.5 }]}
      >
        {busy ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.ctaText}>Build my plan</Text>}
      </Pressable>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1 },
  input: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 17,
  },
  hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  agreeText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  link: { color: colors.accent, textDecorationLine: 'underline' },
  content: { gap: 10, paddingBottom: 8 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 40, letterSpacing: -1, marginTop: 8 },
  sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, marginBottom: 8 },
  label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 10 },
  row: { flexDirection: 'row', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48.5%' },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, textAlign: 'center' },
  cta: { height: 64, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 20 },
});
