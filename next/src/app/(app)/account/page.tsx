'use client'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { vcls } from '@/lib/vue-compat'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import type { SubscriptionTier } from '@/types/app'
import { DEBUG_TIER_COOKIE, useAuth } from '@/lib/app-context'
import { getSupabase } from '@/lib/supabase'
import { writeCookie } from '@/lib/cookie'

export default function AccountPage() {
  const router = useRouter()
  const supabase = getSupabase()
  const { user, userTier, refreshStatus, authReady } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [hasCustomer, setHasCustomer] = useState(false)

  // Has this user ever been a Stripe customer? (needed for the billing portal)
  const fetchCustomer = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return false
    const { data } = await supabase.from('profiles').select('stripe_customer_id').eq('id', u.id).single()
    return !!(data as { stripe_customer_id?: string } | null)?.stripe_customer_id
  }, [supabase])

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshStatus()
    setHasCustomer(await fetchCustomer())
    setIsLoading(false)
  }

  useEffect(() => {
    if (!authReady) return
    let active = true
    ;(async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { router.push('/auth'); return }
        const has = await fetchCustomer()
        if (active) setHasCustomer(has)
      } catch (e) {
        console.error('Failed to load account info:', e)
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getTierName = (tier: SubscriptionTier | undefined | null | string) => {
    if (tier === 'premium') return 'PROプラン'
    if (tier === 'standard') return 'スタンダードプラン'
    if (tier === 'entry') return 'フリープラン'
    if (tier === 'free') return 'フリープラン（未ログイン）'
    return '無料プラン'
  }

  const openCustomerPortal = async () => {
    let customer = hasCustomer
    if (!customer) {
      // one last refresh before giving up
      await handleRefresh()
      customer = await fetchCustomer()
      if (!customer) {
        alert('お支払い情報が見つかりません。プランへの加入履歴がありません。\nプランに加入したばかりの場合は、反映まで数分かかることがあります。')
        return
      }
    }

    setIsPortalLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      // Edge Function 'create-portal-session'
      const { data } = await supabase.functions.invoke('create-portal-session', {
        body: { return_url: window.location.origin + '/account' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
      alert('管理画面の準備中にエラーが発生しました。しばらく時間をおいてから再度お試しください。')
    } finally {
      setIsPortalLoading(false)
    }
  }

  // Debug support (dev only): force a tier
  const isDev = process.env.NODE_ENV === 'development'
  const setDebugTier = (tier: string | null) => {
    writeCookie(DEBUG_TIER_COOKIE, tier ?? '', tier ? 60 * 60 * 24 * 365 : 0)
    if (confirm(`Debugging: Set tier to ${tier || 'Real'}. Reload?`)) window.location.reload()
  }

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP']"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">{/* Header */}<AppHeader showBack />{(!isLoading) ? (<main className="flex-grow px-8 pb-20 overflow-y-auto"><div className="text-center mb-10"><h1 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">My Account</h1><h2 className="text-xl font-bold text-gray-900 mb-2">マイページ</h2></div><div className="space-y-8">{/* User Info Card */}<div className="bg-gray-50 rounded-3xl p-6 border border-gray-100"><div className="flex items-center space-x-4 mb-6"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl font-bold text-gray-400 uppercase">{user?.email?.charAt(0)}</div><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">メールアドレス</p><p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{user?.email}</p></div></div><div className="pt-6 border-t border-white flex justify-between items-center"><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">現在のプラン</p><div className="flex items-center space-x-2"><p className="text-base font-black text-gray-900">{getTierName(userTier)}</p><button className="p-1 text-gray-400 hover:text-indigo-500 transition-colors" onClick={handleRefresh} title="ステータスを更新"><svg className={vcls("h-3 w-3", { 'animate-spin': isLoading })} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button></div></div><Link className="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors" href="/subscription">プラン一覧を見る</Link></div></div>{/* Management Menu */}<div className="space-y-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">各種設定</p>{(userTier !== 'free' || hasCustomer) ? (<button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group" onClick={openCustomerPortal} disabled={isPortalLoading}><div className="flex items-center"><div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div><span className="text-sm font-bold text-gray-700">{isPortalLoading ? '準備中...' : 'お支払い情報の管理・解約'}</span></div><svg className="h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>) : null}<button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-red-50 transition-all group" onClick={handleLogout}><div className="flex items-center"><div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mr-3 group-hover:bg-red-100 group-hover:text-red-500 transition-colors"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div><span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">ログアウト</span></div></button></div>{/* Back to Home Button */}<div className="pt-10"><Link className="flex items-center justify-center space-x-2 py-4 text-gray-400 hover:text-gray-600 transition-colors group" href="/"><svg className="h-4 w-4 transform transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg><span className="text-sm font-bold">ホームに戻る</span></Link></div>{/* Debug Section (Dev Only) */}{(isDev) ? (<section className="opacity-50 hover:opacity-100 transition-opacity pt-8"><div className="border-t border-dashed border-gray-300 pt-6"><h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Development Debug</h3><div className="flex gap-2 flex-wrap"><button className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold hover:bg-gray-200" onClick={(e) => { setDebugTier('free') }}>Force Free</button><button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold hover:bg-blue-200" onClick={(e) => { setDebugTier('entry') }}>Force Entry</button><button className="px-3 py-1 bg-green-100 text-green-600 rounded text-xs font-bold hover:bg-green-200" onClick={(e) => { setDebugTier('standard') }}>Force Standard</button><button className="px-3 py-1 bg-amber-100 text-amber-600 rounded text-xs font-bold hover:bg-amber-200" onClick={(e) => { setDebugTier('premium') }}>Force PRO (Pro)</button><button className="px-3 py-1 bg-white border border-gray-200 text-gray-400 rounded text-xs font-bold hover:bg-gray-50" onClick={(e) => { setDebugTier(null) }}>Reset to Real</button></div></div></section>) : null}</div></main>) : (<div className="flex-grow flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>)}<footer className="text-center text-gray-300 text-[10px] pb-8 shrink-0">&copy; 2026 Akatsuki Inc.</footer></div></div>
  )
}
