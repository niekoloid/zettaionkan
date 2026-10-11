-- Schema for a SEPARATE Supabase TEST project (never run this against production).
-- Derived from app/types/database.types.ts and supabase/migrations/. Review before use.
-- Kept outside supabase/migrations on purpose: this repo is linked to the production
-- project (supabase/.temp/project-ref), so `supabase db push` must not pick it up.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  email text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'entry', 'standard', 'premium')),
  stripe_customer_id text,
  naming_convention text,
  preferred_instrument text,
  color_format text,
  custom_chords jsonb
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select to authenticated using (auth.uid() = id);
-- No client-side update policy: the tier is changed only by the Stripe webhook (service role) or by hand in the dashboard.

-- create a profile row for every new user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- training_sessions
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  score integer not null,
  total_questions integer not null,
  details jsonb not null,
  settings jsonb not null
);
create index if not exists training_sessions_user_created_idx on public.training_sessions (user_id, created_at desc);
alter table public.training_sessions enable row level security;

drop policy if exists "sessions: read own" on public.training_sessions;
drop policy if exists "sessions: insert own" on public.training_sessions;
drop policy if exists "sessions: delete own" on public.training_sessions;
create policy "sessions: read own" on public.training_sessions for select to authenticated using (auth.uid() = user_id);
create policy "sessions: insert own" on public.training_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "sessions: delete own" on public.training_sessions for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------- inquiries (no policies = service role only)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null
);
alter table public.inquiries enable row level security;

-- ---------------------------------------------------------------- storage: parent's recorded voices
insert into storage.buckets (id, name, public) values ('narration_custom', 'narration_custom', true) on conflict (id) do nothing;

drop policy if exists "Users can upload their own narration files" on storage.objects;
drop policy if exists "Users can view their own narration files" on storage.objects;
drop policy if exists "Users can delete their own narration files" on storage.objects;
drop policy if exists "Users can update their own narration files" on storage.objects;
create policy "Users can upload their own narration files" on storage.objects for insert to authenticated
  with check (bucket_id = 'narration_custom' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view their own narration files" on storage.objects for select to authenticated
  using (bucket_id = 'narration_custom' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update their own narration files" on storage.objects for update to authenticated
  using (bucket_id = 'narration_custom' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own narration files" on storage.objects for delete to authenticated
  using (bucket_id = 'narration_custom' and (storage.foldername(name))[1] = auth.uid()::text);
