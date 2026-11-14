-- Run this once in the Supabase SQL editor (Project > SQL Editor).

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  is_premium boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  started_at timestamptz not null,
  duration_sec int not null check (duration_sec >= 0),
  -- [{ "name": "Bench Press", "sets": [{ "kg": 80, "reps": 8 }] }]  (weights always stored in kg)
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array' and pg_column_size(entries) < 200000),
  created_at timestamptz not null default now()
);

create index workouts_user_started_idx on public.workouts (user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;

-- Users may read their own profile, but never write it (only the webhook with the service role does).
create policy "own profile read" on public.profiles for select using (id = auth.uid());

-- Defense in depth: even if a policy is added by mistake, clients cannot write profiles.
revoke insert, update, delete on public.profiles from anon, authenticated;

create policy "own workouts read" on public.workouts for select using (user_id = auth.uid());
create policy "own workouts insert" on public.workouts for insert with check (user_id = auth.uid());
create policy "own workouts delete" on public.workouts for delete using (user_id = auth.uid());

-- Create a profile row for every new user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Free plan limit enforced on the server: max 3 workouts per calendar week (UTC week, Monday start).
create function public.enforce_free_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  premium boolean;
  used int;
begin
  select coalesce(p.is_premium, false) into premium from public.profiles p where p.id = new.user_id;
  if premium then
    return new;
  end if;
  -- serialize concurrent inserts of one user so parallel requests cannot exceed the limit
  perform pg_advisory_xact_lock(hashtext('workouts:' || new.user_id::text));
  -- count by server time (created_at), not by the client-supplied started_at, so back-dating cannot bypass the limit
  select count(*) into used from public.workouts w
   where w.user_id = new.user_id and w.created_at >= date_trunc('week', now());
  if used >= 3 then
    raise exception 'free_limit_reached';
  end if;
  return new;
end;
$$;

create trigger workouts_free_limit before insert on public.workouts
for each row execute function public.enforce_free_limit();

-- Account deletion (required by Apple for apps that let users create accounts).
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ============================================================================
-- Added for Form Check and PR Coach
-- ============================================================================

-- Personal profile used by the PR Coach (goal, level, schedule, lifts to improve).
create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  goal text not null check (goal in ('Strength', 'Muscle', 'Fat loss')),
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  days int not null check (days between 1 and 7),
  focus text[] not null default '{}' check (cardinality(focus) <= 20),
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "own settings read" on public.user_settings for select using (user_id = auth.uid());
create policy "own settings insert" on public.user_settings for insert with check (user_id = auth.uid());
create policy "own settings update" on public.user_settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- One row per Form Check request. Used for the daily limit; written only by the Edge Function (service role).
create table public.form_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  exercise text not null,
  created_at timestamptz not null default now(),
  result jsonb
);
create index form_checks_user_created_idx on public.form_checks (user_id, created_at desc);
alter table public.form_checks enable row level security;
create policy "own form checks read" on public.form_checks for select using (user_id = auth.uid());
-- no insert/update/delete policies: only the service role can write.

-- Atomic daily-limit check + claim (race-safe). Callable only by the service role (Edge Function).
create function public.claim_form_check(p_user uuid, p_exercise text, p_limit int) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  used int;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('form_check:' || p_user::text));
  select count(*) into used from public.form_checks
   where user_id = p_user and created_at >= now() - interval '24 hours';
  if used >= p_limit then
    return null;
  end if;
  insert into public.form_checks (user_id, exercise) values (p_user, p_exercise) returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.claim_form_check(uuid, text, int) from public, anon, authenticated;
grant execute on function public.claim_form_check(uuid, text, int) to service_role;

revoke insert, update, delete on public.form_checks from anon, authenticated;

-- ============================================================================
-- MIGRATION 2: credits, qualifying workouts, weekly bonus, friends, invites,
--              themes, gifting, Form Check credits.
--
-- * Idempotent: safe to run repeatedly in the Supabase SQL editor, on top of the
--   schema above. (The part ABOVE this line is the original run-once schema.)
-- * All writes to credits / friends / profile extras go through SECURITY DEFINER
--   functions. Clients get no INSERT/UPDATE/DELETE on any of these tables.
-- * HONEST LIMITS: duration_sec, sets, weights and started_at are reported by the
--   client. The server can only check plausibility (see rules below); it cannot
--   prove that someone really was in a gym. Credits are therefore "hard to farm
--   by accident", not "impossible to farm by a determined cheater".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CONSTANTS - the single place to tune product rules. Everything below calls
-- public._const('NAME'). Changing a value here and re-running this migration
-- is enough (the Form Check cost is read from here too, see spend_credits).
-- ----------------------------------------------------------------------------
create or replace function public._const(k text) returns int
language plpgsql immutable set search_path = '' as $$
declare v int;
begin
  v := case k
    -- qualifying workout ("gym visit")
    when 'QUALIFY_MIN_DURATION_SEC'     then 1200   -- >= 20 min
    when 'QUALIFY_MAX_DURATION_SEC'     then 21600  -- <= 6 h
    when 'QUALIFY_MIN_SETS'             then 3
    when 'QUALIFY_MAX_AGE_HOURS'        then 36     -- started_at must be at most this old when inserted
    when 'QUALIFY_FUTURE_TOLERANCE_MIN' then 5      -- clock skew tolerance (started_at and end time)
    -- weekly goal / bonus / theme
    when 'WEEKLY_GOAL'                  then 3      -- qualifying workouts per UTC ISO week
    when 'WEEKLY_BONUS'                 then 10     -- credits, once per week
    when 'THEME_MIN_DURATION_SEC'       then 1800   -- >= 30 min: only these workouts count towards theme streaks
    when 'THEME_BLUE_WEEKS'             then 4      -- consecutive goal weeks (3 x >= 30 min) to unlock theme 'blue'
    when 'THEME_RED_WEEKS'              then 26     -- consecutive goal weeks (3 x >= 30 min, no gap) to unlock theme 'red'
    when 'THEME_PURPLE_WEEKS'           then 52     -- consecutive goal weeks (3 x >= 30 min, no gap) = one year, to unlock theme 'purple'
    when 'THEME_GOLD_BENCH_KG'          then 100    -- Barbell Bench Press, 1 rep or more at this weight, to unlock theme 'gold'
    -- invitations
    when 'INVITE_REDEEM_WINDOW_DAYS'    then 7      -- redeem within N days after account creation
    when 'INVITE_REWARD_WINDOW_DAYS'    then 14     -- invitee must reach the target within N days after account creation
    when 'INVITE_REWARD_WORKOUTS'       then 3      -- qualifying workouts in that window
    when 'INVITE_REWARD'                then 400    -- credits for the inviter, once per invitee
    when 'INVITE_MAX_REWARDS_30D'       then 5      -- rewarded invitations per inviter, rolling 30 days
    -- gifting
    when 'GIFT_MIN'                     then 1
    when 'GIFT_MAX'                     then 20
    when 'GIFT_MAX_PER_24H'             then 20     -- per sender
    -- spending
    when 'FORM_CHECK_COST'              then 20
    -- abuse limits
    when 'FRIEND_REQUESTS_PER_24H'      then 20
    when 'LOOKUP_FAILS_PER_HOUR'        then 30     -- failed username / invite-code lookups per user
    -- limits of returned data
    when 'TOP_LIFTS_MAX'                then 4
    when 'FRIEND_WORKOUTS_MAX'          then 50
    else null end;
  if v is null then raise exception 'unknown_constant: %', k; end if;
  return v;
end;
$$;

-- ----------------------------------------------------------------------------
-- Profile extras
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists username text,
  add column if not exists invite_code text,
  add column if not exists referred_by uuid references auth.users on delete set null,
  add column if not exists referred_at timestamptz,            -- set when a code was redeemed (even if the inviter is deleted later)
  add column if not exists share_enabled boolean not null default false,   -- opt-in: friends see nothing until set_sharing(true)
  add column if not exists theme text not null default 'lime',
  add column if not exists theme_unlocked text[] not null default '{lime}';

-- 8 characters from an alphabet without look-alikes (no I, L, O, 0, 1). Uses the strong RNG behind gen_random_uuid().
create or replace function public._gen_invite_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- 31 characters
  idx constant int[] := array[0,1,2,3,4,5,7,9];                 -- skip uuid bytes 6 and 8 (fixed version/variant bits)
  b bytea;
  code text;
  i int;
begin
  loop
    b := uuid_send(gen_random_uuid());
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, (get_byte(b, idx[i]) % 31) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.profiles p where p.invite_code = code);
  end loop;
  return code;
end;
$$;

update public.profiles set invite_code = public._gen_invite_code() where invite_code is null;
alter table public.profiles alter column invite_code set default public._gen_invite_code();
alter table public.profiles alter column invite_code set not null;
create unique index if not exists profiles_invite_code_key on public.profiles (invite_code);
create unique index if not exists profiles_username_key on public.profiles (lower(username));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_format') then
    alter table public.profiles add constraint profiles_username_format
      check (username is null or username ~ '^[a-z0-9_]{3,20}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_invite_code_format') then
    alter table public.profiles add constraint profiles_invite_code_format
      check (invite_code ~ '^[A-HJKMNP-Z2-9]{8}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_theme_unlocked') then
    alter table public.profiles add constraint profiles_theme_unlocked
      check (theme = any (theme_unlocked) and 'lime' = any (theme_unlocked));
  end if;
end $$;

-- Clients still cannot write profiles (re-asserted; new columns inherit this).
alter table public.profiles alter column share_enabled set default false;  -- default only, existing rows keep their choice
revoke insert, update, delete on public.profiles from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Credit ledger (append-only; balance = SUM(delta); never negative)
-- ----------------------------------------------------------------------------
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  delta int not null check (delta <> 0 and abs(delta) <= 100000),
  reason text not null check (reason in ('weekly_bonus', 'referral_reward', 'gift_out', 'gift_in', 'form_check', 'refund')),
  ref text not null check (char_length(ref) between 1 and 100),
  counterparty uuid,                       -- other side of a gift / the invitee of a referral reward (no FK on purpose: the ledger is never updated)
  created_at timestamptz not null default now(),
  -- one grant per (user, reason, ref): weekly_bonus ref = week start date, referral_reward ref = invitee id,
  -- form_check / refund ref = form_checks.id, gift_* ref = gift id.
  constraint credit_ledger_once unique (user_id, reason, ref)
);
create index if not exists credit_ledger_user_created_idx on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;
drop policy if exists "own ledger read" on public.credit_ledger;
create policy "own ledger read" on public.credit_ledger for select using (user_id = auth.uid());
revoke all on public.credit_ledger from anon, authenticated;
grant select on public.credit_ledger to authenticated;

-- Guard: append-only, and a debit may never take the balance below zero (serialised per user).
create or replace function public._credit_ledger_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare bal bigint;
begin
  if tg_op = 'INSERT' then
    if new.delta < 0 then
      perform pg_advisory_xact_lock(hashtext('credits:' || new.user_id::text));
      select coalesce(sum(l.delta), 0) into bal from public.credit_ledger l where l.user_id = new.user_id;
      if bal + new.delta < 0 then
        raise exception 'insufficient_credits';
      end if;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    raise exception 'credit_ledger is append-only';
  elsif tg_op = 'DELETE' then
    -- only allowed as part of deleting the account (ON DELETE CASCADE): the auth user is already gone then
    if exists (select 1 from auth.users u where u.id = old.user_id) then
      raise exception 'credit_ledger is append-only';
    end if;
    return old;
  else
    raise exception 'credit_ledger is append-only';
  end if;
end;
$$;

drop trigger if exists credit_ledger_guard_ins on public.credit_ledger;
create trigger credit_ledger_guard_ins before insert on public.credit_ledger
for each row execute function public._credit_ledger_guard();
drop trigger if exists credit_ledger_guard_upd_del on public.credit_ledger;
create trigger credit_ledger_guard_upd_del before update or delete on public.credit_ledger
for each row execute function public._credit_ledger_guard();
drop trigger if exists credit_ledger_guard_truncate on public.credit_ledger;
create trigger credit_ledger_guard_truncate before truncate on public.credit_ledger
for each statement execute function public._credit_ledger_guard();

-- ----------------------------------------------------------------------------
-- Qualifying days: permanent record "this user had a qualifying workout on this UTC day".
-- Kept even if the workout is deleted afterwards (otherwise delete + re-insert would farm credits).
-- ----------------------------------------------------------------------------
create table if not exists public.qualifying_days (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,                                                   -- UTC calendar day of started_at
  week_start date generated always as (date_trunc('week', day::timestamp)::date) stored,  -- Monday
  workout_id uuid,                                                     -- informational, no FK (workout may be deleted)
  created_at timestamptz not null default now(),                       -- server time of the insert
  primary key (user_id, day)                                           -- max 1 qualifying workout per user and UTC day
);
create index if not exists qualifying_days_user_week_idx on public.qualifying_days (user_id, week_start);
alter table public.qualifying_days enable row level security;
drop policy if exists "own qualifying days read" on public.qualifying_days;
create policy "own qualifying days read" on public.qualifying_days for select using (user_id = auth.uid());
revoke all on public.qualifying_days from anon, authenticated;
grant select on public.qualifying_days to authenticated;

-- longest workout of that day, used for the theme streaks (>= THEME_MIN_DURATION_SEC)
alter table public.qualifying_days add column if not exists duration_sec int not null default 0;
update public.qualifying_days q set duration_sec = w.duration_sec
  from public.workouts w where w.id = q.workout_id and q.duration_sec = 0;

alter table public.workouts add column if not exists qualifying boolean not null default false;

-- Best lift per exercise (feeds "top_lifts" for friends). Self-reported, sanity-capped. Survives workout deletion.
create table if not exists public.lift_records (
  user_id uuid not null references auth.users on delete cascade,
  exercise_key text not null,                 -- lower(trim(name))
  exercise text not null,
  kg numeric(7,2) not null,
  reps int not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_key)
);
alter table public.lift_records enable row level security;
drop policy if exists "own lift records read" on public.lift_records;
create policy "own lift records read" on public.lift_records for select using (user_id = auth.uid());
revoke all on public.lift_records from anon, authenticated;
grant select on public.lift_records to authenticated;

-- ----------------------------------------------------------------------------
-- Friends, blocks, rate limit events
-- ----------------------------------------------------------------------------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users on delete cascade,
  addressee uuid not null references auth.users on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester <> addressee)
);
-- one row per pair, regardless of direction
create unique index if not exists friendships_pair_key
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_requester_idx on public.friendships (requester);
create index if not exists friendships_addressee_idx on public.friendships (addressee);
alter table public.friendships enable row level security;   -- no policies: clients only use the RPCs
revoke all on public.friendships from anon, authenticated;

create table if not exists public.user_blocks (
  blocker uuid not null references auth.users on delete cascade,
  blocked uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.user_blocks enable row level security;
revoke all on public.user_blocks from anon, authenticated;

-- User reports (moderation inbox; read it in the Supabase dashboard, review within 24 h as promised in the store listing)
create table if not exists public.user_reports (
  id bigint generated always as identity primary key,
  reporter uuid not null references auth.users on delete cascade,
  reported uuid not null references auth.users on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'inappropriate_name', 'other')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);
alter table public.user_reports enable row level security;
revoke all on public.user_reports from anon, authenticated;

create table if not exists public.rate_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,                        -- 'friend_request' | 'lookup_fail'
  created_at timestamptz not null default now()
);
create index if not exists rate_events_user_kind_idx on public.rate_events (user_id, kind, created_at desc);
alter table public.rate_events enable row level security;
revoke all on public.rate_events from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Internal helpers (not callable by clients)
-- ----------------------------------------------------------------------------
create or replace function public._err(code text, extra jsonb default '{}'::jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select jsonb_build_object('ok', false, 'error', code) || extra
$$;

-- caller id; also makes sure a profile row exists (users created before the signup trigger have none)
create or replace function public._uid() returns uuid
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  insert into public.profiles (id) values (u) on conflict do nothing;
  return u;
end;
$$;

create or replace function public._week_start(d date) returns date
language sql immutable set search_path = '' as $$ select date_trunc('week', d::timestamp)::date $$;

create or replace function public._today_utc() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'utc')::date $$;

create or replace function public._balance(p_user uuid) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(l.delta), 0)::int from public.credit_ledger l where l.user_id = p_user
$$;

create or replace function public._rate_count(p_user uuid, p_kind text, p_window interval) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.rate_events e
   where e.user_id = p_user and e.kind = p_kind and e.created_at > now() - p_window
$$;

create or replace function public._rate_log(p_user uuid, p_kind text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.rate_events e where e.user_id = p_user and e.created_at < now() - interval '2 days';
  insert into public.rate_events (user_id, kind) values (p_user, p_kind);
end;
$$;

create or replace function public._is_blocked(p_blocker uuid, p_blocked uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_blocks b where b.blocker = p_blocker and b.blocked = p_blocked)
$$;

create or replace function public._are_friends(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships f
     where f.status = 'accepted'
       and least(f.requester, f.addressee) = least(a, b)
       and greatest(f.requester, f.addressee) = greatest(a, b))
$$;

-- number of well-formed sets: {kg: number 0..1000, reps: number 1..100}. Malformed JSON simply yields fewer sets.
create or replace function public._count_valid_sets(p_entries jsonb) returns int
language sql immutable set search_path = '' as $$
  select count(*)::int from jsonb_path_query(
    p_entries,
    '$[*].sets[*] ? (@.reps.type() == "number" && @.reps >= 1 && @.reps <= 100 && @.kg.type() == "number" && @.kg >= 0 && @.kg <= 1000)')
$$;

-- raise the stored best lift per exercise (first 30 exercises of a workout, max ~200 distinct exercises per user)
create or replace function public._record_lifts(p_user uuid, p_entries jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.lift_records as lr (user_id, exercise_key, exercise, kg, reps)
  select distinct on (x.k) p_user, x.k, x.nm, x.kg, x.reps
    from (
      select lower(btrim(left(ex.e ->> 'name', 60))) as k,
             btrim(left(ex.e ->> 'name', 60)) as nm,
             (s.v ->> 'kg')::numeric as kg,
             round((s.v ->> 'reps')::numeric)::int as reps
        from jsonb_path_query(p_entries, '$[*] ? (@.name.type() == "string")') with ordinality as ex(e, ord),
             lateral jsonb_path_query(ex.e, '$.sets[*] ? (@.reps.type() == "number" && @.reps >= 1 && @.reps <= 100 && @.kg.type() == "number" && @.kg > 0 && @.kg <= 1000)') as s(v)
       where ex.ord <= 30
    ) x
   where x.k <> ''
     and (exists (select 1 from public.lift_records r where r.user_id = p_user and r.exercise_key = x.k)
          or (select count(*) from public.lift_records r where r.user_id = p_user) < 200)
   order by x.k, x.kg desc, x.reps desc
  on conflict (user_id, exercise_key) do update
     set kg = excluded.kg, reps = excluded.reps, exercise = excluded.exercise, updated_at = now()
   where (excluded.kg, excluded.reps) > (lr.kg, lr.reps);
end;
$$;

-- one-time backfill of lift records from existing workouts
do $$
begin
  if not exists (select 1 from public.lift_records) then
    perform public._record_lifts(w.user_id, w.entries) from public.workouts w order by w.started_at;
  end if;
end $$;

-- consecutive goal weeks ending now (current week counts if reached, else the streak is still alive via last week)
create or replace function public._streak_weeks(p_user uuid) returns int
language plpgsql stable security definer set search_path = '' as $$
declare
  cw date := public._week_start(public._today_utc());
  anchor date;
  n int;
begin
  if exists (select 1 from public.qualifying_days q where q.user_id = p_user and q.week_start = cw
             group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')) then
    anchor := cw;
  else
    anchor := cw - 7;
  end if;
  with g as (
    select q.week_start from public.qualifying_days q where q.user_id = p_user
     group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')
  ), r as (
    select g.week_start, g.week_start - (row_number() over (order by g.week_start))::int * 7 as grp from g
  )
  select count(*)::int into n from r where r.grp = (select r2.grp from r r2 where r2.week_start = anchor);
  return coalesce(n, 0);
end;
$$;

-- longest run of consecutive goal weeks, ever
create or replace function public._max_goal_run(p_user uuid) returns int
language sql stable security definer set search_path = '' as $$
  with g as (
    select q.week_start from public.qualifying_days q where q.user_id = p_user
     group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')
  ), r as (
    select g.week_start, g.week_start - (row_number() over (order by g.week_start))::int * 7 as grp from g
  )
  select coalesce(max(c), 0)::int from (select count(*) as c from r group by grp) t
$$;

-- Theme streaks: like the goal weeks, but only days with a workout of >= THEME_MIN_DURATION_SEC count.
create or replace function public._max_theme_run(p_user uuid) returns int
language sql stable security definer set search_path = '' as $$
  with g as (
    select q.week_start from public.qualifying_days q
     where q.user_id = p_user and q.duration_sec >= public._const('THEME_MIN_DURATION_SEC')
     group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')
  ), r as (
    select g.week_start, g.week_start - (row_number() over (order by g.week_start))::int * 7 as grp from g
  )
  select coalesce(max(c), 0)::int from (select count(*) as c from r group by grp) t
$$;

-- current run (shown as progress); the current week counts if reached, otherwise last week keeps the run alive
create or replace function public._theme_streak_weeks(p_user uuid) returns int
language plpgsql stable security definer set search_path = '' as $$
declare
  cw date := public._week_start(public._today_utc());
  anchor date;
  n int;
begin
  if exists (select 1 from public.qualifying_days q
              where q.user_id = p_user and q.week_start = cw and q.duration_sec >= public._const('THEME_MIN_DURATION_SEC')
              group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')) then
    anchor := cw;
  else
    anchor := cw - 7;
  end if;
  with g as (
    select q.week_start from public.qualifying_days q
     where q.user_id = p_user and q.duration_sec >= public._const('THEME_MIN_DURATION_SEC')
     group by q.week_start having count(*) >= public._const('WEEKLY_GOAL')
  ), r as (
    select g.week_start, g.week_start - (row_number() over (order by g.week_start))::int * 7 as grp from g
  )
  select count(*)::int into n from r where r.grp = (select r2.grp from r r2 where r2.week_start = anchor);
  return coalesce(n, 0);
end;
$$;

-- true if the entries contain a valid Barbell Bench Press set at >= THEME_GOLD_BENCH_KG for at least 1 rep
create or replace function public._has_gold_lift(p_entries jsonb) returns boolean
language sql stable set search_path = '' as $$
  select jsonb_path_exists(
    p_entries,
    '$[*] ? (@.name == "Barbell Bench Press").sets[*] ? (@.reps.type() == "number" && @.reps >= 1 && @.reps <= 100 && @.kg.type() == "number" && @.kg >= $min && @.kg <= 1000)',
    jsonb_build_object('min', public._const('THEME_GOLD_BENCH_KG')))
$$;

-- unlocks are permanent once earned
create or replace function public._grant_themes(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare run int := public._max_theme_run(p_user);
begin
  if run >= public._const('THEME_BLUE_WEEKS') then
    update public.profiles p set theme_unlocked = array_append(p.theme_unlocked, 'blue')
     where p.id = p_user and not ('blue' = any (p.theme_unlocked));
  end if;
  if run >= public._const('THEME_RED_WEEKS') then
    update public.profiles p set theme_unlocked = array_append(p.theme_unlocked, 'red')
     where p.id = p_user and not ('red' = any (p.theme_unlocked));
  end if;
  if run >= public._const('THEME_PURPLE_WEEKS') then
    update public.profiles p set theme_unlocked = array_append(p.theme_unlocked, 'purple')
     where p.id = p_user and not ('purple' = any (p.theme_unlocked));
  end if;
end;
$$;

-- referral reward check for an invitee (called after a qualifying workout and after redeeming a code)
create or replace function public._check_referral_reward(p_invitee uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  inviter uuid;
  created timestamptz;
  win interval := make_interval(days => public._const('INVITE_REWARD_WINDOW_DAYS'));
  n int;
begin
  select p.referred_by into inviter from public.profiles p where p.id = p_invitee;
  if inviter is null then return; end if;
  select u.created_at into created from auth.users u where u.id = p_invitee;
  if created is null or now() > created + win then return; end if;
  select count(*) into n from public.qualifying_days q
   where q.user_id = p_invitee and q.created_at <= created + win;
  if n < public._const('INVITE_REWARD_WORKOUTS') then return; end if;

  perform pg_advisory_xact_lock(hashtext('referral:' || inviter::text));
  if (select count(*) from public.credit_ledger l
       where l.user_id = inviter and l.reason = 'referral_reward' and l.created_at > now() - interval '30 days')
     >= public._const('INVITE_MAX_REWARDS_30D') then
    return;  -- cap reached; a later qualifying workout inside the window can still trigger it once the cap frees up
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref, counterparty)
  values (inviter, public._const('INVITE_REWARD'), 'referral_reward', p_invitee::text, p_invitee)
  on conflict (user_id, reason, ref) do nothing;
end;
$$;

-- ----------------------------------------------------------------------------
-- Workout triggers
-- ----------------------------------------------------------------------------
-- BEFORE INSERT: plausibility + "qualifying" decision. Never rejects the workout; it is always stored.
-- Rules for qualifying (all must hold, evaluated at insert time on SERVER time):
--   duration 20 min .. 6 h, >= 3 well-formed sets, started_at not > 5 min in the future, not older than 36 h,
--   end time (started_at + duration) not > 5 min in the future, and no earlier qualifying workout on that UTC day.
create or replace function public.workouts_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  tol interval := make_interval(mins => public._const('QUALIFY_FUTURE_TOLERANCE_MIN'));
  inserted int;
begin
  -- created_at is server time only: the free-plan limit counts by it, so a client must not be able to back-date it
  new.created_at := now();
  new.qualifying := false;

  if new.duration_sec >= public._const('QUALIFY_MIN_DURATION_SEC')
     and new.duration_sec <= public._const('QUALIFY_MAX_DURATION_SEC')
     and new.started_at <= now() + tol
     and new.started_at >= now() - make_interval(hours => public._const('QUALIFY_MAX_AGE_HOURS'))
     and new.started_at + make_interval(secs => new.duration_sec) <= now() + tol
     and public._count_valid_sets(new.entries) >= public._const('QUALIFY_MIN_SETS')
  then
    perform pg_advisory_xact_lock(hashtext('workouts:' || new.user_id::text));  -- same lock as the free-plan trigger (re-entrant)
    insert into public.qualifying_days (user_id, day, workout_id)
    values (new.user_id, (new.started_at at time zone 'utc')::date, new.id)
    on conflict (user_id, day) do nothing;
    get diagnostics inserted = row_count;
    new.qualifying := (inserted = 1);
    -- a longer valid workout on the same day upgrades the day for theme streaks (credits still count once per day)
    update public.qualifying_days q set duration_sec = greatest(q.duration_sec, new.duration_sec)
     where q.user_id = new.user_id and q.day = (new.started_at at time zone 'utc')::date;
  end if;
  return new;
end;
$$;

-- AFTER INSERT: lift records, weekly bonus, theme unlock, referral reward.
create or replace function public.workouts_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  d date;
  wk date;
  n int;
begin
  perform public._record_lifts(new.user_id, new.entries);
  if public._has_gold_lift(new.entries) then
    update public.profiles p set theme_unlocked = array_append(p.theme_unlocked, 'gold')
     where p.id = new.user_id and not ('gold' = any (p.theme_unlocked));
  end if;
  perform public._grant_themes(new.user_id);   -- also for a non-counting workout that upgraded the day to >= 30 min
  if not new.qualifying then return new; end if;

  d := (new.started_at at time zone 'utc')::date;
  wk := public._week_start(d);
  select count(*) into n from public.qualifying_days q where q.user_id = new.user_id and q.week_start = wk;

  if n >= public._const('WEEKLY_GOAL') then
    insert into public.credit_ledger (user_id, delta, reason, ref)
    values (new.user_id, public._const('WEEKLY_BONUS'), 'weekly_bonus', wk::text)
    on conflict (user_id, reason, ref) do nothing;
  end if;

  perform public._check_referral_reward(new.user_id);
  return new;
end;
$$;

drop trigger if exists workouts_qualify_before on public.workouts;
create trigger workouts_qualify_before before insert on public.workouts
for each row execute function public.workouts_before_insert();
drop trigger if exists workouts_rewards_after on public.workouts;
create trigger workouts_rewards_after after insert on public.workouts
for each row execute function public.workouts_after_insert();

-- ----------------------------------------------------------------------------
-- Credits: service-role functions for Form Check
-- ----------------------------------------------------------------------------
-- Cost per reason lives in the constants above, so the Edge Function cannot charge an arbitrary amount.
create or replace function public._spend_cost(p_reason text) returns int
language plpgsql immutable set search_path = '' as $$
begin
  if p_reason = 'form_check' then return public._const('FORM_CHECK_COST'); end if;
  raise exception 'unsupported_reason';
end;
$$;

-- Atomically debit. Idempotent per (user, reason, ref): a retry with the same ref does not charge twice.
-- Returns {ok:true, balance, spent} | {ok:true, already:true, balance} | {ok:false, error:'insufficient_credits', needed, balance}
create or replace function public.spend_credits(p_user uuid, p_reason text, p_ref text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  cost int := public._spend_cost(p_reason);
  bal int;
begin
  perform pg_advisory_xact_lock(hashtext('credits:' || p_user::text));
  if exists (select 1 from public.credit_ledger l where l.user_id = p_user and l.reason = p_reason and l.ref = p_ref) then
    return jsonb_build_object('ok', true, 'already', true, 'balance', public._balance(p_user));
  end if;
  bal := public._balance(p_user);
  if bal < cost then
    return public._err('insufficient_credits', jsonb_build_object('needed', cost, 'balance', bal));
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (p_user, -cost, p_reason, p_ref);
  return jsonb_build_object('ok', true, 'balance', bal - cost, 'spent', cost);
end;
$$;

-- Refund exactly what was charged for (user, ref). Idempotent (second call changes nothing).
create or replace function public.refund_credits(p_user uuid, p_ref text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  spent int;
  done int;
begin
  perform pg_advisory_xact_lock(hashtext('credits:' || p_user::text));
  select -l.delta into spent from public.credit_ledger l
   where l.user_id = p_user and l.reason = 'form_check' and l.ref = p_ref;
  if spent is null then
    return jsonb_build_object('ok', true, 'refunded', false, 'balance', public._balance(p_user));
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (p_user, spent, 'refund', p_ref)
  on conflict (user_id, reason, ref) do nothing;
  get diagnostics done = row_count;
  return jsonb_build_object('ok', true, 'refunded', done = 1, 'balance', public._balance(p_user));
end;
$$;

-- Safety net: refund Form Checks that were charged but never finished (Edge Function killed mid-request).
-- "Finished" = form_checks.result is set. Returns the number of refunds.
create or replace function public.refund_stale_form_checks(p_user uuid, p_older_than interval default interval '10 minutes') returns int
language plpgsql security definer set search_path = '' as $$
declare r record; n int := 0; res jsonb;
begin
  for r in
    select l.ref from public.credit_ledger l
      join public.form_checks fc on fc.id::text = l.ref and fc.user_id = l.user_id
     where l.user_id = p_user and l.reason = 'form_check'
       and fc.result is null
       and l.created_at < now() - p_older_than and l.created_at > now() - interval '2 days'
  loop
    res := public.refund_credits(p_user, r.ref);
    if (res ->> 'refunded')::boolean then n := n + 1; end if;
  end loop;
  return n;
end;
$$;

-- ----------------------------------------------------------------------------
-- RPCs for the app (authenticated). Business errors are returned as {"ok":false,"error":"<code>"},
-- not raised, so that rate-limit bookkeeping survives. Only "not_authenticated" is raised.
-- ----------------------------------------------------------------------------

-- Public numbers for the UI (read-only).
create or replace function public.app_config() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'ok', true,
    'weekly_goal', public._const('WEEKLY_GOAL'),
    'weekly_bonus', public._const('WEEKLY_BONUS'),
    'theme_blue_weeks', public._const('THEME_BLUE_WEEKS'),
    'theme_red_weeks', public._const('THEME_RED_WEEKS'),
    'theme_purple_weeks', public._const('THEME_PURPLE_WEEKS'),
    'theme_gold_bench_kg', public._const('THEME_GOLD_BENCH_KG'),
    'theme_min_duration_sec', public._const('THEME_MIN_DURATION_SEC'),
    'form_check_cost', public._const('FORM_CHECK_COST'),
    'qualify_min_duration_sec', public._const('QUALIFY_MIN_DURATION_SEC'),
    'qualify_min_sets', public._const('QUALIFY_MIN_SETS'),
    'invite_reward', public._const('INVITE_REWARD'),
    'invite_redeem_window_days', public._const('INVITE_REDEEM_WINDOW_DAYS'),
    'invite_reward_window_days', public._const('INVITE_REWARD_WINDOW_DAYS'),
    'invite_reward_workouts', public._const('INVITE_REWARD_WORKOUTS'),
    'invite_max_rewards_30d', public._const('INVITE_MAX_REWARDS_30D'),
    'gift_min', public._const('GIFT_MIN'),
    'gift_max', public._const('GIFT_MAX'),
    'gift_max_per_24h', public._const('GIFT_MAX_PER_24H'))
$$;

create or replace function public.set_username(username text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_name text := lower(btrim(coalesce(username, '')));
begin
  if public._rate_count(me, 'lookup_fail', interval '1 hour') >= public._const('LOOKUP_FAILS_PER_HOUR') then
    return public._err('too_many_attempts');
  end if;
  if v_name !~ '^[a-z0-9_]{3,20}$' then
    return public._err('invalid_username');
  end if;
  begin
    update public.profiles p set username = v_name, updated_at = now() where p.id = me;
  exception when unique_violation then
    perform public._rate_log(me, 'lookup_fail');
    return public._err('username_taken');
  end;
  return jsonb_build_object('ok', true, 'username', v_name);
end;
$$;

create or replace function public.set_theme(theme text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_theme text := lower(btrim(coalesce(theme, '')));
  n int;
begin
  update public.profiles p set theme = v_theme, updated_at = now()
   where p.id = me and v_theme = any (p.theme_unlocked);
  get diagnostics n = row_count;
  if n = 0 then return public._err('theme_locked'); end if;
  return jsonb_build_object('ok', true, 'theme', v_theme);
end;
$$;

create or replace function public.set_sharing(enabled boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
begin
  if enabled is null then return public._err('invalid_argument'); end if;
  update public.profiles p set share_enabled = enabled, updated_at = now() where p.id = me;
  return jsonb_build_object('ok', true, 'share_enabled', enabled);
end;
$$;

create or replace function public.my_credits() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  p public.profiles;
  cw date := public._week_start(public._today_utc());
  goal int := public._const('WEEKLY_GOAL');
  q_week int;
  hist jsonb;
begin
  select * into p from public.profiles x where x.id = me;
  select count(*)::int into q_week from public.qualifying_days q where q.user_id = me and q.week_start = cw;
  select coalesce(jsonb_agg(h.j order by h.created_at desc, h.id), '[]'::jsonb) into hist
    from (
      select l.id, l.created_at,
             jsonb_build_object('id', l.id, 'delta', l.delta, 'reason', l.reason, 'ref', l.ref,
                                'created_at', l.created_at, 'counterparty_username', cp.username) as j
        from public.credit_ledger l
        left join public.profiles cp on cp.id = l.counterparty and l.reason in ('gift_in', 'gift_out', 'referral_reward')
       where l.user_id = me
       order by l.created_at desc, l.id
       limit 50
    ) h;
  return jsonb_build_object(
    'ok', true,
    'balance', public._balance(me),
    'history', hist,
    'weekly_progress', jsonb_build_object(
      'qualifying_this_week', q_week,
      'goal', goal,
      'bonus', public._const('WEEKLY_BONUS'),
      'week_start', cw,
      'bonus_awarded', exists (select 1 from public.credit_ledger l where l.user_id = me and l.reason = 'weekly_bonus' and l.ref = cw::text),
      'qualified_today', exists (select 1 from public.qualifying_days q where q.user_id = me and q.day = public._today_utc())),
    'streak_weeks', public._streak_weeks(me),
    'theme_streak_weeks', public._theme_streak_weeks(me),
    'theme', p.theme,
    'theme_unlocked', to_jsonb(p.theme_unlocked),
    'invite_code', p.invite_code,
    'username', p.username,
    'referral', jsonb_build_object(
      'redeemed', p.referred_at is not null,
      'rewarded_count_30d', (select count(*)::int from public.credit_ledger l
                              where l.user_id = me and l.reason = 'referral_reward' and l.created_at > now() - interval '30 days')));
end;
$$;

create or replace function public.gift_credits(friend uuid, amount int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_friend uuid := friend;
  v_amount int := amount;
  sent int;
  bal int;
  gid text := gen_random_uuid()::text;
begin
  if v_friend is null or v_amount is null
     or v_amount < public._const('GIFT_MIN') or v_amount > public._const('GIFT_MAX') then
    return public._err('invalid_amount');
  end if;
  if v_friend = me then return public._err('cannot_gift_self'); end if;
  if not public._are_friends(me, v_friend) then return public._err('not_friends'); end if;

  perform pg_advisory_xact_lock(hashtext('credits:' || me::text));   -- serialises this sender's gifts and debits
  select coalesce(-sum(l.delta), 0)::int into sent from public.credit_ledger l
   where l.user_id = me and l.reason = 'gift_out' and l.created_at > now() - interval '24 hours';
  if sent + v_amount > public._const('GIFT_MAX_PER_24H') then
    return public._err('gift_limit_reached', jsonb_build_object('remaining_24h', greatest(public._const('GIFT_MAX_PER_24H') - sent, 0)));
  end if;
  bal := public._balance(me);
  if bal < v_amount then
    return public._err('insufficient_credits', jsonb_build_object('needed', v_amount, 'balance', bal));
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref, counterparty) values (me, -v_amount, 'gift_out', gid, v_friend);
  insert into public.credit_ledger (user_id, delta, reason, ref, counterparty) values (v_friend, v_amount, 'gift_in', gid, me);
  return jsonb_build_object('ok', true, 'balance', bal - v_amount, 'remaining_24h', public._const('GIFT_MAX_PER_24H') - sent - v_amount);
end;
$$;

create or replace function public.redeem_invite(code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_code text := upper(btrim(coalesce(code, '')));
  my_created timestamptz;
  v_redeemed timestamptz;
  inviter uuid;
  inviter_ref uuid;
  inviter_name text;
  n int;
begin
  if public._rate_count(me, 'lookup_fail', interval '1 hour') >= public._const('LOOKUP_FAILS_PER_HOUR') then
    return public._err('too_many_attempts');
  end if;
  select p.referred_at into v_redeemed from public.profiles p where p.id = me;
  if v_redeemed is not null then return public._err('already_redeemed'); end if;
  select u.created_at into my_created from auth.users u where u.id = me;
  if my_created is null or now() > my_created + make_interval(days => public._const('INVITE_REDEEM_WINDOW_DAYS')) then
    return public._err('invite_window_expired');
  end if;

  if v_code !~ '^[A-HJKMNP-Z2-9]{8}$' then
    perform public._rate_log(me, 'lookup_fail');
    return public._err('invalid_code');
  end if;
  select p.id, p.referred_by, p.username into inviter, inviter_ref, inviter_name
    from public.profiles p where p.invite_code = v_code;
  if inviter is null then
    perform public._rate_log(me, 'lookup_fail');
    return public._err('invalid_code');
  end if;
  if inviter = me then return public._err('own_code'); end if;
  if public._is_blocked(inviter, me) or public._is_blocked(me, inviter) then
    return public._err('invalid_code');
  end if;
  if inviter_ref = me then return public._err('mutual_invite'); end if;   -- A invited by B, B cannot be invited by A

  update public.profiles p set referred_by = inviter, referred_at = now(), updated_at = now()
   where p.id = me and p.referred_at is null;
  get diagnostics n = row_count;
  if n = 0 then return public._err('already_redeemed'); end if;

  insert into public.friendships (requester, addressee, status, responded_at)
  values (me, inviter, 'accepted', now())
  on conflict (least(requester, addressee), greatest(requester, addressee))
  do update set status = 'accepted', responded_at = now();

  perform public._check_referral_reward(me);   -- workouts done before redeeming count too (first 14 days)
  return jsonb_build_object('ok', true, 'inviter_id', inviter, 'inviter_username', inviter_name);
end;
$$;

create or replace function public.send_friend_request(username text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_name text := lower(btrim(coalesce(username, '')));
  my_name text;
  target uuid;
  fr public.friendships;
  new_id uuid;
begin
  select p.username into my_name from public.profiles p where p.id = me;
  if my_name is null then return public._err('username_required'); end if;
  if public._rate_count(me, 'lookup_fail', interval '1 hour') >= public._const('LOOKUP_FAILS_PER_HOUR') then
    return public._err('too_many_attempts');
  end if;
  if public._rate_count(me, 'friend_request', interval '24 hours') >= public._const('FRIEND_REQUESTS_PER_24H') then
    return public._err('rate_limited');
  end if;

  if v_name !~ '^[a-z0-9_]{3,20}$' then
    perform public._rate_log(me, 'lookup_fail');
    return public._err('user_not_found');
  end if;
  select p.id into target from public.profiles p where p.username = v_name;
  if target is null then
    perform public._rate_log(me, 'lookup_fail');
    return public._err('user_not_found');
  end if;
  if target = me then return public._err('cannot_add_self'); end if;
  if public._is_blocked(me, target) then return public._err('user_blocked'); end if;

  perform public._rate_log(me, 'friend_request');
  -- If the target blocked me, pretend it worked (do not reveal blocks, do not create a row).
  if public._is_blocked(target, me) then
    return jsonb_build_object('ok', true, 'status', 'pending');
  end if;

  select * into fr from public.friendships f
   where least(f.requester, f.addressee) = least(me, target) and greatest(f.requester, f.addressee) = greatest(me, target);
  if found then
    if fr.status = 'accepted' then return public._err('already_friends'); end if;
    if fr.requester = me then return public._err('already_requested'); end if;
    update public.friendships f set status = 'accepted', responded_at = now() where f.id = fr.id;   -- they asked me first
    return jsonb_build_object('ok', true, 'status', 'accepted', 'request_id', fr.id);
  end if;

  begin
    insert into public.friendships (requester, addressee, status) values (me, target, 'pending') returning id into new_id;
  exception when unique_violation then
    return public._err('already_requested');
  end;
  return jsonb_build_object('ok', true, 'status', 'pending', 'request_id', new_id);
end;
$$;

create or replace function public.respond_friend_request(request_id uuid, accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_id uuid := request_id;
  v_accept boolean := accept;
  fr public.friendships;
begin
  if v_id is null or v_accept is null then return public._err('invalid_argument'); end if;
  select * into fr from public.friendships f
   where f.id = v_id and f.addressee = me and f.status = 'pending' for update;
  if not found then return public._err('request_not_found'); end if;
  if v_accept then
    update public.friendships f set status = 'accepted', responded_at = now() where f.id = fr.id;
    return jsonb_build_object('ok', true, 'status', 'accepted');
  end if;
  delete from public.friendships f where f.id = fr.id;   -- declined requests are deleted
  return jsonb_build_object('ok', true, 'status', 'declined');
end;
$$;

-- Removes a friend, or cancels an outgoing / declines an incoming pending request with that user.
create or replace function public.remove_friend(friend uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_friend uuid := friend;
  n int;
begin
  if v_friend is null then return public._err('invalid_argument'); end if;
  delete from public.friendships f
   where least(f.requester, f.addressee) = least(me, v_friend) and greatest(f.requester, f.addressee) = greatest(me, v_friend);
  get diagnostics n = row_count;
  return jsonb_build_object('ok', true, 'removed', n > 0);
end;
$$;

create or replace function public.block_user(target uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_target uuid := target;
begin
  if v_target is null then return public._err('invalid_argument'); end if;
  if v_target = me then return public._err('cannot_block_self'); end if;
  if not exists (select 1 from public.profiles p where p.id = v_target) then return public._err('user_not_found'); end if;
  delete from public.friendships f
   where least(f.requester, f.addressee) = least(me, v_target) and greatest(f.requester, f.addressee) = greatest(me, v_target);
  insert into public.user_blocks (blocker, blocked) values (me, v_target) on conflict do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.report_user(target uuid, reason text, note text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
begin
  if target is null or reason is null or reason not in ('spam', 'abuse', 'inappropriate_name', 'other') then
    return public._err('invalid_argument');
  end if;
  if target = me then return public._err('cannot_report_self'); end if;
  if not exists (select 1 from public.profiles p where p.id = target) then return public._err('user_not_found'); end if;
  if (select count(*) from public.user_reports r where r.reporter = me and r.created_at > now() - interval '1 day') >= 10 then
    return public._err('rate_limited');
  end if;
  insert into public.user_reports (reporter, reported, reason, note)
  values (me, target, reason, nullif(left(btrim(coalesce(note, '')), 500), ''));
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.unblock_user(target uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_target uuid := target;
begin
  delete from public.user_blocks b where b.blocker = me and b.blocked = v_target;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.list_blocked() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
begin
  return jsonb_build_object('ok', true, 'blocked', coalesce((
    select jsonb_agg(jsonb_build_object('id', b.blocked, 'username', p.username, 'created_at', b.created_at) order by b.created_at desc)
      from public.user_blocks b join public.profiles p on p.id = b.blocked
     where b.blocker = me), '[]'::jsonb));
end;
$$;

create or replace function public.list_friend_requests() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
begin
  return jsonb_build_object(
    'ok', true,
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object('id', f.id, 'user_id', f.requester, 'username', p.username, 'created_at', f.created_at) order by f.created_at desc)
        from public.friendships f join public.profiles p on p.id = f.requester
       where f.addressee = me and f.status = 'pending'), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object('id', f.id, 'user_id', f.addressee, 'username', p.username, 'created_at', f.created_at) order by f.created_at desc)
        from public.friendships f join public.profiles p on p.id = f.addressee
       where f.requester = me and f.status = 'pending'), '[]'::jsonb));
end;
$$;

-- Accepted friends only. If a friend has sharing off (the default), only id / username / theme / streak_weeks / share_enabled
-- are returned; qualifying_this_week, total_workouts, last_workout_at and top_lifts are null.
create or replace function public.list_friends() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  cw date := public._week_start(public._today_utc());
begin
  return jsonb_build_object('ok', true, 'friends', coalesce((
    select jsonb_agg(x.j order by lower(coalesce(x.uname, '')), x.fid)
      from (
        select p.id as fid, p.username as uname,
          jsonb_build_object(
            'id', p.id,
            'username', p.username,
            'theme', p.theme,
            'share_enabled', p.share_enabled,
            'streak_weeks', public._streak_weeks(p.id),   -- visible even without sharing
            'qualifying_this_week', case when p.share_enabled then
               (select count(*)::int from public.qualifying_days q where q.user_id = p.id and q.week_start = cw) end,
            'total_workouts', case when p.share_enabled then
               (select count(*)::int from public.workouts w where w.user_id = p.id) end,
            'last_workout_at', case when p.share_enabled then
               (select max(least(w.started_at, w.created_at)) from public.workouts w where w.user_id = p.id) end,
            'top_lifts', case when p.share_enabled then coalesce((
               select jsonb_agg(jsonb_build_object('name', t.exercise, 'kg', t.kg, 'reps', t.reps) order by t.kg desc, t.reps desc, t.exercise)
                 from (select r.exercise, r.kg, r.reps from public.lift_records r where r.user_id = p.id
                        order by r.kg desc, r.reps desc, r.exercise limit public._const('TOP_LIFTS_MAX')) t), '[]'::jsonb) end
          ) as j
        from public.friendships f
        join public.profiles p on p.id = case when f.requester = me then f.addressee else f.requester end
       where f.status = 'accepted' and me in (f.requester, f.addressee)
      ) x), '[]'::jsonb));
end;
$$;

-- Latest workouts of an accepted friend who has sharing enabled. lim is clamped to 1..50.
create or replace function public.friend_workouts(friend uuid, lim int default 20) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
  v_friend uuid := friend;
  n int := least(greatest(coalesce(lim, 20), 1), public._const('FRIEND_WORKOUTS_MAX'));
  sharing boolean;
begin
  if v_friend is null or not public._are_friends(me, v_friend) then return public._err('not_friends'); end if;
  select p.share_enabled into sharing from public.profiles p where p.id = v_friend;
  if not coalesce(sharing, false) then return public._err('sharing_disabled'); end if;
  return jsonb_build_object('ok', true, 'workouts', coalesce((
    select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'started_at', t.started_at,
                                        'duration_sec', t.duration_sec, 'entries', t.entries, 'qualifying', t.qualifying)
                     order by t.created_at desc, t.id)
      from (select w.* from public.workouts w where w.user_id = v_friend order by w.created_at desc, w.id limit n) t), '[]'::jsonb));
end;
$$;

-- ----------------------------------------------------------------------------
-- Privileges: nothing is executable by PUBLIC / anon. Re-asserted on every run.
-- ----------------------------------------------------------------------------
do $$
declare
  fn text;
  sig text;
  user_fns constant text[] := array['app_config', 'set_username', 'set_theme', 'set_sharing', 'my_credits', 'gift_credits',
    'redeem_invite', 'send_friend_request', 'respond_friend_request', 'remove_friend', 'block_user', 'unblock_user', 'report_user',
    'list_blocked', 'list_friend_requests', 'list_friends', 'friend_workouts'];
  service_fns constant text[] := array['spend_credits', 'refund_credits', 'refund_stale_form_checks', '_gen_invite_code'];
  internal_fns constant text[] := array['_const', '_credit_ledger_guard', '_err', '_uid', '_week_start', '_today_utc', '_balance',
    '_rate_count', '_rate_log', '_is_blocked', '_are_friends', '_count_valid_sets', '_record_lifts', '_streak_weeks',
    '_max_goal_run', '_max_theme_run', '_theme_streak_weeks', '_grant_themes', '_has_gold_lift', '_check_referral_reward', 'workouts_before_insert', 'workouts_after_insert', '_spend_cost'];
begin
  foreach fn in array user_fns || service_fns || internal_fns loop
    for sig in
      select format('public.%I(%s)', p.proname, pg_get_function_identity_arguments(p.oid))
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = fn
    loop
      execute format('revoke all on function %s from public, anon, authenticated, service_role', sig);
      if fn = any (user_fns) then
        execute format('grant execute on function %s to authenticated', sig);
      elsif fn = any (service_fns) then
        execute format('grant execute on function %s to service_role', sig);
      end if;
    end loop;
  end loop;
end $$;
