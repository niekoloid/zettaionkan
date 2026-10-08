# Test environment (Vercel preview + a separate Supabase project)

Use a **new** Supabase project, not production. The Next.js app in `next/` only needs three tables
(`profiles`, `training_sessions`, `inquiries`) and one storage bucket (`narration_custom`).

## 1. Supabase (test project)
1. Create a project (e.g. `zettaionkan-test`).
2. SQL Editor → run `schema.sql` in this folder.
3. Authentication → URL Configuration:
   - Site URL: your Vercel preview URL
   - Redirect URLs: `https://*-<your-team>.vercel.app/**` and `http://localhost:3000/**`
4. (Optional) Authentication → Providers → Google, if you want to test Google login.
5. Project Settings → API: copy the **Project URL** and the **anon public key**.

## 2. Vercel
1. Import the GitHub repo `niekoloid/zettaionkan`.
2. Root Directory: `next` (keep "Include source files outside of the Root Directory" ON).
3. Environment variables (Preview, or all environments for a pure test project):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (a `pk_test_...` key), `NEXT_PUBLIC_FORMSPREE_ENDPOINT`
4. Deploy the branch `claude/optimistic-thompson-qayzyl`.

## 3. Try the paid features
Sign up in the test app, then in Supabase → Table editor → `profiles` set `subscription_tier`
to `entry` / `standard` / `premium` for your user and reload.
(Subscriptions via Stripe need the Edge Functions in `supabase/functions` deployed to the test
project with Stripe **test** keys; skip that unless you want to test checkout.)

## Do not
- run `supabase db push` / `supabase link` for this project from this repo folder without checking
  `supabase/.temp/project-ref` (it points at production);
- copy production data or keys into the test project.
