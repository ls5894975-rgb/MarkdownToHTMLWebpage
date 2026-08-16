-- 满小传：作品真实评论表，在 Supabase SQL Editor 中运行一次
begin;

create table if not exists public.work_comments (
  id uuid primary key default gen_random_uuid(),
  work_id text not null references public.works(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null check (char_length(user_name) between 1 and 40),
  avatar_url text,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists work_comments_work_created_idx
  on public.work_comments (work_id, created_at desc);

alter table public.work_comments enable row level security;

drop policy if exists "Comments are publicly readable" on public.work_comments;
create policy "Comments are publicly readable"
on public.work_comments for select
to public
using (true);

drop policy if exists "Users can create own comments" on public.work_comments;
create policy "Users can create own comments"
on public.work_comments for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own comments" on public.work_comments;
create policy "Users can delete own comments"
on public.work_comments for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select on public.work_comments to anon, authenticated;
grant insert, delete on public.work_comments to authenticated;

commit;
