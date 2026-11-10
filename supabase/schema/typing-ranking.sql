create table public.typing_scores (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 20 and display_name = btrim(display_name) and display_name !~ '[[:cntrl:]]'),
  duration integer not null check (duration in (30,60,120)),
  elapsed numeric not null check (elapsed >= 5 and elapsed <= duration),
  correct integer not null check (correct between 1 and 180),
  attempts integer not null check (attempts between 1 and 10000),
  mistakes integer not null check (mistakes >= 0 and attempts >= correct + mistakes),
  text_length integer not null check (text_length between 20 and 180 and correct <= text_length),
  reason text not null check (reason in ('completed','timeout')),
  created_at timestamptz not null default now(),
  wpm numeric generated always as (round(correct * 12.0 / elapsed)) stored,
  accuracy numeric generated always as (round((attempts - mistakes) * 100.0 / attempts)) stored,
  constraint valid_finish check ((reason = 'completed' and correct = text_length) or (reason = 'timeout' and elapsed = duration)),
  constraint plausible_speed check (round(correct * 12.0 / elapsed) between 1 and 300)
);
alter table public.typing_scores enable row level security;
revoke all on public.typing_scores from anon, authenticated;
grant select on public.typing_scores to anon, authenticated;
grant insert (id,user_id,display_name,duration,elapsed,correct,attempts,mistakes,text_length,reason) on public.typing_scores to authenticated;
create policy "Public scores are readable" on public.typing_scores for select to anon, authenticated using (true);
create policy "Users publish their own scores" on public.typing_scores for insert to authenticated
  with check ((select auth.uid()) = user_id and coalesce((select auth.jwt())->>'is_anonymous','false') = 'false');
create index typing_scores_best on public.typing_scores (duration,user_id,wpm desc,accuracy desc,created_at,id);
create index typing_scores_user_id on public.typing_scores(user_id);
create view public.typing_leaderboard with (security_invoker = true) as
  select distinct on (duration,user_id) id,user_id,display_name,duration,wpm,accuracy,elapsed,created_at
  from public.typing_scores
  order by duration,user_id,wpm desc,accuracy desc,created_at asc,id asc;
revoke all on public.typing_leaderboard from anon, authenticated;
grant select on public.typing_leaderboard to anon, authenticated;
