// Shows what is in the Supabase project the app currently points at.
//   npm run check-db        -> same env resolution as `npm run dev`  (.env.development.local > .env.local)
//   npm run check-db:prod   -> same env resolution as production     (.env.production.local > .env.local > .env.production)
// Read-only, uses the anon key, so row level security applies (you will only see what an anonymous user can).
import { createClient } from '@supabase/supabase-js'
import nextEnv from '@next/env'

const isProd = process.argv.includes('--prod')
nextEnv.loadEnvConfig(process.cwd(), !isProd, { info() {}, error: console.error })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('❌ Supabase env vars are missing. Check .env.local (see .env.local.example).')
  process.exit(1)
}

console.log(`🔍 Checking ${isProd ? 'PRODUCTION' : 'development'} database: ${url}\n`)
const supabase = createClient(url, key)

for (const table of ['profiles', 'training_sessions', 'inquiries']) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  console.log(error ? `❌ ${table}: ${error.message}` : `📋 ${table}: ${count} rows visible`)
}
