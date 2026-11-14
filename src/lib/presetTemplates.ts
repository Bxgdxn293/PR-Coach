import type { WorkoutTemplate } from './templates';

/**
 * Built-in templates that ship with the app. They are not stored on the device, cannot be edited or deleted and do
 * not count toward the template limit. Exercise names must match the names in src/data/exercises.ts.

 */
export const PRESET_PREFIX = 'preset-';

const P = (n: number, name: string, exercises: { name: string; sets: number; reps: number }[]): WorkoutTemplate => ({
  id: `${PRESET_PREFIX}${n}`,
  name,
  exercises,
  updated_at: '2026-01-01T00:00:00.000Z',
  preset: true,
});

export const PRESET_TEMPLATES: WorkoutTemplate[] = [
  P(1, 'Mo: Brust & Bizeps', [
    { name: 'Barbell Bench Press', sets: 3, reps: 5 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
    { name: 'Cable Fly', sets: 2, reps: 15 },
    { name: 'EZ-Bar Curl', sets: 3, reps: 12 },
    { name: 'Hammer Curl', sets: 2, reps: 8 },
  ]),
  P(2, 'Di: Rücken & Trizeps', [
    { name: 'Lat Pulldown', sets: 3, reps: 10 },
    { name: 'Seated Cable Row', sets: 3, reps: 10 },
    { name: 'Close-Grip Bench Press', sets: 3, reps: 8 },
    { name: 'Triceps Pushdown', sets: 3, reps: 10 },
    { name: 'Face Pull', sets: 2, reps: 15 },
  ]),
  P(3, 'Do: Beine', [
    { name: 'Leg Press', sets: 3, reps: 10 },
    { name: 'Seated Leg Curl', sets: 2, reps: 12 },
    { name: 'Calf Raise', sets: 2, reps: 15 },
    { name: 'Leg Extension', sets: 3, reps: 12 },
  ]),
  P(4, 'Fr: Ganzkörper', [
    { name: 'Barbell Bench Press', sets: 5, reps: 5 },
    { name: 'Push Press', sets: 3, reps: 8 },
    { name: 'Pull-Up', sets: 3, reps: 10 },
    { name: 'Dumbbell Shrug', sets: 2, reps: 8 },
    // "2 x max": the app needs a number, so reps are a target of 10; log what you really do.
    { name: 'Dip', sets: 2, reps: 10 },
    { name: 'Lateral Raise', sets: 2, reps: 15 },
  ]),
];
