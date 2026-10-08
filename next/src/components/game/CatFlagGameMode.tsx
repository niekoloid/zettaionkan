'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chord } from '@/constants/chords'
import { useAppSettings } from '@/lib/app-context'
import { vcls, vfor, useStableRandom } from '@/lib/vue-compat'
import { gridColsFor, makeEmit, type GameModeProps } from './types'
import './game-modes.css'

export default function CatFlagGameMode(props: GameModeProps) {
  const { currentQuestion = null, choices = [], correctHistory = [], userAnswer = null, isAutoPlay = false } = props
  const emit = makeEmit(props)
  const { formatColorName } = useAppSettings()
  const gridColsClass = gridColsFor(choices.length)

  const videoPlayer = useRef<HTMLVideoElement | null>(null)

  const COLOR_TO_EN: Record<string, string> = {
    '赤': 'red', '黄色': 'yellow', '青': 'blue', '黒': 'black', '緑': 'green', 'オレンジ': 'orange', '紫': 'purple',
    'ピンク': 'pink', '茶色': 'brown', '黄緑': 'lightgreen', 'ベージュ': 'beige', '薄紫': 'lightpurple', 'グレー': 'grey', '水色': 'lightblue'
  }

  const [hasVideoError, setHasVideoError] = useState(false)
  const [currentVariant, setCurrentVariant] = useState(1)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)

  // Only red has two video variants
  const hasMultipleVariants = (colorName: string) => colorName === '赤'
  const pickVariant = (colorName: string) => (hasMultipleVariants(colorName) ? (Math.random() > 0.5 ? 2 : 1) : 1)

  const target = userAnswer || currentQuestion
  const currentLevel = target?.sortOrder || 1
  const currentColorEn = COLOR_TO_EN[target?.colorName || ''] || 'red'

  const currentVideoSrc = useMemo(() => {
    if (!target) return null
    const enColor = COLOR_TO_EN[target.colorName]
    if (!enColor) return null
    return `/videos/cats_raise_flags/cat_flag_lv${target.sortOrder}_${enColor}_${currentVariant}.mp4`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, currentVariant])

  const preloadUrls = useMemo(() => {
    const urls: string[] = []
    choices.forEach(chord => {
      const enColor = COLOR_TO_EN[chord.colorName]
      if (!enColor) return
      urls.push(`/videos/cats_raise_flags/cat_flag_lv${chord.sortOrder}_${enColor}_1.mp4`)
      if (hasMultipleVariants(chord.colorName)) urls.push(`/videos/cats_raise_flags/cat_flag_lv${chord.sortOrder}_${enColor}_2.mp4`)
    })
    return urls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices])

  const playVideo = useCallback(() => {
    requestAnimationFrame(() => {
      const v = videoPlayer.current
      if (!v) return
      v.currentTime = 0
      v.play().catch(err => console.error('Video play failed:', err))
    })
  }, [])

  // Preload every video once; parent starts the sound on 'ready'
  const readyRef = useRef(props.onReady)
  readyRef.current = props.onReady
  useEffect(() => {
    if (currentQuestion || userAnswer) setCurrentVariant(pickVariant((userAnswer || currentQuestion)!.colorName))
    let cancelled = false
    ;(async () => {
      if (preloadUrls.length === 0) { setIsPreloaded(true); return }
      let loaded = 0
      const total = preloadUrls.length
      const jobs = preloadUrls.map(url => new Promise<void>(resolve => {
        const video = document.createElement('video')
        video.src = url
        video.preload = 'auto'
        const done = () => {
          loaded++
          if (!cancelled) setPreloadProgress(Math.round((loaded / total) * 100))
          video.removeEventListener('loadedmetadata', done)
          video.removeEventListener('error', done)
          resolve()
        }
        video.addEventListener('loadedmetadata', done)
        video.addEventListener('error', done)
        video.load()
      }))
      // don't wait forever
      const timeout = new Promise<void>(resolve => setTimeout(() => { console.warn('Preload timed out'); resolve() }, 5000))
      await Promise.race([Promise.all(jobs), timeout])
      if (cancelled) return
      setIsPreloaded(true)
      readyRef.current?.()
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (isPreloaded && currentVideoSrc) playVideo() }, [isPreloaded, currentVideoSrc, playVideo])

  // New question: new variant, reset error, play
  useEffect(() => {
    if (!currentQuestion) return
    setCurrentVariant(pickVariant(currentQuestion.colorName))
    setHasVideoError(false)
    playVideo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.warn('Flag video load failed:', e.currentTarget.src)
    setHasVideoError(true)
  }

  return (
<div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-['Noto_Sans_JP']">{/* Video Player Container (Full Screen) */}<div className="absolute inset-0 z-0 bg-black"><>{(currentVideoSrc && !hasVideoError && isPreloaded) ? (<video key={currentVideoSrc} className="w-full h-full object-cover video-fade-in" src={currentVideoSrc} muted playsInline onError={handleVideoError} ref={videoPlayer} />) : (<div className="w-full h-full flex flex-col items-center justify-center bg-stone-900">{(!isPreloaded) ? (<div className="flex flex-col items-center"><div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" /><p className="text-white/50 font-black tracking-widest text-[10px] uppercase">Preloading Videos...</p><p className="text-white/30 text-[9px] mt-1">{preloadProgress}%</p></div>) : (<div className="flex flex-col items-center"><div className="text-6xl mb-4 animate-pulse">🚩</div><p className="text-white/40 font-black tracking-widest text-sm uppercase">No Video Signal</p><p className="text-[10px] text-white/20 mt-2">Level {currentLevel} - {currentColorEn}</p></div>)}</div>)}</>{/* Full Screen Ambient Gradient (Revealed) */}<>{(userAnswer) ? (<div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none transition-opacity duration-1000" />) : null}</></div>{/* Status Overlay (Always visible but subtle) */}{(userAnswer) ? (<div className="absolute top-12 left-0 right-0 flex flex-col items-center pointer-events-none z-10"><div className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transform transition-all duration-500 scale-110"><span className="text-white font-black text-2xl tracking-tight">{formatColorName(userAnswer.colorName)}</span></div>{/* Colored indicator */}<div className="mt-4 w-1 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-700" style={{ ...({ backgroundColor: userAnswer.color, boxShadow: `0 0 30px ${userAnswer.color}` }) }} /></div>) : null}<div className="hidden">{vfor(preloadUrls, (url, _i) => (<video key={url} src={url} preload="auto" />))}</div>{/* Bottom Selection UI (Subtle Overlay for Autoplay Stop/Stats) */}<div className="absolute bottom-10 left-0 right-0 z-50 px-6">{/* Progress track */}{(!isAutoPlay) ? (<div className="max-w-md mx-auto grid grid-cols-5 gap-2 pb-6">{vfor(choices, (chord, _i) => (<div key={chord.id} className={vcls("h-1 rounded-full overflow-hidden", userAnswer?.id === chord.id ? 'bg-white' : 'bg-white/10')} />))}</div>) : null}</div></div>
  )
}
