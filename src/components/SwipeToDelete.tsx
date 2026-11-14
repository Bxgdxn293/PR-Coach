import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Palette } from '../theme';
import { useColors } from '../context/ThemeContext';

const THRESHOLD = 90;

/** Swipe a row to the left to delete it. Vertical scrolling and taps on inputs keep working. */
export function SwipeToDelete({
  children,
  onDelete,
  enabled = true,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const x = useRef(new Animated.Value(0)).current;
  const cb = useRef({ onDelete, enabled });
  cb.current = { onDelete, enabled };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        cb.current.enabled && g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderMove: (_e, g) => x.setValue(Math.min(0, g.dx)),
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -THRESHOLD) {
          Animated.timing(x, { toValue: -500, duration: 140, useNativeDriver: true }).start(() => {
            x.setValue(0);
            cb.current.onDelete();
          });
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;

  return (
    <View>
      <View style={styles.bg} pointerEvents="none">
        <Feather name="trash-2" size={20} color={colors.text} />
      </View>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    bg: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
      backgroundColor: colors.danger,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: 20,
    },
  });
