'use client'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { vcls, vfor } from '@/lib/vue-compat'
import { useRouter } from 'next/navigation'
import { useDocumentTitle } from '@/lib/use-document-title'

import { useEffect, useRef, useState } from 'react'
import { useAppSettings, useAuth, useChordSettings, usePro } from '@/lib/app-context'
import { useAudio } from '@/lib/audio'
import { buildAllChords } from '@/lib/chords'

export default function SettingsPage() {
  useDocumentTitle('各種設定 - 絶対音感トレーニング')
  const router = useRouter()
  const { selectedInstrument, loadSampler } = useAudio()
  const { userTier, authReady } = useAuth()
  const { isPro, isEnabled, hasAccess } = usePro()
  const { allChords, saveSingleMapping, resetAll: resetGlobal } = useChordSettings()
  const {
    namingConvention, updateNamingConvention, instrument, updateInstrument,
    formatColorName, formatChordName, colorFormat, updateColorFormat, isKeyboardSoundEnabled, updateKeyboardSound
  } = useAppSettings()

  const navigateToSubscription = () => {
    if (confirm('この機能はPROプラン限定です。プランを確認しますか？')) router.push('/subscription')
  }

  const NARRATION_PRESETS = [
    '赤', '黄色', '青', '黒', '緑', 'オレンジ', '紫', 'ピンク', '茶色', '黄緑', 'ベージュ', '薄橙', '肌色', '薄紫', '藤色', 'グレー', '灰色', '水色', '空色'
  ]

  type Draft = { color: string; colorName: string; homeEnabled: boolean }
  const toDrafts = (chords: { id: string; color: string; colorName: string; homeEnabled: boolean }[]) => {
    const current: Record<string, Draft> = {}
    chords.forEach(c => { current[c.id] = { color: c.color, colorName: c.colorName, homeEnabled: c.homeEnabled } })
    return current
  }

  // Unsaved edits per chord (only (re)initialised on mount and on reset)
  const [draftMappings, setDraftMappings] = useState<Record<string, Draft>>({})
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isSavingMap, setIsSavingMap] = useState<Record<string, boolean>>({})
  const chordsRef = useRef(allChords)
  chordsRef.current = allChords

  const handleInstrumentChange = (inst: string) => {
    if (inst === selectedInstrument) return
    // Steinway is PRO only
    if (inst === 'steinway' && !isPro(userTier)) {
      if (confirm('Steinway音源はPROプラン限定です。プランを確認しますか？')) router.push('/subscription')
      return
    }
    loadSampler(inst as 'yamaha' | 'steinway')
    updateInstrument(inst)
  }

  useEffect(() => {
    if (!authReady) return
    // Security check: force back to free options if the user is not PRO
    if (!isPro(userTier)) {
      if (instrument === 'steinway') updateInstrument('yamaha')
      if (colorFormat === 'hiragana') updateColorFormat('standard')
      if (namingConvention !== 'italian') updateNamingConvention('italian')
      if (isKeyboardSoundEnabled) updateKeyboardSound(false)
    }
    setDraftMappings(toDrafts(chordsRef.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  const updateDraft = (id: string, updates: Partial<Draft>) => {
    setDraftMappings(prev => ({ ...prev, [id]: { ...prev[id]!, ...updates } }))
  }

  const isModified = (chord: { id: string; color: string; colorName: string; homeEnabled?: boolean }) => {
    const draft = draftMappings[chord.id]
    if (!draft) return false
    return draft.color !== chord.color || draft.colorName !== chord.colorName || (draft.homeEnabled ?? false) !== (chord.homeEnabled ?? false)
  }

  const flashSaved = (ms: number) => {
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), ms)
  }

  const handleSaveChord = async (id: string) => {
    if (isSavingMap[id]) return
    setIsSavingMap(m => ({ ...m, [id]: true }))
    try {
      saveSingleMapping(id, draftMappings[id]!)
      flashSaved(2000)
    } catch (e) {
      console.error('Settings: Save failed', e)
      alert('保存中にエラーが発生しました。')
    } finally {
      setIsSavingMap(m => ({ ...m, [id]: false }))
    }
  }

  const handleToggleHome = (chord: { id: string; color: string; colorName: string; homeEnabled: boolean }) => {
    const current = draftMappings[chord.id] || { color: chord.color, colorName: chord.colorName, homeEnabled: chord.homeEnabled }
    const nextValue = !current.homeEnabled
    updateDraft(chord.id, { homeEnabled: nextValue })
    // Save only the toggle; keep the stored colour/name so unconfirmed edits are not saved
    saveSingleMapping(chord.id, { color: chord.color, colorName: chord.colorName, homeEnabled: nextValue })
  }

  const handleReset = () => {
    if (confirm('全ての和音設定を初期状態に戻しますか？')) {
      resetGlobal()
      setDraftMappings(toDrafts(buildAllChords({})))
      flashSaved(3000)
    }
  }

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative"><AppHeader showBack /><main className="flex-grow px-6 py-8"><div className="mb-8"><h2 className="text-2xl font-black text-gray-900 mb-2">各種設定</h2><p className="text-sm text-gray-400 font-bold">アプリの表示や音源の設定を変更できます</p></div>{/* Instrument Settings */}{(isEnabled('settings_instrument_yamaha') || isEnabled('settings_instrument_steinway')) ? (<section className="space-y-6 mb-12"><div className="flex items-center space-x-2"><span className="w-1 h-5 bg-indigo-500 rounded-full" /><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">使用するピアノ音源</h3></div><div className="grid grid-cols-1 gap-4">{(isEnabled('settings_instrument_yamaha')) ? (<div className={vcls("relative p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm bg-white", instrument === 'yamaha' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200')} onClick={(e) => { handleInstrumentChange('yamaha') }}><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">🎹</div><div><h4 className="font-black text-gray-900">Yamaha C5</h4><p className="text-[10px] font-bold text-gray-400 mt-0.5">落ち着いた、温かみのある伝統的なピアノ音源</p></div></div>{(instrument === 'yamaha') ? (<div className="text-indigo-500"><svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>) : null}</div></div>) : null}{(isEnabled('settings_instrument_steinway')) ? (<div className={vcls("relative p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm bg-white", [
                instrument === 'steinway' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200',
                !isPro(userTier) ? 'opacity-80' : ''
              ])} onClick={(e) => { handleInstrumentChange('steinway') }}><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">✨</div><div><div className="flex items-center space-x-2"><h4 className="font-black text-gray-900">Steinway Model B</h4>{(!isPro(userTier)) ? (<span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center"><svg className="h-2 w-2 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>Pro</span>) : null}</div><p className="text-[10px] font-bold text-gray-400 mt-0.5">繊細で豊かな表現力を持つ最高峰の響き</p></div></div>{(instrument === 'steinway') ? (<div className="text-indigo-500"><svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>) : (!isPro(userTier)) ? (<div className="text-gray-300"><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>) : null}</div></div>) : null}</div></section>) : null}{(isEnabled('settings_color_format')) ? (<section className="space-y-6 mb-12"><div className="flex items-center space-x-2"><span className="w-1 h-5 bg-indigo-500 rounded-full" /><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">色の表示形式</h3></div><div className="grid grid-cols-2 gap-4"><div className={vcls("relative p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-2", colorFormat === 'standard' ? 'border-indigo-500 ring-4 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200')} onClick={(e) => { updateColorFormat('standard') }}><span className="text-xl font-black text-gray-900">赤・黄色</span><p className="text-[9px] font-bold text-gray-400">標準（漢字/カタカナ）</p>{(colorFormat === 'standard') ? (<div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>) : null}</div><div className={vcls("relative p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-2", [
                colorFormat === 'hiragana' ? 'border-indigo-500 ring-4 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200',
                !hasAccess('settings_color_format_hiragana', userTier) ? 'opacity-80' : ''
              ])} onClick={(e) => { hasAccess('settings_color_format_hiragana', userTier) ? updateColorFormat('hiragana') : navigateToSubscription() }}><span className="text-xl font-black text-gray-900">あか・きいろ</span><div className="flex flex-col items-center"><p className="text-[9px] font-bold text-gray-400">すべてひらがな</p>{(!hasAccess('settings_color_format_hiragana', userTier)) ? (<span className="mt-1 px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center"><svg className="h-2 w-2 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>PRO</span>) : null}</div>{(colorFormat === 'hiragana') ? (<div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>) : null}</div></div></section>) : null}{(isEnabled('settings_naming_convention')) ? (<section className="space-y-6 mb-12"><div className="flex items-center space-x-2"><span className="w-1 h-5 bg-indigo-500 rounded-full" /><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">音名の表示形式</h3></div><div className="grid grid-cols-3 gap-3"><div className={vcls("relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24", namingConvention === 'italian' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200')} onClick={(e) => { updateNamingConvention('italian') }}><span className="text-sm font-black text-gray-900">ド・ミ・ソ</span><p className="text-[8px] font-bold text-gray-400">標準的</p>{(namingConvention === 'italian') ? (<div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>) : null}</div><div className={vcls("relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24", [
                namingConvention === 'hybrid' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200',
                !isPro(userTier) ? 'opacity-80' : ''
              ])} onClick={(e) => { isPro(userTier) ? updateNamingConvention('hybrid') : navigateToSubscription() }}><span className="text-sm font-black text-gray-900">ラ・チス・ミ</span><div className="flex flex-col items-center"><p className="text-[8px] font-bold text-gray-400">半音は独語読み</p>{(!isPro(userTier)) ? (<span className="mt-1 px-2 py-0.5 bg-gray-900 text-white text-[7px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center"><svg className="h-2 w-2 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>PRO</span>) : null}</div>{(namingConvention === 'hybrid') ? (<div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>) : null}</div><div className={vcls("relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24", [
                namingConvention === 'german' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200',
                !isPro(userTier) ? 'opacity-80' : ''
              ])} onClick={(e) => { isPro(userTier) ? updateNamingConvention('german') : navigateToSubscription() }}><span className="text-sm font-black text-gray-900">C - E - G</span><div className="flex flex-col items-center"><p className="text-[8px] font-bold text-gray-400">コード名</p>{(!isPro(userTier)) ? (<span className="mt-1 px-2 py-0.5 bg-gray-900 text-white text-[7px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center"><svg className="h-2 w-2 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>PRO</span>) : null}</div>{(namingConvention === 'german') ? (<div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>) : null}</div></div></section>) : null}{(isEnabled('settings_chord_customization')) ? (<section className="space-y-6 mb-12"><div className="flex items-center justify-between"><div className="flex items-center space-x-2"><span className="w-1 h-5 bg-indigo-500 rounded-full" /><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">和音と色のカスタマイズ</h3></div><button className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors" onClick={handleReset}>初期設定に戻す</button></div><div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6 relative overflow-hidden">{/* PRO Overlay for Chord Customization */}{(!hasAccess('settings_chord_customization', userTier)) ? (<div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center"><div className="bg-gray-900 text-white p-4 rounded-3xl shadow-xl mb-4"><svg className="h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg><p className="text-xs font-black uppercase tracking-widest">PRO Plan Only</p></div><h4 className="text-gray-900 font-black mb-2">和音と色のカスタマイズ</h4><p className="text-[10px] font-bold text-gray-400 mb-6 max-w-[200px]">自分の好きな色や名前に変更するには、PROプランへの加入が必要です。</p><Link className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-xs shadow-lg shadow-indigo-200 active:scale-95 transition-all" href="/subscription">プランを確認する</Link></div>) : null}<p className="text-[10px] font-bold text-gray-400 leading-normal">各和音に対応する色と、音声ガイドでの読み上げ名を変更できます。<br />「Home表示」をオンにすると、その和音だけをHome画面に表示できます（未選択時はすべて表示されます）。<br />変更後、各項目の「確定して保存」ボタンを押してください。</p><div className="space-y-4">{vfor(allChords, (chord, _i) => (<div key={chord.id} className={vcls("bg-white p-4 rounded-3xl border transition-all duration-300 shadow-sm space-y-4 relative overflow-hidden", isModified(chord) ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-md' : 'border-gray-100')}>{(isModified(chord)) ? (<div className="absolute top-0 left-0 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-br-xl uppercase tracking-widest animate-pulse">未確定</div>) : null}<div className="flex items-center justify-between"><div className="flex items-center space-x-2"><span className="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{formatChordName(chord)}</span></div><button className={vcls("px-4 py-1.5 rounded-full font-bold text-[10px] active:scale-95 transition-all flex items-center space-x-1", [
                      isModified(chord) 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-bounce-subtle' 
                        : 'bg-gray-100 text-gray-400 cursor-default pointer-events-none',
                      isSavingMap[chord.id] ? 'opacity-50 pointer-events-none' : ''
                    ])} onClick={(e) => { handleSaveChord(chord.id) }} type="button">{(!isSavingMap[chord.id]) ? (<svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>) : (<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />)}<span>{isSavingMap[chord.id] ? '保存中...' : (isModified(chord) ? '確定して保存' : '確定済み')}</span></button></div><div className="flex items-center space-x-1"><div className="shrink-0 w-20 h-14 flex items-center justify-center">{(chord.scoreImage) ? (<img className="h-full w-auto object-contain" src={chord.scoreImage} alt={formatChordName(chord)} />) : (<div className="text-[8px] font-black text-gray-200">NO IMAGE</div>)}</div><div className="relative w-16 h-16 shrink-0 group"><div className="w-full h-full rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center text-[9px] font-black" style={{ ...({ 
                        backgroundColor: draftMappings[chord.id]?.color || chord.color,
                        color: (parseInt((draftMappings[chord.id]?.color || chord.color).slice(1, 3), 16) * 299 + parseInt((draftMappings[chord.id]?.color || chord.color).slice(3, 5), 16) * 587 + parseInt((draftMappings[chord.id]?.color || chord.color).slice(5, 7), 16) * 114) / 1000 > 180 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'
                      }) }}>{draftMappings[chord.id]?.color || chord.color}</div><input className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" type="color" value={draftMappings[chord.id]?.color || chord.color} onChange={(e: any) => updateDraft(chord.id, { color: (e.target as HTMLInputElement).value })} /></div><div className="flex-grow min-w-0"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-1">再生ナレーション</p><div className="relative"><select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-700 focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer" value={draftMappings[chord.id]?.colorName || chord.colorName} onChange={(e: any) => updateDraft(chord.id, { colorName: (e.target as HTMLSelectElement).value })}>{vfor(NARRATION_PRESETS, (preset, _i) => (<option key={preset} value={preset}>{formatColorName(preset)}</option>))}</select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></div></div></div><div className="shrink-0 flex flex-col items-center justify-center pl-2 space-y-1"><p className="text-[8px] font-black text-gray-400 uppercase leading-none">Home表示</p><button className={vcls("w-10 h-6 rounded-full relative transition-all duration-300 active:scale-90", draftMappings[chord.id]?.homeEnabled ? 'bg-indigo-500' : 'bg-gray-200')} onClick={(e) => { handleToggleHome(chord) }} type="button"><div className={vcls("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm", draftMappings[chord.id]?.homeEnabled ? 'translate-x-4' : 'translate-x-0')} /></button></div></div></div>))}</div></div></section>) : null}{(isEnabled('settings_keyboard_sound')) ? (<section className="space-y-6 mb-12"><div className="flex items-center space-x-2"><span className="w-1 h-5 bg-indigo-500 rounded-full" /><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">鍵盤の設定</h3></div><div className={vcls("flex items-center justify-between p-5 bg-white rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]", [
              isKeyboardSoundEnabled ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100',
              !isPro(userTier) ? 'opacity-80' : ''
            ])} onClick={(e) => { isPro(userTier) ? updateKeyboardSound(!isKeyboardSoundEnabled) : navigateToSubscription() }}><div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">🔊</div><div><div className="flex items-center space-x-2"><h4 className="font-black text-gray-900 text-sm">ホーム画面の鍵盤の音を鳴らす</h4>{(!isPro(userTier)) ? (<span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center"><svg className="h-2 w-2 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>PRO</span>) : null}</div><p className="text-[10px] font-bold text-gray-400 mt-0.5">鍵盤を押したときに音を出します</p></div></div><div className={vcls("w-10 h-6 rounded-full transition-colors relative shrink-0", isKeyboardSoundEnabled ? 'bg-indigo-600' : 'bg-gray-200')}><div className={vcls("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", isKeyboardSoundEnabled ? 'translate-x-4' : '')} /></div></div></section>) : null}<>{(showSaveSuccess) ? (<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"><div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center space-x-2"><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>設定を保存しました</span></div></div>) : null}</></main></div></div>
  )
}
