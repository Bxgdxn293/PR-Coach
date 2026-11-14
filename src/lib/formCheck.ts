import * as VideoThumbnails from 'expo-video-thumbnails';
import { supabase } from './supabase';

import { tr } from './i18n';
export const FORM_EXERCISES = ['Squat', 'Bench', 'Deadlift', 'Press'] as const;
export type FormExercise = (typeof FORM_EXERCISES)[number];

export type FormCheckItem = {
  area: string;
  status: 'good' | 'issue';
  note: string;
  frame: number | null;
};

export type FormCheckResult = {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  summary: string;
  items: FormCheckItem[];
  safety: string | null;
};

export const MIN_RECORD_MS = 3000;
export const MAX_RECORD_SEC = 25;
const FRAME_COUNT = 5;

export class FormCheckError extends Error {
  code: string;
  needed?: number;
  balance?: number;
  constructor(code: string, extra?: { needed?: number; balance?: number }) {
    super(code);
    this.code = code;
    this.needed = extra?.needed;
    this.balance = extra?.balance;
  }
}

export function describeError(e: unknown): string {
  const code = e instanceof FormCheckError ? e.code : 'unknown';
  switch (code) {
    case 'premium_required':
      return tr("Form Check needs credits or Premium.");
    case 'insufficient_credits': {
      const err = e as FormCheckError;
      return err.needed !== undefined && err.balance !== undefined
        ? tr("Not enough credits: this check costs {0} and you have {1}.", [err.needed, err.balance])
        : tr("Not enough credits for a Form Check.");
    }
    case 'timeout':
      return tr("The analysis took too long. Your credits were refunded; please try again.");
    case 'internal':
      return tr("Something went wrong on our side. Any credits were refunded; please try again.");
    case 'daily_limit':
      return tr("You reached today’s Form Check limit. Try again tomorrow.");
    case 'bad_frames':
    case 'too_large':
      return tr("The video frames could not be processed. Try a shorter recording.");
    case 'upstream_error':
    case 'upstream_unreachable':
    case 'unreadable_answer':
      return tr("The analysis service did not answer. Please try again in a moment.");
    case 'not_configured':
      return tr("Form Check is not set up on the server yet.");
    default:
      return tr("Something went wrong. Check your connection and try again.");
  }
}

async function uriToBase64(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const s = String(reader.result);
      resolve(s.slice(s.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Evenly spaced still frames from the recorded set.
export async function extractFrames(videoUri: string, durationMs: number): Promise<string[]> {
  const uris: string[] = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    // The wall-clock duration is slightly longer than the real clip (camera start/stop latency): keep a safety margin.
    const usable = Math.max(1000, durationMs - 800);
    const time = Math.round((usable * (i + 0.5)) / FRAME_COUNT);
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time, quality: 0.35 });
    uris.push(uri);
  }
  return uris;
}

export async function analyse(exercise: FormExercise, frameUris: string[]): Promise<FormCheckResult> {
  const frames = await Promise.all(frameUris.map(uriToBase64));
  const { data, error } = await supabase.functions.invoke('form-check', {
    body: { exercise, frames, lang: 'en' },
  });
  if (error) {
    let code = 'unknown';
    let extra: { needed?: number; balance?: number } | undefined;
    try {
      const body = await (error as any).context.json();
      if (typeof body?.error === 'string') code = body.error;
      if (typeof body?.needed === 'number' || typeof body?.balance === 'number') {
        extra = { needed: body.needed, balance: body.balance };
      }
    } catch {
      // network failure: keep "unknown"
    }
    throw new FormCheckError(code, extra);
  }
  return data as FormCheckResult;
}
