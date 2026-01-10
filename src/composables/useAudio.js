
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
let samplerLoadingPromises = {} // Track sampler loading per instrument
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
  '薄橙': '/narration/google/薄橙.mp3',
  '肌色': '/narration/google/肌色.mp3',
  '薄紫': '/narration/google/薄紫.mp3',
  '藤色': '/narration/google/藤色.mp3',
  'グレー': '/narration/google/グレー.mp3',
  '灰色': '/narration/google/灰色.mp3',
  '水色': '/narration/google/水色.mp3',
  '空色': '/narration/google/空色.mp3'
}

export function useAudio() {
  const { user, userTier } = useAuth()

  const loadSampler = async (instrumentId, isBackground = false) => {
    // 1. If sampler already exists, just switch and return
    if (samplers[instrumentId]) {
      if (!isBackground) {
        selectedInstrument.value = instrumentId
        // NEW: Dispose other samplers to save memory when switching
        Object.keys(samplers).forEach(id => {
          if (id !== instrumentId && samplers[id]) {
            try {
              samplers[id].dispose()
              delete samplers[id]
              isLoaded.value[id] = false
              console.log(`Disposed idle sampler: ${id}`)
            } catch (e) {
              console.error(`Error disposing ${id}:`, e)
            }
          }
        })
      }
      return
    }

    // 2. If already loading, return existing promise
    if (samplerLoadingPromises[instrumentId]) {
      return samplerLoadingPromises[instrumentId]
    }

    if (!isBackground) {
      isLoading.value = true
      loadingProgress.value = 0
      selectedInstrument.value = instrumentId

      // NEW: Clear other samplers before starting new load to prevent memory spikes
      Object.keys(samplers).forEach(id => {
        if (id !== instrumentId && samplers[id]) {
          try {
            samplers[id].dispose()
            delete samplers[id]
            isLoaded.value[id] = false
            console.log(`Disposed idle sampler before load: ${id}`)
          } catch (e) {
            console.error(e)
          }
        }
      })
    }

    samplerLoadingPromises[instrumentId] = new Promise((resolve) => {
      try {
        const config = instrumentId === 'yamaha'
          ? { urls: YAMAHA_MAP, baseUrl: "https://tonejs.github.io/audio/salamander/" }
          : { urls: STEINWAY_MAP, baseUrl: "/samples/steinway/ff/" }

        const fileList = Object.values(config.urls)
        let fileIdx = 0

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
            samplerLoadingPromises[instrumentId] = null
            resolve(true)
          },
          onerror: (err) => {
            console.error(`${instrumentId} load error:`, err)
            if (!isBackground) {
              isLoading.value = false
              loadingProgress.value = 100
            }
            samplerLoadingPromises[instrumentId] = null
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
        samplerLoadingPromises[instrumentId] = null
        resolve(false)
      }
    })

    return samplerLoadingPromises[instrumentId]
  }

  const loadNarration = async () => {
    if (isLoaded.value.narration) return true
    if (narrationLoadingPromise) return narrationLoadingPromise

    narrationLoadingPromise = (async () => {
      console.log('Starting narration buffer load...')
      try {
        // Load sequentially to avoid memory spikes on tablets
        const entries = Object.entries(NARRATION_FILES)
        for (const [name, url] of entries) {
          if (!narrationBuffers[name]) {
            narrationBuffers[name] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        }
        
        console.log('Narration buffers loaded successfully')
        isLoaded.value.narration = true
        narrationLoadingPromise = null
        
        // Also trigger effect loading sequentially in background
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
        const entries = Object.entries(effectFiles)
        for (const [name, url] of entries) {
          if (!effectBuffers[name]) {
            effectBuffers[name] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        }
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
    console.log('Preloading all audio samples sequentially...')
    // Load Yamaha first, then Steinway, then Narration
    await loadSampler('yamaha', true)
    await loadSampler('steinway', true)
    await loadNarration()
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

