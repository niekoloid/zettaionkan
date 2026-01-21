import * as Tone from 'tone'
import { ref, computed } from 'vue'
import { STEINWAY_FAST_MAP, STEINWAY_FULL_MAP, YAMAHA_MAP } from '~/constants/instruments'
import { useAuth } from './useAuth'
import { useVoiceSettings } from './useVoiceSettings'

// Singleton state shared across all components
const samplers: Record<string, Tone.Sampler> = {}
const isLoaded = ref({
  yamaha: false,
  steinway: false,
  steinwayFull: false,
  narration: false,
  effects: false
})
const isLoading = ref(false)
const isPreloading = ref(false)
const loadingProgress = ref(0)
const selectedInstrument = ref('yamaha')
const loadingFile = ref('')
const narrationBuffers: Record<string, Tone.ToneAudioBuffer> = {}
const effectBuffers: Record<string, Tone.ToneAudioBuffer> = {}
const samplerLoadingPromises: Record<string, Promise<boolean> | null> = {}
let narrationLoadingPromise: Promise<boolean> | null = null
let effectsLoadingPromise: Promise<boolean> | null = null
const customVoiceBuffers: Record<string, Tone.ToneAudioBuffer> = {}

// Set narration volume to approx 50% (-6dB) - initialized lazily on client
let narrationVolume: Tone.Volume | null = null
let effectsVolume: Tone.Volume | null = null

const getNarrationVolume = () => {
  if (!import.meta.client) return null
  if (!narrationVolume) {
    narrationVolume = new Tone.Volume(-6).toDestination()
  }
  return narrationVolume
}

const getEffectsVolume = () => {
  if (!import.meta.client) return null
  if (!effectsVolume) {
    effectsVolume = new Tone.Volume(-3).toDestination()
  }
  return effectsVolume
}

const NARRATION_FILES: Record<string, string> = {
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
  const { getVoiceUrl, customVoiceEnabled, availableVoices } = useVoiceSettings()

  const loadSampler = async (instrumentId: 'yamaha' | 'steinway', isBackground = false): Promise<boolean> => {
    // 1. If sampler already exists, just switch and return
    if (samplers[instrumentId] && isLoaded.value[instrumentId as keyof typeof isLoaded.value]) {
      if (!isBackground) {
        selectedInstrument.value = instrumentId
      }
      return true
    }

    // 2. If already loading, return existing promise
    if (samplerLoadingPromises[instrumentId]) {
      return samplerLoadingPromises[instrumentId] as Promise<boolean>
    }

    if (!isBackground) {
      isLoading.value = true
      if (!isPreloading.value) loadingProgress.value = 0
      selectedInstrument.value = instrumentId
    }

    samplerLoadingPromises[instrumentId] = new Promise<boolean>((resolve) => {
      try {
        let urls = instrumentId === 'yamaha' ? YAMAHA_MAP : STEINWAY_FAST_MAP
        const baseUrl = instrumentId === 'yamaha' 
          ? "https://tonejs.github.io/audio/salamander/" 
          : "/samples/steinway/ff/"

        // Use full map if background or already partially loaded
        if (instrumentId === 'steinway' && (isBackground || isLoaded.value.steinway)) {
          console.log('Targeting Steinway FULL map (two-stage upgrade)')
          urls = STEINWAY_FULL_MAP
        }

        const fileList = Object.values(urls)
        let fileIdx = 0
        let interval: NodeJS.Timeout | null = null

        const s = new Tone.Sampler({
          urls,
          baseUrl,
          release: 4,
          onload: () => {
            console.log(`${instrumentId} loaded (${Object.keys(urls).length} samples)`)
            
            // Upgrade case
            if (samplers[instrumentId] && urls === STEINWAY_FULL_MAP) {
              const oldSampler = samplers[instrumentId]
              samplers[instrumentId] = s.toDestination()
              // Dispose old sampler after a delay to avoid cutting off sounds
              setTimeout(() => {
                if (oldSampler) {
                  try {
                    oldSampler.dispose()
                    console.log('Old Steinway sampler disposed')
                  } catch (e) {}
                }
              }, 4000)
            } else {
              samplers[instrumentId] = s.toDestination()
            }

            isLoaded.value[instrumentId] = true

            if (!isBackground) {
              if (!isPreloading.value) {
                isLoading.value = false
                loadingProgress.value = 100
                loadingFile.value = ''
              }
            }
            samplerLoadingPromises[instrumentId] = null
            
            resolve(true)
          },
          onerror: (err) => {
            console.error(`${instrumentId} load error:`, err)
            if (!isBackground) {
              if (!isPreloading.value) {
                isLoading.value = false
                loadingProgress.value = 100
              }
            }
            samplerLoadingPromises[instrumentId] = null
            resolve(false)
          }
        })

        if (!isBackground) {
          interval = setInterval(() => {
            if (!isLoading.value) {
              if (interval) clearInterval(interval)
              return
            }
            loadingProgress.value = Math.min(Math.floor(loadingProgress.value + Math.random() * 15), 95)
            loadingFile.value = fileList[fileIdx % fileList.length] || ''
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

    return samplerLoadingPromises[instrumentId] as Promise<boolean>
  }

  const loadNarration = async (): Promise<boolean> => {
    if (isLoaded.value.narration) return true
    if (narrationLoadingPromise) return narrationLoadingPromise

    narrationLoadingPromise = (async () => {
      console.log('Starting narration buffer load in parallel...')
      try {
        const entries = Object.entries(NARRATION_FILES)
        const promises = entries.map(async ([name, url]) => {
          if (!narrationBuffers[name]) {
            narrationBuffers[name] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        })
        
        await Promise.all(promises)
        
        console.log('Narration buffers loaded successfully')
        isLoaded.value.narration = true
        narrationLoadingPromise = null
        
        // Also trigger effect loading in parallel
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

  const loadEffects = async (): Promise<boolean> => {
    if (isLoaded.value.effects) return true
    if (effectsLoadingPromise) return effectsLoadingPromise

    effectsLoadingPromise = (async () => {
      console.log('Starting effect buffer load in parallel...')
      const effectFiles = {
        'correct': '/audio/effects/correct.mp3',
        'incorrect': '/audio/effects/incorrect.mp3'
      }

      try {
        const entries = Object.entries(effectFiles)
        const promises = entries.map(async ([name, url]) => {
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
    if (isPreloading.value) return
    isPreloading.value = true
    isLoading.value = true
    loadingProgress.value = 0
    
    console.log('Preloading all audio samples in parallel...')
    
    loadingFile.value = 'Preparing Sound Source...'
    
    try {
      // Start all loads in parallel
      const yamahaPromise = loadSampler('yamaha', true)
      const steinwayPromise = userTier.value === 'premium' ? loadSampler('steinway', true) : Promise.resolve(true)
      const narrationPromise = loadNarration()
      const effectsPromise = loadEffects()

      // Set a tracking interval for overall progress
      const progressInterval = setInterval(() => {
        let totalProgress = 0
        if (isLoaded.value.yamaha) totalProgress += 30
        if (isLoaded.value.steinway) totalProgress += 30
        if (isLoaded.value.narration) totalProgress += 20
        if (isLoaded.value.effects) totalProgress += 20
        
        loadingProgress.value = Math.max(loadingProgress.value, totalProgress)
        
        if (totalProgress >= 100) {
          clearInterval(progressInterval)
        }
      }, 500)

      await Promise.all([yamahaPromise, steinwayPromise, narrationPromise, effectsPromise])
    } catch (err) {
      console.error('Preload all error:', err)
    } finally {
      loadingProgress.value = 100
      isLoading.value = false
      isPreloading.value = false
      console.log('All audio samples preloaded.')
    }
  }

  const playNotes = async (notes: string | string[], duration: string | number = 3): Promise<boolean> => {
    if (Tone.context.state !== 'running') await Tone.start()
    const s = samplers[selectedInstrument.value]
    if (s && isLoaded.value[selectedInstrument.value as keyof typeof isLoaded.value]) {
      s.triggerAttackRelease(notes, duration)
      return true
    }
    return false
  }

  const playNarration = async (colorName: string): Promise<boolean> => {
    // 1. Ensure context is running
    if (Tone.context.state !== 'running') {
      try {
        await Tone.context.resume()
      } catch (e) {
        console.warn('Silent context resume failed')
      }
    }
    
    // 2. Custom Voice Logic
    if (customVoiceEnabled.value && availableVoices.value.has(colorName)) {
      try {
        if (!customVoiceBuffers[colorName]) {
          const url = getVoiceUrl(colorName)
          if (url) {
            customVoiceBuffers[colorName] = await Tone.ToneAudioBuffer.fromUrl(url)
          }
        }
        
        const buffer = customVoiceBuffers[colorName]
        if (buffer) {
          const vol = getNarrationVolume()
          const source = new Tone.BufferSource(buffer)
          if (vol) source.connect(vol)
          else source.toDestination()
          
          source.start()
          console.log(`Custom Voice Play: ${colorName}`)
          return true
        }
      } catch (e) {
        console.error(`Custom Voice Play Error (${colorName}):`, e)
        // Fall back to default
      }
    }

    // 3. Ensure default loaded
    if (!isLoaded.value.narration) {
      const success = await loadNarration()
      if (!success) return false
    }
    
    // 4. Play using BufferSource (stateless)
    const buffer = narrationBuffers[colorName]
    if (buffer) {
      try {
        const vol = getNarrationVolume()
        const source = new Tone.BufferSource(buffer)
        if (vol) source.connect(vol)
        else source.toDestination()
        
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

  const playEffect = async (effectName: string): Promise<boolean> => {
    if (Tone.context.state !== 'running') {
      await Tone.context.resume()
    }

    if (!isLoaded.value.effects) {
      await loadEffects()
    }

    const buffer = effectBuffers[effectName]
    if (buffer) {
      try {
        const vol = getEffectsVolume()
        const source = new Tone.BufferSource(buffer)
        if (vol) source.connect(vol)
        else source.toDestination()
        
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
    isPreloading,
    loadingProgress,
    loadingFile,
    isSamplerLoaded: computed(() => isLoaded.value[selectedInstrument.value as keyof typeof isLoaded.value]),
    isLoaded,
    selectedInstrument,
    loadSampler,
    loadNarration,
    loadEffects,
    preloadAll,
    playNotes,
    playNarration,
    playEffect,
    customVoiceEnabled
  }
}
