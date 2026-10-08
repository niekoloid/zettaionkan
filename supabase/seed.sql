-- Local development data (runs on `supabase start` / `supabase db reset`).
-- All users have the password: password123
--
--   test@example.com      premium   (the "DEBUG TEST LOGIN" button on /auth uses this one)
--   standard@example.com  standard
--   entry@example.com     entry
--   free@example.com      free      (the app treats a signed-in "free" user as "entry")

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('11111111-1111-1111-1111-111111111111'::uuid, 'test@example.com', 'premium'),
      ('22222222-2222-2222-2222-222222222222'::uuid, 'standard@example.com', 'standard'),
      ('33333333-3333-3333-3333-333333333333'::uuid, 'entry@example.com', 'entry'),
      ('44444444-4444-4444-4444-444444444444'::uuid, 'free@example.com', 'free')
    ) as t(id, email, tier)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt('password123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    ) on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), u.id, u.id::text,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email', now(), now(), now()
    ) on conflict do nothing;

    -- the on_auth_user_created trigger already created the profile row
    update public.profiles set subscription_tier = u.tier, email = u.email where id = u.id;
  end loop;
end $$;

-- A little history for the premium test user (chord quiz + autoplay)
insert into public.training_sessions (id, user_id, created_at, score, total_questions, details, settings) values
(
  'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', now() - interval '1 day', 2, 3,
  '[
    {"question":{"id":"domiso","name":"ドミソ","nameIt":"ドミソ","symbol":"C","colorName":"赤","color":"#EF4444","notes":["C4","E4","G4"],"abc":"[CEG]","sortOrder":1},"answer":{"id":"domiso","name":"ドミソ","nameIt":"ドミソ","symbol":"C","colorName":"赤","color":"#EF4444","notes":["C4","E4","G4"],"abc":"[CEG]","sortOrder":1},"isCorrect":true,"isSkipped":false},
    {"question":{"id":"dofara","name":"ドファラ","nameIt":"ドファラ","symbol":"F/C","colorName":"黄色","color":"#FFD700","notes":["C4","F4","A4"],"abc":"[CFA]","sortOrder":2},"answer":{"id":"dofara","name":"ドファラ","nameIt":"ドファラ","symbol":"F/C","colorName":"黄色","color":"#FFD700","notes":["C4","F4","A4"],"abc":"[CFA]","sortOrder":2},"isCorrect":true,"isSkipped":false},
    {"question":{"id":"domiso","name":"ドミソ","nameIt":"ドミソ","symbol":"C","colorName":"赤","color":"#EF4444","notes":["C4","E4","G4"],"abc":"[CEG]","sortOrder":1},"answer":{"id":"dofara","name":"ドファラ","nameIt":"ドファラ","symbol":"F/C","colorName":"黄色","color":"#FFD700","notes":["C4","F4","A4"],"abc":"[CFA]","sortOrder":2},"isCorrect":false,"isSkipped":false}
  ]'::jsonb,
  '{"mode":"chord_quizz","selected_chords":["domiso","dofara"],"instrument":"yamaha"}'::jsonb
),
(
  'aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', now() - interval '2 hours', 2, 2,
  '[
    {"question":{"id":"domiso","name":"ドミソ","nameIt":"ドミソ","symbol":"C","colorName":"赤","color":"#EF4444","notes":["C4","E4","G4"],"abc":"[CEG]","sortOrder":1},"answer":{"id":"domiso","name":"ドミソ","nameIt":"ドミソ","symbol":"C","colorName":"赤","color":"#EF4444","notes":["C4","E4","G4"],"abc":"[CEG]","sortOrder":1},"isCorrect":true,"isSkipped":false,"mode":"autoplay"},
    {"question":{"id":"dofara","name":"ドファラ","nameIt":"ドファラ","symbol":"F/C","colorName":"黄色","color":"#FFD700","notes":["C4","F4","A4"],"abc":"[CFA]","sortOrder":2},"answer":{"id":"dofara","name":"ドファラ","nameIt":"ドファラ","symbol":"F/C","colorName":"黄色","color":"#FFD700","notes":["C4","F4","A4"],"abc":"[CFA]","sortOrder":2},"isCorrect":true,"isSkipped":false,"mode":"autoplay"}
  ]'::jsonb,
  '{"mode":"autoplay","instrument":"yamaha","voice":false,"delay":3,"reveal_type":"icecream","selected_chords":["domiso","dofara"]}'::jsonb
)
on conflict (id) do nothing;
