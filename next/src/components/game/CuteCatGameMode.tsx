'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chord } from '@/constants/chords'
import { useAppSettings } from '@/lib/app-context'
import { vcls, vfor, useStableRandom } from '@/lib/vue-compat'
import { gridColsFor, makeEmit, type GameModeProps } from './types'
import './game-modes.css'

export default function CuteCatGameMode(props: GameModeProps) {
  const { currentQuestion = null, choices = [], correctHistory = [], userAnswer = null, isAutoPlay = false } = props
  const emit = makeEmit(props)
  const { formatColorName } = useAppSettings()
  const gridColsClass = gridColsFor(choices.length)

  const [isPlaying, setIsPlaying] = useState(!!currentQuestion)
  useEffect(() => { if (currentQuestion) setIsPlaying(true) }, [currentQuestion])
  const rnd = useStableRandom(isPlaying)

  const currentActionColor = currentQuestion?.color || '#ccc'
  const accessoryColor = currentQuestion?.color || '#FF6B6B'
  const catTheme = {
    body: currentQuestion?.color || '#ccc',
    stroke: '#fff',
    earInner: '#fff',
    stripe: 'rgba(255,255,255,0.3)',
    hasStripes: true
  }
  const actionClass = isPlaying ? 'animate-enter-right' : ''

  return (
<div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 overflow-hidden font-['Noto_Sans_JP']">{/* Dynamic Background (Soft Pulse) */}<div className="absolute inset-0 transition-colors duration-1000 ease-in-out" style={{ ...({ backgroundColor: currentActionColor ? currentActionColor + '20' : '#f5f5f4' }) }} />{/* Floating Particles/Notes */}{(isPlaying) ? (<div className="absolute inset-0 overflow-hidden pointer-events-none">{vfor(8, (n, _i) => (<div key={n} className="absolute animate-float text-4xl" style={{ ...({ 
              left: rnd(n, 1) * 80 + 10 + '%', 
              top: '80%', 
              animationDelay: rnd(n, 2) * 0.5 + 's',
              color: currentActionColor,
              opacity: 0.7
            }) }}>{['♪', '♫', '♥', '★', '🐟'][Math.floor(rnd(n, 3) * 5)]}</div>))}</div>) : null}<div className="relative w-80 h-80 sm:w-96 sm:h-96 cursor-pointer transform transition-transform active:scale-95 touch-manipulation z-10" onClick={(e) => { emit('play', currentQuestion) }}>{/* Kawaii Cat SVG */}<svg className={vcls("w-full h-full drop-shadow-xl", actionClass)} viewBox="0 0 400 400"><defs><filter id="cute-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter></defs>{/* Body Group */}<g transform="translate(200, 250)">{/* Tail */}<path className="origin-bottom-left" d="M-60,50 Q-90,50 -100,20 T-80,-20" fill="none" stroke={catTheme.stroke} strokeWidth="20" strokeLinecap="round" />{/* Main Body (Soft Round Shape) */}<ellipse cx="0" cy="20" rx="90" ry="80" fill={catTheme.body} />{/* White Belly */}<ellipse cx="0" cy="30" rx="55" ry="45" fill="#FFF" opacity="0.8" />{/* Arms/Paws (Visible/Moving only if explicitly set, but now static) */}{/* Removed complex action-based arms for simplicity/cleanliness or left as fallback */}</g>{/* Head Group */}<g transform="translate(200, 160)">{/* Ears */}<path d="M-70,-50 L-90,-110 L-20,-80 Z" fill={catTheme.body} /><path d="M70,-50 L90,-110 L20,-80 Z" fill={catTheme.body} />{/* Inner Ears */}<path d="M-70,-50 L-80,-90 L-35,-70 Z" fill={catTheme.earInner} /><path d="M70,-50 L80,-90 L35,-70 Z" fill={catTheme.earInner} />{/* Head Base */}<ellipse cx="0" cy="0" rx="100" ry="85" fill={catTheme.body} />{/* Striped Marking on Forehead */}{(catTheme.hasStripes) ? (<g stroke={catTheme.stripe} strokeWidth="8" strokeLinecap="round" opacity="0.5"><path d="M-20,-60 L-20,-40" /><path d="M0,-65 L0,-45" /><path d="M20,-60 L20,-40" /></g>) : null}<g transform="translate(0, 10)">{/* Eyes Container */}{/* Always show happy eyes when playing, normal when idle */}{(!isPlaying) ? (<g>{/* Open Eyes (Normal) */}<circle cx="-40" cy="-10" r="10" fill="#333"><animate attributeName="r" values="10;10;1;10" keyTimes="0;0.9;0.95;1" dur="4s" repeatCount="indefinite" /></circle><circle cx="-36" cy="-14" r="3" fill="white" /><circle cx="40" cy="-10" r="10" fill="#333"><animate attributeName="r" values="10;10;1;10" keyTimes="0;0.9;0.95;1" dur="4s" repeatCount="indefinite" /></circle><circle cx="44" cy="-14" r="3" fill="white" /></g>) : (<g>{/* Happy Eyes (Closed Curves) default for playing */}<path d="M-55,-10 Q-40,-25 -25,-10" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round" /><path d="M25,-10 Q40,-25 55,-10" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round" /></g>)}{/* Nose */}<path d="M-8,15 L8,15 L0,23 Z" fill="#Pink" />{/* Mouth */}{(!isPlaying) ? (<g><path d="M-8,23 Q-15,35 0,35 Q15,35 8,23" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" /></g>) : (<g><ellipse cx="0" cy="35" rx="10" ry="12" fill="#F88" stroke="#333" strokeWidth="2" /></g>)}{/* Cheeks & Whiskers */}<ellipse cx="-65" cy="20" rx="12" ry="8" fill="#FFB7B2" opacity="0.6" /><ellipse cx="65" cy="20" rx="12" ry="8" fill="#FFB7B2" opacity="0.6" /><g stroke="#333" strokeWidth="2" opacity="0.3"><path d="M-70,10 L-100,5" /><path d="M-70,20 L-100,20" /><path d="M70,10 L100,5" /><path d="M70,20 L100,20" /></g></g></g>{/* Accessories: Bow tie */}<g transform="translate(200, 255)"><path d="M-15,-5 L-30,-20 L-30,10 L-15,-5" fill={accessoryColor} /><path d="M15,-5 L30,-20 L30,10 L15,-5" fill={accessoryColor} /><circle cx="0" cy="-5" r="8" fill={accessoryColor} /></g></svg></div>{/* Message / Play Hint */}<div className="mt-8 text-center z-10 h-16 flex items-center justify-center">{(!isPlaying) ? (<div className="animate-pulse"><p className="text-stone-400 font-bold text-sm tracking-widest rounded-full bg-white px-6 py-2 shadow-sm border border-stone-100">TAP TO PLAY</p></div>) : (<div className="transition-all duration-300 transform scale-100"><p className="text-4xl font-black tracking-widest drop-shadow-sm transition-colors duration-300" style={{ ...({ color: currentActionColor }) }}>{formatColorName(currentQuestion?.colorName || '')}</p></div>)}</div></div>
  )
}
