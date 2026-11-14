import React, { useMemo } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { ARM, BACK, FRONT, HEAD, LEG, NECK, TORSO, type Shape } from '../data/bodyPaths';
import { useColors } from '../context/ThemeContext';

/**
 * Front and back silhouette with the trained muscles in red (primary: solid, secondary: softer).
 * One SVG, 210 x 200 units (front 0..100, back 110..210); `height` scales it, width follows.
 */
export function MuscleMap({
  primary,
  secondary = [],
  height = 200,
  view = 'both',
}: {
  primary: string[];
  secondary?: string[];
  height?: number;
  view?: 'both' | 'front' | 'back';
}) {
  const colors = useColors();
  const base = colors.border;
  const stroke = colors.muted;
  const only = secondary.filter((m) => !primary.includes(m));
  const width = (view === 'both' ? 210 : 100) * (height / 200);

  const body = useMemo(() => {
    const mirrored = (d: string, key: string, props: object) => (
      <React.Fragment key={key}>
        <Path d={d} {...props} />
        <Path d={d} transform="translate(100,0) scale(-1,1)" {...props} />
      </React.Fragment>
    );
    const one = (table: Record<string, Shape[]>, x0: number, keyPrefix: string) => {
      const draw = (ids: string[], opacity: number) =>
        ids.flatMap((m) =>
          (table[m] ?? []).map((s, i) =>
            s.k === 'c' ? (
              <Path key={`${keyPrefix}${m}${i}${opacity}`} d={s.d} fill="url(#muscleRed)" opacity={opacity} />
            ) : (
              mirrored(s.d, `${keyPrefix}${m}${i}${opacity}`, { fill: 'url(#muscleRed)', opacity })
            ),
          ),
        );
      return (
        <G key={keyPrefix} transform={`translate(${x0},0)`}>
          <Path d={HEAD} fill={base} stroke={stroke} strokeOpacity={0.35} strokeWidth={0.6} />
          <Path d={NECK} fill={base} />
          {[TORSO, ARM, LEG].map((d, i) => mirrored(d, `${keyPrefix}b${i}`, { fill: base, stroke, strokeOpacity: 0.35, strokeWidth: 0.6 }))}
          {draw(only, 0.45)}
          {draw(primary, 1)}
        </G>
      );
    };
    return (
      <>
        {view !== 'back' && one(FRONT, 0, 'f')}
        {view !== 'front' && one(BACK, view === 'both' ? 110 : 0, 'k')}
      </>
    );
  }, [primary, only, view, base, stroke]);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${view === 'both' ? 210 : 100} 200`}
      accessibilityLabel={`Body map, trained muscles in red`}
    >
      <Defs>
        <LinearGradient id="muscleRed" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ff5a52" />
          <Stop offset="1" stopColor="#d4202c" />
        </LinearGradient>
      </Defs>
      {body}
    </Svg>
  );
}
