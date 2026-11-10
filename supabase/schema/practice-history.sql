-- Private practice history. Separate from the opt-in public leaderboard.
create table public.practice_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 100),
  saved_at timestamptz not null,
  result jsonb not null,
  primary key (user_id, id),
  constraint valid_result check (coalesce((
    jsonb_typeof(result) = 'object'
    and result ?& array['id','savedAt','text','duration','elapsed','wpm','accuracy','mistakes','correct','reason']
    and result->>'id' = id
    and (result->>'savedAt')::timestamptz = saved_at
    and jsonb_typeof(result->'text') = 'string'
    and length(result->>'text') <= 1000
    and result->>'reason' in ('completed','timeout','stopped')
    and coalesce(result->>'language', 'en') in ('en','ko')
    and jsonb_typeof(result->'duration') = 'number'
    and (result->>'duration')::numeric >= 0
    and jsonb_typeof(result->'elapsed') = 'number'
    and (result->>'elapsed')::numeric between 0 and (result->>'duration')::numeric
    and jsonb_typeof(result->'accuracy') = 'number'
    and (result->>'accuracy')::numeric between 0 and 100
    and jsonb_typeof(result->'wpm') = 'number' and (result->>'wpm')::numeric >= 0
    and jsonb_typeof(result->'mistakes') = 'number' and (result->>'mistakes')::numeric >= 0
    and jsonb_typeof(result->'correct') = 'number' and (result->>'correct')::numeric >= 0
    and octet_length(result::text) <= 16000
  ), false))
);
create index practice_results_user_date_idx on public.practice_results(user_id, saved_at desc, id);
alter table public.practice_results enable row level security;
revoke all on public.practice_results from anon, authenticated;
grant select, insert on public.practice_results to authenticated;
create policy "Read own practice history" on public.practice_results for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Insert own practice history" on public.practice_results for insert to authenticated
  with check ((select auth.uid()) = user_id);
