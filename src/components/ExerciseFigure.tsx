import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { buildFrame, COL, easeLoop, figureBox } from '../lib/figure';
import { patternFor } from '../lib/figurePatterns';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

import { tr } from '../lib/i18n';
/** Looping animation of an exercise (drawn figure, not a video) with the trained muscles in red. */
export function ExerciseFigure({
  name,
  primary,
  secondary,
  height = 250,
}: {
  name: string;
  primary: string[];
  secondary: string[];
  height?: number;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const pat = useMemo(() => patternFor(name), [name]);
  const box = useMemo(() => figureBox(pat), [pat]);
  const [t, setT] = useState(0);
  const [reduce, setReduce] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduce) return;
    const ms = pat.ms ?? 3200;
    const t0 = Date.now();
    let last = 0;
    const tick = () => {
      const now = Date.now();
      if (now - last >= 33) {
        last = now;
        setT(((now - t0) % ms) / ms);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [pat, reduce]);

  // reduced motion: show the end of the movement as a still pose
  const s = reduce ? 1 : easeLoop(t);
  const frame = useMemo(() => buildFrame(pat, s, primary, secondary), [pat, s, primary, secondary]);
  const [vx, vy, vw, vh] = box.split(' ').map(Number);
  const width = height * (vw / vh);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={tr("{0}: animated movement. Trained muscles are shown in red.", [name])}
    >
      <Svg width={width} height={height} viewBox={box}>
        <Defs>
          <LinearGradient id="fgSkin" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COL.skinA} />
            <Stop offset="1" stopColor={COL.skinB} />
          </LinearGradient>
          <LinearGradient id="fgHi" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COL.hi1} />
            <Stop offset="1" stopColor={COL.hi2} />
          </LinearGradient>
        </Defs>
        {frame.prims.map((p, i) =>
          p.t === 'path' ? (
            <Path key={i} d={p.d} fill={p.f} fillOpacity={p.o} stroke={p.s} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.f} fillOpacity={p.o} stroke={p.s} strokeWidth={p.sw} />
          ),
        )}
      </Svg>
      <Text style={styles.note}>{tr("Loop animation, not a video")}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: 6 },
    note: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1 },
  });
