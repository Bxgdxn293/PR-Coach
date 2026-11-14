-- Run once in the Supabase SQL Editor (existing projects). Adds the hidden "Shadow" theme.
create or replace function public.unlock_shadow() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public._uid();
begin
  update public.profiles p set theme_unlocked = array_append(p.theme_unlocked, 'shadow')
   where p.id = me and not ('shadow' = any (p.theme_unlocked));
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.unlock_shadow() from public, anon, authenticated, service_role;
grant execute on function public.unlock_shadow() to authenticated;

-- PostgREST picks up the new function after a schema reload.
notify pgrst, 'reload schema';
