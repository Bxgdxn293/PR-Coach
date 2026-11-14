import { supabase } from './supabase';
import type { ThemeId } from '../theme';

export type CreditReason = 'form_check' | 'refund' | 'weekly_bonus' | 'referral_reward' | 'gift_in' | 'gift_out';

export type LedgerEntry = {
  id: string;
  delta: number;
  reason: CreditReason | string;
  ref: string | null;
  created_at: string;
  counterparty_username: string | null;
};

export type WeeklyProgress = {
  qualifying_this_week: number;
  goal: number;
  bonus: number;
  week_start: string;
  bonus_awarded: boolean;
  qualified_today: boolean;
};

export type CreditsData = {
  balance: number;
  history: LedgerEntry[];
  weekly_progress: WeeklyProgress;
  streak_weeks: number;
  theme_streak_weeks: number;
  theme: string;
  theme_unlocked: string[];
  invite_code: string | null;
  username: string | null;
  referral: { redeemed: boolean; rewarded_count_30d: number };
};

export type AppConfig = {
  weekly_goal: number;
  weekly_bonus: number;
  theme_blue_weeks: number;
  theme_red_weeks: number;
  theme_purple_weeks: number;
  theme_gold_bench_kg: number;
  theme_min_duration_sec: number;
  form_check_cost: number;
  qualify_min_duration_sec: number;
  qualify_min_sets: number;
  invite_reward: number;
  invite_redeem_window_days: number;
  invite_reward_window_days: number;
  invite_reward_workouts: number;
  invite_max_rewards_30d: number;
  gift_min: number;
  gift_max: number;
  gift_max_per_24h: number;
};

/** Fallback only, used until app_config() has answered (e.g. offline). The server values win. */
export const DEFAULT_CONFIG: AppConfig = {
  weekly_goal: 3,
  weekly_bonus: 10,
  theme_blue_weeks: 4,
  theme_red_weeks: 26,
  theme_purple_weeks: 52,
  theme_gold_bench_kg: 100,
  theme_min_duration_sec: 1800,
  form_check_cost: 20,
  qualify_min_duration_sec: 1200,
  qualify_min_sets: 3,
  invite_reward: 400,
  invite_redeem_window_days: 7,
  invite_reward_window_days: 14,
  invite_reward_workouts: 3,
  invite_max_rewards_30d: 5,
  gift_min: 1,
  gift_max: 20,
  gift_max_per_24h: 20,
};

export type CreditResult<T> = ({ ok: true } & T) | { ok: false; error: string };

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<CreditResult<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) return { ok: false, error: error.message?.includes('not_authenticated') ? 'not_authenticated' : 'network' };
    const body = data as { ok?: boolean; error?: string } | null;
    if (!body || typeof body !== 'object') return { ok: false, error: 'unknown' };
    if (body.ok === false) return { ok: false, error: typeof body.error === 'string' ? body.error : 'unknown' };
    return body as { ok: true } & T;
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const fetchMyCredits = () => call<CreditsData>('my_credits');
export const fetchAppConfig = () => call<AppConfig>('app_config');
export const rpcSetUsername = (username: string) => call<{ username: string }>('set_username', { username });
export const rpcSetTheme = (theme: ThemeId) => call<{ theme: string }>('set_theme', { theme });
export const rpcRedeemInvite = (code: string) =>
  call<{ inviter_id: string; inviter_username: string | null }>('redeem_invite', { code });

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Readable message for a business error code of set_username / redeem_invite / set_theme. */
export function describeCreditError(code: string): string {
  switch (code) {
    case 'invalid_username':
      return 'Use 3 to 20 characters: letters, numbers and underscore.';
    case 'username_taken':
      return 'This username is already taken.';
    case 'too_many_attempts':
      return 'Too many attempts. Please try again later.';
    case 'theme_locked':
      return 'This theme is not unlocked yet.';
    case 'already_redeemed':
      return 'You already used an invite code.';
    case 'invite_window_expired':
      return 'This code can only be used in the first days after sign-up.';
    case 'invalid_code':
      return 'This invite code is not valid.';
    case 'own_code':
      return 'You cannot use your own invite code.';
    case 'mutual_invite':
      return 'This person was invited by you, so the code cannot be used.';
    case 'not_authenticated':
      return 'Please sign in again.';
    case 'network':
      return 'No connection. Check your internet and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function describeReason(e: Pick<LedgerEntry, 'reason' | 'counterparty_username'>): string {
  const name = e.counterparty_username ? `@${e.counterparty_username}` : 'a friend';
  switch (e.reason) {
    case 'form_check':
      return 'Form Check';
    case 'refund':
      return 'Form Check refund';
    case 'weekly_bonus':
      return 'Weekly goal bonus';
    case 'referral_reward':
      return 'Invite reward';
    case 'gift_in':
      return `Gift from ${name}`;
    case 'gift_out':
      return `Gift to ${name}`;
    default:
      return 'Credits';
  }
}
