-- Supabase advisor fixes, and ahead of anonymous sessions for every family:
-- profiles were readable by anyone, and the signup trigger function was callable over the API.

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
