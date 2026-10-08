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
    icon: [
      'M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z',
      'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm2.25 0c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5-7.5 3.358-7.5 7.5Z'
    ]
  },
  {
    to: '/settings', title: '各種設定', desc: '音源の切り替えやアプリの設定', primary: false, iconBox: 'bg-gray-100 text-gray-500',
    icon: ['M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.349l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.282-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.431l.84-.692a1.875 1.875 0 00.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z']
  }
]

const FOOTER_GROUPS = [
  { heading: 'Training', links: [{ to: '/method', label: 'トレーニング方法' }, { to: '/about', label: 'サービス概要' }] },
  { heading: 'Support', links: [{ to: '/subscription', label: '料金プラン' }, { to: '/contact', label: 'お問い合わせ' }, { to: '/faq', label: 'よくあるご質問 (Q&A)' }] }
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
  const [isMenuOpen, setIsMenuOpen] = useState(true)
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
  const gridClasses =
    count === 0 ? 'hidden'
      : count === 1 ? 'grid-cols-1 max-w-xs mx-auto'
        : count === 2 ? 'grid-cols-2 max-w-md mx-auto'
          : count === 3 ? 'grid-cols-3' : 'grid-cols-4'

  // Desktop tile height (mobile tiles stay square so circles never turn into pills)
  const itemClasses = !isMenuOpen
    ? count <= 2 ? 'md:h-64' : count <= 4 ? 'md:h-48' : count <= 9 ? 'md:h-32' : 'md:h-24'
    : count > 0 && count <= 4 ? 'md:h-32' : 'md:h-20'

  return (
    <div className="min-h-screen font-['Noto_Sans_JP'] antialiased relative overflow-hidden">
      {/* Background: white, flooded with the chord colour while it plays */}
      <div className="fixed inset-0 bg-white pointer-events-none" />
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isChordPlaying && currentChord ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: currentChord?.color || 'transparent' }}
      />

      <div className="min-h-screen flex flex-col max-w-3xl mx-auto relative z-10">
        <AppHeader transparent />

        <main className="flex-grow px-4 pb-8 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          {/* Score */}
          <section className="flex flex-col items-center mb-2 text-center">
            <ScoreDisplay
              abc={currentChord?.abc}
              isAnswered
              footer={currentChord && (
                <div className="mt-4 text-[14px] font-bold text-gray-700 flex flex-col items-center">
                  <span className="whitespace-nowrap">{formatChordName(currentChord)} ({formatColorName(currentChord.colorName)})</span>
                </div>
              )}
            />
          </section>

          {/* Keyboard */}
          <section className="flex flex-col items-center mb-5" aria-label="鍵盤">
            <div className="w-full -mx-4 px-0">
              <div className="relative flex justify-center h-28 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 overflow-hidden">
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
            </div>
          </section>

          {/* Chord tiles */}
          <section className="mb-8" aria-label="和音">
            <p className="text-center text-sm font-bold text-gray-500 mb-4" role="status">
              {isLoading ? '音源を読み込み中です…' : 'いろをタップして、和音を聴いてみよう'}
            </p>
            <div className={`grid gap-3 sm:gap-4 transition-all duration-500 ${gridClasses}`}>
              {chords.map(chord => {
                const selected = currentChord?.id === chord.id
                return (
                  <button
                    key={chord.id}
                    type="button"
                    onClick={() => toggleChord(chord)}
                    aria-label={`${chord.globalIndex}番 ${formatChordName(chord)} ${formatColorName(chord.colorName)}${chord.isLocked ? ' (PROプラン限定)' : ''}`}
                    aria-pressed={selected}
                    className={`relative cursor-pointer shadow-sm aspect-square rounded-full md:aspect-auto md:rounded-2xl overflow-hidden transition-all duration-300 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${selected ? 'ring-4 ring-offset-2 ring-gray-300 z-10 scale-105 shadow-md' : 'hover:scale-105 active:scale-95 hover:shadow-md'} ${itemClasses}`}
                    style={{ backgroundColor: chord.color }}
                  >
                    {chord.isLocked && (
                      <div className="absolute inset-0 bg-gray-900/40 z-20">
                        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 md:top-2 md:right-2 md:left-auto md:translate-x-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/95 shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    )}

                    {/* Mobile: number + chord name */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center md:hidden"
                      style={{ color: chord.isLight ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.95)' }}
                    >
                      <span className="text-xl font-black leading-none">{chord.globalIndex}</span>
                      <span className="mt-1 text-[10px] font-bold leading-none">{formatChordName(chord)}</span>
                    </div>

                    {/* Desktop: detail view */}
                    <div className="hidden md:flex items-center w-full h-full px-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 text-base font-black shadow-sm border-2 border-white/20"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: chord.isLight ? '#1f2937' : 'white' }}
                      >
                        {chord.globalIndex}
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
          </section>

          {/* Menu */}
          <section className="mb-6 px-4">
            <button
              type="button"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-expanded={isMenuOpen}
              aria-controls="home-menu"
              className="w-full flex flex-col items-center justify-center py-3 mb-2 text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <div className="h-1.5 w-16 bg-gray-200 rounded-full mb-2 group-hover:bg-gray-300 transition-colors" />
              <span className="text-xs font-bold tracking-wider">
                {isMenuOpen ? 'メニューを閉じる(和音を大きく表示)' : 'メニューを開く'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mt-1 transition-transform duration-300 ${isMenuOpen ? '' : 'rotate-180'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <nav
              id="home-menu"
              aria-label="メインメニュー"
              className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0 pointer-events-none'}`}
              aria-hidden={!isMenuOpen}
            >
              {MENU_ITEMS.map(item => (
                <Link
                  key={item.to}
                  href={item.to}
                  tabIndex={isMenuOpen ? 0 : -1}
                  className={`group relative flex items-center w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${item.primary ? 'h-20 bg-gradient-to-r from-indigo-500 to-blue-500 text-white' : 'h-16 bg-white border border-gray-100'}`}
                >
                  <div className="flex items-center w-full px-5">
                    <div className={`flex items-center justify-center rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300 ${item.primary ? 'w-12 h-12 bg-white/20 text-white' : `w-10 h-10 ${item.iconBox}`}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                        {item.icon.map(d => <path key={d} fillRule="evenodd" clipRule="evenodd" d={d} />)}
                      </svg>
                    </div>
                    <div className="ml-4 flex flex-col items-start justify-center flex-grow">
                      <h3 className={`font-black tracking-wider ${item.primary ? 'text-base' : 'text-sm text-gray-900'}`}>{item.title}</h3>
                      <p className={`text-xs font-medium mt-0.5 ${item.primary ? 'text-white/85' : 'text-gray-500'}`}>{item.desc}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors duration-300 ${item.primary ? 'text-white/70' : 'text-gray-300 group-hover:text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              ))}
            </nav>
          </section>

          {/* Footer: always visible (legal links must not hide with the menu) */}
          <footer className="mt-8 border-t border-gray-100 pt-8 pb-8 px-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 mb-10">
              {FOOTER_GROUPS.map(group => (
                <div key={group.heading} className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{group.heading}</p>
                  <div className="flex flex-col space-y-3">
                    {group.links.map(link => (
                      <Link key={link.to} href={link.to} className="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5 shrink-0" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
                {LEGAL_LINKS.map(link => (
                  <Link key={link.to} href={link.to} className="text-xs text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap">{link.label}</Link>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 font-medium">&copy; 2026 Akatsuki Inc.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
