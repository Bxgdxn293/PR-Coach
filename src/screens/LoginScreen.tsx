import React, { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { supabaseConfigured } from '../lib/supabase';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

export function LoginScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!email.includes('@') || password.length < 6) {
      setMessage('Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const err = mode === 'in' ? await signIn(email, password) : await signUp(email, password);
    setMessage(err);
    setBusy(false);
  };

  return (
    <Screen hideCredits>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Text style={styles.brand}>Fitness</Text>
          <Text style={styles.sub}>Log workouts. Beat your records.</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password"
          />
          {message && <Text style={styles.message}>{message}</Text>}
          {!supabaseConfigured && (
            <Text style={styles.message}>Supabase is not configured. Set the EXPO_PUBLIC_SUPABASE_* variables.</Text>
          )}
          <Pressable style={styles.primary} onPress={submit} disabled={busy} accessibilityRole="button">
            {busy ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text style={styles.primaryText}>{mode === 'in' ? 'Sign in' : 'Create account'}</Text>
            )}
          </Pressable>
          {mode === 'in' && (
            <Pressable
              onPress={async () => {
                if (!email.includes('@')) return setMessage('Enter your email above first.');
                setBusy(true);
                const err = await resetPassword(email);
                setMessage(err ?? 'If this email has an account, a reset link is on its way.');
                setBusy(false);
              }}
              style={styles.switch}
              accessibilityRole="button"
            >
              <Text style={styles.switchText}>Forgot password?</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setMode(mode === 'in' ? 'up' : 'in')} style={styles.switch} accessibilityRole="button">
            <Text style={styles.switchText}>
              {mode === 'in' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between' },
  top: { marginTop: 80, gap: 8 },
  brand: { color: colors.accent, fontFamily: fonts.bold, fontSize: 56, letterSpacing: -2 },
  sub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 18 },
  form: { gap: 12, paddingBottom: 24 },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 17,
  },
  message: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14 },
  primary: {
    height: 60,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 19 },
  switch: { height: 44, alignItems: 'center', justifyContent: 'center' },
  switchText: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
});
