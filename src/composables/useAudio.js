
import { ref, computed } from 'vue'
import * as Tone from 'tone'
import { useAuth } from './useAuth'
import { STEINWAY_MAP, YAMAHA_MAP } from '../constants/instruments.js'

// Singleton state shared across all components
const samplers = {}
const isLoaded = ref({
  yamaha: false,
  steinway: false,
  narration: false,
  effects: false
})
const isLoading = ref(false)
const loadingProgress = ref(0)
const selectedInstrument = ref('yamaha')
const loadingFile = ref('')
const narrationBuffers = {}
const effectBuffers = {}
let narrationLoadingPromise = null
let effectsLoadingPromise = null

const NARRATION_FILES = {
  '赤': '/narration/google/赤.mp3',
  '青': '/narration/google/青.mp3',
  '黄色': '/narration/google/黄色.mp3',
  '黒': '/narration/google/黒.mp3',
  '緑': '/narration/google/緑.mp3',
  'オレンジ': '/narration/google/オレンジ.mp3',
  '紫': '/narration/google/紫.mp3',
  'ピンク': '/narration/google/ピンク.mp3',
  '茶色': '/narration/google/茶色.mp3',
  '黄緑': '/narration/google/黄緑.mp3',
  'ベージュ': '/narration/google/ベージュ.mp3',
  '薄紫': '/narration/google/薄紫.mp3',
  'グレー': '/narration/google/グレー.mp3',
  '水色': '/narration/google/水色.mp3'
}

export function useAudio() {
  const { user, userTier } = useAuth()

  const loadSampler = async (instrumentId, isBackground = false) => {
    // 1. If sampler already exists, just switch and return
    if (samplers[instrumentId]) {
      if (!isBackground) selectedInstrument.value = instrumentId
      return
    }

    // 2. If already loading, ignore duplicate call
    if (isBackground && isLoaded.value[instrumentId]) return

    if (!isBackground) {
      isLoading.value = true
      loadingProgress.value = 0
      selectedInstrument.value = instrumentId
    }

    const config = instrumentId === 'yamaha'
      ? { urls: YAMAHA_MAP, baseUrl: "https://tonejs.github.io/audio/salamander/" }
      : { urls: STEINWAY_MAP, baseUrl: "/samples/steinway/ff/" }

    const fileList = Object.values(config.urls)
    let fileIdx = 0

    return new Promise((resolve) => {
      try {
        const s = new Tone.Sampler({
          ...config,
          onload: () => {
            console.log(`${instrumentId} loaded and cached`)
            samplers[instrumentId] = s
            isLoaded.value[instrumentId] = true
            if (!isBackground) {
              isLoading.value = false
              loadingProgress.value = 100
              loadingFile.value = ''
            }
            resolve(true)
          },
          onerror: (err) => {
            console.error(`${instrumentId} load error:`, err)
            if (!isBackground) {
              isLoading.value = false
              loadingProgress.value = 100
            }
            resolve(false)
          }
        }).toDestination()

        if (!isBackground) {
          const interval = setInterval(() => {
            if (!isLoading.value) {
              clearInterval(interval)
              return
            }
            loadingProgress.value = Math.min(Math.floor(loadingProgress.value + Math.random() * 15), 95)
            loadingFile.value = fileList[fileIdx % fileList.length]
            fileIdx++
          }, 200)
        }

      } catch (err) {
        console.error('Sampler initialization error:', err)
        if (!isBackground) isLoading.value = false
        resolve(false)
      }
    })
  }

  const loadNarration = async () => {
    if (isLoaded.value.narration) return true
    if (narrationLoadingPromise) return narrationLoadingPromise

    narrationLoadingPromise = (async () => {
      console.log('Starting narration buffer load...')
      try {
        const promises = Object.entries(NARRATION_FILES).map(async ([name, url]) => {
          if (!narrationBuffers[name]) {
            narrationBuffers[name] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        })
        await Promise.all(promises)
        console.log('Narration buffers loaded successfully')
        isLoaded.value.narration = true
        narrationLoadingPromise = null
        
        // Also trigger effect loading in background
        loadEffects().catch(console.error)
        
        return true
      } catch (err) {
        console.error('Narration load error:', err)
        narrationLoadingPromise = null
        return false
      }
    })()

    return narrationLoadingPromise
  }

  const loadEffects = async () => {
    if (isLoaded.value.effects) return true
    if (effectsLoadingPromise) return effectsLoadingPromise

    effectsLoadingPromise = (async () => {
      console.log('Starting effect buffer load...')
      const effectFiles = {
        'correct': '/audio/effects/correct.mp3',
        'incorrect': '/audio/effects/incorrect.mp3'
      }

      try {
        const promises = Object.entries(effectFiles).map(async ([name, url]) => {
          if (!effectBuffers[name]) {
            effectBuffers[name] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        })
        await Promise.all(promises)
        console.log('Effect buffers loaded')
        isLoaded.value.effects = true
        effectsLoadingPromise = null
        return true
      } catch (err) {
        console.error('Effect load error:', err)
        effectsLoadingPromise = null
        return false
      }
    })()

    return effectsLoadingPromise
  }

  const preloadAll = async () => {
    console.log('Preloading all audio samples in background...')
    const p1 = loadSampler('yamaha', true)
    const p2 = loadSampler('steinway', true)
    const p3 = loadNarration()
    await Promise.all([p1, p2, p3])
    console.log('All audio samples preloaded.')
  }

  const playNotes = async (notes, duration = 3) => {
    if (Tone.context.state !== 'running') await Tone.start()
    const s = samplers[selectedInstrument.value]
    if (s && isLoaded.value[selectedInstrument.value]) {
      s.triggerAttackRelease(notes, duration)
      return true
    }
    return false
  }

  const playNarration = async (colorName) => {
    // 1. Ensure context is running
    if (Tone.context.state !== 'running') {
      try {
        await Tone.context.resume()
      } catch (e) {
        console.warn('Silent context resume failed')
      }
    }
    
    // 2. Ensure loaded
    if (!isLoaded.value.narration) {
      const success = await loadNarration()
      if (!success) return false
    }
    
    // 3. Play using BufferSource (stateless)
    const buffer = narrationBuffers[colorName]
    if (buffer) {
      try {
        const source = new Tone.BufferSource(buffer).toDestination()
        source.fadeIn = 0.05
        source.fadeOut = 0.1
        source.start()
        console.log(`Stateless Play: ${colorName}`)
        return true
      } catch (e) {
        console.error(`Stateless Play Error (${colorName}):`, e)
      }
    } else {
      console.warn(`Buffer missing for ${colorName}`)
    }
    return false
  }

  const playEffect = async (effectName) => {
    if (Tone.context.state !== 'running') {
      await Tone.context.resume()
    }

    if (!isLoaded.value.effects) {
      await loadEffects()
    }

    const buffer = effectBuffers[effectName]
    if (buffer) {
      try {
        const source = new Tone.BufferSource(buffer).toDestination()
        source.start()
        return true
      } catch (e) {
        console.error(`Effect Play Error (${effectName}):`, e)
      }
    }
    return false
  }

  return {
    samplers,
    isLoading,
    loadingProgress,
    loadingFile,
    isSamplerLoaded: computed(() => isLoaded.value[selectedInstrument.value]),
    isLoaded,
    selectedInstrument,
    loadSampler,
    loadNarration,
    loadEffects,
    preloadAll,
    playNotes,
    playNarration,
    playEffect
  }
}

