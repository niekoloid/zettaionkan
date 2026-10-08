'use client'

import {
  createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode
} from 'react'
import type * as ToneNS from 'tone'
import { STEINWAY_FAST_MAP, STEINWAY_FULL_MAP, YAMAHA_MAP } from '@/constants/instruments'
import { useAuth } from '@/lib/app-context'
import { useVoiceSettings } from '@/lib/voice'

type InstrumentId = 'yamaha' | 'steinway'
type LoadedFlags = { yamaha: boolean; steinway: boolean; narration: boolean; effects: boolean }

const NARRATION_COLORS = [
  '赤', '青', '黄色', '黒', '緑', 'オレンジ', '紫', 'ピンク', '茶色', '黄緑',
  'ベージュ', '薄橙', '肌色', '薄紫', '藤色', 'グレー', '灰色', '水色', '空色'
]
const EFFECT_FILES: Record<string, string> = {
  correct: '/audio/effects/correct.mp3',
  incorrect: '/audio/effects/incorrect.mp3'
}

// Tone.js is browser-only and heavy: load it lazily and only once.
let tonePromise: Promise<typeof ToneNS> | null = null
const loadTone = () => (tonePromise ??= import('tone'))

// Samplers / buffers are not React state: they live for the whole session.
const samplers: Partial<Record<InstrumentId, ToneNS.Sampler>> = {}
const narrationBuffers: Record<string, ToneNS.ToneAudioBuffer> = {}
const customVoiceBuffers: Record<string, ToneNS.ToneAudioBuffer> = {}
const effectBuffers: Record<string, ToneNS.ToneAudioBuffer> = {}
const samplerPromises: Partial<Record<InstrumentId, Promise<boolean>>> = {}
let narrationPromise: Promise<boolean> | null = null
let effectsPromise: Promise<boolean> | null = null
let narrationVolume: ToneNS.Volume | null = null
let effectsVolume: ToneNS.Volume | null = null

interface AudioContextValue {
  samplers: Partial<Record<InstrumentId, ToneNS.Sampler>>
  isLoading: boolean
  isPreloading: boolean
  loadingProgress: number
  loadingFile: string
  isLoaded: LoadedFlags
  isSamplerLoaded: boolean
  selectedInstrument: InstrumentId
  loadSampler: (id: InstrumentId, isBackground?: boolean) => Promise<boolean>
  loadNarration: () => Promise<boolean>
  loadEffects: () => Promise<boolean>
  preloadAll: () => Promise<void>
  playNotes: (notes: string | string[], duration?: string | number) => Promise<boolean>
  playNarration: (colorName: string) => Promise<boolean>
  playEffect: (name: string) => Promise<boolean>
  customVoiceEnabled: boolean
}

const AudioCtx = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const { userTier } = useAuth()
  const { customVoiceEnabled, availableVoices, getVoiceUrl } = useVoiceSettings()
  const voiceRef = useRef({ customVoiceEnabled, availableVoices, getVoiceUrl })
  voiceRef.current = { customVoiceEnabled, availableVoices, getVoiceUrl }
  const tierRef = useRef(userTier)
  tierRef.current = userTier

  const [isLoading, setIsLoading] = useState(false)
  const [isPreloading, setIsPreloading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingFile, setLoadingFile] = useState('')
  const [isLoaded, setIsLoadedState] = useState<LoadedFlags>({ yamaha: false, steinway: false, narration: false, effects: false })
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentId>('yamaha')

  const loadedRef = useRef(isLoaded)
  const preloadingRef = useRef(false)
  const loadingRef = useRef(false)
  const selectedRef = useRef<InstrumentId>('yamaha')

  const markLoaded = useCallback((key: keyof LoadedFlags) => {
    loadedRef.current = { ...loadedRef.current, [key]: true }
    setIsLoadedState(loadedRef.current)
  }, [])
  const setLoading = useCallback((v: boolean) => { loadingRef.current = v; setIsLoading(v) }, [])
  const select = useCallback((id: InstrumentId) => { selectedRef.current = id; setSelectedInstrument(id) }, [])

  const loadSampler = useCallback(async (id: InstrumentId, isBackground = false): Promise<boolean> => {
    if (samplers[id] && loadedRef.current[id]) {
      if (!isBackground) select(id)
      return true
    }
    if (samplerPromises[id]) return samplerPromises[id]!

    if (!isBackground) {
      setLoading(true)
      if (!preloadingRef.current) setLoadingProgress(0)
      select(id)
    }

    const promise = new Promise<boolean>(async resolve => {
      try {
        const Tone = await loadTone()
        const useFull = id === 'steinway' && (isBackground || loadedRef.current.steinway)
        const urls = id === 'yamaha' ? YAMAHA_MAP : useFull ? STEINWAY_FULL_MAP : STEINWAY_FAST_MAP
        const baseUrl = id === 'yamaha' ? 'https://tonejs.github.io/audio/salamander/' : '/samples/steinway/ff/'
        const fileList = Object.values(urls)
        let fileIdx = 0
        let interval: ReturnType<typeof setInterval> | null = null

        const finish = (ok: boolean) => {
          if (interval) clearInterval(interval)
          if (!isBackground && !preloadingRef.current) {
            setLoading(false)
            setLoadingProgress(100)
            setLoadingFile('')
          }
          delete samplerPromises[id]
          resolve(ok)
        }

        const sampler: ToneNS.Sampler = new Tone.Sampler({
          urls,
          baseUrl,
          release: 4,
          onload: () => {
            const previous = samplers[id]
            samplers[id] = sampler.toDestination()
            // Upgrade case: keep the old sampler alive briefly so sounds are not cut
            if (previous && urls === STEINWAY_FULL_MAP) setTimeout(() => { try { previous.dispose() } catch {} }, 4000)
            markLoaded(id)
            finish(true)
          },
          onerror: err => {
            console.error(`${id} load error:`, err)
            finish(false)
          }
        })

        if (!isBackground) {
          interval = setInterval(() => {
            if (!loadingRef.current) { if (interval) clearInterval(interval); return }
            setLoadingProgress(p => Math.min(Math.floor(p + Math.random() * 15), 95))
            setLoadingFile(fileList[fileIdx++ % fileList.length] || '')
          }, 200)
        }
      } catch (err) {
        console.error('Sampler initialization error:', err)
        if (!isBackground) setLoading(false)
        delete samplerPromises[id]
        resolve(false)
      }
    })
    samplerPromises[id] = promise
    return promise
  }, [markLoaded, select, setLoading])

  const loadEffects = useCallback(async (): Promise<boolean> => {
    if (loadedRef.current.effects) return true
    if (effectsPromise) return effectsPromise
    effectsPromise = (async () => {
      try {
        const Tone = await loadTone()
        await Promise.all(Object.entries(EFFECT_FILES).map(async ([name, url]) => {
          effectBuffers[name] ??= await Tone.ToneAudioBuffer.fromUrl(url)
        }))
        markLoaded('effects')
        return true
      } catch (err) {
        console.error('Effect load error:', err)
        return false
      } finally {
        effectsPromise = null
      }
    })()
    return effectsPromise
  }, [markLoaded])

  const loadNarration = useCallback(async (): Promise<boolean> => {
    if (loadedRef.current.narration) return true
    if (narrationPromise) return narrationPromise
    narrationPromise = (async () => {
      try {
        const Tone = await loadTone()
        await Promise.all(NARRATION_COLORS.map(async name => {
          narrationBuffers[name] ??= await Tone.ToneAudioBuffer.fromUrl(`/narration/google/${name}.mp3`)
        }))
        markLoaded('narration')
        loadEffects().catch(console.error)
        return true
      } catch (err) {
        console.error('Narration load error:', err)
        return false
      } finally {
        narrationPromise = null
      }
    })()
    return narrationPromise
  }, [loadEffects, markLoaded])

  const preloadAll = useCallback(async () => {
    if (preloadingRef.current) return
    preloadingRef.current = true
    setIsPreloading(true)
    setLoading(true)
    setLoadingProgress(0)
    setLoadingFile('Preparing Sound Source...')

    const progress = setInterval(() => {
      const f = loadedRef.current
      const total = (f.yamaha ? 30 : 0) + (f.steinway ? 30 : 0) + (f.narration ? 20 : 0) + (f.effects ? 20 : 0)
      setLoadingProgress(p => Math.max(p, total))
      if (total >= 100) clearInterval(progress)
    }, 500)

    try {
      await Promise.all([
        loadSampler('yamaha', true),
        tierRef.current === 'premium' ? loadSampler('steinway', true) : Promise.resolve(true),
        loadNarration(),
        loadEffects()
      ])
    } catch (err) {
      console.error('Preload all error:', err)
    } finally {
      clearInterval(progress)
      setLoadingProgress(100)
      setLoading(false)
      preloadingRef.current = false
      setIsPreloading(false)
    }
  }, [loadEffects, loadNarration, loadSampler, setLoading])

  const ensureRunning = async () => {
    const Tone = await loadTone()
    if (Tone.getContext().state !== 'running') await Tone.start()
    return Tone
  }

  const playNotes = useCallback(async (notes: string | string[], duration: string | number = 3) => {
    await ensureRunning()
    const id = selectedRef.current
    const s = samplers[id]
    if (s && loadedRef.current[id]) {
      s.triggerAttackRelease(notes, duration)
      return true
    }
    return false
  }, [])

  const playBuffer = async (buffer: ToneNS.ToneAudioBuffer, kind: 'narration' | 'effects') => {
    const Tone = await loadTone()
    if (kind === 'narration') narrationVolume ??= new Tone.Volume(-6).toDestination()
    else effectsVolume ??= new Tone.Volume(-3).toDestination()
    const source = new Tone.BufferSource(buffer)
    source.connect((kind === 'narration' ? narrationVolume : effectsVolume)!)
    if (kind === 'narration') { source.fadeIn = 0.05; source.fadeOut = 0.1 }
    source.start()
  }

  const playNarration = useCallback(async (colorName: string) => {
    const Tone = await ensureRunning()

    // 1. Parent's own recording, when enabled
    const voice = voiceRef.current
    if (voice.customVoiceEnabled && voice.availableVoices.has(colorName)) {
      try {
        if (!customVoiceBuffers[colorName]) {
          const url = voice.getVoiceUrl(colorName)
          if (url) customVoiceBuffers[colorName] = await Tone.ToneAudioBuffer.fromUrl(url)
        }
        const buffer = customVoiceBuffers[colorName]
        if (buffer) { await playBuffer(buffer, 'narration'); return true }
      } catch (e) {
        console.error(`Custom Voice Play Error (${colorName}):`, e)
        // fall back to the default voice
      }
    }

    // 2. Default narration
    if (!loadedRef.current.narration && !(await loadNarration())) return false
    const buffer = narrationBuffers[colorName]
    if (!buffer) { console.warn(`Buffer missing for ${colorName}`); return false }
    try { await playBuffer(buffer, 'narration'); return true } catch (e) { console.error(e); return false }
  }, [loadNarration])

  const playEffect = useCallback(async (name: string) => {
    await ensureRunning()
    if (!loadedRef.current.effects) await loadEffects()
    const buffer = effectBuffers[name]
    if (!buffer) return false
    try { await playBuffer(buffer, 'effects'); return true } catch (e) { console.error(e); return false }
  }, [loadEffects])

  const value = useMemo<AudioContextValue>(() => ({
    samplers, isLoading, isPreloading, loadingProgress, loadingFile, isLoaded,
    isSamplerLoaded: isLoaded[selectedInstrument],
    selectedInstrument, loadSampler, loadNarration, loadEffects, preloadAll,
    playNotes, playNarration, playEffect, customVoiceEnabled
  }), [customVoiceEnabled, isLoading, isPreloading, loadingProgress, loadingFile, isLoaded, selectedInstrument,
    loadSampler, loadNarration, loadEffects, preloadAll, playNotes, playNarration, playEffect])

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('AudioProvider is missing')
  return ctx
}
