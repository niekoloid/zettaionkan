'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Flag from '@/components/Flag'
import { CHORDS } from '@/lib/chords'
import { DEFAULT_TIMES, setState, useAppState } from '@/lib/store'
import { useAccount } from '@/lib/account'

const TIME_LABELS = ['あさ', 'おかえり', 'ゆうがた', 'ねるまえ']

export default function StartPage() {
  const router = useRouter()
  const { sync } = useAccount()
  const [nickname, setNickname] = useState('')
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES)

  const s = useAppState()

  // Already set up (or restored from the account after signing in)
  useEffect(() => {
    if (s.nickname) router.replace('/today')
  }, [s.nickname, router])

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setState({ nickname: nickname.trim(), times })
    sync()
    router.push('/today')
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-8">
      <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-8 w-auto" />
      <h1 className="mt-6 text-2xl font-black">はじめる前に</h1>
      <p className="mt-2 text-sm text-gray-600">
        1回30秒ほどのレッスンを、1日4回。お子さんは音を聞いて色の旗をあげ、おうちの方は ○ か × を押すだけです。
      </p>

      <form onSubmit={save} className="mt-8 space-y-6">
        <div>
          <label className="label" htmlFor="nickname">
            お子さんの呼び名
          </label>
          <input
            id="nickname"
            className="field"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="例：はるちゃん"
            required
            maxLength={20}
          />
          <p className="mt-1 text-xs text-gray-400">本名でなくてかまいません。</p>
        </div>

        <div>
          <span className="label">レッスンの時刻（だいたいでOK）</span>
          <div className="grid grid-cols-2 gap-3">
            {times.map((t, i) => (
              <label key={i} className="block">
                <span className="text-xs text-gray-500">{TIME_LABELS[i]}</span>
                <input
                  type="time"
                  className="field mt-1"
                  value={t}
                  onChange={e => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))}
                  required
                />
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">あとで設定から、スマホのカレンダーに通知つきで登録できます。</p>
        </div>

        <div className="card">
          <p className="font-bold">旗を用意してください</p>
          <p className="mt-1 text-sm text-gray-600">
            最初は「あか」1本から始めます。折り紙やハンカチなど、その色のものなら何でもかまいません。
          </p>
          <div className="mt-3 flex gap-3">
            {CHORDS.slice(0, 3).map(c => (
              <Flag key={c.id} chord={c} size={40} />
            ))}
          </div>
          <Link href="/flags" className="mt-3 inline-block text-sm font-bold text-gray-900 underline">
            印刷して使える旗のページ
          </Link>
        </div>

        <button className="btn-primary w-full py-4 text-lg">はじめる</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        別のスマホで使っていた方は{' '}
        <Link href="/login" className="font-bold text-gray-900 underline">
          ログイン
        </Link>
      </p>
    </main>
  )
}
