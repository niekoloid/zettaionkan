'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAccount } from '@/lib/account'

const nextPath = () => {
  const n = new URLSearchParams(window.location.search).get('next')
  return n && n.startsWith('/') && !n.startsWith('//') ? n : '/today'
}

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAccount()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const sb = getSupabase()

  useEffect(() => {
    if (user) router.replace(nextPath())
  }, [user, router])

  const google = async () => {
    await sb?.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${nextPath()}` }
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sb) return
    setBusy(true)
    setMessage(null)
    try {
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${nextPath()}` }
        })
        if (error) throw error
        setMessage({ ok: true, text: '確認メールを送りました。メール内のリンクを開くと登録が完了します。' })
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'エラーが発生しました' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-sm px-5 py-8">
      <Link href="/today" className="text-sm text-gray-400">
        ← もどる
      </Link>
      <h1 className="mt-6 text-2xl font-black">{mode === 'signin' ? 'ログイン' : 'アカウントをつくる'}</h1>
      <p className="mt-2 text-sm text-gray-600">
        ログインすると記録がアカウントに保存され、家族のスマホでも同じ続きができます。いま このスマホにある記録も引き継がれます。
      </p>

      {!sb ? (
        <p className="mt-6 text-sm text-red-600">ただいまログインを利用できません。</p>
      ) : (
        <>
          <button className="btn-ghost mt-6 w-full py-3.5" onClick={google}>
            Googleで{mode === 'signin' ? 'ログイン' : '登録'}
          </button>
          <div className="my-6 text-center text-xs text-gray-400">またはメールアドレスで</div>
          <form onSubmit={submit} className="space-y-4">
            <input className="field" type="email" required placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <input
              className="field"
              type="password"
              required
              minLength={8}
              placeholder="パスワード（8文字以上）"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            <button className="btn-primary w-full py-3.5" disabled={busy}>
              {busy ? '処理中…' : mode === 'signin' ? 'ログイン' : '登録する'}
            </button>
          </form>
          {message && <p className={`mt-4 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>}
          <button className="mt-6 w-full text-center text-sm text-gray-500" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'はじめての方はこちら（新規登録）' : 'アカウントをお持ちの方はこちら'}
          </button>
        </>
      )}
    </main>
  )
}
