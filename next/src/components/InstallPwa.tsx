'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstruction, setShowIOSInstruction] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    if (isStandalone) { setShowButton(false); return }

    // Android: Chrome fires beforeinstallprompt
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    // iOS has no such event: show the button with manual instructions
    if (ios) setShowButton(true)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSInstruction(true)
    } else if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') setShowButton(false)
    } else {
      alert('ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。')
    }
  }

  return (
<>{(showButton) ? (<div className="w-full"><button className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all active:scale-95" onClick={handleClick}><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span>ホーム画面に追加する</span></button>{/* iOS Instruction Modal */}{(showIOSInstruction) ? (<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4" style={{ ...{ backgroundColor: "rgba(0,0,0,0.5)" } }}><div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up relative"><button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={(e) => { setShowIOSInstruction(false) }}><svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button><h3 className="text-lg font-bold text-gray-900 mb-4 text-center">ホーム画面への追加方法</h3><div className="space-y-4"><div className="flex items-center space-x-4"><div className="bg-gray-100 p-2 rounded-lg"><svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></div><p className="text-sm text-gray-700">1. 画面下部の<span className="font-bold">「共有アイコン」</span>をタップ</p></div><div className="flex items-center space-x-4"><div className="bg-gray-100 p-2 rounded-lg"><svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div><p className="text-sm text-gray-700">2. メニューから<span className="font-bold">「ホーム画面に追加」</span>を選択</p></div><div className="flex items-center space-x-4"><div className="bg-gray-100 p-2 rounded-lg"><span className="text-lg font-bold">右上の「追加」</span></div><p className="text-sm text-gray-700">3. 画面右上の<span className="font-bold">「追加」</span>をタップ</p></div></div><div className="mt-6 text-center"><button className="text-sm text-blue-500 font-bold" onClick={(e) => { setShowIOSInstruction(false) }}>閉じる</button></div>{/* Decoration Triangle pointing down to mimic system tooltip if needed, but centering modal is better */}</div></div>) : null}</div>) : null}</>
  )
}
