import React from 'react';
import { Pressable } from 'react-native';
import { MuscleMap } from './MuscleMap';
import { EXERCISE_INFO } from '../data/exerciseInfo';

import { tr } from '../lib/i18n';
/** Small front+back body map for an exercise; tapping it opens the how-to. Renders nothing without data. */
export function ExerciseMini({ name, onPress, height = 52 }: { name: string; onPress?: () => void; height?: number }) {
  const info = EXERCISE_INFO[name];
  if (!info) return null;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("How to do {0}, muscles worked", [name])}
      hitSlop={6}
    >
      <MuscleMap primary={info.p} secondary={info.s} height={height} />
    </Pressable>
  );
}
