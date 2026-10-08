'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chord } from '@/constants/chords'
import { useAppSettings } from '@/lib/app-context'
import { vcls, vfor, useStableRandom } from '@/lib/vue-compat'
import { gridColsFor, makeEmit, type GameModeProps } from './types'
import './game-modes.css'

export default function VehicleGameMode(props: GameModeProps) {
  const { currentQuestion = null, choices = [], correctHistory = [], userAnswer = null, isAutoPlay = false } = props
  const emit = makeEmit(props)
  const { formatColorName } = useAppSettings()
  const gridColsClass = gridColsFor(choices.length)

  const VEHICLE_MAP: Record<string, { name: string; icon: string; sound: string[]; move: string }> = {
    '赤': { name: 'しょうぼうしゃ', icon: '🚒', sound: ['ぴーぽー！', 'しゅっ！', 'つけろー！'], move: 'animate-siren' },
    '黄色': { name: 'ぶるどーざー', icon: '🚜', sound: ['ずどどっ！', 'おすよー！', 'がががっ！'], move: 'animate-bulldozer-push' },
    '青': { name: 'ぱとかー', icon: '🚓', sound: ['うーうー！', 'まってー！'], move: 'animate-drive' },
    'オレンジ': { name: 'きゅうきゅうしゃ', icon: '🚑', sound: ['ぴーぽー！', 'いそげー！'], move: 'animate-drive' },
    '緑': { name: 'ごみしゅうしゅうしゃ', icon: '🚛', sound: ['ぐるぐる！', 'きれいにするよ！'], move: 'animate-drive' },
    '黒': { name: 'たくしー', icon: '🚕', sound: ['ぶーん！', 'のる？'], move: 'animate-drive' },
    '紫': { name: 'ろーどろーらー', icon: '🚜', sound: ['どっしん！', 'ぺったんこ！'], move: 'animate-roll' },
    'ピンク': { name: 'きっちんかー', icon: '🚐', sound: ['おいしいよ！', 'いらっしゃい！'], move: 'animate-drive' },
    '茶色': { name: 'ぶるどーざー', icon: '🚜', sound: ['ずドドド！', 'おすよ！'], move: 'animate-bulldozer-push' },
    '黄緑': { name: 'みきさーしゃ', icon: '🚛', sound: ['まわるよ！', 'ぐるぐる！'], move: 'animate-drive' },
    'ベージュ': { name: 'だんぷかー', icon: '🚚', sound: ['どざーっ！', 'はこぶよ！'], move: 'animate-drive' },
    '薄紫': { name: 'こうじのくるま', icon: '🚧', sound: ['こうじちゅう！', 'きをつけて！'], move: 'animate-drive' },
    'グレー': { name: 'くれーんしゃ', icon: '🏗️', sound: ['ぐーん！', 'つるよ！'], move: 'animate-drive' },
    '水色': { name: 'ばす', icon: '🚌', sound: ['ぷっぷー！', 'のるひとー？'], move: 'animate-drive' }
  }

  const [randomVariant, setRandomVariant] = useState(1)
  const [randomArrivalId, setRandomArrivalId] = useState(1)
  const [pulseActive, setPulseActive] = useState(false)
  const [whiteFlashActive, setWhiteFlashActive] = useState(false)
  const [playCounter, setPlayCounter] = useState(0)

  const rndCity = useStableRandom(0)
  const rnd = useStableRandom(playCounter)

  const getVehicleName = (c: string) => VEHICLE_MAP[c]?.name || c
  const getVehicleIcon = (c: string) => VEHICLE_MAP[c]?.icon || '🚗'
  const getVehicleOnomatopoeia = (c: string) => {
    const sounds = VEHICLE_MAP[c]?.sound || ['ぶーん！']
    return sounds[randomVariant % sounds.length]
  }
  const randomArrivalName = ['vehicle-hyper', 'vehicle-jump', 'vehicle-spin'][randomArrivalId % 3]!

  // Reveal effects (white shutter flash + colour pulse) each time a new answer appears
  useEffect(() => {
    if (!userAnswer) return
    setPlayCounter(c => c + 1)
    setWhiteFlashActive(true)
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setWhiteFlashActive(false), 80))
    timers.push(setTimeout(() => {
      setPulseActive(true)
      timers.push(setTimeout(() => setPulseActive(false), 150))
    }, 80))
    setRandomVariant(Math.floor(Math.random() * 3) + 1)
    setRandomArrivalId(Math.floor(Math.random() * 3))
    return () => timers.forEach(clearTimeout)
  }, [userAnswer])

  const getVehicleAnimation = (colorName: string) => {
    const baseMove = VEHICLE_MAP[colorName]?.move || 'animate-drive'
    if (colorName === '赤') return ['animate-siren', 'animate-truck-tilt', 'animate-truck-jolt'][randomVariant % 3]
    if (colorName === '黄色') return ['animate-bulldozer-push', 'animate-bulldozer-heavy', 'animate-truck-jolt'][randomVariant % 3]
    return baseMove
  }

  return (
<div className="absolute inset-0 flex flex-col bg-sky-50 overflow-hidden font-['Noto_Sans_JP']">{/* High-Impact White Flash Layer (Visual Shutter) */}<>{(whiteFlashActive) ? (<div className="absolute inset-0 z-[60] pointer-events-none bg-white opacity-100 anim-white-flash" />) : null}</>{/* Vivid Color Pulse Transition Overlay */}<>{(pulseActive) ? (<div className="absolute inset-0 z-50 pointer-events-none opacity-40 transition-opacity anim-color-pulse" style={{ ...({ backgroundColor: userAnswer?.color }) }} />) : null}</>{/* Dynamic Background Sky */}<div className="absolute inset-0 transition-colors duration-1000 z-0" style={{ ...(userAnswer ? { backgroundColor: userAnswer.color, opacity: 0.3 } : { backgroundColor: '#f0f9ff', opacity: 1 }) }} />{/* Siren Flash Overlay (Red only) */}{(userAnswer?.colorName === '赤') ? (<div className="absolute inset-0 z-0 pointer-events-none animate-siren-flash opacity-20" style={{ ...{ background: "radial-gradient(circle, transparent 40%, red 100%)" } }} />) : null}<div className="absolute bottom-40 left-0 right-0 h-32 flex items-end justify-around px-10 opacity-30 pointer-events-none select-none">{vfor(5, (i, _i) => (<div key={i} className="w-16 bg-stone-400 rounded-t-lg" style={{ ...({ height: `${20 + rndCity(i, 1) * 60}%` }) }} />))}</div>{/* Road / Ground Area */}<div className="absolute bottom-0 left-0 right-0 h-64 bg-stone-100 border-t-8 border-stone-200 z-10"><div className="absolute top-1/2 left-0 right-0 h-2 border-y-2 border-dashed border-stone-300 -translate-y-1/2" />{/* Environmental Elements (Fire / Earth) based on Variant */}<div className="absolute inset-0 z-20 pointer-events-none">{/* Fire for 'あか' (Persistent Fire) */}{(userAnswer?.colorName === '赤') ? (<>{(randomVariant === 1) ? (<div className="absolute left-1/2 top-4 flex space-x-12 -translate-x-1/2">{vfor(3, (i, _i) => (<span key={'f1-'+i} className="text-5xl animate-fire-float" style={{ ...({ animationDelay: `${i*0.3}s` }) }}>🔥</span>))}</div>) : (randomVariant === 2) ? (<div className="absolute inset-x-0 top-0 flex items-center justify-around px-10">{vfor(5, (i, _i) => (<span key={'f2-'+i} className="text-4xl animate-fire-float" style={{ ...({ animationDelay: `${i*0.2}s` }) }}>🔥</span>))}</div>) : (<div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-4"><span className="text-6xl animate-fire-float">🔥</span><span className="text-4xl animate-fire-float" style={{ ...{ animationDelay: "0.5s" } }}>🔥</span><span className="text-6xl animate-fire-float" style={{ ...{ animationDelay: "0.2s" } }}>🔥</span></div>)}</>) : (userAnswer?.colorName === '黄色') ? (<>{(randomVariant === 1) ? (<div className="absolute left-1/2 bottom-12 text-6xl animate-push-out translate-x-20">⛰️</div>) : (randomVariant === 2) ? (<div className="absolute left-1/2 bottom-10 flex space-x-4 animate-push-out translate-x-12">{vfor(3, (i, _i) => (<span key={'r1-'+i} className="text-4xl">🪨</span>))}</div>) : (<div className="absolute left-1/2 bottom-8 text-7xl animate-push-out translate-x-16">🪵</div>)}</>) : null}</div></div>{/* Particles Emitter */}<div className="absolute inset-0 z-40 pointer-events-none">{/* Water for Red */}{(userAnswer?.colorName === '赤') ? (<>{vfor(15, (i, _i) => (<div key={'water-'+i} className="absolute w-4 h-4 bg-sky-300 rounded-full animate-water-particle opacity-0" style={{ ...({ 
                    left: randomVariant === 2 ? (i % 2 === 0 ? '40%' : '60%') : '50%', 
                    top: '40%',
                    animationDelay: `${rnd(i, 2) * 1.5}s`,
                    '--tx': `${(rnd(i, 3) - 0.5) * (randomVariant === 3 ? 600 : 300)}px`,
                    '--ty': `${-150 - rnd(i, 4) * 200}px`
                 }) }} />))}</>) : null}{(userAnswer?.colorName === '黄色') ? (<>{vfor(20, (i, _i) => (<div key={'dust-'+i} className="absolute w-3 h-3 bg-amber-600/50 rounded-full animate-dust-particle opacity-0" style={{ ...({ 
                    left: '60%', top: '70%',
                    animationDelay: `${rnd(i, 5) * 1}s`,
                    '--tx': `${(rnd(i, 6) - 0.2) * 200}px`,
                    '--ty': `${-80 - rnd(i, 7) * 120}px`
                 }) }} />))}</>) : null}</div>{/* Onomatopoeia Text Layer */}<div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"><>{(userAnswer) ? (<div key={'text-'+userAnswer.id+'-'+playCounter} className="relative"><div className="text-6xl md:text-8xl font-black italic tracking-tighter filter drop-shadow-lg animate-text-pop" style={{ ...({ color: userAnswer.color === '#000000' ? 'white' : userAnswer.color, WebkitTextStroke: '3px white' }) }}>{getVehicleOnomatopoeia(userAnswer.colorName)}</div></div>) : null}</></div>{/* Main Game Area: Vehicles */}<div className="flex-grow relative flex items-center justify-center z-30 pointer-events-none"><>{(userAnswer) ? (<div key={userAnswer.id + '-' + playCounter} className={`relative flex flex-col items-center ${randomArrivalName}-in`}>{/* Vehicle Container */}<div className="relative scale-[2.5] md:scale-[3] transform transition-all duration-500 animate-impact"><div className={vcls("text-7xl md:text-8xl transition-all duration-500", getVehicleAnimation(userAnswer.colorName))} style={{ ...({ filter: `drop-shadow(0 0 15px ${userAnswer.color}) drop-shadow(0 0 50px ${userAnswer.color}40)` }) }}>{getVehicleIcon(userAnswer.colorName)}</div></div>{/* Info Bubble */}<div className="mt-24 bg-white/95 backdrop-blur-xl px-12 py-6 rounded-[3rem] shadow-2xl border-4 border-stone-100 flex flex-col items-center animate-bounce-subtle"><span className="text-[14px] font-black tracking-[0.4em] uppercase mb-1" style={{ ...({ color: userAnswer.color }) }}>{formatColorName(userAnswer.colorName)}</span><span className="text-3xl font-black text-stone-900">{getVehicleName(userAnswer.colorName)}</span></div></div>) : null}</></div>{/* History: Fleet of Vehicles */}<div className="absolute inset-x-0 bottom-24 h-24 z-30 flex items-center overflow-x-auto scrollbar-hide px-8 pb-4"><div>{vfor(correctHistory, (history, index) => (<div key={history.question.id + '-' + index} className="shrink-0 w-20 h-20 bg-white/60 backdrop-blur rounded-[1.5rem] border-2 border-white shadow-lg flex items-center justify-center mx-2 relative group hover:scale-110 transition-transform"><div className="text-4xl filter">{getVehicleIcon((history.question as any).colorName || '')}</div><div className="absolute bottom-0 inset-x-0 h-1.5" style={{ ...({ backgroundColor: history.question.color }) }} /></div>))}</div></div>{/* Bottom Controls */}<div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t-2 border-stone-100 p-6 pb-12 z-50"><div className="flex justify-between items-center mb-4 px-2"><h3 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center"><span className="mr-3 scale-125">🚛</span>{' '}しゃりょうずかん</h3></div><div className={vcls("grid gap-3", gridColsClass)}>{vfor(choices, (chord, _i) => (<button key={chord.id} className={vcls("group relative flex flex-col items-center justify-center p-3 rounded-3xl transition-all duration-300", [
            !isAutoPlay && 'active:scale-90 cursor-pointer',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-10 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'ring-6 ring-indigo-500/10 scale-110 z-10 bg-white shadow-2xl' : (!isAutoPlay ? 'hover:bg-indigo-50/50' : 'bg-white/40')
          ])} onClick={(e) => { !isAutoPlay && emit('answer', chord) }} disabled={!!userAnswer || isAutoPlay}><div className="text-3xl mb-1 filter drop-shadow-sm transform transition-transform group-hover:scale-125">{getVehicleIcon(chord.colorName)}</div><div className="flex flex-col items-center"><span className="text-[10px] font-black text-stone-900 truncate px-1">{getVehicleName(chord.colorName)}</span></div></button>))}</div></div></div>
  )
}
