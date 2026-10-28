'use client'

import { useMemo } from 'react'
import Shell from '@/components/Shell'
import ColorDot from '@/components/ColorDot'
import { CHORD_BY_ID, chordsForLevel } from '@/lib/chords'
import { accuracy, chordStats, confusions, dayKey, lessonsOn } from '@/lib/engine'
import { useAppState, useHydrated } from '@/lib/store'

export default function RecordPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const stats = useMemo(() => chordStats(s.lessons), [s.lessons])
  const mixups = useMemo(() => confusions(s.lessons).slice(0, 5), [s.lessons])

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const key = dayKey(d)
      const list = lessonsOn(s.lessons, key)
      return { key, date: d, count: list.length, acc: list.length ? accuracy(list.flatMap(l => l.answers)) : null }
    })
  }, [s.lessons])

  const recent = useMemo(() => [...s.lessons].reverse().slice(0, 20), [s.lessons])

  if (!hydrated) return <Shell title="きろく">{null}</Shell>

  return (
    <Shell title="きろく">
      <section className="card">
        <h2 className="font-black">この2週間</h2>
        <p className="mt-1 text-xs text-gray-400">1日のレッスン回数（4回で満タン）</p>
        <div className="mt-4 flex h-24 items-end gap-1">
          {days.map(d => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end rounded bg-gray-50">
                <div
                  className="w-full rounded bg-emerald-400"
                  style={{ height: `${(Math.min(d.count, 4) / 4) * 100}%` }}
                  title={`${d.count}回`}
                />
              </div>
              <span className="text-[10px] text-gray-400">{d.date.getDate()}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          レッスンした日：{days.filter(d => d.count > 0).length} / 14日、合計 {days.reduce((a, d) => a + d.count, 0)}回
        </p>
      </section>

      <section className="card mt-5">
        <h2 className="font-black">和音ごとの正解率</h2>
        <p className="mt-1 text-xs text-gray-400">それぞれ直近30問まで</p>
        <ul className="mt-4 space-y-3">
          {chordsForLevel(s.level).map(c => {
            const st = stats[c.id]
            const pct = st ? Math.round(st.accuracy * 100) : null
            return (
              <li key={c.id} className="flex items-center gap-3">
                <ColorDot chord={c} size={32} label={false} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">
                      {c.kana} <span className="font-normal text-gray-400">{c.notes}</span>
                    </span>
                    <span className="text-gray-500">{pct === null ? 'まだ' : `${pct}%（${st!.count}問）`}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-gray-800" style={{ width: `${pct ?? 0}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card mt-5">
        <h2 className="font-black">取り違えやすい組</h2>
        <p className="mt-1 text-xs text-gray-400">ちがう色にタッチしたときに、その色を押した記録から（直近150問）</p>
        {mixups.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">まだ記録がありません。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mixups.map(m => {
              const [a, b] = m.pair.map(id => CHORD_BY_ID[id]!)
              return (
                <li key={m.pair.join('/')} className="flex items-center gap-2 text-sm">
                  <ColorDot chord={a!} size={28} label={false} />
                  <ColorDot chord={b!} size={28} label={false} />
                  <span className="flex-1 font-bold">
                    {a!.kana} と {b!.kana}
                  </span>
                  <span className="text-gray-500">{m.count}回</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card mt-5">
        <h2 className="font-black">さいきんのレッスン</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">まだレッスンがありません。</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {recent.map(l => {
              const d = new Date(l.startedAt)
              const c = l.answers.filter(a => a.correct).length
              return (
                <li key={l.id} className="flex justify-between py-2">
                  <span className="text-gray-500">
                    {d.getMonth() + 1}/{d.getDate()} {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}
                  </span>
                  <span>
                    {l.focus ? `くらべっこ（${l.focus.map(id => CHORD_BY_ID[id]?.kana).join('・')}）` : `${l.level}和音`}・{c}/{l.answers.length}問
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </Shell>
  )
}
