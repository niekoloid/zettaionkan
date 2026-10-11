'use client'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { vcls, vfor } from '@/lib/vue-compat'
import { useEffect, useMemo, useState } from 'react'
import type { HistoryItem } from '@/types/app'
import { useAppSettings, useAuth, usePro } from '@/lib/app-context'
import { getSupabase } from '@/lib/supabase'

export default function HistoryPage() {
  const { user, userTier, authReady } = useAuth()
  const { isEnabled, hasAccess } = usePro()
  const { namingConvention, formatChordName } = useAppSettings()

  interface TrainingSession {
    id: string
    created_at: string
    score: number
    total_questions: number
    details: HistoryItem[]
    settings: { mode: string; type?: string } | null
  }

  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([])
  const [activeTab, setActiveTab] = useState<'chord_quizz' | 'single_note_quizz' | 'autoplay'>('chord_quizz')
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  const filteredHistory = useMemo(() => trainingHistory.filter(s => s.settings?.mode === activeTab), [trainingHistory, activeTab])

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    let hours = d.getHours()
    const minutes = d.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${d.getFullYear()}年${month}月${day}日（${weekDay}） ${hours}:${minutes} ${ampm}`
  }

  const toggleSession = (sessionId: string) => setExpandedSessionId(cur => (cur === sessionId ? null : sessionId))

  const deleteSession = async (sessionId: string) => {
    if (!confirm('この履歴を削除してもよろしいですか？')) return
    const { error } = await getSupabase().from('training_sessions').delete().eq('id', sessionId)
    if (error) {
      console.error('Error deleting session:', error)
      alert('削除に失敗しました')
      return
    }
    setTrainingHistory(h => h.filter(s => s.id !== sessionId))
  }

  useEffect(() => {
    if (!authReady) return
    let active = true
    ;(async () => {
      try {
        if (user) {
          const { data } = await getSupabase()
            .from('training_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
          if (data && active) setTrainingHistory(data as unknown as TrainingSession[])
        }
      } finally {
        if (active) setIsLoadingHistory(false)
      }
    })()
    return () => { active = false }
  }, [authReady, user])

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative"><AppHeader showBack /><main className="flex-grow px-6 py-8"><div className="mb-8"><h2 className="text-2xl font-black text-gray-900 mb-2">学習履歴</h2><p className="text-sm text-gray-400 font-bold">これまでのトレーニング成果を確認できます</p></div>{/* Tabs */}<div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl mb-6">{vfor([
              { id: 'chord_quizz', label: '和音テスト' },
              { id: 'single_note_quizz', label: '単音テスト' },
              { id: 'autoplay', label: '聞き流し' }
            ], (tab, _i) => (<button key={tab.id} className={vcls("flex-grow py-2 px-3 rounded-lg text-xs font-black transition-all", activeTab === tab.id 
              ? 'bg-white text-gray-900 shadow-sm transform scale-[1.02]' 
              : 'text-gray-400 hover:text-gray-600')} onClick={(e) => { setActiveTab(tab.id as any); setExpandedSessionId(null) }}>{tab.label}</button>))}</div>{/* Training History Section */}<section className="space-y-6">{(isLoadingHistory) ? (<div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" /></div>) : (filteredHistory.length > 0) ? (<div className="space-y-3">{vfor(filteredHistory, (session, _i) => (<div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={(e) => { toggleSession(session.id) }}><div><p className="text-[10px] text-gray-400 font-bold mb-1">{formatDate(session.created_at)}</p><div className="flex items-center space-x-2">{(session.settings?.mode === 'autoplay') ? (<><span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-tighter">和音の聞き流し</span></>) : (session.settings?.mode === 'chord_quizz') ? (<><span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-tighter">和音テスト</span></>) : (session.settings?.mode === 'single_note_quizz' || session.settings?.type === 'single_note') ? (<><span className="text-[9px] font-black bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md border border-sky-100 uppercase tracking-tighter">単音テスト</span></>) : (<><span className="text-[9px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100 uppercase tracking-tighter">和音トレーニング</span></>)}{(session.settings?.mode !== 'autoplay' && session.score === session.total_questions) ? (<span className="text-[9px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-md font-black shadow-sm">PERFECT</span>) : null}</div></div><div className="flex items-center space-x-3"><div className="text-right"><span className="text-xl font-black text-gray-900">{session.score}</span><span className="text-xs font-bold text-gray-300">/{session.total_questions}</span></div>{(isEnabled('history_delete_feature')) ? (<button className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }} title="削除"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>) : null}<svg className={vcls("h-4 w-4 text-gray-300 transition-transform duration-200", { 'rotate-180': expandedSessionId === session.id })} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div></div>{(expandedSessionId === session.id) ? (<div className="border-t border-gray-100 bg-gray-50/50 p-4">{(hasAccess('history_detailed_view', userTier)) ? (<div className="space-y-2">{vfor(session.details, (log, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100"><div className="flex items-center space-x-3"><span className="text-xs font-bold text-gray-300 w-4">{idx + 1}</span>{/* Question Info */}<div className="flex flex-col items-center space-y-1">{(log?.question?.color) ? (<div className="w-8 h-8 rounded-lg shadow-sm border border-gray-100" style={{ ...({ backgroundColor: log.question.color }) }} />) : (<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">{log?.question?.name?.charAt(0)}</div>)}<span className="text-[8px] font-bold text-gray-400 leading-none truncate max-w-[40px]">{formatChordName(log?.question)}</span></div><svg className="h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>{/* Answer Info */}<div className="flex flex-col items-center space-y-1">{(log && !log.isSkipped && log.answer) ? (<>{(log.answer?.color) ? (<div className="w-8 h-8 rounded-lg shadow-sm border border-gray-100" style={{ ...({ backgroundColor: log.answer.color }) }} />) : (<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">{log.answer.name?.charAt(0)}</div>)}<span className={vcls("text-[8px] font-bold", log.isCorrect ? 'text-green-500' : 'text-rose-500')}>{formatChordName(log.answer)}</span></>) : (<span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">SKIP</span>)}</div></div>{/* Result Icon (Only for training) */}{(session.settings?.mode !== 'autoplay') ? (<div>{(log.isCorrect) ? (<div className="text-green-500 bg-green-50 p-1 rounded-full"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>) : (<div className="text-red-400 bg-red-50 p-1 rounded-full"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></div>)}</div>) : null}</div>))}</div>) : (<div className="text-center py-4"><p className="text-[10px] font-bold text-gray-500 mb-3">詳細情報の閲覧はPROプラン限定です</p><Link className="inline-block text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full" href="/subscription">プランを確認する</Link></div>)}</div>) : null}</div>))}<p className="text-center text-[10px] text-gray-400 mt-4">直近の10件を表示しています</p></div>) : (<div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200"><p className="text-sm text-gray-400 font-bold">履歴はまだありません</p><Link className="inline-block mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-600" href="/chordquizz">トレーニングを開始する</Link></div>)}</section></main></div></div>
  )
}
