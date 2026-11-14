import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import { giftCredits } from '../lib/social';

import { tr } from '../lib/i18n';
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
      setDone(tr("Credits sent: {0}. Recipient: {1}. Your balance: {2}.", [amount, username, res.balance]));
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.title}>
            {tr("Send credits")}
          </Text>
          <Text style={styles.sub}>{tr("Gift credits to {0}. 1 to 20 per gift.", [username])}</Text>

          {done ? (
            <>
              <Text style={styles.ok} accessibilityLiveRegion="polite">
                {done}
              </Text>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.primary}>
                <Text style={styles.primaryText}>{tr("Done")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Decrease amount")}
                  disabled={amount <= MIN || busy}
                  onPress={() => setAmount((a) => Math.max(MIN, a - 1))}
                  style={[styles.stepBtn, (amount <= MIN || busy) && styles.dim]}
                >
                  <Feather name="minus" size={22} color={colors.text} />
                </Pressable>
                <Text style={styles.amount} accessibilityLabel={tr("{0} credits", [amount])}>
                  {amount}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Increase amount")}
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
                  <Text style={styles.primaryText}>{tr("Send {0}", [amount])}</Text>
                )}
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondary}>
                <Text style={styles.secondaryText}>{tr("Cancel")}</Text>
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
