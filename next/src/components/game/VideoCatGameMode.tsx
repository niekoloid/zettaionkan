'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chord } from '@/constants/chords'
import { useAppSettings } from '@/lib/app-context'
import { vcls, vfor, useStableRandom } from '@/lib/vue-compat'
import { gridColsFor, makeEmit, type GameModeProps } from './types'
import './game-modes.css'

export default function VideoCatGameMode(props: GameModeProps) {
  const { currentQuestion = null, choices = [], correctHistory = [], userAnswer = null, isAutoPlay = false } = props
  const emit = makeEmit(props)
  const { formatColorName } = useAppSettings()
  const gridColsClass = gridColsFor(choices.length)

  const videoPlayer = useRef<HTMLVideoElement | null>(null)

  const COLOR_TO_EN: Record<string, string> = {
    '赤': 'red', '黄色': 'yellow', '青': 'blue', '黒': 'black', '緑': 'green', 'オレンジ': 'orange', '紫': 'purple',
    'ピンク': 'pink', '茶色': 'brown', '黄緑': 'lightgreen', 'ベージュ': 'beige', '薄紫': 'lightpurple', 'グレー': 'grey', '水色': 'lightblue'
  }

  // Video files are named cat_lv{sortOrder}_{color}_video_1.mp4
  const currentVideoSrc = useMemo(() => {
    const target = userAnswer || currentQuestion
    if (!target) return null
    const enColor = COLOR_TO_EN[target.colorName]
    if (!enColor) return null
    return `/videos/cats/cat_lv${target.sortOrder}_${enColor}_video_1.mp4`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswer, currentQuestion])

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget
    console.warn('Video load failed:', el.src)
    el.style.display = 'none' // hide broken video
  }

  useEffect(() => {
    if (!currentVideoSrc) return
    const t = setTimeout(() => {
      const v = videoPlayer.current
      if (!v) return
      v.currentTime = 0
      v.play().catch(e => console.error('Autoplay prevented:', e))
    }, 0)
    return () => clearTimeout(t)
  }, [currentVideoSrc])

  return (
<div className="absolute inset-0 flex flex-col bg-black overflow-hidden font-['Noto_Sans_JP']">{/* Video Player Container */}<div className="flex-grow relative flex items-center justify-center bg-black">{/* Video Element */}<>{(currentVideoSrc) ? (<video key={currentVideoSrc} className="absolute inset-0 w-full h-full object-contain fade-in-slow" src={currentVideoSrc} muted playsInline onError={handleVideoError} ref={videoPlayer} />) : (<div className="absolute inset-0 flex items-center justify-center bg-stone-100">{/* Re-use the realistic cat SVG logic here or minimal fallback */}<div className="flex flex-col items-center"><span className="text-6xl mb-4">🐱</span><p className="text-stone-400 font-bold">No Signal...</p></div></div>)}</>{/* Overlay for Color/Text if needed (Optional, user asked for video focus) */}{/* Only show subtle indicator if revealed */}{(userAnswer) ? (<div className="absolute top-10 left-0 right-0 text-center pointer-events-none"><span className="inline-block px-6 py-2 rounded-full bg-black/50 text-white font-black text-xl backdrop-blur-md" style={{ ...({ borderColor: userAnswer.color, borderWidth: '2px' }) }}>{formatColorName(userAnswer.colorName)}</span></div>) : null}</div>{/* Bottom Controls: Video Cat Types */}<div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.5)] p-4 pb-8 z-50 border-t border-white/10"><div className="flex justify-between items-center mb-3 px-2"><h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center"><span className="mr-2 text-base">🎥</span>{' '}Video Collection</h3>{/* Replay Button (Small) */}{(!isAutoPlay) ? (<button className="bg-white/20 text-white rounded-full p-2 hover:bg-white/30 active:scale-90 transition-all disabled:opacity-30" onClick={(e) => { emit('play') }} disabled={!!userAnswer}><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></button>) : null}</div><div className={vcls("grid gap-2", gridColsClass)}>{vfor(choices, (chord, _i) => (<button key={chord.id} className={vcls("group relative flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200", [
            !isAutoPlay && 'active:scale-95 cursor-pointer hover:bg-white/10',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-30 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'z-10 bg-white/20 ring-1 ring-white/50' : ''
          ])} onClick={(e) => { !isAutoPlay && emit('answer', chord) }} disabled={!!userAnswer || isAutoPlay}>{/* Cat Head Icon */}<div className="mb-1 w-8 h-8 rounded-full shadow-inner flex items-center justify-center transform transition-transform group-hover:scale-110 overflow-hidden bg-white/10 border border-white/20"><span className="text-sm">🐱</span></div><div className="flex flex-col items-center leading-none"><span className="text-[9px] font-bold text-white/60 mb-0.5 whitespace-nowrap">{formatColorName(chord.colorName)}</span></div></button>))}</div></div></div>
  )
}
