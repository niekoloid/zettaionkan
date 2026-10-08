'use client'
import Link from 'next/link'
import { vcls, vfor } from '@/lib/vue-compat'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import { useEffect, useRef, useState } from 'react'
import { ChordDefinitions } from '@/constants/chords'
import { useVoiceSettings } from '@/lib/voice'
import { useAuth } from '@/lib/app-context'
import { useDocumentTitle } from '@/lib/use-document-title'

export default function VoiceSettingsPage() {
  useDocumentTitle('親の声の設定 - いろおと')
  const { authReady } = useAuth()
  const { availableVoices, uploadVoice, deleteVoice, fetchAvailableVoices, getVoiceUrl } = useVoiceSettings()

  const chords = [
    ChordDefinitions.DOMISO, ChordDefinitions.DOFARA, ChordDefinitions.SHIRESO, ChordDefinitions.RADOFA, ChordDefinitions.RESOSHI,
    ChordDefinitions.MISODO, ChordDefinitions.FARADO, ChordDefinitions.SOSHIRE, ChordDefinitions.SODOMI,
    ChordDefinitions.LA_CIS_MI, ChordDefinitions.RE_FIS_LA, ChordDefinitions.MI_GIS_SI, ChordDefinitions.BE_RE_FA, ChordDefinitions.ES_SO_BE
  ]

  const audioPlayer = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const handleRecorded = async (colorName: string, blob: Blob) => { await uploadVoice(colorName, blob) }

  const playVoice = (colorName: string) => {
    const url = getVoiceUrl(colorName)
    const player = audioPlayer.current
    if (url && player) {
      player.src = url
      player.play()
      setIsPlaying(colorName)
      player.onended = () => setIsPlaying(null)
    }
  }

  const removeVoice = async (colorName: string) => {
    if (confirm(`${colorName}の録音を削除しますか？`)) await deleteVoice(colorName)
  }

  // Recordings are listed per user, so wait until we know who it is
  useEffect(() => { if (authReady) fetchAvailableVoices() }, [authReady, fetchAvailableVoices])

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP']"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">{/* Header */}<header className="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0"><Link className="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10" href="/autoplay"><svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></Link><div className="absolute left-1/2 transform -translate-x-1/2"><span className="text-lg font-black text-gray-900">親の声の設定</span></div><div className="w-10" /></header><main className="flex-grow px-6 pb-20 overflow-y-auto"><div className="mb-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100"><h3 className="text-indigo-900 font-bold mb-2 flex items-center"><span className="text-xl mr-2">🎙️</span>お子様に届ける「親の声」</h3><p className="text-xs text-indigo-700 leading-relaxed">各色の名前をあなたの声で録音しましょう。録音された声は、自動再生（聞き流し）モードで読み上げ音声として使用できます。</p></div><div className="space-y-4">{vfor(chords, (chord, _i) => (<div key={chord!.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"><div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-full shadow-inner" style={{ ...({ backgroundColor: chord!.color }) }} /><div><p className="text-sm font-black text-gray-900" dangerouslySetInnerHTML={{ __html: chord!.colorName }} /><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: chord!.name }} /></div></div><div className="flex items-center space-x-2">{(availableVoices.has(chord!.colorName)) ? (<><button className={vcls("p-3 rounded-full bg-white border border-gray-100 hover:bg-gray-100 transition-colors shadow-sm", { 'text-indigo-500 animate-pulse': isPlaying === chord!.colorName })} onClick={(e) => { playVoice(chord!.colorName) }}>{(isPlaying !== chord!.colorName) ? (<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>) : (<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>)}</button><button className="p-3 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors" onClick={(e) => { removeVoice(chord!.colorName) }}><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></>) : (<VoiceRecorder colorName={chord!.colorName} colorHex={chord!.color} onRecorded={(blob: Blob) => handleRecorded(chord!.colorName, blob)} />)}</div></div>))}</div></main><audio className="hidden" ref={audioPlayer} /></div></div>
  )
}
