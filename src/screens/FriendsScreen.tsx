import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ColorDot, ThemeBadge, StreakBadge } from '../components/FriendBits';
import { useAuth } from '../context/AuthContext';
import {
  getOwnSharing,
  listFriendRequests,
  listFriends,
  respondFriendRequest,
  setSharing,
  sortFriends,
  timeAgo,
  type Friend,
  type FriendRequest,
} from '../lib/social';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

import { tr } from '../lib/i18n';
type Nav = NativeStackNavigationProp<RootStackParamList>;

const CONSENT_KEY = 'social.sharingConsent';
const WEEKLY_GOAL = 3;
// The "sharing is off" hint dialog is shown at most once per app run.
let hintShown = false;

export function FriendsScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [sharing, setSharingState] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [sharingBusy, setSharingBusy] = useState(false);
  const loadId = useRef(0);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++loadId.current;
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      const [f, r, s] = await Promise.all([
        listFriends(),
        listFriendRequests(),
        user ? getOwnSharing(user.id) : Promise.resolve(null),
      ]);
      if (id !== loadId.current) return;
      if (!f.ok) {
        setError(f.message);
      } else {
        setError(null);
        setFriends(sortFriends(f.friends));
        setIncoming(r.ok ? r.incoming : []);
        setSharingState(s);
        if (s === false && f.friends.length > 0 && !hintShown) {
          hintShown = true;
          setConsent(true);
        }
      }
      setLoading(false);
      setRefreshing(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      load(friends.length === 0 && !error ? 'initial' : 'refresh');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const applySharing = async (enabled: boolean) => {
    setSharingBusy(true);
    setActionError(null);
    const res = await setSharing(enabled);
    setSharingBusy(false);
    if (res.ok) setSharingState(res.share_enabled);
    else setActionError(res.message);
  };

  const onToggle = async (next: boolean) => {
    if (!next) {
      applySharing(false);
      return;
    }
    let consented = false;
    try {
      consented = (await AsyncStorage.getItem(CONSENT_KEY)) === '1';
    } catch {
      consented = false;
    }
    if (consented) applySharing(true);
    else setConsent(true);
  };

  const allow = async () => {
    setConsent(false);
    try {
      await AsyncStorage.setItem(CONSENT_KEY, '1');
    } catch {
      // ignore: the dialog just shows again next time
    }
    applySharing(true);
  };

  const respond = async (req: FriendRequest, accept: boolean) => {
    setBusyIds((b) => [...b, req.id]);
    setActionError(null);
    const res = await respondFriendRequest(req.id, accept);
    setBusyIds((b) => b.filter((x) => x !== req.id));
    if (!res.ok) setActionError(res.message);
    else load('refresh');
  };

  const openFriend = (f: Friend) =>
    navigation.navigate('FriendProfile', { friendId: f.id, username: f.username ?? 'Friend' });

  return (
    <Screen>
      <Header title={tr("Friends")} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" accessibilityLabel={tr("Loading friends")} />
        </View>
      ) : error && friends.length === 0 ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.muted} />
          <Text style={styles.emptyTitle}>{tr("Couldn't load friends")}</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load('initial')} style={styles.primary}>
            <Text style={styles.primaryText}>{tr("Retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.accent} />
          }
        >
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{tr("Sharing")}</Text>
                <Text style={styles.cardSub}>
                  {sharing ? tr("Friends can see your workouts, weights, records, streak and colour.") : tr("Sharing is off. Friends only see your username, streak and colour.")}
                </Text>
              </View>
              <Switch
                accessibilityLabel={tr("Share my workouts with friends")}
                value={!!sharing}
                disabled={sharing === null || sharingBusy}
                onValueChange={onToggle}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#ffffff"
              />
            </View>
            {sharing === null && <Text style={styles.cardSub}>{tr("Couldn't read your sharing setting. Pull to refresh.")}</Text>}
          </View>

          {actionError && (
            <Text style={styles.errText} accessibilityLiveRegion="polite">
              {actionError}
            </Text>
          )}
          {error && friends.length > 0 && <Text style={styles.errText}>{tr("Couldn't refresh: {0}", [error])}</Text>}

          {incoming.length > 0 && <Text style={styles.section}>{tr("REQUESTS")}</Text>}
          {incoming.map((req) => {
            const busy = busyIds.includes(req.id);
            const name = req.username ?? 'Someone';
            return (
              <View key={req.id} style={styles.reqRow}>
                <View style={styles.flex}>
                  <Text style={styles.rowName}>{name}</Text>
                  <Text style={styles.rowSub}>{tr("wants to be your friend")}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Decline request from {0}", [name])}
                  disabled={busy}
                  onPress={() => respond(req, false)}
                  style={[styles.iconBtn, busy && styles.dim]}
                >
                  <Feather name="x" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Accept request from {0}", [name])}
                  disabled={busy}
                  onPress={() => respond(req, true)}
                  style={[styles.iconBtn, styles.iconBtnAccent, busy && styles.dim]}
                >
                  <Feather name="check" size={20} color={colors.onAccent} />
                </Pressable>
              </View>
            );
          })}

          <Text style={styles.section}>{tr("YOUR FRIENDS")}</Text>
          {friends.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="users" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>{tr("No friends yet")}</Text>
              <Text style={styles.emptyText}>{tr("Add a friend by username or invite code and keep each other going.")}</Text>
            </View>
          ) : (
            friends.map((f) => {
              const name = f.username ?? 'Unnamed';
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    f.share_enabled ? tr("{0}, {1} week streak, {2} of {3} workouts this week", [name, f.streak_weeks, f.qualifying_this_week ?? 0, WEEKLY_GOAL]) : tr("{0}, {1} week streak, sharing is off", [name, f.streak_weeks])
                  }
                  onPress={() => openFriend(f)}
                  style={styles.row}
                >
                  <ColorDot theme={f.theme} size={16} />
                  <View style={styles.flex}>
                    <View style={styles.nameLine}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {name}
                      </Text>
                      <ThemeBadge theme={f.theme} />
                    </View>
                    {f.share_enabled ? (
                      <Text style={styles.rowSub}>
                        {tr("{0}/{1} this week · {2}", [f.qualifying_this_week ?? 0, WEEKLY_GOAL, timeAgo(f.last_workout_at)])}
                      </Text>
                    ) : (
                      <Text style={styles.rowSub}>{tr("Sharing is off")}</Text>
                    )}
                  </View>
                  <StreakBadge weeks={f.streak_weeks} />
                  <Feather name="chevron-right" size={20} color={colors.muted} />
                </Pressable>
              );
            })
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr("Add friend")}
            onPress={() => navigation.navigate('AddFriend')}
            style={styles.primary}
          >
            <Feather name="user-plus" size={20} color={colors.onAccent} />
            <Text style={styles.primaryText}>{tr("Add friend")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Blocked')} style={styles.link}>
            <Text style={styles.linkText}>{tr("Blocked users")}</Text>
          </Pressable>
        </ScrollView>
      )}

      <Modal visible={consent} transparent animationType="fade" onRequestClose={() => setConsent(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              {tr("Share with friends?")}
            </Text>
            <Text style={styles.sheetText}>
              {tr("Friends can see your workouts, weights, records, streak and colour. You can turn this off any time.")}
            </Text>
            <Pressable accessibilityRole="button" onPress={allow} style={styles.primary}>
              <Text style={styles.primaryText}>{tr("Allow")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setConsent(false)} style={styles.secondary}>
              <Text style={styles.secondaryText}>{tr("Not now")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 12 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
    card: {
      borderRadius: 24,
      padding: 18,
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    cardSub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 4 },
    row: {
      minHeight: 68,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    reqRow: {
      minHeight: 64,
      borderRadius: 20,
      paddingVertical: 10,
      paddingLeft: 18,
      paddingRight: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    nameLine: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    rowName: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, flexShrink: 1 },
    rowSub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
    dim: { opacity: 0.4 },
    empty: { alignItems: 'center', gap: 8, paddingVertical: 24, paddingHorizontal: 12 },
    emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    emptyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
    errText: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    primary: {
      minHeight: 52,
      borderRadius: 26,
      paddingHorizontal: 24,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 17 },
    secondary: { height: 48, alignItems: 'center', justifyContent: 'center' },
    secondaryText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 15 },
    link: { height: 44, alignItems: 'center', justifyContent: 'center' },
    linkText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, textDecorationLine: 'underline' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    sheet: {
      borderRadius: 28,
      padding: 22,
      gap: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sheetTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 24 },
    sheetText: { color: colors.text, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  });
