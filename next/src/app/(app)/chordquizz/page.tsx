'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import ChordSelectionButton from '@/components/ChordSelectionButton'
import FrequencySettings from '@/components/FrequencySettings'
import type { Chord } from '@/constants/chords'
import type { HistoryItem } from '@/types/app'
import { useAppSettings, useAuth, useChordSettings, useFeatures, usePro } from '@/lib/app-context'
import { useAudio } from '@/lib/audio'
import { useChordFrequency } from '@/lib/chord-frequency'
import { decodeCookie, HUNDRED_YEARS, readCookie, writeCookie } from '@/lib/cookie'
import { getSupabase } from '@/lib/supabase'

type QuizChord = Chord & { homeEnabled?: boolean }
type View = 'settings' | 'quiz' | 'result'

const DELAYS = { PLAYBACK_START: 500, TRANSITION: 400, FEEDBACK: 800 }
const QUIZ_COOKIE = 'chord_quizz_settings'

interface QuizCookie {
  selectedChordIds: string[]
  parentChordRatio: number
  isReviewWeighted: boolean
}

const shuffle = <T,>(items: T[]) => {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export default function ChordQuizPage() {
  const router = useRouter()
  const { allChords: customChords } = useChordSettings()
  const { formatColorName } = useAppSettings()
  const { userTier, authReady } = useAuth()
  const { hasAccess } = usePro()
  const { isEnabled } = useFeatures()
  const { samplers, selectedInstrument, isSamplerLoaded, loadSampler, playEffect } = useAudio()

  const chords = useMemo<QuizChord[]>(
    () => customChords.slice(0, 14).map((c, i) => ({
      ...c, label: String(i + 1), displayColor: formatColorName(c.colorName), displayColorFormatted: formatColorName(c.colorName), sortOrder: i + 1
    })),
    [customChords, formatColorName]
  )

  const [view, setView] = useState<View>('settings')
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<QuizChord[]>([])
  const [userAnswer, setUserAnswer] = useState<QuizChord | null>(null)
  const [isQuestionChanging, setIsQuestionChanging] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [shuffledIds, setShuffledIds] = useState<string[]>([])
  const [cookiesLoaded, setCookiesLoaded] = useState(false)

  const selectedChords = useMemo(() => chords.filter(c => selectedIds.includes(c.id)), [chords, selectedIds])
  const freq = useChordFrequency(selectedChords)
  const { parentChordRatio, setParentChordRatio, isReviewWeighted, setIsReviewWeighted } = freq

  const currentQuestion = questions[questionIndex]
  const whiteKeyChords = chords.filter(c => (c.sortOrder || 0) <= 9)
  const blackKeyChords = chords.filter(c => (c.sortOrder || 0) > 9)
  const canUseBlackKeys = hasAccess('quiz_content_black_keys', userTier)

  const layoutChords = useMemo(() => (
    view === 'quiz'
      ? shuffledIds.map(id => chords.find(c => c.id === id)).filter((c): c is QuizChord => !!c)
      : selectedChords
  ), [view, shuffledIds, chords, selectedChords])
  const gridCols = layoutChords.length <= 3 ? 1 : layoutChords.length <= 8 ? 2 : 3
  const gridRows = Math.ceil(layoutChords.length / gridCols)

  // Latest values for timers (avoid stale closures)
  const latest = useRef({ questions, questionIndex, samplers, selectedInstrument, isSamplerLoaded, getRandomChord: freq.getRandomChord, selectedIds })
  latest.current = { questions, questionIndex, samplers, selectedInstrument, isSamplerLoaded, getRandomChord: freq.getRandomChord, selectedIds }
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }

  const goSubscription = () => {
    if (confirm('このオプションの変更はPROプラン限定です。プランを確認しますか？')) router.push('/subscription')
  }

  // --- Persistence ------------------------------------------------------------
  useEffect(() => {
    if (!authReady) return
    const saved = decodeCookie<Partial<QuizCookie>>(JSON.stringify(readCookie(QUIZ_COOKIE, {})), {})
    let ids = saved.selectedChordIds ?? []
    if (ids.length === 0 && chords.length >= 2) ids = [chords[0]!.id, chords[1]!.id]
    setSelectedIds(ids)
    if (saved.parentChordRatio !== undefined) setParentChordRatio(saved.parentChordRatio)
    if (saved.isReviewWeighted !== undefined) setIsReviewWeighted(saved.isReviewWeighted)
    setCookiesLoaded(true)

    let preferred = (readCookie<{ instrument?: string }>('zettaionkan_app_settings', {}).instrument || 'yamaha') as 'yamaha' | 'steinway'
    if (preferred === 'steinway' && userTier !== 'premium') preferred = 'yamaha'
    loadSampler(preferred)

    new Image().src = '/quiz_correct.png'
    new Image().src = '/quiz_incorrect.png'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  useEffect(() => {
    if (!cookiesLoaded) return
    writeCookie(QUIZ_COOKIE, { selectedChordIds: selectedIds, parentChordRatio, isReviewWeighted } satisfies QuizCookie, HUNDRED_YEARS)
  }, [cookiesLoaded, selectedIds, parentChordRatio, isReviewWeighted])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // --- Core logic -------------------------------------------------------------
  const playQuestion = useCallback(async () => {
    const { questions, questionIndex, samplers, selectedInstrument, isSamplerLoaded } = latest.current
    const sampler = samplers[selectedInstrument]
    const chord = questions[questionIndex]
    if (!sampler || !isSamplerLoaded || !chord) return
    const Tone = await import('tone')
    if (Tone.getContext().state !== 'running') await Tone.start()
    sampler.triggerAttackRelease(chord.notes, 8)
  }, [])

  const toggleChordSelection = (id: string) => {
    const target = chords.find(c => c.id === id)
    if (!target) return
    if ((target.sortOrder || 0) > 9 && !canUseBlackKeys) { goSubscription(); return }
    // Selecting level N selects levels 1..N
    setSelectedIds(chords.filter(c => (c.sortOrder || 0) <= (target.sortOrder || 0)).map(c => c.id))
  }

  const startQuiz = () => {
    timers.current.forEach(clearTimeout)
    const first = freq.getRandomChord()
    const qs = first ? [first] : []
    latest.current.questions = qs
    latest.current.questionIndex = 0
    setQuestions(qs)
    setQuestionIndex(0)
    setScore(0)
    setHistory([])
    setUserAnswer(null)
    setShuffledIds(shuffle(selectedIds))
    setView('quiz')
    // Let the browser Back button return to the settings instead of leaving the page
    window.history.pushState({ quiz: true }, '')
    later(playQuestion, DELAYS.PLAYBACK_START)
  }

  const advance = (delay: number) => {
    setIsQuestionChanging(true)
    later(() => {
      const next = latest.current.getRandomChord()
      const qs = next ? [...latest.current.questions, next] : latest.current.questions
      latest.current.questions = qs
      latest.current.questionIndex += 1
      setQuestions(qs)
      setQuestionIndex(latest.current.questionIndex)
      setUserAnswer(null)
      setIsQuestionChanging(false)
      setShuffledIds(shuffle(latest.current.selectedIds))
      // wait for state to flush before playing the new question
      later(playQuestion, 0)
    }, delay)
  }

  const submitAnswer = (chord: QuizChord) => {
    if (userAnswer || isQuestionChanging || !currentQuestion) return
    const isCorrect = chord.id === currentQuestion.id
    if (isCorrect) setScore(s => s + 1)
    playEffect(isCorrect ? 'correct' : 'incorrect')
    setHistory(h => [...h, { question: { ...currentQuestion }, answer: { ...chord }, isCorrect, isSkipped: false }])
    setUserAnswer(chord)
    advance(DELAYS.FEEDBACK)
  }

  const skipQuestion = () => {
    if (userAnswer || isQuestionChanging || !currentQuestion) return
    setHistory(h => [...h, { question: { ...currentQuestion }, answer: null, isCorrect: false, isSkipped: true }])
    advance(DELAYS.TRANSITION)
  }

  const finishQuiz = async () => {
    timers.current.forEach(clearTimeout)
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && history.length > 0) {
      try {
        await supabase.from('training_sessions').insert({
          user_id: user.id,
          score,
          total_questions: history.length,
          details: history,
          settings: { mode: 'chord_quizz', selected_chords: selectedIds, instrument: selectedInstrument }
        } as never)
      } catch (e) {
        console.error('Failed to save session:', e)
      }
    }
    setView('result')
  }

  const resetQuiz = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setUserAnswer(null)
    setIsQuestionChanging(false)
    setView('settings')
  }, [])

  const viewRef = useRef(view)
  viewRef.current = view
  useEffect(() => {
    const onPop = () => { if (viewRef.current !== 'settings') resetQuiz() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [resetQuiz])

  const handleHeaderBack = (e: React.MouseEvent) => {
    if (view !== 'settings') { e.preventDefault(); resetQuiz() }
  }

  const rate = history.length ? score / history.length : 0
  const isCorrectAnswer = !!userAnswer && !!currentQuestion && userAnswer.id === currentQuestion.id

  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased">
      <div className="min-h-screen flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden">
        <AppHeader showBack onBack={handleHeaderBack} />

        <main className={`w-full flex-grow flex flex-col ${view === 'quiz' ? 'p-0 overflow-hidden' : 'px-4 py-6 overflow-y-auto'}`} style={{ scrollbarGutter: 'stable' }}>
          {/* SETTINGS */}
          {view === 'settings' && (
            <div className="space-y-8 pb-40">
              <div className="text-center mb-2">
                <h2 className="text-xl font-black text-gray-900">和音クイズ</h2>
                <p className="text-xs text-gray-400 mt-1 font-bold">覚えた色をテストしてみましょう</p>
              </div>

              <div className="px-2 space-y-3">
                <button
                  type="button"
                  onClick={startQuiz}
                  disabled={selectedIds.length === 0}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>テストを開始する</span>
                </button>
              </div>

              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">出題する和音</span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center"><span className="w-1 h-4 bg-gray-900 rounded-full mr-2" />白鍵の和音</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {whiteKeyChords.map(c => (
                      <ChordSelectionButton key={c.id} chord={c} selected={selectedIds.includes(c.id)} onToggle={() => toggleChordSelection(c.id)} onLockedClick={goSubscription} />
                    ))}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center"><span className="w-1 h-4 bg-gray-900 rounded-full mr-2" />黒鍵の和音</h3>
                <div className="grid grid-cols-2 gap-3">
                  {blackKeyChords.map(c => (
                    <ChordSelectionButton
                      key={c.id} chord={c} selected={selectedIds.includes(c.id)} locked={!canUseBlackKeys}
                      onToggle={() => toggleChordSelection(c.id)}
                      onLockedClick={() => { if (confirm('黒鍵（レベル10〜14）はPROプラン限定です。\nプラン詳細を確認しますか？')) router.push('/subscription') }}
                    />
                  ))}
                </div>
              </section>

              {isEnabled('quiz_settings_frequency') && (
                <FrequencySettings
                  parentChordRatio={parentChordRatio} onParentChordRatioChange={setParentChordRatio}
                  isReviewWeighted={isReviewWeighted} onReviewWeightedChange={setIsReviewWeighted}
                  parentChord={freq.parentChord} otherChords={freq.otherChords}
                  otherChordsDisplay={freq.otherChordsDisplay} otherChordsWithWeights={freq.otherChordsWithWeights}
                  selectedCount={selectedChords.length}
                />
              )}
            </div>
          )}

          {/* QUIZ */}
          {view === 'quiz' && (
            <div className="flex-grow w-full flex flex-col bg-white relative">
              <div className="fixed top-0 left-0 right-0 z-[60] h-1.5 bg-gray-100/50 backdrop-blur-sm">
                <div className={`h-full w-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out ${isQuestionChanging ? 'brightness-150 h-2' : ''}`} />
              </div>

              <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
                <div className={`flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg overflow-hidden ring-1 ring-black/5 h-8 transition-all duration-300 ${isQuestionChanging ? 'scale-125 ring-4 ring-indigo-500/50 bg-indigo-900/60' : ''}`}>
                  <div className="px-3 h-full flex items-center bg-white/10 border-r border-white/5">
                    <span className="text-[8px] text-gray-300 font-black uppercase tracking-widest leading-none">Question</span>
                  </div>
                  <div className="px-4 h-full flex items-center min-w-[3rem] justify-center text-white text-[11px] font-black">Q {questionIndex + 1}</div>
                </div>
                <button type="button" onClick={finishQuiz} className="pointer-events-auto bg-black/40 backdrop-blur-md text-[10px] text-white font-black rounded-full px-4 h-8 hover:bg-black/50 transition-colors border border-white/10 shadow-lg flex items-center">
                  テストを終了
                </button>
              </div>

              {userAnswer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" aria-live="polite">
                  <div className={`text-[250px] sm:text-[350px] font-black select-none leading-none ${isCorrectAnswer ? 'text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]'}`}>
                    {isCorrectAnswer ? '◯' : '×'}
                  </div>
                </div>
              )}

              <div
                key={questionIndex}
                className="flex-grow grid gap-0.5 w-full h-full"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}
              >
                {layoutChords.map(chord => (
                  <button
                    key={chord.id}
                    type="button"
                    onClick={() => submitAnswer(chord)}
                    disabled={!!userAnswer}
                    aria-label={chord.colorName}
                    className={`relative w-full h-full transition-all duration-150 active:scale-95 flex items-center justify-center overflow-hidden ${userAnswer ? (userAnswer.id === chord.id ? 'z-10 ring-inset ring-8 ring-white/50' : 'opacity-20') : 'hover:brightness-105 active:brightness-90'}`}
                    style={{ backgroundColor: chord.color }}
                  />
                ))}
              </div>

              <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-center items-center space-x-4 pointer-events-none">
                <button type="button" onClick={playQuestion} className="pointer-events-auto bg-black/40 backdrop-blur-md text-[10px] text-white font-black rounded-full px-6 py-2.5 hover:bg-black/50 transition-colors border border-white/20 shadow-lg flex items-center space-x-2 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>もう一度聴く</span>
                </button>
                <button type="button" onClick={skipQuestion} className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full text-white font-black hover:bg-black/50 transition-all flex items-center space-x-2 active:scale-95 border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-widest">スキップ</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULT */}
          {view === 'result' && (
            <div className="h-full flex flex-col items-center">
              <div className="mb-8 text-center pt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quiz Finished</p>
                <div className="text-6xl font-black text-gray-900 mb-2">
                  <span className="text-blue-500">{score}</span>
                  <span className="text-gray-300 text-4xl">/{history.length}</span>
                </div>
                <p className="text-lg font-bold text-gray-600 mb-6">
                  {score === history.length ? 'Perfect! 🎉' : rate >= 0.8 ? 'Great Job! 👍' : 'Keep Practicing! 💪'}
                </p>
              </div>

              <div className="w-full bg-gray-50 rounded-3xl border border-gray-100 mb-10 overflow-hidden flex flex-col max-h-[400px]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">解答履歴</span>
                  <span className="text-[10px] font-bold text-gray-900">{score} / {history.length} 正解</span>
                </div>
                <div className="flex-grow overflow-y-auto px-4 py-2 space-y-2">
                  {history.map((h, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-3 rounded-2xl bg-white border border-gray-100">
                      <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shrink-0">{idx + 1}</div>
                      <div className="flex-grow flex items-center space-x-3 min-w-0">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-10 h-10 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: (h.question as Chord).color }} />
                          <span className="text-[8px] font-bold text-gray-400 leading-none">正解</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="flex flex-col items-center space-y-1">
                          {h.answer ? (
                            <div className="w-10 h-10 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: (h.answer as Chord).color }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
                              <span className="text-[8px] text-gray-300 font-bold">SKIP</span>
                            </div>
                          )}
                          <span className="text-[8px] font-bold text-gray-400 leading-none">回答</span>
                        </div>
                      </div>
                      <div className="shrink-0 w-10 flex justify-center">
                        {h.isCorrect ? <span className="text-green-500 font-black text-xl">○</span>
                          : h.isSkipped ? <span className="text-gray-300 font-bold text-sm">−</span>
                            : <span className="text-red-500 font-black text-xl">×</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full space-y-4 px-6 mb-20">
                <button type="button" onClick={startQuiz} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95">もう一度挑戦する</button>
                <button type="button" onClick={resetQuiz} className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">設定に戻る</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
