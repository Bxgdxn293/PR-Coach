import React, { useEffect } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Motion of the secret "Shadow" theme: a slowly flowing gradient of black and dark blue, no shapes.
 * The screen background and every GlowPressable button use the same gradient (each button is offset in time).
 * On the web (the PWA) this is a CSS gradient animation; on native it falls back to a colour fade.
 */
const GRADIENT = 'linear-gradient(135deg,#010308 0%,#0a2a66 28%,#02060f 52%,#0d3a8a 76%,#010308 100%)';

let cssInjected = false;
function ensureCss() {
  if (cssInjected || Platform.OS !== 'web' || typeof document === 'undefined') return;
  cssInjected = true;
  const el = document.createElement('style');
  el.textContent =
    '@keyframes shadowFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
    '[data-shadow="bg"]{background-image:' + GRADIENT + ' !important;background-size:400% 400% !important;animation:shadowFlow 14s ease-in-out infinite}';
  document.head.appendChild(el);
}

// native fallback only
const fade = new Animated.Value(0);
let users = 0;
let running: Animated.CompositeAnimation | null = null;
function acquire() {
  users += 1;
  if (running || Platform.OS === 'web') return;
  running = Animated.loop(
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(fade, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]),
  );
  running.start();
}
function release() {
  users = Math.max(0, users - 1);
  if (users === 0 && running) {
    running.stop();
    running = null;
  }
}

export function ShadowBackdrop() {
  useEffect(() => {
    ensureCss();
    acquire();
    let prev = '';
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      prev = document.documentElement.style.backgroundColor;
      document.documentElement.style.backgroundColor = '#02060f';
      document.body.style.backgroundColor = '#02060f';
    }
    return () => {
      release();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.style.backgroundColor = prev;
        document.body.style.backgroundColor = prev;
      }
    };
  }, []);
  if (Platform.OS === 'web') {
    // fixed + html colour: the gradient also fills the strip under the page (home-indicator area on an iPhone)
    return (
      <View
        pointerEvents="none"
        {...({ dataSet: { shadow: 'bg' } } as any)}
        style={[{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#02060f' } as any]}
      />
    );
  }
  const bg = fade.interpolate({ inputRange: [0, 1], outputRange: ['#010308', '#0a2250'] });
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />;
}

/** Pressable that carries the animated gradient in the Shadow theme; a plain Pressable in every other theme. */
export function GlowPressable({ phase = 0, keepFill = false, style, ...rest }: PressableProps & { phase?: number; keepFill?: boolean; style?: StyleProp<ViewStyle> }) {
  const { themeId } = useTheme();
  const on = themeId === 'shadow';
  useEffect(() => {
    if (!on) return;
    ensureCss();
  }, [on]);
  if (!on) return <Pressable {...rest} style={style} />;
  return (
    <Pressable
      {...rest}
      style={(state) => [
        typeof style === 'function' ? (style as any)(state) : style,
        keepFill ? { borderWidth: 1, borderColor: '#1b3a73' } : ({ backgroundColor: '#0b1d3f', borderWidth: 1, borderColor: '#1b3a73' } as any),
      ]}
    />
  );
}
