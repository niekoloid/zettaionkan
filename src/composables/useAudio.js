
import { ref, computed } from 'vue'
import * as Tone from 'tone'
import { useAuth } from './useAuth'
import { STEINWAY_MAP, YAMAHA_MAP } from '../constants/instruments.js'

// Singleton state shared across all components
const samplers = {}
const isLoaded = ref({
  yamaha: false,
  steinway: false
})
const isLoading = ref(false)
const loadingProgress = ref(0)
const selectedInstrument = ref('yamaha')
const loadingFile = ref('')

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

  const preloadAll = async () => {
    console.log('Preloading all audio samples in background...')
    const p1 = loadSampler('yamaha', true)
    const p2 = loadSampler('steinway', true)
    await Promise.all([p1, p2])
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

  return {
    samplers,
    isLoading,
    loadingProgress,
    loadingFile,
    isSamplerLoaded: computed(() => isLoaded.value[selectedInstrument.value]),
    isLoaded,
    selectedInstrument,
    loadSampler,
    preloadAll,
    playNotes
  }
}

