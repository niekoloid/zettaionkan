-- Daily access counter. Each visit (and a daily Vercel cron) adds 1, which also keeps
-- the free Supabase project from being paused for inactivity.
create table if not exists public.access_counts (
  day date primary key default ((now() at time zone 'Asia/Tokyo')::date),
  count integer not null default 0
);

alter table public.access_counts enable row level security;
-- No policies: clients can only change it through increment_access()

create or replace function public.increment_access()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.access_counts (day, count)
  values ((now() at time zone 'Asia/Tokyo')::date, 1)
  on conflict (day) do update set count = public.access_counts.count + 1;
$$;

revoke all on function public.increment_access() from public;
grant execute on function public.increment_access() to anon, authenticated;
