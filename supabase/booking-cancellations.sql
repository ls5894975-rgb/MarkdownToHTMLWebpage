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