import { supabase } from './supabase';

// ---- Types (see supabase/CONTRACT.md) ----

export type TopLift = { name: string; kg: number; reps: number };

export type Friend = {
  id: string;
  username: string | null;
  theme: string;
  share_enabled: boolean;
  streak_weeks: number;
  /** null when the friend does not share. */
  qualifying_this_week: number | null;
  total_workouts: number | null;
  last_workout_at: string | null;
  top_lifts: TopLift[] | null;
};

export type FriendRequest = { id: string; user_id: string; username: string | null; created_at: string };
export type BlockedUser = { id: string; username: string | null; created_at: string };

export type FriendWorkout = {
  id: string;
  name: string;
  started_at: string;
  duration_sec: number;
  entries: { name: string; sets: { kg: number; reps: number }[] }[];
  qualifying: boolean;
};

export type MyCredits = {
  balance: number;
  streak_weeks: number;
  theme: string;
  invite_code: string | null;
  username: string | null;
};

export type SocialFailure = {
  ok: false;
  /** Raw error code from the server (or 'network' / 'unknown'). */
  error: string;
  /** Human readable English text, safe to show. */
  message: string;
  /** Extra fields of the server answer (needed, balance, remaining_24h ...). */
  extra: Record<string, unknown>;
};
export type SocialResult<T> = ({ ok: true } & T) | SocialFailure;

// ---- Error texts ----

const ERRORS: Record<string, string> = {
  username_required: 'Set your own username first (Settings), then you can add friends.',
  user_not_found: 'No user found with that name or code.',
  cannot_add_self: "That's you. Try a friend's username.",
  already_friends: 'You are already friends.',
  already_requested: 'You already sent a request to this person.',
  user_blocked: 'You blocked this person. Unblock them first.',
  rate_limited: 'Too many requests today. Try again tomorrow.',
  too_many_attempts: 'Too many attempts. Please wait a while and try again.',
  request_not_found: 'This request no longer exists.',
  cannot_block_self: "You can't block yourself.",
  cannot_report_self: "You can't report yourself.",
  not_friends: 'You are not friends with this person.',
  sharing_disabled: 'This friend is not sharing their workouts.',
  invalid_amount: 'Choose an amount between 1 and 20.',
  cannot_gift_self: "You can't send credits to yourself.",
  gift_limit_reached: 'Daily gift limit reached.',
  insufficient_credits: 'Not enough credits.',
  invalid_code: 'That invite code is not valid.',
  already_redeemed: 'You already used an invite code.',
  invite_window_expired: 'This invite code can no longer be used.',
  own_code: "That's your own invite code.",
  mutual_invite: "You can't use this code.",
  not_authenticated: 'Please sign in again.',
  network: 'Network problem. Check your connection and try again.',
  unknown: 'Something went wrong. Please try again.',
};

export function errorText(code: string, extra: Record<string, unknown> = {}): string {
  if (code === 'gift_limit_reached' && typeof extra.remaining_24h === 'number') {
    return extra.remaining_24h > 0
      ? `Daily gift limit reached. You can still send ${extra.remaining_24h} credits today.`
      : 'Daily gift limit reached. Try again tomorrow.';
  }
  if (code === 'insufficient_credits' && typeof extra.balance === 'number') {
    return `Not enough credits (you have ${extra.balance}).`;
  }
  return ERRORS[code] ?? ERRORS.unknown;
}

function fail(code: string, extra: Record<string, unknown> = {}): SocialFailure {
  return { ok: false, error: code, message: errorText(code, extra), extra };
}

/** Business errors come back as a result, never as an exception. */
async function call<T extends object>(fn: string, args?: Record<string, unknown>): Promise<SocialResult<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('not_authenticated')) return fail('not_authenticated');
      if (msg.includes('fetch') || msg.includes('network')) return fail('network');
      return fail('unknown');
    }
    const d = (data ?? null) as Record<string, unknown> | null;
    if (!d || typeof d !== 'object') return fail('unknown');
    if (d.ok === false) {
      const { ok: _ok, error: code, ...extra } = d;
      return fail(typeof code === 'string' ? code : 'unknown', extra);
    }
    return d as unknown as { ok: true } & T;
  } catch {
    return fail('network');
  }
}

// ---- Wrappers ----

export const listFriends = () => call<{ friends: Friend[] }>('list_friends');
export const listFriendRequests = () =>
  call<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>('list_friend_requests');
export const sendFriendRequest = (username: string) =>
  call<{ status: 'pending' | 'accepted'; request_id?: string }>('send_friend_request', { username });
export const respondFriendRequest = (requestId: string, accept: boolean) =>
  call<{ status: 'accepted' | 'declined' }>('respond_friend_request', { request_id: requestId, accept });
export const removeFriend = (friend: string) => call<{ removed: boolean }>('remove_friend', { friend });
export const friendWorkouts = (friend: string, lim = 20) =>
  call<{ workouts: FriendWorkout[] }>('friend_workouts', { friend, lim });
export const blockUser = (target: string) => call<{}>('block_user', { target });
export type ReportReason = 'spam' | 'abuse' | 'inappropriate_name' | 'other';
export const reportUser = (target: string, reason: ReportReason, note?: string) =>
  call<{}>('report_user', { target, reason, note: note ?? null });
export const unblockUser = (target: string) => call<{}>('unblock_user', { target });
export const listBlocked = () => call<{ blocked: BlockedUser[] }>('list_blocked');
export const setSharing = (enabled: boolean) => call<{ share_enabled: boolean }>('set_sharing', { enabled });
export const giftCredits = (friend: string, amount: number) =>
  call<{ balance: number; remaining_24h: number }>('gift_credits', { friend, amount });
export const myCredits = () => call<MyCredits>('my_credits');

/** Own sharing flag (direct select on the own profiles row). Returns null if unknown. */
export async function getOwnSharing(userId: string): Promise<boolean | null> {
  try {
    const { data, error } = await supabase.from('profiles').select('share_enabled').eq('id', userId).maybeSingle();
    if (error || !data) return null;
    return !!(data as { share_enabled: boolean }).share_enabled;
  } catch {
    return null;
  }
}

// ---- Helpers ----

export function timeAgo(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'No workouts yet';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 'No workouts yet';
  const min = Math.floor(Math.max(0, now - t) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.floor(d / 7)} weeks ago`;
  return `${Math.floor(d / 30)} months ago`;
}

export function sortFriends(list: Friend[]): Friend[] {
  return [...list].sort((a, b) => {
    if (b.streak_weeks !== a.streak_weeks) return b.streak_weeks - a.streak_weeks;
    const ta = a.last_workout_at ? new Date(a.last_workout_at).getTime() : 0;
    const tb = b.last_workout_at ? new Date(b.last_workout_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return (a.username ?? '').localeCompare(b.username ?? '');
  });
}

export const redeemInvite = (code: string) =>
  call<{ inviter_id: string; inviter_username: string | null }>('redeem_invite', { code });

/** Invite codes: 8 chars from A-H J K M N P-Z 2-9 (no I, L, O, 0, 1). */
export const looksLikeInviteCode = (s: string) => /^[A-HJKMNP-Z2-9]{8}$/i.test(s.trim());
