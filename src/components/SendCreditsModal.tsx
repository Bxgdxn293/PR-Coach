import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import { giftCredits } from '../lib/social';

const MIN = 1;
const MAX = 20;

export function SendCreditsModal({
  visible,
  friendId,
  username,
  onClose,
}: {
  visible: boolean;
  friendId: string;
  username: string;
  onClose: () => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [amount, setAmount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setAmount(5);
      setBusy(false);
      setError(null);
      setDone(null);
    }
  }, [visible]);

  const send = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await giftCredits(friendId, amount);
    setBusy(false);
    if (res.ok) {
      setDone(`Sent ${amount} credit${amount === 1 ? '' : 's'} to ${username}. Your balance: ${res.balance}.`);
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.title}>
            Send credits
          </Text>
          <Text style={styles.sub}>Gift credits to {username}. 1 to 20 per gift.</Text>

          {done ? (
            <>
              <Text style={styles.ok} accessibilityLiveRegion="polite">
                {done}
              </Text>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.primary}>
                <Text style={styles.primaryText}>Done</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Decrease amount"
                  disabled={amount <= MIN || busy}
                  onPress={() => setAmount((a) => Math.max(MIN, a - 1))}
                  style={[styles.stepBtn, (amount <= MIN || busy) && styles.dim]}
                >
                  <Feather name="minus" size={22} color={colors.text} />
                </Pressable>
                <Text style={styles.amount} accessibilityLabel={`${amount} credits`}>
                  {amount}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Increase amount"
                  disabled={amount >= MAX || busy}
                  onPress={() => setAmount((a) => Math.min(MAX, a + 1))}
                  style={[styles.stepBtn, (amount >= MAX || busy) && styles.dim]}
                >
                  <Feather name="plus" size={22} color={colors.text} />
                </Pressable>
              </View>
              {error && (
                <Text style={styles.err} accessibilityLiveRegion="polite">
                  {error}
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy, busy }}
                disabled={busy}
                onPress={send}
                style={[styles.primary, busy && styles.dim]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Text style={styles.primaryText}>Send {amount}</Text>
                )}
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondary}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    sheet: {
      borderRadius: 28,
      padding: 22,
      gap: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { color: colors.text, fontFamily: fonts.bold, fontSize: 24 },
    sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginVertical: 6 },
    stepBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    amount: { color: colors.text, fontFamily: fonts.bold, fontSize: 44, minWidth: 80, textAlign: 'center' },
    dim: { opacity: 0.4 },
    err: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
    ok: { color: colors.text, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
    primary: {
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 17 },
    secondary: { height: 48, alignItems: 'center', justifyContent: 'center' },
    secondaryText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 15 },
  });
