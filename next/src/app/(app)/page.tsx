'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import type { Chord } from '@/constants/chords'
import { isLightColor } from '@/lib/chords'
import {
  useAppSettings, useAuth, useChordSettings, usePro, useProModal
} from '@/lib/app-context'
import { useAudio } from '@/lib/audio'

// abcjs touches the DOM, so the score is client-only (like Nuxt's ScoreDisplay.client.vue)
const ScoreDisplay = dynamic(() => import('@/components/ScoreDisplay'), { ssr: false })

type DisplayChord = Chord & { globalIndex: number; isLight: boolean; isLocked: boolean }

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const WHITE_KEYS = ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']

const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }
const toSharp = (n: string) => {
  const clean = n.replace('♭', 'b')
  for (const [flat, sharp] of Object.entries(FLAT_TO_SHARP)) {
    if (clean.startsWith(flat)) return clean.replace(flat, sharp)
  }
  return clean
}
const hasBlackKey = (white: string) => !['B', 'E'].includes(white.replace(/\d/, ''))
const blackKeyNote = (white: string) => `${white.replace(/\d/, '')}#${white.match(/\d/)![0]}`

const PLAY_DURATION_SEC = 15

const MENU_ITEMS = [
  {
    to: '/autoplay', title: '和音の聞き流し', desc: '自動で和音が出題され続けます', primary: true, iconBox: '',
    icon: ['M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z']
  },
  {
    to: '/chordquizz', title: '和音テストに挑戦', desc: '和音を色で認識できるかテスト', primary: false, iconBox: 'bg-amber-50 text-amber-600',
    icon: ['M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z']
  },
  {
    to: '/history', title: '学習履歴を確認', desc: 'これまでのトレーニング成果を見返します', primary: false, iconBox: 'bg-indigo-50 text-indigo-500',
    icon: ['M18.375 2.625a1.875 1.875 0 00-1.875 1.875v15a1.875 1.875 0 001.875 1.875h.75a1.875 1.875 0 001.875-1.875v-15a1.875 1.875 0 00-1.875-1.875h-.75zM9.75 8.625a1.875 1.875 0 011.875-1.875h.75a1.875 1.875 0 011.875 1.875v11.25a1.875 1.875 0 01-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125a1.875 1.875 0 011.875-1.875h.75a1.875 1.875 0 011.875 1.875v6.75a1.875 1.875 0 01-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z']
  },
  {
    to: '/settings', title: '各種設定', desc: '音源の切り替えやアプリの設定', primary: false, iconBox: 'bg-gray-100 text-gray-500',
    icon: ['M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.349l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.282-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.431l.84-.692a1.875 1.875 0 00.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z']
  }
]

const FOOTER_GROUPS = [
  { heading: 'トレーニング', links: [{ to: '/method', label: 'トレーニング方法' }, { to: '/about', label: 'サービス概要' }] },
  { heading: 'サポート', links: [{ to: '/subscription', label: '料金プラン' }, { to: '/faq', label: 'よくあるご質問' }, { to: '/contact', label: 'お問い合わせ' }] }
]

const LEGAL_LINKS = [
  { to: '/company', label: '運営会社' },
  { to: '/terms', label: '利用規約' },
  { to: '/privacy', label: 'プライバシーポリシー' },
  { to: '/legal', label: '特定商取引法に基づく表記' }
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HomePage() {
  const { allChords: customChords } = useChordSettings()
  const { formatChordName, formatColorName, instrument, isKeyboardSoundEnabled } = useAppSettings()
  const { userTier, authReady } = useAuth()
  const { hasAccess, isPro } = usePro()
  const { openProModal } = useProModal()
  const { samplers, isLoading, isSamplerLoaded, selectedInstrument, loadSampler } = useAudio()

  const [currentId, setCurrentId] = useState<string | null>(null)
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set())
  const [isChordPlaying, setIsChordPlaying] = useState(false)
  const [isLargeTiles, setIsLargeTiles] = useState(false)
  const playbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Chords shown on the home screen (all of them unless some were chosen in settings)
  const chords = useMemo<DisplayChord[]>(() => {
    const selected = customChords.filter(c => c.homeEnabled)
    const source = selected.length > 0 ? selected : customChords
    return source.map((chord, index) => ({
      ...chord,
      globalIndex: index + 1,
      isLight: isLightColor(chord.color),
      isLocked: !hasAccess(`home_chord_${chord.id}` as never, userTier)
    }))
  }, [customChords, hasAccess, userTier])

  const currentChord = chords.find(c => c.id === currentId) ?? chords[0] ?? null

  const activeNotes = useMemo(() => new Set((currentChord?.notes ?? []).map(toSharp)), [currentChord])
  const isNoteActive = (note: string) => activeNotes.has(toSharp(note))

  // Load the preferred instrument once auth state is known
  useEffect(() => {
    if (!authReady) return
    let preferred = instrument as 'yamaha' | 'steinway'
    if (preferred === 'steinway' && !isPro(userTier)) preferred = 'yamaha'
    loadSampler(preferred)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  useEffect(() => () => { if (playbackTimeout.current) clearTimeout(playbackTimeout.current) }, [])

  const withTone = async () => {
    const Tone = await import('tone')
    if (Tone.getContext().state !== 'running') await Tone.start()
  }

  const playChord = useCallback(async (notes: string[]) => {
    await withTone()
    const sampler = samplers[selectedInstrument]
    if (!sampler || !isSamplerLoaded) {
      console.warn('Sampler not ready or missing:', selectedInstrument)
      return
    }
    if (playbackTimeout.current) clearTimeout(playbackTimeout.current)

    sampler.releaseAll()
    setIsChordPlaying(true)
    sampler.triggerAttackRelease(notes, PLAY_DURATION_SEC)
    setPressedNotes(new Set(notes))

    playbackTimeout.current = setTimeout(() => {
      setPressedNotes(new Set())
      setIsChordPlaying(false)
      playbackTimeout.current = null
    }, PLAY_DURATION_SEC * 1000)
  }, [samplers, selectedInstrument, isSamplerLoaded])

  const playNote = useCallback(async (note: string) => {
    if (!isKeyboardSoundEnabled) return
    await withTone()
    const sampler = samplers[selectedInstrument]
    if (!sampler || !isSamplerLoaded) return
    sampler.triggerAttackRelease(note, 10)
    setPressedNotes(prev => new Set(prev).add(note))
    setTimeout(() => setPressedNotes(prev => { const n = new Set(prev); n.delete(note); return n }), 10000)
  }, [isKeyboardSoundEnabled, samplers, selectedInstrument, isSamplerLoaded])

  const toggleChord = (chord: DisplayChord) => {
    if (chord.isLocked) {
      if (userTier === 'free') openProModal('PROプラン限定', 'この和音（黒鍵など）はPROプランで利用可能です。体験版では制限されています。')
      else openProModal('PROプラン機能', 'この機能はPROプラン限定です。')
      return
    }
    setCurrentId(chord.id)
    playChord(chord.notes)
  }


  // --- Layout ---------------------------------------------------------------
  const count = chords.length
  const lockedCount = chords.filter(c => c.isLocked).length
  const gridClasses =
    count === 0 ? 'hidden'
      : count === 1 ? 'grid-cols-1 max-w-xs mx-auto'
        : count === 2 ? 'grid-cols-2 max-w-md mx-auto'
          : count === 3 ? 'grid-cols-3'
            : isLargeTiles ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-4'

  // Desktop tile height (mobile tiles stay square so circles never turn into pills)
  const itemClasses = isLargeTiles
    ? count <= 2 ? 'md:h-64' : count <= 4 ? 'md:h-48' : count <= 9 ? 'md:h-32' : 'md:h-28'
    : count > 0 && count <= 4 ? 'md:h-32' : 'md:h-20'

  const cardClasses = 'rounded-3xl bg-white shadow-sm border border-gray-100 p-4 sm:p-5'

  return (
    <div className="min-h-screen flex flex-col relative antialiased">
      {/* Background: soft grey, flooded with the chord colour while it plays */}
      <div className="fixed inset-0 bg-gray-50 pointer-events-none" />
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isChordPlaying && currentChord ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: currentChord?.color || 'transparent' }}
      />

      <AppHeader sticky />

      <main className="relative z-10 flex-grow w-full max-w-3xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Now playing: score + name + keyboard */}
        <section className={cardClasses} aria-label="えらんでいる和音">
          <div className="flex items-center gap-4 sm:gap-6">
            <ScoreDisplay
              abc={currentChord?.abc}
              isAnswered
              boxClassName="w-[116px] h-[124px] sm:w-[148px] sm:h-[150px] shrink-0 bg-gray-50 rounded-2xl border border-gray-100"
            />

            {currentChord && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wider text-gray-400">
                  {isChordPlaying ? '♪ 再生中' : 'えらんでいる和音'}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 leading-tight truncate">
                  {formatChordName(currentChord)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                    <span className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: currentChord.color }} aria-hidden="true" />
                    {formatColorName(currentChord.colorName)}
                  </span>
                  <span className="text-xs font-bold text-gray-400">No.{currentChord.globalIndex}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleChord(currentChord)}
                  disabled={isLoading}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-700 active:scale-95 disabled:opacity-40 disabled:cursor-wait focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                  </svg>
                  {isLoading ? '準備中…' : isChordPlaying ? 'もう一度きく' : 'きいてみる'}
                </button>
              </div>
            )}
          </div>

          {/* Keyboard */}
          <div className="mt-4 relative flex justify-center h-28 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 overflow-hidden" aria-label="鍵盤">
            {WHITE_KEYS.map(note => {
              const active = isNoteActive(note)
              return (
                <div
                  key={note}
                  onClick={() => playNote(note)}
                  className={`relative flex-grow border-x-[0.5px] border-gray-200 first:border-l-0 last:border-r-0 rounded-b-sm cursor-pointer active:opacity-90 overflow-hidden transition-colors duration-150 ${pressedNotes.has(note) ? 'translate-y-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-[0.98] z-10' : ''}`}
                  style={{ backgroundColor: active ? currentChord?.color : '#fff' }}
                >
                  {/* Only label the C keys; labelling every key at 5-6px was unreadable */}
                  {note.startsWith('C') && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold ${active ? (currentChord?.isLight ? 'text-black/50' : 'text-white/80') : note === 'C4' ? 'text-indigo-400' : 'text-gray-400'}`}>
                      {note}
                    </span>
                  )}
                </div>
              )
            })}

            {/* Black keys sit in the gaps between white keys */}
            <div className="absolute inset-x-1 top-1 h-16 pointer-events-none flex">
              {WHITE_KEYS.map(white => {
                const black = blackKeyNote(white)
                return (
                  <div key={`gap-${white}`} className="flex-grow relative h-full">
                    {hasBlackKey(white) && (
                      <div
                        onClick={e => { e.stopPropagation(); playNote(black) }}
                        className={`absolute right-0 translate-x-1/2 w-3/5 h-full rounded-b-sm border-x border-b border-gray-800 z-20 cursor-pointer pointer-events-auto transition-colors duration-150 ${isNoteActive(black) ? '' : 'bg-gray-800'} ${pressedNotes.has(black) ? 'translate-y-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-95 z-30' : ''}`}
                        style={isNoteActive(black) ? { backgroundColor: currentChord?.color } : undefined}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Chord tiles */}
        <section className={cardClasses} aria-labelledby="chords-heading">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="chords-heading" className="text-base font-black text-gray-900">和音をえらぶ</h2>
              <p className="mt-0.5 text-xs font-bold text-gray-500" role="status">
                {isLoading ? '音源を読み込み中です…' : 'タップすると和音が鳴ります'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLargeTiles(v => !v)}
              aria-pressed={isLargeTiles}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                {isLargeTiles
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />}
              </svg>
              {isLargeTiles ? '元のサイズ' : '大きく表示'}
            </button>
          </div>

          <div className={`grid gap-3 sm:gap-4 transition-all duration-500 ${gridClasses}`}>
            {chords.map(chord => {
              const selected = currentChord?.id === chord.id
              const fg = chord.isLight ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.96)'
              return (
                <button
                  key={chord.id}
                  type="button"
                  onClick={() => toggleChord(chord)}
                  aria-label={`${chord.globalIndex}番 ${formatChordName(chord)} ${formatColorName(chord.colorName)}${chord.isLocked ? ' (PROプラン限定)' : ''}`}
                  aria-pressed={selected}
                  className={`relative cursor-pointer shadow-sm aspect-square rounded-full md:aspect-auto md:rounded-2xl overflow-hidden transition-all duration-300 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${selected ? 'ring-[3px] ring-offset-2 ring-gray-900 z-10 scale-105 shadow-md' : 'hover:scale-105 active:scale-95 hover:shadow-md'} ${itemClasses}`}
                  style={{ backgroundColor: chord.color }}
                >
                  {/* Mobile: number + chord name; locked chords keep their true colour and show a lock instead */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center md:hidden" style={{ color: fg }}>
                    <span className={`${isLargeTiles ? 'text-3xl' : 'text-xl'} font-black leading-none`}>{chord.globalIndex}</span>
                    {chord.isLocked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`mt-1 ${isLargeTiles ? 'text-xs' : 'text-[10px]'} font-bold leading-none`}>{formatChordName(chord)}</span>
                    )}
                  </div>

                  {/* Desktop: detail view */}
                  <div className="hidden md:flex items-center w-full h-full px-4 relative z-10">
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 text-base font-black shadow-sm border-2 border-white/20"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: chord.isLight ? '#1f2937' : 'white' }}
                    >
                      {chord.globalIndex}
                      {chord.isLocked && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden justify-center h-full">
                      <span className={`font-black text-[15px] leading-tight ${chord.isLight ? 'text-gray-900' : 'text-white'}`}>
                        {formatChordName(chord)}
                      </span>
                      <span className={`text-xs font-bold leading-none mt-1 ${chord.isLight ? 'text-gray-700' : 'text-white/90'}`}>
                        {formatColorName(chord.colorName)}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {lockedCount > 0 && !isLargeTiles && (
            <Link
              href="/subscription"
              className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber-600 shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="flex-1 text-xs font-bold text-amber-900 leading-snug">
                鍵マークの和音は PRO プランで使えます
              </span>
              <span className="shrink-0 text-xs font-black text-amber-700 whitespace-nowrap">プランを見る →</span>
            </Link>
          )}
        </section>

        {/* Menu (hidden while the tiles are enlarged) */}
        {!isLargeTiles && (
          <nav aria-label="メインメニュー" className="space-y-3">
            {MENU_ITEMS.filter(item => item.primary).map(item => (
              <Link
                key={item.to}
                href={item.to}
                className="group flex items-center w-full h-20 px-5 rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                    {item.icon.map(d => <path key={d} fillRule="evenodd" clipRule="evenodd" d={d} />)}
                  </svg>
                </span>
                <span className="ml-4 flex-grow">
                  <span className="block text-base font-black tracking-wider">{item.title}</span>
                  <span className="block text-xs font-medium text-white/85 mt-0.5">{item.desc}</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MENU_ITEMS.filter(item => !item.primary).map(item => (
                <Link
                  key={item.to}
                  href={item.to}
                  className="group flex items-center sm:flex-col sm:items-start gap-4 sm:gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
                >
                  <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300 ${item.iconBox}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      {item.icon.map(d => <path key={d} fillRule="evenodd" clipRule="evenodd" d={d} />)}
                    </svg>
                  </span>
                  <span className="flex-grow min-w-0">
                    <span className="block text-sm font-black text-gray-900 tracking-wide">{item.title}</span>
                    <span className="block text-xs font-medium text-gray-500 mt-0.5 leading-snug">{item.desc}</span>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors sm:hidden" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </main>

      {/* Footer: always visible (legal links must not hide with the menu) */}
      <footer className="relative z-10 mt-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr] gap-x-8 gap-y-8">
            <div className="col-span-2 sm:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-7 w-auto" />
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                色と和音で、絶対音感を楽しく育てる<br />トレーニングアプリ
              </p>
            </div>
            {FOOTER_GROUPS.map(group => (
              <div key={group.heading}>
                <h3 className="text-xs font-black text-gray-900 mb-3">{group.heading}</h3>
                <ul className="space-y-2">
                  {group.links.map(link => (
                    <li key={link.to}>
                      <Link href={link.to} className="text-sm text-gray-600 hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map(link => (
                <li key={link.to}>
                  <Link href={link.to} className="text-xs text-gray-500 hover:text-gray-800 whitespace-nowrap">{link.label}</Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400">&copy; 2026 Akatsuki Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
