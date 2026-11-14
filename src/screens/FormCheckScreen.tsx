import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { usePremium } from '../context/PremiumContext';
import { useCredits } from '../context/CreditsContext';
import {
  FORM_EXERCISES,
  MAX_RECORD_SEC,
  MIN_RECORD_MS,
  analyse,
  describeError,
  extractFrames,
  type FormExercise,
} from '../lib/formCheck';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FormCheckScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { isPremium, ready } = usePremium();
  const credits = useCredits();
  const cost = credits.config.form_check_cost;
  const wp = credits.weeklyProgress;
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const startedAt = useRef(0);
  const [exercise, setExercise] = useState<FormExercise>('Squat');
  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const mounted = useRef(true);
  const discard = useRef(false);
  const leaving = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      try {
        camRef.current?.stopRecording();
      } catch {
        // camera already gone
      }
    };
  }, []);

  // Android back button / swipe back while recording: ask first, then stop and discard the clip.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (!recording || leaving.current) return;
      e.preventDefault();
      Alert.alert('Stop recording?', 'The current recording will be discarded.', [
        { text: 'Keep recording', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            leaving.current = true;
            discard.current = true;
            camRef.current?.stopRecording();
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
  }, [navigation, recording]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [recording]);

  const header = <Header title="Form Check" />;

  if (!ready) {
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!isPremium && !credits.hasData) {
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <Feather name="wifi-off" size={40} color={colors.muted} />
          <Text style={styles.lockTitle}>Could not load your credits</Text>
          <Text style={styles.lockText}>{credits.error ?? 'Check your connection and try again.'}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => credits.refresh()} style={styles.cta}>
          <Text style={styles.ctaText}>Retry</Text>
        </Pressable>
      </Screen>
    );
  }

  if (!isPremium && credits.balance < cost) {
    const missing = cost - credits.balance;
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <Feather name="zap" size={40} color={colors.accent} />
          <Text style={styles.lockTitle}>Not enough credits</Text>
          <Text style={styles.lockText}>
            A Form Check costs {cost} credits. You have {credits.balance}, so you need {missing} more.
          </Text>
          <View style={styles.earnBox}>
            <Text style={styles.earnTitle}>
              {wp.qualifying_this_week} / {wp.goal} workouts this week
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, (wp.qualifying_this_week / Math.max(1, wp.goal)) * 100)}%` }]} />
            </View>
            <Text style={styles.earnText}>Reach your weekly goal to earn +{wp.bonus} credits.</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Credits')} style={styles.cta}>
          <Text style={styles.ctaText}>Earn credits</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Paywall')} style={styles.ctaAlt}>
          <Text style={styles.ctaAltText}>Go Premium</Text>
        </Pressable>
      </Screen>
    );
  }

  if (!permission) {
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        {header}
        <View style={styles.center}>
          <Feather name="camera" size={40} color={colors.muted} />
          <Text style={styles.lockTitle}>Camera access needed</Text>
          <Text style={styles.lockText}>
            The camera records your set so it can be analysed. Videos are not saved to your gallery.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{permission.canAskAgain ? 'Allow camera' : 'Open settings'}</Text>
        </Pressable>
      </Screen>
    );
  }

  const CONSENT_KEY = 'formcheck.consent.v1';
  const askConsent = async (): Promise<boolean> => {
    try {
      if ((await AsyncStorage.getItem(CONSENT_KEY)) === 'yes') return true;
    } catch {}
    const ok = await new Promise<boolean>((resolve) =>
      Alert.alert(
        'Send frames to AI?',
        'To analyse your technique, a few still frames from your video are sent to our server and to Anthropic, an AI provider. The video is not uploaded and the frames are not stored by us.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'I agree', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      ),
    );
    if (ok) {
      try {
        await AsyncStorage.setItem(CONSENT_KEY, 'yes');
      } catch {}
    }
    return ok;
  };

  const process = async (uri: string, durationMs: number) => {
    try {
      if (!(await askConsent())) return;
      setBusy('Preparing your set…');
      const frames = await extractFrames(uri, durationMs);
      if (!mounted.current) return;
      setBusy('Analysing your technique…');
      const result = await analyse(exercise, frames);
      credits.refresh();
      if (!mounted.current) return;
      setBusy(null);
      navigation.navigate('FormResult', { exercise, result, frames });
    } catch (e) {
      // a failed check is refunded by the server: reload the balance
      credits.refresh();
      if (!mounted.current) return;
      setBusy(null);
      Alert.alert('Form Check', describeError(e));
    }
  };

  const start = async () => {
    if (!cameraReady || recording || busy) return;
    startedAt.current = Date.now();
    setSeconds(0);
    setRecording(true);
    try {
      // Resolves when the recording is stopped (by the user or by maxDuration).
      const video = await camRef.current?.recordAsync({ maxDuration: MAX_RECORD_SEC });
      const durationMs = Date.now() - startedAt.current;
      if (!mounted.current || discard.current) return;
      setRecording(false);
      if (!video?.uri) return;
      if (durationMs < MIN_RECORD_MS) {
        Alert.alert('Too short', 'Record at least a few seconds of your set.');
        return;
      }
      await process(video.uri, durationMs);
    } catch {
      if (!mounted.current || discard.current) return;
      setRecording(false);
      Alert.alert('Form Check', 'Recording failed. Please try again.');
    }
  };

  const stop = () => camRef.current?.stopRecording();

  return (
    <Screen hideCredits>
      {header}
      <View style={styles.chips}>
        {FORM_EXERCISES.map((e) => {
          const on = e === exercise;
          return (
            <Pressable
              key={e}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: recording || !!busy }}
              disabled={recording || !!busy}
              onPress={() => setExercise(e)}
              style={[styles.chip, on && { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{e}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.costLine}>
        {isPremium ? 'Free with Premium' : `This check costs ${cost} credits · You have ${credits.balance}`}
      </Text>

      <View style={styles.viewfinder}>
        <CameraView
          ref={camRef}
          style={StyleSheet.absoluteFill}
          mode="video"
          facing="back"
          mute
          onCameraReady={() => setCameraReady(true)}
        />
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {recording
              ? `Recording ${seconds}s of ${MAX_RECORD_SEC}s`
              : 'Film side-on, 2–3 m away, full body in frame, good light.'}
          </Text>
        </View>
        {busy && (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.busyText}>{busy}</Text>
          </View>
        )}
      </View>

      <View style={styles.recordWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
          onPress={recording ? stop : start}
          disabled={!!busy || (!cameraReady && !recording)}
          style={[styles.ring, (!!busy || (!cameraReady && !recording)) && { opacity: 0.4 }]}
        >
          <View style={[styles.dot, recording && styles.dotStop]} />
        </Pressable>
        <Text style={styles.recordLabel}>{recording ? 'Tap to stop' : 'Tap to record your set'}</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
  lockTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 24, textAlign: 'center' },
  lockText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center', lineHeight: 22 },
  cta: { height: 60, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: 19 },
  earnBox: { alignSelf: 'stretch', borderRadius: 20, padding: 16, gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  earnTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  earnText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.bg, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.accent },
  ctaAlt: { height: 56, borderRadius: 24, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaAltText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 18 },
  costLine: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  viewfinder: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#12141b',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { position: 'absolute', left: 14, right: 14, bottom: 14, borderRadius: 16, padding: 12, backgroundColor: colors.bg },
  hintText: { color: colors.text, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  busy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,12,16,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  busyText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  recordWrap: { alignItems: 'center', gap: 8 },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent },
  dotStop: { width: 28, height: 28, borderRadius: 6 },
  recordLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
});
