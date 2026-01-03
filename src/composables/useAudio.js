import { ref, reactive } from 'vue'
import * as Tone from 'tone'
import { STEINWAY_MAP, YAMAHA_MAP } from '../constants/instruments.js'

// Singleton state shared across all components
const samplers = {}
const isLoading = ref(false)
const loadingProgress = ref(0)
const isSamplerLoaded = ref(false)
const selectedInstrument = ref('yamaha')

export function useAudio() {
  const loadSampler = async (instrumentId) => {
    // 1. If sampler already exists, just switch and return
    if (samplers[instrumentId]) {
      selectedInstrument.value = instrumentId
      isSamplerLoaded.value = true
      loadingProgress.value = 100
      return
    }

    // 2. If already loading THIS specific instrument, ignore duplicate call
    if (isLoading.value && selectedInstrument.value === instrumentId) {
      console.log(`Already loading ${instrumentId}, skipping...`)
      return
    }

    // 3. If loading something ELSE, we could either cancel or just wait.
    // For now, we allow switching the TARGET instrument even if another is loading,
    // but we reset the state for the new target.
    if (isLoading.value) {
      console.log(`Switching load target from ${selectedInstrument.value} to ${instrumentId}`)
    }

    // Set loading state
    selectedInstrument.value = instrumentId
    isLoading.value = true
    loadingProgress.value = 0
    isSamplerLoaded.value = false

    const config = instrumentId === 'yamaha'
      ? { urls: YAMAHA_MAP, baseUrl: "https://tonejs.github.io/audio/salamander/" }
      : { urls: STEINWAY_MAP, baseUrl: "/samples/steinway/ff/" }

    try {
      const s = new Tone.Sampler({
        ...config,
        onload: () => {
          console.log(`${instrumentId} loaded and cached`)
          samplers[instrumentId] = s
          selectedInstrument.value = instrumentId
          isSamplerLoaded.value = true
          loadingProgress.value = 100
          isLoading.value = false
        },
        onerror: (err) => {
          console.error(`${instrumentId} load error:`, err)
          // Fallback logic if needed, but for now we follow the existing pattern
          isSamplerLoaded.value = true
          loadingProgress.value = 100
          isLoading.value = false
        }
      }).toDestination()

      // Fake progress animation
      const interval = setInterval(() => {
        if (!isLoading.value) {
          clearInterval(interval)
          return
        }
        loadingProgress.value = Math.min(Math.floor(loadingProgress.value + Math.random() * 15), 95)
      }, 200)

      // Safety timeout
      setTimeout(() => {
        if (isLoading.value) {
          console.warn(`${instrumentId} load timed out`)
          isLoading.value = false
          loadingProgress.value = 100
          isSamplerLoaded.value = true
        }
      }, 30000) // Increased to 30s as samples can be large

    } catch (err) {
      console.error('Sampler initialization error:', err)
      isLoading.value = false
      loadingProgress.value = 100
    }
  }

  const playNotes = async (notes, duration = 3) => {
    if (Tone.context.state !== 'running') await Tone.start()
    const s = samplers[selectedInstrument.value]
    if (s && isSamplerLoaded.value) {
      s.triggerAttackRelease(notes, duration)
      return true
    }
    return false
  }

  return {
    samplers,
    isLoading,
    loadingProgress,
    isSamplerLoaded,
    selectedInstrument,
    loadSampler,
    playNotes
  }
}
