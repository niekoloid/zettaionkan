'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Footer from '@/components/Footer'
import { PLANS, yen, type Tier } from '@/lib/plans'
import { getSupabase } from '@/lib/supabase'
import { useAccount } from '@/lib/account'

export default function PlansPage() {
  const router = useRouter()
  const { user, tier, unlimited } = useAccount()
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const current: Tier = tier === 'entry' ? 'standard' : tier

  const checkout = async (target: Tier) => {
    if (!user) {
      router.push('/login?next=/plans')
      return
    }
    const sb = getSupabase()
    if (!sb) return
    setBusy(target)
    setError('')
    try {
      const isTest = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').startsWith('pk_test')
      const { data, error } = await sb.functions.invoke('create-checkout-session', {
        body: { tier: target, interval: cycle, return_url: `${window.location.origin}/today?subscribed=1`, is_test: isTest }
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
      else throw new Error('no checkout url')
    } catch (err) {
      console.error(err)
      setError('お申し込み画面を開けませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setBusy(null)
    }
  }

  const manage = async () => {
    const sb = getSupabase()
    if (!sb) return
    setBusy('portal')
    try {
      const { data, error } = await sb.functions.invoke('create-portal-session', {
        body: { return_url: `${window.location.origin}/settings` }
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setError('管理画面を開けませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5">
      <header className="flex items-center justify-between py-5">
        <Link href="/">
          <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-7 w-auto" />
        </Link>
        <Link href="/today" className="text-sm font-bold text-gray-500">
          アプリへ
        </Link>
      </header>

      <h1 className="text-2xl font-black">料金プラン</h1>
      <p className="mt-2 text-sm text-gray-600">
        無料で3つの和音まで試せます。4つ目からは有料プランで。有料プランは最初の14日間無料で、その間に解約すれば料金はかかりません。
      </p>

      {unlimited && (
        <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          このアカウントは管理者として、すべての和音を無制限で使えます。
        </p>
      )}

      <div className="mt-6 inline-flex rounded-full bg-gray-100 p-1">
        {(['monthly', 'yearly'] as const).map(c => (
          <button
            key={c}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${cycle === c ? 'bg-white shadow' : 'text-gray-500'}`}
            onClick={() => setCycle(c)}
          >
            {c === 'monthly' ? '月払い' : '年払い'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PLANS.map(p => {
          const price = cycle === 'monthly' ? p.monthly : p.yearly
          const isCurrent = user && !unlimited && current === p.tier
          return (
            <section key={p.tier} className={`card flex flex-col ${p.tier === 'standard' ? 'ring-2 ring-gray-900' : ''}`}>
              <h2 className="font-black">{p.name}</h2>
              <p className="mt-2 text-3xl font-black">
                {price === 0 ? '0円' : yen(price)}
                {price > 0 && <span className="text-sm font-normal text-gray-500"> / {cycle === 'monthly' ? '月' : '年'}（税込）</span>}
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-gray-600">
                {p.points.map(x => (
                  <li key={x}>・{x}</li>
                ))}
              </ul>
              {p.tier === 'free' ? (
                <Link href="/today" className="btn-ghost mt-5">
                  無料ではじめる
                </Link>
              ) : isCurrent ? (
                <button className="btn-ghost mt-5" onClick={manage} disabled={busy !== null}>
                  ご利用中（変更・解約）
                </button>
              ) : (
                <button className="btn-primary mt-5" onClick={() => checkout(p.tier)} disabled={busy !== null || unlimited}>
                  {busy === p.tier ? '準備中…' : '14日間無料で試す'}
                </button>
              )}
            </section>
          )
        })}
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!user && <p className="mt-4 text-xs text-gray-400">有料プランのお申し込みにはログインが必要です。</p>}
      <Footer />
    </div>
  )
}
