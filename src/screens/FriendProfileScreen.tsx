import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ThemeBadge } from '../components/FriendBits';
import { SendCreditsModal } from '../components/SendCreditsModal';
import { useSettings } from '../context/SettingsContext';
import { toDisplay } from '../lib/units';
import { formatDate, formatMinutes } from '../lib/dates';
import {
  blockUser,
  reportUser,
  type ReportReason,
  friendWorkouts,
  listFriends,
  removeFriend,
  timeAgo,
  type Friend,
  type FriendWorkout,
} from '../lib/social';
import { fonts, type Palette } from '../theme';
import { paletteFor, ThemeOverride, useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'FriendProfile'>;

const WEEKLY_GOAL = 3;

export function FriendProfileScreen() {
  const myColors = useColors();
  const { friendId, username } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();
  const { unit } = useSettings();

  const [friend, setFriend] = useState<Friend | null>(null);
  const [workouts, setWorkouts] = useState<FriendWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutsError, setWorkoutsError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadId = useRef(0);

  // The screen uses the friend's accent colour; fall back to the own theme until loaded.
  const palette = friend ? paletteFor(friend.theme) : myColors;
  const styles = useMemo(() => makeStyles(palette, palette), [palette]);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++loadId.current;
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      const res = await listFriends();
      if (id !== loadId.current) return;
      if (!res.ok) {
        setError(res.message);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const f = res.friends.find((x) => x.id === friendId) ?? null;
      setError(null);
      setFriend(f);
      setGone(!f);
      if (f && f.share_enabled) {
        const w = await friendWorkouts(friendId, 20);
        if (id !== loadId.current) return;
        if (w.ok) {
          setWorkouts(w.workouts);
          setWorkoutsError(null);
        } else if (w.error === 'sharing_disabled') {
          setWorkouts([]);
          setWorkoutsError(null);
        } else {
          setWorkoutsError(w.message);
        }
      } else {
        setWorkouts([]);
        setWorkoutsError(null);
      }
      setLoading(false);
      setRefreshing(false);
    },
    [friendId],
  );

  useFocusEffect(
    useCallback(() => {
      load(friend ? 'refresh' : 'initial');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const doRemove = async () => {
    setBusy(true);
    const res = await removeFriend(friendId);
    setBusy(false);
    if (res.ok) navigation.goBack();
    else Alert.alert('Could not remove friend', res.message);
  };

  const doBlock = async () => {
    setBusy(true);
    const res = await blockUser(friendId);
    setBusy(false);
    if (res.ok) navigation.goBack();
    else Alert.alert('Could not block', res.message);
  };

  const confirmRemove = () =>
    Alert.alert('Remove friend?', `${username} will no longer see your data and you won't see theirs.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doRemove },
    ]);

  const confirmBlock = () =>
    Alert.alert(
      'Block this user?',
      `${username} will be removed from your friends and can't send you requests. You can unblock later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: doBlock },
      ],
    );

  const sendReport = async (reason: ReportReason) => {
    setBusy(true);
    const res = await reportUser(friendId, reason);
    setBusy(false);
    if (res.ok) {
      Alert.alert('Report sent', 'Thank you. We review reports within 24 hours. You can also block this user.');
    } else Alert.alert('Could not send report', res.message);
  };

  // Android shows at most 3 buttons per dialog, so the menus are split into short steps (outside tap = cancel).
  const openReport = () =>
    Alert.alert(
      'Report this user',
      'What is the problem?',
      [
        { text: 'Spam', onPress: () => sendReport('spam') },
        { text: 'Abuse or harassment', onPress: () => sendReport('abuse') },
        { text: 'Something else', onPress: openReportMore },
      ],
      { cancelable: true },
    );

  const openReportMore = () =>
    Alert.alert(
      'Report this user',
      'What is the problem?',
      [
        { text: 'Inappropriate name', onPress: () => sendReport('inappropriate_name') },
        { text: 'Other', onPress: () => sendReport('other') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );

  const openMenu = () =>
    Alert.alert(
      username,
      undefined,
      [
        { text: 'Remove friend', onPress: confirmRemove },
        { text: 'Report', onPress: openReport },
        { text: 'Block', style: 'destructive', onPress: confirmBlock },
      ],
      { cancelable: true },
    );

  const w = (kg: number) => `${toDisplay(kg, unit)} ${unit}`;

  const menuBtn = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="More options"
      disabled={busy || !friend}
      onPress={openMenu}
      style={[styles.menuBtn, (busy || !friend) && styles.dim]}
    >
      <Feather name="more-horizontal" size={22} color={palette.text} />
    </Pressable>
  );

  return (
    <ThemeOverride palette={palette}>
    <Screen>
      <Header title={username} right={menuBtn} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} size="large" accessibilityLabel="Loading profile" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Couldn't load profile</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load('initial')} style={styles.primary}>
            <Text style={styles.primaryText}>Retry</Text>
          </Pressable>
        </View>
      ) : gone || !friend ? (
        <View style={styles.center}>
          <Feather name="user-x" size={32} color={palette.muted} />
          <Text style={styles.emptyTitle}>Not your friend anymore</Text>
          <Text style={styles.emptyText}>This person is no longer in your friends list.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={palette.accent} />
          }
        >
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>STREAK</Text>
            <Text style={styles.heroValue} accessibilityLabel={`${friend.streak_weeks} week streak`}>
              {friend.streak_weeks} {friend.streak_weeks === 1 ? 'week' : 'weeks'}
            </Text>
            <ThemeBadge theme={friend.theme} />
            {friend.share_enabled && (
              <Text style={styles.heroSub}>
                {friend.qualifying_this_week ?? 0}/{WEEKLY_GOAL} workouts this week · last {timeAgo(friend.last_workout_at).toLowerCase()}
              </Text>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Send credits to ${username}`}
            onPress={() => setGiftOpen(true)}
            style={styles.action}
          >
            <Feather name="gift" size={20} color={palette.text} />
            <Text style={styles.actionText}>Send credits</Text>
          </Pressable>

          {!friend.share_enabled ? (
            <View style={styles.empty}>
              <Feather name="eye-off" size={28} color={palette.muted} />
              <Text style={styles.emptyTitle}>Sharing is off</Text>
              <Text style={styles.emptyText}>{username} isn't sharing workouts, weights or records right now.</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{friend.qualifying_this_week ?? 0}/{WEEKLY_GOAL}</Text>
                  <Text style={styles.statLabel}>This week</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{friend.total_workouts ?? 0}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
              </View>

              <Text style={styles.section}>TOP LIFTS</Text>
              {(friend.top_lifts ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No records yet.</Text>
              ) : (
                (friend.top_lifts ?? []).map((l) => (
                  <View key={l.name} style={styles.row} accessibilityLabel={`${l.name}, ${w(l.kg)} for ${l.reps} reps`}>
                    <Text style={styles.rowName}>{l.name}</Text>
                    <Text style={styles.rowValue}>
                      {w(l.kg)} × {l.reps}
                    </Text>
                  </View>
                ))
              )}

              <Text style={styles.section}>RECENT WORKOUTS</Text>
              {workoutsError ? (
                <View style={styles.empty}>
                  <Text style={styles.errText}>{workoutsError}</Text>
                  <Pressable accessibilityRole="button" onPress={() => load('refresh')} style={styles.action}>
                    <Text style={styles.actionText}>Retry</Text>
                  </Pressable>
                </View>
              ) : workouts.length === 0 ? (
                <Text style={styles.emptyText}>No workouts yet.</Text>
              ) : (
                workouts.map((wk) => (
                  <View key={wk.id} style={styles.workout}>
                    <View style={styles.workoutHead}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {wk.name}
                      </Text>
                      <Text style={styles.rowSub}>
                        {formatDate(wk.started_at)} · {formatMinutes(wk.duration_sec)}
                      </Text>
                    </View>
                    {wk.entries.map((e, i) => (
                      <View key={`${e.name}-${i}`} style={styles.entry}>
                        <Text style={styles.entryName}>{e.name}</Text>
                        <Text style={styles.entrySets}>
                          {e.sets.map((s) => `${toDisplay(s.kg, unit)}×${s.reps}`).join('  ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
      <SendCreditsModal visible={giftOpen} friendId={friendId} username={username} onClose={() => setGiftOpen(false)} />
    </Screen>
    </ThemeOverride>
  );
}

// `colors` = own theme (UI chrome), `friend` = friend's palette (accent header).
const makeStyles = (colors: Palette, friend: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    list: { gap: 12, paddingBottom: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
    menuBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dim: { opacity: 0.4 },
    hero: { borderRadius: 28, padding: 22, gap: 6, backgroundColor: friend.accent, alignItems: 'flex-start' },
    heroLabel: { color: friend.onAccent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5 },
    heroValue: { color: friend.onAccent, fontFamily: fonts.bold, fontSize: 44, letterSpacing: -1.5 },
    heroSub: { color: friend.onAccent, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    action: {
      minHeight: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    actionText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
    statsRow: { flexDirection: 'row', gap: 12 },
    stat: {
      flex: 1,
      borderRadius: 20,
      padding: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 2,
    },
    statValue: { color: friend.accent, fontFamily: fonts.bold, fontSize: 28 },
    statLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    section: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.5, marginTop: 4 },
    row: {
      minHeight: 56,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    rowName: { color: colors.text, fontFamily: fonts.bold, fontSize: 16, flexShrink: 1 },
    rowValue: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
    rowSub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    workout: {
      borderRadius: 20,
      padding: 16,
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    workoutHead: { gap: 2 },
    entry: { gap: 2 },
    entryName: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
    entrySets: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
    empty: { alignItems: 'center', gap: 8, paddingVertical: 20, paddingHorizontal: 12 },
    emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    emptyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
    errText: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
    primary: {
      minHeight: 52,
      borderRadius: 26,
      paddingHorizontal: 24,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 17 },
  });
