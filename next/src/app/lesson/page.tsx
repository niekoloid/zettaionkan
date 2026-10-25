'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Flag from '@/components/Flag'
import { CHORD_BY_ID, chordsForLevel } from '@/lib/chords'
import { chordStats, checkPromotion, pickChord, type Answer } from '@/lib/engine'
import { cheer, playChord, preload, sayColor, stop, unlock, wait } from '@/lib/audio'
import { addLesson, getState, useAppState, useHydrated } from '@/lib/store'
import { useAccount } from '@/lib/account'

type Phase = 'ready' | 'run' | 'done'

export default function LessonPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const router = useRouter()
  const { sync, maxLevel } = useAccount()

  const [phase, setPhase] = useState<Phase>('ready')
  const [loaded, setLoaded] = useState<boolean | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const startedAt = useRef<string>('')
  const asked = useRef<string[]>([])
  const alive = useRef(true)

  // A level above the plan's limit (e.g. after a downgrade) plays at the limit
  const level = Math.min(s.level, maxLevel)
  const chords = chordsForLevel(level)
  const stats = useMemo(() => chordStats(s.lessons), [s.lessons])
  const total = s.questionsPerLesson

  useEffect(() => {
    if (hydrated && !s.nickname) router.replace('/start')
  }, [hydrated, s.nickname, router])

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    preload(chordsForLevel(level)).then(ok => !cancelled && setLoaded(ok))
    return () => {
      cancelled = true
    }
  }, [hydrated, level])

  useEffect(
    () => () => {
      alive.current = false
      stop()
    },
    []
  )

  const ask = async () => {
    const id = pickChord(level, asked.current, stats)
    asked.current.push(id)
    setCurrentId(id)
    setBusy(true)
    await wait(350)
    await playChord(CHORD_BY_ID[id]!)
    if (alive.current) setBusy(false)
  }

  const start = async () => {
    await unlock()
    startedAt.current = new Date().toISOString()
    asked.current = []
    setAnswers([])
    setPhase('run')
    await ask()
  }

  const finish = (list: Answer[]) => {
    stop()
    if (list.length > 0) {
      addLesson({
        id: crypto.randomUUID(),
        startedAt: startedAt.current,
        finishedAt: new Date().toISOString(),
        level,
        answers: list
      })
      sync()
    }
    setPhase('done')
  }

  const mark = async (correct: boolean) => {
    if (!currentId || busy) return
    const chord = CHORD_BY_ID[currentId]!
    const list = [...answers, { chordId: currentId, correct }]
    setAnswers(list)
    setBusy(true)
    stop()
    if (correct) {
      await cheer()
      await sayColor(chord)
    } else {
      // No "wrong" sound: say the right colour and play the chord again
      await sayColor(chord)
      await playChord(chord, 1.6)
      await wait(1600)
    }
    if (!alive.current) return
    if (list.length >= total) finish(list)
    else await ask()
  }

  /** Flip the last mark, for a mis-tap */
  const fixLast = () => {
    if (!answers.length) return
    const last = answers[answers.length - 1]!
    setAnswers([...answers.slice(0, -1), { ...last, correct: !last.correct }])
  }

  if (!hydrated || !s.nickname) return null

  if (phase === 'ready') {
    return (
      <Screen>
        <p className="text-sm font-bold text-gray-500">じゅんび</p>
        <h1 className="mt-1 text-2xl font-black">きょうの はたを ならべてね</h1>
        <div className="my-8 flex flex-wrap justify-center gap-4">
          {chords.map(c => (
            <Flag key={c.id} chord={c} size={72} />
          ))}
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>・おとが なったら、{chords.length > 1 ? 'おもう いろの はたを' : 'はたを'} あげてもらいます。</li>
          <li>・おうちの方は、画面に出る「こたえ」と見くらべて ○ か × を押してください。</li>
          <li>・スマホは お子さんに画面が見えないように持つと、音だけで答える練習になります。</li>
        </ul>
        {loaded === false && <p className="mt-4 text-sm text-red-600">音の読み込みに失敗しました。通信を確認して、もう一度開いてください。</p>}
        <button className="btn-primary mt-8 w-full py-5 text-xl" onClick={start} disabled={!loaded}>
          {loaded ? 'はじめる' : '音をよみこみ中…'}
        </button>
        <Link href="/today" className="mt-3 block text-center text-sm text-gray-400">
          やめる
        </Link>
      </Screen>
    )
  }

  if (phase === 'done') {
    const correct = answers.filter(a => a.correct).length
    const after = getState()
    const promo = checkPromotion(after.lessons, after.level)
    const sticker = ['🐱', '🚃', '🍓', '🐶', '🌷', '🚗', '🐰', '🍙', '⭐', '🐘', '🍎', '🚀', '🐧', '🌈'][(after.lessons.length - 1 + 14) % 14]
    return (
      <Screen>
        <div className="flex flex-col items-center pt-6 text-center">
          <div className="animate-pop text-8xl">{answers.length ? sticker : '👋'}</div>
          <h1 className="mt-4 text-3xl font-black">{answers.length ? 'できたね！' : 'またあとでね'}</h1>
          {answers.length > 0 && (
            <p className="mt-2 text-gray-500">シールを1まい もらったよ</p>
          )}
        </div>
        {answers.length > 0 && (
          <div className="card mt-8 text-sm">
            <p className="text-xs font-bold text-gray-400">おうちの方へ</p>
            <p className="mt-1 text-gray-700">
              {answers.length}問中 {correct}問 正解（{Math.round((correct / answers.length) * 100)}%）
            </p>
            {promo.ready && after.level < maxLevel && (
              <p className="mt-2 font-bold text-amber-700">次の和音に進める状態です。ホームから追加できます。</p>
            )}
            {!promo.ready && <p className="mt-2 text-gray-500">{promo.hint}</p>}
          </div>
        )}
        <Link href="/today" className="btn-primary mt-8 w-full py-4 text-lg">
          おわる
        </Link>
      </Screen>
    )
  }

  const chord = currentId ? CHORD_BY_ID[currentId]! : null
  return (
    <Screen>
      <div className="flex items-center justify-between">
        <div className="flex gap-1" aria-label={`${answers.length} / ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < answers.length ? (answers[i]!.correct ? 'bg-emerald-500' : 'bg-gray-400') : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <button className="text-sm font-bold text-gray-400" onClick={() => finish(answers)}>
          おしまい
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
        {chord && <Flag chord={chord} size={56} label={false} />}
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400">こたえ（おうちの方へ）</p>
          <p className="text-2xl font-black">{chord?.kana}</p>
          <p className="text-xs text-gray-400">{chord?.notes}</p>
        </div>
        <button
          className="btn-ghost px-3 py-2 text-sm"
          disabled={busy || !chord}
          onClick={async () => {
            setBusy(true)
            await playChord(chord!)
            setBusy(false)
          }}
        >
          もういちど
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">{busy ? '♪' : 'はたは あっていた？'}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <button
          className="flex aspect-square items-center justify-center rounded-[2rem] bg-emerald-500 text-7xl font-black text-white shadow-lg active:scale-95 disabled:opacity-40"
          onClick={() => mark(true)}
          disabled={busy}
          aria-label="あっていた"
        >
          ○
        </button>
        <button
          className="flex aspect-square items-center justify-center rounded-[2rem] bg-gray-200 text-6xl font-black text-gray-600 shadow active:scale-95 disabled:opacity-40"
          onClick={() => mark(false)}
          disabled={busy}
          aria-label="ちがっていた"
        >
          ×
        </button>
      </div>

      {answers.length > 0 && (
        <button className="mt-6 block w-full text-center text-xs text-gray-400" onClick={fixLast}>
          ひとつ前の ○× を なおす（いま：{answers[answers.length - 1]!.correct ? '○' : '×'}）
        </button>
      )}
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-md px-5 py-6">{children}</main>
}
