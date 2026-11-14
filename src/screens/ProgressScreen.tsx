import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { e1rmHistory } from '../lib/coach';
import { startOfWeek } from '../lib/dates';
import { toDisplay } from '../lib/units';
import { fonts, type Palette } from '../theme';
import { useColors } from '../context/ThemeContext';
import { tr, dateLocale } from '../lib/i18n';

const WEEKS = 8;
const CHART_H = 150;
const PAD = 10;

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' });

export function ProgressScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { workouts } = useData();
  const { unit } = useSettings();
  const [width, setWidth] = useState(300);
  const [picked, setPicked] = useState<string | null>(null);
  const [selWeek, setSelWeek] = useState<number | null>(null);
  const [selDot, setSelDot] = useState<number | null>(null);

  // Lifts with logged sets, most trained first.
  const lifts = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach((w) => w.entries.forEach((e) => names.add(e.name)));
    return [...names]
      .map((n) => ({ name: n, points: e1rmHistory(n, workouts) }))
      .filter((l) => l.points.length > 0)
      .sort((a, b) => b.points.length - a.points.length);
  }, [workouts]);

  const lift = lifts.find((l) => l.name === picked) ?? lifts[0];

  const weekly = useMemo(() => {
    const start = startOfWeek();
    const buckets = Array.from({ length: WEEKS }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - 7 * (WEEKS - 1 - i));
      return { from: d.getTime(), count: 0 };
    });
    for (const w of workouts) {
      const t = new Date(w.started_at).getTime();
      for (let i = WEEKS - 1; i >= 0; i--) {
        if (t >= buckets[i].from) {
          buckets[i].count += 1;
          break;
        }
      }
    }
    return buckets;
  }, [workouts]);

  const last30 = workouts.filter((w) => Date.now() - new Date(w.started_at).getTime() <= 30 * 86_400_000).length;
  const maxWeek = Math.max(1, ...weekly.map((b) => b.count));

  const chartW = Math.max(120, width);
  const innerW = chartW - PAD * 2;
  const innerH = CHART_H - PAD * 2;

  let linePath = '';
  let dots: { x: number; y: number }[] = [];
  let lo = 0;
  let hi = 0;
  if (lift) {
    const vals = lift.points.map((p) => toDisplay(p.e1rm, unit));
    lo = Math.min(...vals);
    hi = Math.max(...vals);
    const span = hi - lo || 1;
    dots = vals.map((v, i) => ({
      x: PAD + (vals.length === 1 ? innerW / 2 : (i / (vals.length - 1)) * innerW),
      y: PAD + innerH - ((v - lo) / span) * innerH,
    }));
    linePath = dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x.toFixed(1)} ${d.y.toFixed(1)}`).join(' ');
  }
  const first = lift ? toDisplay(lift.points[0].e1rm, unit) : 0;
  const now = lift ? toDisplay(lift.points[lift.points.length - 1].e1rm, unit) : 0;
  const diff = Math.round((now - first) * 10) / 10;

  return (
    <Screen>
      <Header title={tr("Progress")} />
      {workouts.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="trending-up" size={40} color={colors.muted} />
          <Text style={styles.emptyText}>{tr("Finish a few workouts and your progress shows up here.")}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 16 }}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{workouts.length}</Text>
              <Text style={styles.statLabel}>{tr("Workouts")}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{last30}</Text>
              <Text style={styles.statLabel}>{tr("Last 30 days")}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{tr("Workouts per week")}</Text>
            <View style={styles.bars}>
              {weekly.map((b, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={tr("Week of {0}: {1} workout(s)", [shortDate(new Date(b.from).toISOString()), b.count])}
                  onPress={() => setSelWeek(selWeek === i ? null : i)}
                  style={styles.barCol}
                >
                  <Text style={styles.barNum}>{b.count > 0 ? b.count : ''}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${Math.max(b.count > 0 ? 8 : 0, (b.count / maxWeek) * 100)}%` }, selWeek === i && styles.barSel]} />
                  </View>
                  <Text style={[styles.barLabel, selWeek === i && { color: colors.text }]}>{new Date(b.from).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'numeric' })}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.detail}>
              {selWeek === null ? tr("Tap a bar or a point for details") : tr("Week of {0}: {1} workout(s)", [shortDate(new Date(weekly[selWeek].from).toISOString()), weekly[selWeek].count])}
            </Text>
          </View>

          {lift && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{tr("Strength progress")}</Text>
              <Text style={styles.cardSub}>{tr("Best set per workout, estimated 1RM")} ({unit})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {lifts.map((l) => {
                  const on = l.name === lift.name;
                  return (
                    <Pressable
                      key={l.name}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() => {
                        setPicked(l.name);
                        setSelDot(null);
                      }}
                      style={[styles.chip, on && { backgroundColor: colors.accent }]}
                    >
                      <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{tr(l.name)}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: CHART_H }}>
                <Svg width={chartW} height={CHART_H}>
                  <Rect x={0} y={0} width={chartW} height={CHART_H} fill="none" />
                  <Line x1={PAD} y1={PAD} x2={chartW - PAD} y2={PAD} stroke={colors.border} strokeWidth={1} />
                  <Line x1={PAD} y1={CHART_H - PAD} x2={chartW - PAD} y2={CHART_H - PAD} stroke={colors.border} strokeWidth={1} />
                  {dots.length > 1 && <Path d={linePath} stroke={colors.accent} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
                  {dots.map((d, i) => (
                    <Circle key={i} cx={d.x} cy={d.y} r={selDot === i ? 8 : i === dots.length - 1 ? 6 : 4} fill={colors.accent} stroke={selDot === i ? colors.text : 'none'} strokeWidth={2} />
                  ))}
                </Svg>
                <Text style={[styles.axis, { top: 0, right: 0 }]}>{hi}</Text>
                <Text style={[styles.axis, { bottom: 0, right: 0 }]}>{lo}</Text>
                {dots.map((d, i) => (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`${shortDate(lift.points[i].date)}: ${toDisplay(lift.points[i].e1rm, unit)} ${unit}`}
                    onPress={() => setSelDot(selDot === i ? null : i)}
                    style={{ position: 'absolute', left: d.x - 16, top: d.y - 16, width: 32, height: 32 }}
                  />
                ))}
              </View>
              <Text style={styles.detail}>
                {selDot === null || !lift.points[selDot]
                  ? tr("Tap a bar or a point for details")
                  : `${shortDate(lift.points[selDot].date)} · ${toDisplay(lift.points[selDot].e1rm, unit)} ${unit} · ${toDisplay(lift.points[selDot].topKg, unit)} ${unit} ${tr("top set")}`}
              </Text>
              <View style={styles.axisRow}>
                <Text style={styles.axisText}>{shortDate(lift.points[0].date)}</Text>
                <Text style={styles.axisText}>{shortDate(lift.points[lift.points.length - 1].date)}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statSmall}>
                  <Text style={styles.statLabel}>{tr("Start")}</Text>
                  <Text style={styles.statValueSmall}>{first} {unit}</Text>
                </View>
                <View style={styles.statSmall}>
                  <Text style={styles.statLabel}>{tr("Now")}</Text>
                  <Text style={styles.statValueSmall}>{now} {unit}</Text>
                </View>
                <View style={styles.statSmall}>
                  <Text style={styles.statLabel}>{tr("Change")}</Text>
                  <Text style={[styles.statValueSmall, { color: diff >= 0 ? colors.accent : colors.text }]}>{diff > 0 ? '+' : ''}{diff} {unit}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
    emptyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: 12 },
    stat: { flex: 1, borderRadius: 24, padding: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    statSmall: { flex: 1, gap: 2 },
    statValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 32 },
    statValueSmall: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
    statLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    card: { borderRadius: 24, padding: 16, gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
    cardSub: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 },
    barCol: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    barNum: { color: colors.text, fontFamily: fonts.bold, fontSize: 12, height: 16 },
    barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
    barSel: { opacity: 1, borderWidth: 2, borderColor: colors.text },
    detail: { color: colors.text, fontFamily: fonts.medium, fontSize: 14, textAlign: 'center' },
    barFill: { width: '100%', borderRadius: 8, backgroundColor: colors.accent },
    barLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10 },
    chips: { gap: 8 },
    chip: {
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
    axis: { position: 'absolute', color: colors.muted, fontFamily: fonts.medium, fontSize: 11 },
    axisRow: { flexDirection: 'row', justifyContent: 'space-between' },
    axisText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  });
