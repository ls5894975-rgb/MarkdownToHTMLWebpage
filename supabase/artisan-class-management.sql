-- 满小传：传承人体验课管理与预约关联
begin;

create table if not exists public.experience_courses (
  id uuid primary key default gen_random_uuid(),
  artisan_id text not null references public.artisans(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  class_date date not null,
  start_time time not null,
  location text not null check (char_length(location) between 2 and 120),
  price integer not null default 0 check (price >= 0),
  capacity integer not null default 1 check (capacity between 1 and 100),
  status text not null default 'published' check (status in ('published', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add column if not exists course_id uuid references public.experience_courses(id) on delete set null;

create index if not exists experience_courses_artisan_date_idx
  on public.experience_courses (artisan_id, class_date, start_time);

create index if not exists bookings_course_id_idx
  on public.bookings (course_id);

alter table public.experience_courses enable row level security;

drop policy if exists "Published courses are publicly readable" on public.experience_courses;
create policy "Published courses are publicly readable"
on public.experience_courses for select
to public
using (
  status = 'published'
  or exists (
    select 1 from public.artisans
    where artisans.id = experience_courses.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can create own courses" on public.experience_courses;
create policy "Artisans can create own courses"
on public.experience_courses for insert
to authenticated
with check (
  exists (
    select 1 from public.artisans
    where artisans.id = experience_courses.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can update own courses" on public.experience_courses;
create policy "Artisans can update own courses"
on public.experience_courses for update
to authenticated
using (
  exists (
    select 1 from public.artisans
    where artisans.id = experience_courses.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.artisans
    where artisans.id = experience_courses.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can delete own courses" on public.experience_courses;
create policy "Artisans can delete own courses"
on public.experience_courses for delete
to authenticated
using (
  exists (
    select 1 from public.artisans
    where artisans.id = experience_courses.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can view received bookings" on public.bookings;
create policy "Artisans can view received bookings"
on public.bookings for select
to authenticated
using (
  exists (
    select 1 from public.artisans
    where artisans.id = bookings.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

drop policy if exists "Artisans can manage received bookings" on public.bookings;
create policy "Artisans can manage received bookings"
on public.bookings for update
to authenticated
using (
  exists (
    select 1 from public.artisans
    where artisans.id = bookings.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.artisans
    where artisans.id = bookings.artisan_id
      and artisans.profile_id = (select auth.uid())
  )
);

grant select on public.experience_courses to anon, authenticated;
grant insert, update, delete on public.experience_courses to authenticated;
grant select, update on public.bookings to authenticated;

commit;