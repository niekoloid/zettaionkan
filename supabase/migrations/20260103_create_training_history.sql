-- Create training_sessions table
create table public.training_sessions (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone not null default now(),
  score integer not null,
  total_questions integer not null,
  details jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  constraint training_sessions_pkey primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.training_sessions enable row level security;

-- Policy: Users can view their own training sessions
create policy "Users can view their own training sessions"
  on public.training_sessions
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own training sessions
create policy "Users can insert their own training sessions"
  on public.training_sessions
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own training sessions (if needed, though logs are usually immutable)
create policy "Users can update their own training sessions"
  on public.training_sessions
  for update
  using (auth.uid() = user_id);
