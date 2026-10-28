'use client'

import Link from 'next/link'
import Shell from '@/components/Shell'
import ColorDot from '@/components/ColorDot'
import { CHORDS } from '@/lib/chords'
import { lessonCalendar } from '@/lib/ics'
import { PLANS } from '@/lib/plans'
import { changeLevel, resetAll, setState, useAppState, useHydrated } from '@/lib/store'
import { useAccount } from '@/lib/account'

export default function SettingsPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const { user, tier, unlimited, maxLevel, signOut, sync } = useAccount()

  if (!hydrated) return <Shell title="せってい">{null}</Shell>

  const update = (patch: Parameters<typeof setState>[0]) => {
    setState(patch)
    sync()
  }

  const downloadCalendar = () => {
    const blob = new Blob([lessonCalendar(s.times, `${window.location.origin}/lesson`)], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'irooto-lessons.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const planName = unlimited ? '無制限（管理者）' : PLANS.find(p => p.tier === (tier === 'entry' ? 'standard' : tier))?.name

  return (
    <Shell title="せってい">
      <section className="card space-y-4">
        <div>
          <label className="label" htmlFor="nickname">
            お子さんの呼び名
          </label>
          <input
            id="nickname"
            className="field"
            value={s.nickname}
            onChange={e => setState({ nickname: e.target.value })}
            onBlur={sync}
            maxLength={20}
          />
        </div>
        <div>
          <span className="label">1回の問題数</span>
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 20].map(n => (
              <button
                key={n}
                className={`btn py-2 ${s.questionsPerLesson === n ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white'}`}
                onClick={() => update({ questionsPerLesson: n })}
              >
                {n}問
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">3歳なら10〜15問（30秒〜1分）がおすすめです。</p>
        </div>
      </section>

      <section className="card mt-5 space-y-3">
        <h2 className="font-black">レッスンの時刻</h2>
        <div className="grid grid-cols-2 gap-3">
          {s.times.map((t, i) => (
            <input
              key={i}
              type="time"
              className="field"
              value={t}
              onChange={e => setState({ times: s.times.map((x, j) => (j === i ? e.target.value : x)) })}
              onBlur={sync}
            />
          ))}
        </div>
        <button className="btn-ghost w-full" onClick={downloadCalendar}>
          カレンダーに登録（通知つき）
        </button>
        <p className="text-xs text-gray-400">
          ダウンロードしたファイルを開くと、毎日この時刻に通知が出ます。時刻を変えたときは、古い予定を消してから登録し直してください。
        </p>
      </section>

      <section className="card mt-5">
        <h2 className="font-black">和音の数</h2>
        <p className="mt-1 text-sm text-gray-600">
          いま {s.level}和音（{CHORDS[s.level - 1]!.kana}まで）。ふつうはホームの案内に沿って増やします。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHORDS.slice(0, s.level).map(c => (
            <ColorDot key={c.id} chord={c} size={32} label={false} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="btn-ghost py-2 text-sm"
            disabled={s.level <= 1}
            onClick={() => confirm('和音をひとつ減らしますか？') && (changeLevel(s.level - 1), sync())}
          >
            ひとつ減らす
          </button>
          <button
            className="btn-ghost py-2 text-sm"
            disabled={s.level >= maxLevel}
            onClick={() => confirm('判定を待たずに和音をひとつ増やしますか？') && (changeLevel(s.level + 1), sync())}
          >
            ひとつ増やす
          </button>
        </div>
      </section>

      <section className="card mt-5 space-y-3">
        <h2 className="font-black">アカウントとプラン</h2>
        {user ? (
          <>
            <p className="text-sm text-gray-600">
              {user.email} でログイン中。プラン：{planName}
            </p>
            <p className="text-xs text-gray-400">記録はアカウントに保存され、ほかのスマホでも続きができます。</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/plans" className="btn-ghost py-2 text-sm">
                プラン
              </Link>
              <button className="btn-ghost py-2 text-sm" onClick={signOut}>
                ログアウト
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              いまは このスマホの中だけに記録しています。ログインすると記録をアカウントに保存でき、家族のスマホでも続きができます。
            </p>
            <Link href="/login" className="btn-primary w-full">
              ログイン / 新規登録
            </Link>
          </>
        )}
      </section>

      <section className="mt-8 space-y-3 text-center text-sm">
        <Link href="/mat" className="block text-gray-600 underline">
          印刷用の いろマット
        </Link>
        <button
          className="text-red-500"
          onClick={() => confirm('このスマホの記録と設定をすべて消しますか？（アカウントの記録は残ります）') && resetAll()}
        >
          このスマホの記録を消す
        </button>
      </section>
    </Shell>
  )
}
