import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { listBlocked, unblockUser, type BlockedUser } from '../lib/social';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
export function BlockedScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const loadId = useRef(0);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    const id = ++loadId.current;
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    const res = await listBlocked();
    if (id !== loadId.current) return;
    if (res.ok) {
      setItems(res.blocked);
      setError(null);
    } else {
      setError(res.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  const unblock = async (u: BlockedUser) => {
    setBusyIds((b) => [...b, u.id]);
    setActionError(null);
    const res = await unblockUser(u.id);
    setBusyIds((b) => b.filter((x) => x !== u.id));
    if (res.ok) setItems((list) => list.filter((x) => x.id !== u.id));
    else setActionError(res.message);
  };

  return (
    <Screen>
      <Header title={tr("Blocked")} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" accessibilityLabel={tr("Loading blocked users")} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{tr("Couldn't load list")}</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load('initial')} style={styles.primary}>
            <Text style={styles.primaryText}>{tr("Retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            actionError ? (
              <Text style={styles.errText} accessibilityLiveRegion="polite">
                {actionError}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="slash" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>{tr("No blocked users")}</Text>
              <Text style={styles.emptyText}>{tr("People you block can't send you requests or use your invite code.")}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const busy = busyIds.includes(item.id);
            const name = item.username ?? 'Unnamed';
            return (
              <View style={styles.row}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {name}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Unblock {0}", [name])}
                  disabled={busy}
                  onPress={() => unblock(item)}
                  style={[styles.unblock, busy && styles.dim]}
                >
                  {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.unblockText}>{tr("Unblock")}</Text>}
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    list: { gap: 12, paddingBottom: 12, flexGrow: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
    row: {
      minHeight: 64,
      borderRadius: 20,
      paddingVertical: 10,
      paddingLeft: 20,
      paddingRight: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowName: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
    unblock: {
      minWidth: 88,
      height: 44,
      borderRadius: 22,
      paddingHorizontal: 16,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unblockText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
    dim: { opacity: 0.4 },
    empty: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 12 },
    emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
    emptyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
    errText: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
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
