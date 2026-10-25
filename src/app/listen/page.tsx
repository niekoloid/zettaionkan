'use client'

import { useEffect, useRef, useState } from 'react'
import Shell from '@/components/Shell'
import Flag from '@/components/Flag'
import { chordsForLevel, type Chord } from '@/lib/chords'
import { playChord, preload, sayColor, stop, unlock, wait } from '@/lib/audio'
import { useAppState, useHydrated } from '@/lib/store'
import { useAccount } from '@/lib/account'

/** Background listening: the chords learned so far, each followed by its colour name */
export default function ListenPage() {
  const s = useAppState()
  const hydrated = useHydrated()
  const { maxLevel } = useAccount()
  const chords = chordsForLevel(Math.min(s.level, maxLevel))
  const [playing, setPlaying] = useState<Chord | null>(null)
  // Bumped on every start/stop so an older loop notices it should end
  const run = useRef(0)
  const [starting, setStarting] = useState(false)

  useEffect(
    () => () => {
      run.current++
      stop()
    },
    []
  )

  const start = async () => {
    const id = ++run.current
    const alive = () => run.current === id
    setStarting(true)
    await unlock()
    await preload(chords)
    setStarting(false)
    let last = ''
    while (alive()) {
      const options = chords.length > 1 ? chords.filter(c => c.id !== last) : chords
      const c = options[Math.floor(Math.random() * options.length)]!
      last = c.id
      setPlaying(c)
      await playChord(c, 2.2)
      await wait(1800)
      if (!alive()) break
      await sayColor(c)
      await wait(2500)
    }
  }

  const halt = () => {
    run.current++
    stop()
    setPlaying(null)
    setStarting(false)
  }

  if (!hydrated) return <Shell title="きく">{null}</Shell>

  return (
    <Shell title="きく">
      <p className="text-sm text-gray-600">
        いま練習している和音を、色の名前といっしょに流します。車の中や遊びの合間などに。メインはあくまで旗あげのレッスンです。
      </p>
      <div
        className="mt-6 flex aspect-square w-full flex-col items-center justify-center rounded-[2.5rem] transition-colors duration-500"
        style={{ background: playing?.color ?? '#f3f4f6', color: playing?.ink ?? '#9ca3af' }}
      >
        <span className="text-5xl font-black">{playing ? playing.kana : '♪'}</span>
        {playing && <span className="mt-2 text-sm opacity-80">{playing.notes}</span>}
      </div>
      <button className="btn-primary mt-6 w-full py-4 text-lg" onClick={playing || starting ? halt : start}>
        {playing || starting ? 'とめる' : 'ながす'}
      </button>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {chords.map(c => (
          <Flag key={c.id} chord={c} size={32} />
        ))}
      </div>
    </Shell>
  )
}
