'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import ChordSelectionButton from '@/components/ChordSelectionButton'
import FrequencySettings from '@/components/FrequencySettings'
import CatGameMode from '@/components/game/CatGameMode'
import CatFlagGameMode from '@/components/game/CatFlagGameMode'
import CuteCatGameMode from '@/components/game/CuteCatGameMode'
import IceCreamGameMode from '@/components/game/IceCreamGameMode'
import TrainFrontGameMode from '@/components/game/TrainFrontGameMode'
import TrainGameMode from '@/components/game/TrainGameMode'
import VehicleGameMode from '@/components/game/VehicleGameMode'
import VideoCatGameMode from '@/components/game/VideoCatGameMode'
import type { Chord } from '@/constants/chords'
import type { FeatureKey } from '@/constants/features'
import type { HistoryItem } from '@/types/app'
import { useAppSettings, useAuth, useChordSettings, usePro, useProModal } from '@/lib/app-context'
import { useAudio } from '@/lib/audio'
import { useChordFrequency } from '@/lib/chord-frequency'
import { HUNDRED_YEARS, readCookie, writeCookie } from '@/lib/cookie'
import { isLightColor } from '@/lib/chords'
import { getSupabase } from '@/lib/supabase'
import { useVoiceSettings } from '@/lib/voice'

type RevealType = 'full' | 'icecream' | 'cat' | 'cute_cat' | 'video_cat' | 'train_front' | 'cat_flag' | 'train' | 'vehicle'
type QuizChord = Chord & { homeEnabled?: boolean }

const DELAYS = { NEXT_QUESTION: 4000, PLAYBACK_START: 500 }
const COOKIE = 'zettaionkan_autoplay_settings'

interface AutoplayCookie {
  chordIds: string[]
  revealType: RevealType
  voiceEnabled: boolean
  immediate: boolean
  delay: number
  ratio: number
  isReviewWeighted: boolean
}

const DEFAULTS: AutoplayCookie = { chordIds: [], revealType: 'icecream', voiceEnabled: false, immediate: false, delay: 3, ratio: 0.3, isReviewWeighted: false }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
)

// Display styles: feature gate, label and selected colours
const MODES: { type: Exclude<RevealType, 'full'>; feature: FeatureKey; emoji: string; label: string; border: string; text: string }[] = [
  { type: 'icecream', feature: 'mode_icecream', emoji: '🍦', label: 'アイス', border: 'border-pink-400', text: 'text-pink-500' },
  { type: 'cat', feature: 'mode_cat', emoji: '🐱', label: 'リアルねこ', border: 'border-amber-500', text: 'text-amber-600' },
  { type: 'cute_cat', feature: 'mode_cute_cat', emoji: '😻', label: 'ねこ', border: 'border-pink-400', text: 'text-pink-500' },
  { type: 'video_cat', feature: 'mode_video_cat', emoji: '🎥', label: '動画ねこ', border: 'border-stone-800', text: 'text-stone-800' },
  { type: 'train_front', feature: 'mode_train_front', emoji: '🚄', label: '迫る電車', border: 'border-blue-600', text: 'text-blue-700' },
  { type: 'cat_flag', feature: 'mode_cat_flag', emoji: '🚩', label: 'ねこ旗揚げ', border: 'border-red-500', text: 'text-red-600' },
  { type: 'train', feature: 'mode_train', emoji: '🚃', label: '電車', border: 'border-green-500', text: 'text-green-600' },
  { type: 'vehicle', feature: 'mode_vehicle', emoji: '🚒', label: '車', border: 'border-red-400', text: 'text-red-600' }
]

const STOP_LIGHT = 'pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20'
const STOP_DARK = 'pointer-events-auto px-6 py-2.5 bg-black/50 backdrop-blur-md text-white/80 hover:text-red-400 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/10'
const STOP_FLAG = 'pointer-events-auto px-6 py-2.5 bg-stone-900/50 backdrop-blur-md text-white font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/10'

const Toggle = ({ on, onColor = 'bg-gray-900' }: { on: boolean; onColor?: string }) => (
  <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${on ? onColor : 'bg-gray-200'}`}>
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${on ? 'translate-x-4' : ''}`} />
  </div>
)

export default function AutoplayPage() {
  const { allChords: customChords } = useChordSettings()
  const { instrument } = useAppSettings()
  const { userTier, authReady } = useAuth()
  const { hasAccess, isEnabled } = usePro()
  const { openProModal } = useProModal()
  const audio = useAudio()
  const { loadSampler, loadNarration, playNarration, customVoiceEnabled, selectedInstrument } = audio
  const { availableVoices, fetchAvailableVoices, updateSettings } = useVoiceSettings()

  const chords = useMemo<QuizChord[]>(
    () => customChords.slice(0, 14).map((c, i) => ({ ...c, label: String(i + 1), displayColor: c.colorName, sortOrder: i + 1 })),
    [customChords]
  )
  const checkAccess = (feature: FeatureKey) => hasAccess(feature, userTier)

  // --- State ------------------------------------------------------------------
  const [view, setView] = useState<'settings' | 'playing'>('settings')
  const [questions, setQuestions] = useState<QuizChord[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealType, setRevealType] = useState<RevealType>(DEFAULTS.revealType)
  const [isImmediate, setIsImmediate] = useState(DEFAULTS.immediate)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(DEFAULTS.voiceEnabled)
  const [revealDelay, setRevealDelay] = useState(DEFAULTS.delay)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [cookiesLoaded, setCookiesLoaded] = useState(false)

  const selectedChords = useMemo(() => chords.filter(c => selectedIds.includes(c.id)), [chords, selectedIds])
  const freq = useChordFrequency(selectedChords, { ratio: DEFAULTS.ratio, weighted: DEFAULTS.isReviewWeighted })
  const { parentChordRatio, setParentChordRatio, isReviewWeighted, setIsReviewWeighted } = freq

  const whiteKeyChords = chords.filter(c => (c.sortOrder || 0) <= 9)
  const blackKeyChords = chords.filter(c => (c.sortOrder || 0) > 9)
  const missingRecordingChords = selectedChords.filter(c => !availableVoices.has(c.colorName))

  // Mutable mirror of everything the timers need (they outlive a single render)
  const live = useRef({
    view, questions, questionIndex, revealType, isImmediate, isVoiceEnabled, revealDelay, selectedIds,
    getRandomChord: freq.getRandomChord, audio, playNarration
  })
  live.current = {
    ...live.current, view, revealType, isImmediate, isVoiceEnabled, revealDelay, selectedIds,
    getRandomChord: freq.getRandomChord, audio, playNarration
  }
  const qs = useRef<QuizChord[]>([])
  const qi = useRef(0)
  const revealed = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saving = useRef(false)

  const setReveal = (v: boolean) => { revealed.current = v; setIsRevealed(v) }
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current) }
  const goPro = () => {
    if (userTier === 'free') openProModal('PROプラン限定', 'この機能（モード変更や黒鍵の選択など）はPROプランで利用可能です。')
    else openProModal('PROプラン機能', 'この機能はPROプラン限定です。')
  }

  // --- Persistence ------------------------------------------------------------
  useEffect(() => {
    if (!authReady) return
    const saved = { ...DEFAULTS, ...readCookie<Partial<AutoplayCookie>>(COOKIE, {}) }
    let ids = saved.chordIds
    if (ids.length === 0 && chords.length >= 2) ids = [chords[0]!.id, chords[1]!.id]
    setSelectedIds(ids)
    setRevealType(saved.revealType)
    setIsVoiceEnabled(saved.voiceEnabled)
    setIsImmediate(saved.immediate)
    setRevealDelay(saved.delay)
    setParentChordRatio(saved.ratio)
    setIsReviewWeighted(saved.isReviewWeighted)
    setCookiesLoaded(true)

    let preferred = instrument as 'yamaha' | 'steinway'
    if (preferred === 'steinway' && !checkAccess('instrument_steinway')) preferred = 'yamaha'
    loadSampler(preferred)
    loadNarration()
    fetchAvailableVoices()

    // Automation support via URL params (used for recording demo videos)
    const q = new URLSearchParams(window.location.search)
    if (q.get('start') === 'true') {
      if (q.get('delay')) setRevealDelay(parseFloat(q.get('delay')!))
      if (q.get('voice') === 'false') setIsVoiceEnabled(false)
      if (q.get('type')) setRevealType(q.get('type') as RevealType)
      if (q.get('ratio')) setParentChordRatio(parseFloat(q.get('ratio')!))
      if (q.get('chords') === 'all') setSelectedIds(chords.map(c => c.id))
      else if (q.get('chordId')) setSelectedIds([q.get('chordId')!])
      setTimeout(() => api.current.start(q.get('chords') === 'all' ? chords.map(c => c.id) : q.get('chordId') ? [q.get('chordId')!] : undefined), 2000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  useEffect(() => {
    if (!cookiesLoaded) return
    writeCookie(COOKIE, {
      chordIds: selectedIds, revealType, voiceEnabled: isVoiceEnabled, immediate: isImmediate,
      delay: revealDelay, ratio: parentChordRatio, isReviewWeighted
    } satisfies AutoplayCookie, HUNDRED_YEARS)
  }, [cookiesLoaded, selectedIds, revealType, isVoiceEnabled, isImmediate, revealDelay, parentChordRatio, isReviewWeighted])

  useEffect(() => () => clearTimer(), [])

  // --- Playback engine ----------------------------------------------------------
  const api = useRef({ start: (_ids?: string[]) => {}, play: async () => {}, next: async () => {}, stop: async () => {} })

  api.current.play = async () => {
    clearTimer()
    const L = live.current
    setReveal(L.isImmediate)

    // Wait (max 5s) for the sampler if it is still loading
    const ready = () => L.audio.samplers[L.audio.selectedInstrument] && live.current.audio.isSamplerLoaded
    for (let i = 0; i < 50 && !ready(); i++) await sleep(100)
    const sampler = live.current.audio.samplers[live.current.audio.selectedInstrument]
    if (!sampler || !live.current.audio.isSamplerLoaded) {
      console.error('Sampler failed to load in time')
      await api.current.stop()
      return
    }

    const Tone = await import('tone')
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
      try { await Tone.getContext().resume() } catch (e) { console.warn('Context resume failed:', e) }
    }

    const chord = qs.current[qi.current]
    if (!chord) return
    sampler.triggerAttackRelease(chord.notes, 8)

    const flag = live.current.revealType === 'cat_flag'
    const delayMs = flag ? 5000 : live.current.revealDelay * 1000
    const nextDelay = flag ? 3500 : DELAYS.NEXT_QUESTION
    timer.current = setTimeout(() => {
      if (!live.current.isImmediate) setReveal(true)
      if (live.current.isVoiceEnabled) live.current.playNarration(chord.displayColor || '')
      timer.current = setTimeout(() => api.current.next(), nextDelay)
    }, delayMs)
  }

  api.current.next = async () => {
    if (live.current.view !== 'playing') return
    // Hide the previous answer BEFORE swapping the chord to avoid a flash
    if (!live.current.isImmediate) { setReveal(false); await sleep(16) }
    const next = live.current.getRandomChord() as QuizChord | null
    if (next) { qs.current = [...qs.current, next]; setQuestions(qs.current) }
    qi.current += 1
    setQuestionIndex(qi.current)
    await api.current.play()
  }

  const saveSession = async (count: number) => {
    if (saving.current || qs.current.length === 0 || count === 0) return
    const supabase = getSupabase()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    saving.current = true
    try {
      const details = qs.current.slice(0, count).map(q => ({ question: { ...q }, answer: { ...q }, isCorrect: true, isSkipped: false, mode: 'autoplay' }))
      await supabase.from('training_sessions').insert({
        user_id: u.id, score: count, total_questions: count, details,
        settings: {
          mode: 'autoplay', instrument: live.current.audio.selectedInstrument, voice: live.current.isVoiceEnabled,
          delay: live.current.revealDelay, reveal_type: live.current.revealType, selected_chords: live.current.selectedIds
        }
      } as never)
    } catch (e) {
      console.error('Failed to save autoplay session:', e)
    } finally {
      saving.current = false
    }
  }

  api.current.stop = async () => {
    if (live.current.view !== 'playing') return
    const count = revealed.current ? qi.current + 1 : qi.current
    clearTimer()
    live.current.view = 'settings'
    setView('settings')
    setReveal(false)
    if (count > 0) saveSession(count)
  }

  api.current.start = async (idsOverride?: string[]) => {
    const first = live.current.getRandomChord() as QuizChord | null
    const pool = idsOverride ? chords.filter(c => idsOverride.includes(c.id)) : null
    const firstChord = pool && pool.length ? pool[Math.floor(Math.random() * pool.length)]! : first
    if (!firstChord) return
    // Tone.start() must run inside the user gesture to unlock audio
    try {
      const Tone = await import('tone')
      await Tone.start()
      await Tone.getContext().resume()
    } catch (e) { console.error('Failed to start audio context:', e) }

    if (live.current.isVoiceEnabled) loadNarration().catch(console.error)

    qs.current = [firstChord]
    qi.current = 0
    setQuestions(qs.current)
    setQuestionIndex(0)
    setReveal(false)
    live.current.view = 'playing'
    setView('playing')
    window.history.pushState({ autoplay: true }, '')
    // cat_flag waits for its videos to preload and calls play on 'ready'
    if (live.current.revealType !== 'cat_flag') setTimeout(() => api.current.play(), DELAYS.PLAYBACK_START)
  }

  // Browser back button stops playback instead of leaving the page
  useEffect(() => {
    const onPop = () => { if (live.current.view === 'playing') api.current.stop() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleHeaderBack = (e: React.MouseEvent) => {
    if (view !== 'settings') { e.preventDefault(); api.current.stop() }
  }

  // --- Derived ------------------------------------------------------------------
  const currentQuestion = questions[questionIndex] ?? null
  const history = useMemo<HistoryItem[]>(() => {
    if (view !== 'playing') return []
    const h: HistoryItem[] = questions.slice(0, questionIndex).map(q => ({ question: q, answer: q, isCorrect: true }))
    if (isRevealed && currentQuestion) h.push({ question: currentQuestion, answer: currentQuestion, isCorrect: true })
    return h
  }, [view, questions, questionIndex, isRevealed, currentQuestion])

  const toggleChordSelection = (id: string) => {
    const target = chords.find(c => c.id === id)
    if (!target) return
    setSelectedIds(chords.filter(c => (c.sortOrder || 0) <= (target.sortOrder || 0)).map(c => c.id))
  }

  const handleToggleCustomVoice = () => {
    if (!customVoiceEnabled && missingRecordingChords.length > 0) {
      alert(`以下の選択された和音の録音が見つかりません：\n${missingRecordingChords.map(c => c.colorName).join('、')}\n\n全ての和音の録音を完了させてから有効にしてください。`)
      return
    }
    updateSettings(!customVoiceEnabled)
  }

  const revealedQ = isRevealed ? currentQuestion : null
  const StopButton = ({ className, children }: { className: string; children?: React.ReactNode }) => (
    <div className="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
      <button type="button" onClick={() => api.current.stop()} className={className}>
        {children ?? (<>
          <div className="w-1.5 h-1.5 bg-current rounded-full" />
          <span className="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
        </>)}
      </button>
    </div>
  )
  const common = { choices: selectedChords, correctHistory: history, isQuestionChanging: false, isAutoPlay: true }

  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased">
      <div className="min-h-screen flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden">
        <AppHeader showBack onBack={handleHeaderBack} />

        <main className="w-full flex-grow overflow-y-auto px-4 py-6" style={{ scrollbarGutter: 'stable' }}>
          {/* SETTINGS */}
          {view === 'settings' && (
            <div className="space-y-8 pb-40">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-gray-900">和音の聞き流し</h2>
                <p className="text-xs text-gray-400 mt-1 font-bold">色と和音の対応を反復トレーニング</p>
              </div>

              <div className="px-2">
                <button
                  type="button"
                  onClick={() => api.current.start()}
                  disabled={selectedIds.length === 0}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>自動再生を開始する</span>
                </button>
              </div>

              {/* Display style */}
              <div className="px-2">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">表示スタイル</p>
                  <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
                    <button
                      type="button"
                      onClick={() => setRevealType('full')}
                      aria-pressed={revealType === 'full'}
                      className={`flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 ${revealType === 'full' ? 'bg-white border-gray-900 shadow-md scale-[1.02]' : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'}`}
                    >
                      <div className="text-2xl mb-1">📱</div>
                      <span className={`text-xs font-black ${revealType === 'full' ? 'text-gray-900' : 'text-gray-400'}`}>画面全体</span>
                    </button>

                    {MODES.filter(m => isEnabled(m.feature)).map(m => {
                      const ok = checkAccess(m.feature)
                      const active = revealType === m.type
                      return (
                        <button
                          key={m.type}
                          type="button"
                          onClick={() => (ok ? setRevealType(m.type) : goPro())}
                          aria-pressed={active}
                          className={`flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${active ? `bg-white ${m.border} shadow-md scale-[1.02]` : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'}`}
                        >
                          {!ok && <div className="absolute top-2 right-2"><LockIcon /></div>}
                          <div className={`text-2xl mb-1 ${!ok ? 'opacity-50 grayscale' : ''}`}>{m.emoji}</div>
                          <span className={`text-xs font-black ${active ? m.text : 'text-gray-400'} ${!ok ? 'opacity-50' : ''}`}>{m.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Chord selection */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">出題する和音</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center"><span className="w-1 h-4 bg-gray-900 rounded-full mr-2" />白鍵の和音</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {whiteKeyChords.map(c => (
                      <ChordSelectionButton key={c.id} chord={c} selected={selectedIds.includes(c.id)} locked={!checkAccess(`autoplay_chord_${c.id}` as FeatureKey)} onToggle={() => toggleChordSelection(c.id)} onLockedClick={goPro} />
                    ))}
                  </div>
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center"><span className="w-1 h-4 bg-gray-900 rounded-full mr-2" />黒鍵の和音</h3>
                <div className="grid grid-cols-2 gap-3">
                  {blackKeyChords.map(c => (
                    <ChordSelectionButton key={c.id} chord={c} selected={selectedIds.includes(c.id)} locked={!checkAccess(`autoplay_chord_${c.id}` as FeatureKey)} onToggle={() => toggleChordSelection(c.id)} onLockedClick={goPro} />
                  ))}
                </div>
              </section>

              {/* Options */}
              <section className="space-y-4 pb-40 px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">オプション</span>

                <div className="space-y-3">
                  <button type="button" role="switch" aria-checked={isImmediate} onClick={() => setIsImmediate(v => !v)} className="w-full text-left flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-colors active:bg-gray-100">
                    <div>
                      <p className="text-sm font-black text-gray-900">答えをすぐに表示</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">音がなると同時に色を見せる</p>
                    </div>
                    <Toggle on={isImmediate} />
                  </button>

                  <button type="button" role="switch" aria-checked={isVoiceEnabled} onClick={() => setIsVoiceEnabled(v => !v)} className="w-full text-left flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-colors active:bg-gray-100">
                    <div>
                      <p className="text-sm font-black text-gray-900">色の名前を読み上げる</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">正解の色を音声でガイド</p>
                    </div>
                    <Toggle on={isVoiceEnabled} />
                  </button>

                  {isEnabled('parent_voice') && (
                    <div className="flex flex-col p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-gray-900">保護者の声で読み上げる</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">録音したあなたの声でガイド</p>
                        </div>
                        <button type="button" role="switch" aria-checked={customVoiceEnabled} aria-label="保護者の声で読み上げる" onClick={handleToggleCustomVoice} className="cursor-pointer">
                          <Toggle on={customVoiceEnabled} onColor="bg-indigo-600" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-indigo-400">{availableVoices.size} / 14 色 録音済み</span>
                        <Link href="/voice-settings" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center">
                          <span>声を録音・管理する</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">出現頻度の調整</span>
                  <FrequencySettings
                    parentChordRatio={parentChordRatio} onParentChordRatioChange={setParentChordRatio}
                    isReviewWeighted={isReviewWeighted} onReviewWeightedChange={setIsReviewWeighted}
                    parentChord={freq.parentChord} otherChords={freq.otherChords}
                    otherChordsDisplay={freq.otherChordsDisplay} otherChordsWithWeights={freq.otherChordsWithWeights}
                    selectedCount={selectedChords.length}
                  />
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-gray-900">回答までの時間</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">音が鳴ってから正解を伝えるまで</p>
                    </div>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{revealDelay}s</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={0.5} value={revealDelay}
                    onChange={e => setRevealDelay(parseFloat(e.target.value))}
                    aria-label="回答までの時間"
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                    <span>1.0s (速い)</span>
                    <span>5.0s (ゆっくり)</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PLAYING */}
          {view === 'playing' && currentQuestion && (
            <div className="z-40 h-full w-full">
              {revealType === 'full' && (
                <>
                  {isRevealed && <div className="fixed inset-0 z-40 flex items-center justify-center transition-all duration-500 fade-in" style={{ backgroundColor: currentQuestion.color }} />}
                  <div className="fixed bottom-10 left-0 right-0 flex justify-center z-[60]">
                    <button
                      type="button"
                      onClick={() => api.current.stop()}
                      className={`px-6 py-2.5 bg-black/5 hover:bg-black/10 backdrop-blur-sm text-gray-400 hover:text-gray-600 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 border border-black/5 ${isRevealed && !isLightColor(currentQuestion.color) ? 'text-white/70 hover:text-white bg-white/10 border-white/10' : ''}`}
                    >
                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      <span className="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                    </button>
                  </div>
                </>
              )}

              {revealType === 'icecream' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <IceCreamGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} />
                  <StopButton className={STOP_LIGHT} />
                </div>
              )}

              {revealType === 'cat' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <CatGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} />
                  <StopButton className={STOP_LIGHT} />
                </div>
              )}

              {revealType === 'cute_cat' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <CuteCatGameMode currentQuestion={revealedQ} isAutoPlay onPlay={() => api.current.play()} />
                  <StopButton className={STOP_LIGHT} />
                </div>
              )}

              {revealType === 'video_cat' && (
                <div className="fixed inset-0 z-40 bg-black fade-in">
                  <VideoCatGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} />
                  <StopButton className={STOP_DARK} />
                </div>
              )}

              {revealType === 'cat_flag' && (
                <div className="fixed inset-0 z-40 bg-stone-100 fade-in">
                  <CatFlagGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} onReady={() => api.current.play()} />
                  <StopButton className={STOP_FLAG}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                  </StopButton>
                </div>
              )}

              {revealType === 'train' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <TrainGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} />
                  <StopButton className={STOP_LIGHT} />
                </div>
              )}

              {revealType === 'train_front' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <TrainFrontGameMode key={questionIndex} currentQuestion={revealedQ} isAutoPlay />
                  <div className="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                    <button type="button" onClick={e => { e.stopPropagation(); api.current.stop() }} className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-800 px-6 py-2 rounded-full border border-slate-200/50 flex items-center shadow-lg transition-transform active:scale-95 text-sm font-bold">
                      <span className="mr-2">●</span> 停止する
                    </button>
                  </div>
                </div>
              )}

              {revealType === 'vehicle' && (
                <div className="fixed inset-0 z-40 bg-white fade-in">
                  <VehicleGameMode currentQuestion={currentQuestion} userAnswer={revealedQ} {...common} />
                  <StopButton className={STOP_LIGHT} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
