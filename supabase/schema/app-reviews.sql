create table public.app_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 20 and display_name !~ '[[:cntrl:]]'),
  rating integer not null check (rating between 1 and 5),
  title text not null check (char_length(btrim(title)) between 1 and 60 and title !~ '[[:cntrl:]]'),
  comment text not null check (char_length(btrim(comment)) between 10 and 500),
  created_at timestamptz not null default now()
);
create index app_reviews_created_idx on public.app_reviews(created_at desc, id);
alter table public.app_reviews enable row level security;
revoke all on public.app_reviews from anon, authenticated;
grant select (id, display_name, rating, title, comment, created_at) on public.app_reviews to anon;
grant select on public.app_reviews to authenticated;
grant insert (user_id, display_name, rating, title, comment) on public.app_reviews to authenticated;
grant update (display_name, rating, title, comment, user_id) on public.app_reviews to authenticated;
create policy "Read published reviews" on public.app_reviews for select to anon, authenticated using (true);
create policy "Post own review" on public.app_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Edit own review" on public.app_reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
