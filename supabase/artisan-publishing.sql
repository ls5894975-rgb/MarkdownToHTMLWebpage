-- 当前登录传承人初始化与本人作品权限
-- 不绑定任何现有大师；为 ls5894975@gmail.com 建立独立工作室资料。

begin;

update public.profiles
set role = 'artisan'
where id = (
  select id from auth.users where email = 'ls5894975@gmail.com'
);

insert into public.artisans (
  id,
  profile_id,
  name,
  title,
  category_id,
  bio,
  quote,
  years_experience,
  work_count,
  follower_count,
  is_verified,
  sort_order
)
select
  'artisan-' || left(replace(user_row.id::text, '-', ''), 12),
  user_row.id,
  split_part(user_row.email, '@', 1),
  '非遗传承人 · 个人工作室',
  'suzhou-embroidery',
  '这位传承人正在完善个人简介。',
  '以手艺守住时间，以作品连接知音。',
  0,
  0,
  0,
  false,
  999
from auth.users as user_row
where user_row.email = 'ls5894975@gmail.com'
  and not exists (
    select 1 from public.artisans where profile_id = user_row.id
  );

alter table public.artisans enable row level security;
alter table public.works enable row level security;
grant select, update on table public.artisans to authenticated;
grant insert, update, delete on table public.works to authenticated;

drop policy if exists "Artisans can update own profile" on public.artisans;
create policy "Artisans can update own profile"
on public.artisans
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "Artisans can insert own works" on public.works;
create policy "Artisans can insert own works"
on public.works
for insert
to authenticated
with check (
  exists (
    select 1
    from public.artisans as artisan
    where artisan.id = works.artisan_id
      and artisan.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can update own works" on public.works;
create policy "Artisans can update own works"
on public.works
for update
to authenticated
using (
  exists (
    select 1
    from public.artisans as artisan
    where artisan.id = works.artisan_id
      and artisan.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.artisans as artisan
    where artisan.id = works.artisan_id
      and artisan.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can delete own works" on public.works;
create policy "Artisans can delete own works"
on public.works
for delete
to authenticated
using (
  exists (
    select 1
    from public.artisans as artisan
    where artisan.id = works.artisan_id
      and artisan.profile_id = (select auth.uid())
  )
);

commit;

select id, name, title, profile_id is not null as account_linked
from public.artisans
where profile_id = (
  select id from auth.users where email = 'ls5894975@gmail.com'
);