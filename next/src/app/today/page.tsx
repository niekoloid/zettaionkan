'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Shell from '@/components/Shell'
import ColorDot from '@/components/ColorDot'
import { CHORD_BY_ID, CHORDS, chordsForLevel } from '@/lib/chords'
import { checkPromotion, dayKey, isStuck, lessonsOn, suggestFocus, weekDays } from '@/lib/engine'
import { changeLevel, useAppState, useHydrated } from '@/lib/store'
import { useAccount } from '@/lib/account'
import { warm } from '@/lib/audio'

const STICKERS = ['🐱', '🚃', '🍓', '🐶', '🌷', '🚗', '🐰', '🍙', '⭐', '🐘', '🍎', '🚀', '🐧', '🌈']

export default function TodayPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const router = useRouter()
  const { maxLevel, sync } = useAccount()

  useEffect(() => {
    if (hydrated && !s.nickname) router.replace('/start')
  }, [hydrated, s.nickname, router])

  // Fetch the piano samples while the parent reads this page
  useEffect(() => {
    if (hydrated && s.nickname) warm(chordsForLevel(Math.min(s.level, maxLevel)))
  }, [hydrated, s.nickname, s.level, maxLevel])

  const today = dayKey(new Date())
  const todays = lessonsOn(s.lessons, today)
  const week = weekDays(s.lessons)
  const promo = useMemo(() => checkPromotion(s.lessons, s.level), [s.lessons, s.level])
  const stuck = useMemo(() => isStuck(s.lessons, s.level), [s.lessons, s.level])
  // Suggested at most until a くらべっこ lesson is done that day
  const focus = useMemo(
    () => (lessonsOn(s.lessons, dayKey(new Date())).some(l => l.focus) ? null : suggestFocus(s.lessons, Math.min(s.level, maxLevel))),
    [s.lessons, s.level, maxLevel]
  )
  const nextChord = CHORDS[s.level]
  const nextTime = s.times[todays.length]

  if (!hydrated || !s.nickname) return <Shell>{null}</Shell>

  const addChord = () => {
    changeLevel(s.level + 1)
    sync()
  }

  return (
    <Shell>
      <section className="pt-2">
        <p className="text-sm font-bold text-gray-500">{s.nickname}の きょう</p>
        <div className="mt-2 flex items-center gap-3">
          {s.times.map((t, i) => {
            const done = i < todays.length
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                    done ? 'animate-pop bg-amber-100' : 'border-2 border-dashed border-gray-200 bg-white'
                  }`}
                >
                  {done ? STICKERS[(s.lessons.length - todays.length + i) % STICKERS.length] : ''}
                </div>
                <span className="text-[11px] text-gray-400">{t}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {todays.length === 0
            ? '1回でもできたら、きょうは たっせい！'
            : todays.length >= 4
              ? 'きょうの4回、ぜんぶできました。'
              : `きょう ${todays.length}回できました。${nextTime ? `つぎは ${nextTime} ごろ。` : ''}`}
        </p>
      </section>

      <Link href="/lesson" className="btn-primary mt-5 w-full py-5 text-xl">
        レッスンをはじめる
      </Link>

      {promo.ready && nextChord && (
        <section className="card mt-5 border-amber-200 bg-amber-50">
          {s.level < maxLevel ? (
            <>
              <p className="font-black">つぎの いろに すすめます</p>
              <p className="mt-1 text-sm text-gray-600">
                直近{promo.counted.length}回のレッスンがよくできています。「{nextChord.kana}（{nextChord.notes}）」を加えましょう。
              </p>
              <div className="mt-3 flex items-center gap-4">
                <ColorDot chord={nextChord} />
                <button className="btn-primary flex-1" onClick={addChord}>
                  {nextChord.kana}を ふやす
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-black">つぎの いろは 有料プランで</p>
              <p className="mt-1 text-sm text-gray-600">
                {s.level}和音までよくできています。「{nextChord.kana}」から先は有料プランで続けられます（14日間無料）。
              </p>
              <Link href="/plans" className="btn-primary mt-3 w-full">
                プランを見る
              </Link>
            </>
          )}
        </section>
      )}

      {focus && (
        <section className="card mt-5 border-sky-200 bg-sky-50">
          <p className="font-black">くらべっこ をしてみましょう</p>
          <p className="mt-1 text-sm text-gray-600">
            さいきん「{CHORD_BY_ID[focus[0]]!.kana}」と「{CHORD_BY_ID[focus[1]]!.kana}」を取り違えることが多いようです。この2色だけで1回やってみると、聞き分けやすくなります。
          </p>
          <div className="mt-3 flex items-center gap-3">
            <ColorDot chord={CHORD_BY_ID[focus[0]]!} size={40} />
            <ColorDot chord={CHORD_BY_ID[focus[1]]!} size={40} />
            <Link href={`/lesson?focus=${focus.join(',')}`} className="btn-primary flex-1">
              くらべっこ
            </Link>
          </div>
        </section>
      )}

      {stuck && (
        <section className="card mt-5 border-sky-200 bg-sky-50 text-sm text-gray-700">
          <p className="font-bold">しばらく正解率が伸びていません</p>
          <p className="mt-1">
            よくあることです。設定から和音をひとつ減らして、確実にできる状態に戻してから増やし直すと進みやすくなります。
          </p>
        </section>
      )}

      <section className="card mt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-black">いまの いろ</h2>
          <span className="text-xs text-gray-400">
            {s.level} / {CHORDS.length} 和音
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chordsForLevel(s.level).map(c => (
            <ColorDot key={c.id} chord={c} size={44} />
          ))}
        </div>
        {!promo.ready && s.level < CHORDS.length && <p className="mt-3 text-xs text-gray-500">つぎの和音まで：{promo.hint}</p>}
      </section>

      <section className="card mt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-black">こんしゅう</h2>
          <span className="text-xs text-gray-400">{week.filter(d => d.done).length}日 できた</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {week.map(d => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <span className={`text-xs ${d.isToday ? 'font-black text-gray-900' : 'text-gray-400'}`}>{d.label}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  d.done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'
                }`}
              >
                {d.done ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  )
}
