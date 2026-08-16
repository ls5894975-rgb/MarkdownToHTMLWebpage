-- 满小传：体验课预约表
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artisan_id text not null references public.artisans(id) on delete restrict,
  course_title text not null,
  booking_date date not null,
  time_slot text not null,
  participants integer not null check (participants between 1 and 6),
  price_per_person integer not null check (price_per_person >= 0),
  total_amount integer generated always as (participants * price_per_person) stored,
  contact text not null check (char_length(contact) between 2 and 100),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_id_created_at_idx
  on public.bookings (user_id, created_at desc);

create index if not exists bookings_artisan_id_date_idx
  on public.bookings (artisan_id, booking_date);

alter table public.bookings enable row level security;

drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users can view own bookings"
  on public.bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own bookings" on public.bookings;
create policy "Users can create own bookings"
  on public.bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.bookings to authenticated;

-- 允许登录用户取消自己的待确认预约
-- 只能把 pending 改为 cancelled，不能确认或修改他人的预约。
drop policy if exists "Users can cancel own pending bookings" on public.bookings;
create policy "Users can cancel own pending bookings"
  on public.bookings
  for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'cancelled');

grant update (status) on public.bookings to authenticated;