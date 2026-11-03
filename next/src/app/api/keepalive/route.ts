/**
 * Called once a day by Vercel Cron (see vercel.json) so Supabase sees activity
 * even when nobody visits; free projects are paused after a week without any.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return Response.json({ ok: false, error: 'supabase not configured' }, { status: 500 })
  const res = await fetch(`${url}/rest/v1/rpc/increment_access`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store'
  })
  return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 })
}
