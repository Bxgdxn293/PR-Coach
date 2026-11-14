import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** One free-text note per exercise (seat height, grip, cues). Stored on this device only. */
const KEY = 'exercise.notes.v1';
export const NOTE_MAX = 300;

export type NoteMap = Record<string, string>;

export function setNote(map: NoteMap, exercise: string, text: string): NoteMap {
  const clean = text.slice(0, NOTE_MAX);
  const next = { ...map };
  if (clean.trim() === '') delete next[exercise];
  else next[exercise] = clean;
  return next;
}

export function useExerciseNotes() {
  const [notes, setNotes] = useState<NoteMap>({});
  const ref = useRef<NoteMap>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          if (parsed && typeof parsed === 'object') {
            // keep anything typed while loading
            ref.current = { ...parsed, ...ref.current };
            setNotes(ref.current);
          }
        } catch {
          /* ignore broken data */
        }
        loadedRef.current = true;
      })
      .catch(() => {
        loadedRef.current = true;
      });
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((exercise: string, text: string) => {
    ref.current = setNote(ref.current, exercise, text);
    setNotes(ref.current);
  }, []);

  /** Write to storage (call on blur / when leaving the screen). */
  const persist = useCallback(async () => {
    if (!loadedRef.current) return;
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(ref.current));
    } catch {
      /* best effort */
    }
  }, []);

  return { notes, update, persist };
}
