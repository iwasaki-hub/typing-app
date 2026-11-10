-- Account-owned deletion marker prevents old device caches from restoring deleted history.
create table public.practice_history_resets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cleared_at timestamptz not null default now()
);
alter table public.practice_history_resets enable row level security;
revoke all on public.practice_history_resets from anon, authenticated;
grant select, insert, update on public.practice_history_resets to authenticated;
create policy "Read own reset" on public.practice_history_resets for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Insert own reset" on public.practice_history_resets for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Update own reset" on public.practice_history_resets for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant delete on public.practice_results to authenticated;
create policy "Delete own practice history" on public.practice_results for delete to authenticated
using ((select auth.uid()) = user_id);
alter policy "Read own practice history" on public.practice_results using (
  (select auth.uid()) = user_id and saved_at > coalesce(
    (select cleared_at from public.practice_history_resets where user_id = (select auth.uid())), '-infinity'::timestamptz)
);
alter policy "Insert own practice history" on public.practice_results with check (
  (select auth.uid()) = user_id and saved_at > coalesce(
    (select cleared_at from public.practice_history_resets where user_id = (select auth.uid())), '-infinity'::timestamptz)
);
create function public.clear_practice_history() returns timestamptz
language plpgsql security invoker set search_path = '' as $$
declare cutoff timestamptz := clock_timestamp(); owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  -- Delete first: SELECT policy hides old records after the marker is advanced.
  delete from public.practice_results where user_id = owner_id;
  insert into public.practice_history_resets(user_id, cleared_at) values (owner_id, cutoff)
  on conflict (user_id) do update set cleared_at = greatest(practice_history_resets.cleared_at, excluded.cleared_at)
  returning cleared_at into cutoff;
  return cutoff;
end;
$$;
revoke all on function public.clear_practice_history() from public, anon;
grant execute on function public.clear_practice_history() to authenticated;
