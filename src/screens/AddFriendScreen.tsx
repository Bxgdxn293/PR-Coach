import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import {
  looksLikeInviteCode,
  myCredits,
  redeemInvite,
  sendFriendRequest,
  type MyCredits,
} from '../lib/social';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
type Notice = { kind: 'ok' | 'error'; text: string };

export function AddFriendScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [me, setMe] = useState<MyCredits | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    setMeLoading(true);
    const res = await myCredits();
    if (res.ok) {
      setMe(res);
      setMeError(null);
    } else {
      setMeError(res.message);
    }
    setMeLoading(false);
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const submit = async () => {
    const value = input.trim();
    if (!value || busy) return;
    setBusy(true);
    setNotice(null);
    let res = await sendFriendRequest(value.toLowerCase());
    if (!res.ok && res.error === 'user_not_found' && looksLikeInviteCode(value)) {
      // Not a username: try it as an invite code.
      const redeemed = await redeemInvite(value.toUpperCase());
      if (redeemed.ok) {
        setBusy(false);
        setInput('');
        setNotice({
          kind: 'ok',
          text: tr("You are now friends with {0}.", [redeemed.inviter_username ?? tr("your inviter")]),
        });
        return;
      }
      setBusy(false);
      // Show the code error only if it is more specific than "not found".
      setNotice({
        kind: 'error',
        text: redeemed.error === 'invalid_code' ? tr("No user or invite code found for that entry.") : redeemed.message,
      });
      return;
    }
    setBusy(false);
    if (res.ok) {
      setInput('');
      setNotice({
        kind: 'ok',
        text:
          res.status === 'accepted'
            ? tr("You are now friends.")
            : tr("Request sent. They will see it in their friends list."),
      });
    } else {
      setNotice({ kind: 'error', text: res.message });
    }
  };

  const share = async () => {
    if (!me?.invite_code) return;
    const who = me.username ? tr(" My username is {0}.", [me.username]) : '';
    try {
      await Share.share({
        message: tr("Join me on the fitness app and let's keep each other going! Use my invite code {0}.{1}", [me.invite_code, who]),
      });
    } catch {
      setNotice({ kind: 'error', text: tr("Couldn't open the share sheet.") });
    }
  };

  return (
    <Screen>
      <Header title={tr("Add friend")} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{tr("Username or invite code")}</Text>
            <TextInput
              accessibilityLabel={tr("Username or invite code")}
              value={input}
              onChangeText={(t) => {
                setInput(t);
                if (notice) setNotice(null);
              }}
              placeholder={tr("e.g. alex_fit or K7M2QX9P")}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="send"
              onSubmitEditing={submit}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: busy || !input.trim(), busy }}
              disabled={busy || !input.trim()}
              onPress={submit}
              style={[styles.primary, (busy || !input.trim()) && styles.dim]}
            >
              {busy ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text style={styles.primaryText}>{tr("Send request")}</Text>
              )}
            </Pressable>
            {notice && (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.notice, notice.kind === 'error' ? styles.noticeErr : styles.noticeOk]}
              >
                {notice.text}
              </Text>
            )}
            <Text style={styles.hint}>
              {tr("You need your own username to add friends. You can send up to 20 requests per day. Too many failed lookups in an hour pause searching for a while.")}
            </Text>
          </View>

          <Text style={styles.section}>{tr("YOUR DETAILS")}</Text>
          <View style={styles.card}>
            {meLoading ? (
              <ActivityIndicator color={colors.accent} accessibilityLabel={tr("Loading your invite code")} />
            ) : meError || !me ? (
              <>
                <Text style={styles.noticeErr}>{meError ?? tr("Could not load your details.")}</Text>
                <Pressable accessibilityRole="button" onPress={loadMe} style={styles.secondary}>
                  <Text style={styles.secondaryText}>{tr("Retry")}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.label}>{tr("Username")}</Text>
                <Text style={styles.value} selectable>
                  {me.username ?? tr("Not set yet (set it in Settings)")}
                </Text>
                <Text style={styles.label}>{tr("Invite code")}</Text>
                <Text style={styles.code} selectable accessibilityLabel={tr("Your invite code {0}", [me.invite_code ?? 'unavailable'])}>
                  {me.invite_code ?? tr("Unavailable")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Share my invite code")}
                  disabled={!me.invite_code}
                  onPress={share}
                  style={[styles.secondary, !me.invite_code && styles.dim]}
                >
                  <Feather name="share" size={18} color={colors.text} />
                  <Text style={styles.secondaryText}>{tr("Share invite")}</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 16 },
    card: {
      borderRadius: 24,
      padding: 18,
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    input: {
      height: 52,
      borderRadius: 16,
      paddingHorizontal: 16,
      color: colors.text,
      fontFamily: fonts.medium,
      fontSize: 17,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primary: {
      minHeight: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 17 },
    dim: { opacity: 0.4 },
    secondary: {
      minHeight: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 20,
    },
    secondaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    notice: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    noticeOk: { color: colors.accent },
    noticeErr: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    hint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 4 },
    label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1 },
    value: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    code: { color: colors.accent, fontFamily: fonts.bold, fontSize: 30, letterSpacing: 3 },
  });
