-- Allow users to delete their own training sessions
create policy "Users can delete their own training sessions"
  on public.training_sessions
  for delete
  using (auth.uid() = user_id);
