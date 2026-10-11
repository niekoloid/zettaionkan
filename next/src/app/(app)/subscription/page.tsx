'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import PageTitle from '@/components/PageTitle'
import { useAuth } from '@/lib/app-context'
import { getSupabase } from '@/lib/supabase'

type Tier = 'free' | 'standard' | 'premium'

// Feature lists mirror FEATURE_GATES in constants/features.ts and the LP pricing section
const PLANS: { id: Tier; name: string; tagline: string; monthly: number; yearly: number; yearlyNote?: string; features: { ok: boolean; t: string }[] }[] = [
  {
    id: 'free', name: 'Free', tagline: 'まずは基本から', monthly: 0, yearly: 0,
    features: [
      { ok: true, t: '白鍵の和音 9種類' },
      { ok: true, t: '聞き流し（赤の和音）' },
      { ok: true, t: '演出モード 2種類（ねこ・迫る電車）' },
      { ok: false, t: '黒鍵の和音（全14種類）' },
      { ok: false, t: 'Steinway Model B 音源' }
    ]
  },
  {
    id: 'standard', name: 'Standard', tagline: '基本をしっかり', monthly: 980, yearly: 9800, yearlyNote: '2か月分おトク',
    features: [
      { ok: true, t: '白鍵の和音 9種類' },
      { ok: true, t: '黒鍵の和音（全14種類）' },
      { ok: true, t: '聞き流し（全14和音・全モード）' },
      { ok: true, t: 'すべての演出モード' },
      { ok: true, t: '色のひらがな表示・詳しい学習履歴' },
      { ok: false, t: 'Steinway Model B 音源' }
    ]
  },
  {
    id: 'premium', name: 'Premium', tagline: '最高の音で', monthly: 1980, yearly: 15000,
    features: [
      { ok: true, t: 'Standard のすべて' },
      { ok: true, t: 'Steinway Model B 音源' },
      { ok: true, t: 'ホーム画面の鍵盤の音' },
      { ok: true, t: '和音と色のカスタマイズ' }
    ]
  }
]

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, userTier } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async (tierArg: 'standard' | 'premium' = 'premium') => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!user || !session) {
        alert('セッションが切れているか、ログインしていません。もう一度ログインしてください。')
        router.push('/auth')
        return
      }

      // Test mode is decided by the publishable key
      const isTest = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').startsWith('pk_test')

      // The Supabase client adds the Authorization header automatically
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { tier: tierArg, interval: billingCycle, return_url: window.location.origin + '/subscription/success', is_test: isTest }
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err: any) {
      console.error('Subscription error:', err)
      alert(`エラーが発生しました: ${err?.message || JSON.stringify(err) || '不明なエラー'}\n\n(詳細はコンソールを確認してください)`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased">
      <div className="min-h-screen flex flex-col max-w-3xl mx-auto relative">
        <AppHeader showBack />
        <main className="flex-grow px-5 sm:px-6 py-8 pb-20">
          <PageTitle
            title="料金プラン"
            lead="有料プラン（Standard / Premium）をまとめて「PRO」と呼んでいます。どちらも最初の14日間は無料で、体験中に解約すれば料金はかかりません。"
          />

          {/* Billing cycle */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full bg-gray-100 p-1" role="group" aria-label="支払い周期">
              {(['monthly', 'yearly'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBillingCycle(c)}
                  aria-pressed={billingCycle === c}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all ${billingCycle === c ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {c === 'monthly' ? '月額払い' : '年額払い'}
                  {c === 'yearly' && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">おトク</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map(p => {
              const current = userTier === p.id
              const highlight = p.id === 'standard'
              const price = billingCycle === 'monthly' ? p.monthly : p.yearly
              return (
                <div key={p.id} className={`relative flex flex-col rounded-3xl p-6 ${highlight ? 'bg-gray-900 text-white shadow-xl ring-4 ring-indigo-200' : 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'}`}>
                  {highlight && !current && <span className="absolute -top-3 left-6 rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-black text-white">人気</span>}
                  {current && <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-black ${highlight ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>現在のプラン</span>}
                  <h2 className="text-lg font-black">{p.name}</h2>
                  <p className={`text-xs font-bold ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{p.tagline}</p>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{yen(price)}</span>
                    <span className={`text-sm font-bold ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{p.monthly === 0 ? '' : billingCycle === 'monthly' ? '/月' : '/年'}</span>
                  </p>
                  {p.monthly > 0 && (
                    <p className={`mt-1 text-xs font-bold ${highlight ? 'text-indigo-200' : 'text-indigo-700'}`}>
                      {billingCycle === 'monthly' ? `年額 ${yen(p.yearly)}${p.yearlyNote ? `（${p.yearlyNote}）` : ''}` : `月あたり ${yen(Math.round(p.yearly / 12))}`}
                    </p>
                  )}

                  <ul className="mt-6 flex-grow space-y-2.5">
                    {p.features.map(f => (
                      <li key={f.t} className={`flex items-start gap-2 text-sm ${f.ok ? '' : highlight ? 'text-white/40' : 'text-gray-400'}`}>
                        {f.ok ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-indigo-300' : 'text-indigo-600'}`} aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                        )}
                        <span className="font-bold">{f.t}</span>
                      </li>
                    ))}
                  </ul>

                  {p.id === 'free' ? (
                    <Link href="/" className="mt-6 flex h-12 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-200 transition-colors">
                      {current ? '無料のまま使う' : 'ホームへ戻る'}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(p.id as 'standard' | 'premium')}
                      disabled={isLoading || current}
                      className={`mt-6 flex h-12 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${highlight ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                    >
                      {isLoading ? '処理中…' : current ? 'ご利用中' : '14日間無料で試す'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs leading-relaxed text-gray-500">
            決済は Stripe を通じて安全に行われます。契約期間の縛りはなく、
            <Link href="/account" className="underline underline-offset-2 hover:text-gray-800">マイページ</Link>
            からいつでも解約できます。
          </p>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            <Link className="hover:underline" href="/terms">利用規約</Link>
            {' ・ '}
            <Link className="hover:underline" href="/privacy">プライバシーポリシー</Link>
            {' ・ '}
            <Link className="hover:underline" href="/legal">特定商取引法に基づく表記</Link>
          </p>
        </main>
      </div>
    </div>
  )
}
