'use client'

import { useMemo } from 'react'
import Shell from '@/components/Shell'
import Flag from '@/components/Flag'
import { chordsForLevel } from '@/lib/chords'
import { accuracy, chordStats, dayKey, lessonsOn } from '@/lib/engine'
import { useAppState, useHydrated } from '@/lib/store'

export default function RecordPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const stats = useMemo(() => chordStats(s.lessons), [s.lessons])

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
                <Flag chord={c} size={32} label={false} />
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
                    {l.level}和音・{c}/{l.answers.length}問
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
