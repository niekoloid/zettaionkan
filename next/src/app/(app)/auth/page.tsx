'use client'
import Link from 'next/link'
import { vcls } from '@/lib/vue-compat'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Provider } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export default function AuthPage() {
  const supabase = getSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'signup') setIsSignUp(true)
  }, [])

  const handleAuth = async (creds?: { email: string; password: string }) => {
    const em = creds?.email ?? email
    const pw = creds?.password ?? password
    setIsLoading(true)
    setMessage('')
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: window.location.origin } })
        if (error) throw error
        setMessage('確認メールを送信しました。メールボックスをご確認ください。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw })
        if (error) throw error
        router.push('/')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/` } })
      if (error) throw error
    } catch (error: any) {
      console.error('OAuth Login Error:', error)
      setMessage(`エラーが発生しました: ${error.message || '不明なエラー'}`)
    }
  }

  return (
<div className="min-h-screen bg-white"><div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-3xl mx-auto relative overflow-hidden font-['Noto_Sans_JP']">{/* Back Button */}<Link className="absolute top-8 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors group z-20" href="/"><svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></Link><main className="flex-grow px-8 pb-20 overflow-y-auto"><div className="text-center mb-10"><div className="flex justify-center mb-8"><img className="h-32 w-auto object-contain" src="/logo_irooto.png" alt="いろおと 絶対音感トレーニング" /></div><h1 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Account</h1><h2 className="text-xl font-bold text-gray-900 mb-2">{isSignUp ? '新規登録' : 'ログイン'}</h2><p className="text-xs text-gray-500">ログインして、<br />和音を奏でよう。</p></div><div className="space-y-3 mb-8"><button className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95 shadow-sm" onClick={(e) => { handleOAuthLogin('google') }} type="button"><svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>Googleで{isSignUp ? '登録' : 'ログイン'}</button></div><div className="relative mb-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">またはメールアドレスで</span></div></div><form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAuth() }}><div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">メールアドレス</label><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="example@mail.com" /></div><div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">パスワード</label><input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" /></div><button className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50" disabled={isLoading}>{isLoading ? '処理中...' : (isSignUp ? 'アカウントを作成' : 'ログイン')}</button>{(message) ? (<p className={vcls("text-xs text-center font-medium", message.includes('送信') ? 'text-green-600' : 'text-red-500')}>{message}</p>) : null}<div className="text-center space-y-4"><button className="text-xs text-gray-400 hover:text-gray-600 font-medium block w-full" type="button" onClick={(e) => { setIsSignUp(!isSignUp) }}>{isSignUp ? '既にアカウントをお持ちの方はこちら' : '新しくアカウントを作成する'}</button>{/* Debug Login Button (Development Only) */}{(!isSignUp && isDev) ? (<div className="pt-4 border-t border-gray-50"><button className="text-[10px] text-gray-300 hover:text-gray-500 font-medium px-4 py-2 rounded-lg border border-dashed border-gray-100 hover:border-gray-200 transition-all uppercase tracking-widest" type="button" onClick={(e) => { setEmail('test@example.com'); setPassword('password123'); handleAuth({ email: 'test@example.com', password: 'password123' }) }}>🛠️ Debug Test Login</button></div>) : null}</div></form></main><footer className="text-center text-gray-300 text-[10px] pb-8 shrink-0">&copy; 2026 Akatsuki Inc.</footer></div></div>
  )
}
