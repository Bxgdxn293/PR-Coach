import type { FormCheckResult } from './lib/formCheck';

// What is stored in the database (weights always in kg).
export type SavedSet = { kg: number; reps: number };
export type SavedExercise = { name: string; sets: SavedSet[] };

export type Workout = {
  id: string;
  name: string;
  started_at: string;
  duration_sec: number;
  entries: SavedExercise[];
};

// What the user edits during a workout (strings in the display unit).
export type DraftSet = {
  kg: string;
  reps: string;
  done: boolean;
  /** Rest after this set: total seconds (editable) and when it started (ms). */
  rest?: { total: number; startedAt: number };
};
export type DraftExercise = { name: string; sets: DraftSet[] };

export type Unit = 'kg' | 'lb';

export type Goal = 'Strength' | 'Muscle' | 'Fat loss';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type Profile = { goal: Goal; level: Level; days: number; focus: string[] };

export type RootStackParamList = {
  Menu: undefined;
  Workout: { exercise: string; kg: number; reps: number } | { templateId: string } | { session: { exercise: string; title: string; sets: { kg: number; reps: number; warmup?: boolean }[] } } | undefined;
  Templates: undefined;
  PrGoal: { id: string };
  PrGoalEdit: { id?: string } | undefined;
  TemplateEdit: { id?: string } | undefined;
  PRs: undefined;
  Library: undefined;
  Settings: undefined;
  Paywall: undefined;
  Onboarding: { usernameOnly?: boolean } | undefined;
  Coach: undefined;
  FormCheck: undefined;
  FormResult: { exercise: string; result: FormCheckResult; frames: string[] };
  Friends: undefined;
  FriendProfile: { friendId: string; username: string };
  AddFriend: undefined;
  Themes: undefined;
  Blocked: undefined;
  Credits: undefined;
};
