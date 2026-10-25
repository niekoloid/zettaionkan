-- まいにちコース: one child profile per account, lesson records, and an unlimited flag for the operator.

-- ---------------------------------------------------------------- profiles.is_unlimited
-- Set by hand (SQL editor) for the operator's own account; clients cannot update profiles.
alter table public.profiles add column if not exists is_unlimited boolean not null default false;

-- ---------------------------------------------------------------- children
create table if not exists public.children (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '',
  times text[] not null default '{07:30,17:30,19:00,20:30}',
  questions_per_lesson integer not null default 15 check (questions_per_lesson between 5 and 30),
  level integer not null default 1 check (level between 1 and 14),
  level_changed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.children enable row level security;

drop policy if exists "children: read own" on public.children;
drop policy if exists "children: insert own" on public.children;
drop policy if exists "children: update own" on public.children;
create policy "children: read own" on public.children for select to authenticated using (auth.uid() = user_id);
create policy "children: insert own" on public.children for insert to authenticated with check (auth.uid() = user_id);
create policy "children: update own" on public.children for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- lessons
create table if not exists public.lessons (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  level integer not null,
  answers jsonb not null,
  correct integer not null,
  total integer not null,
  created_at timestamptz not null default now()
);
create index if not exists lessons_user_started_idx on public.lessons (user_id, started_at desc);
alter table public.lessons enable row level security;

drop policy if exists "lessons: read own" on public.lessons;
drop policy if exists "lessons: insert own" on public.lessons;
drop policy if exists "lessons: update own" on public.lessons;
drop policy if exists "lessons: delete own" on public.lessons;
create policy "lessons: read own" on public.lessons for select to authenticated using (auth.uid() = user_id);
create policy "lessons: insert own" on public.lessons for insert to authenticated with check (auth.uid() = user_id);
-- upsert needs update; rows can only be rewritten by their owner
create policy "lessons: update own" on public.lessons for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lessons: delete own" on public.lessons for delete to authenticated using (auth.uid() = user_id);
