<script setup lang="ts">
useHead({
  title: '和音の聞き流し - いろおと'
})
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Database } from '~/types/database.types'
import type { Chord } from '~/constants/chords'
import type { HistoryItem } from '~/types/app'

const supabase = useSupabaseClient<Database>()

import * as Tone from 'tone'
import { ChordDefinitions } from '~/constants/chords'

// ... imports
// ...



const router = useRouter()
// ... existing code ...
const route = useRoute()

// === Constants ===
const { allChords: customChords } = useChordSettings()
const { namingConvention, instrument } = useAppSettings()

const TEST_CHORDS = computed<Chord[]>(() => {
  return customChords.value.slice(0, 14).map((c, index) => ({
    ...c,
    label: (index + 1).toString(),
    displayColor: c.colorName,
    sortOrder: index + 1
  }))
})

const DELAYS = {
  REVEAL: 5000,
  NEXT_QUESTION: 4000,
  PLAYBACK_START: 500,
}

// === Reactive State ===
const view = ref('settings')
const currentQuestionIndex = ref(0)
const AUTOPLAY_SETTINGS_KEY = 'zettaionkan_autoplay_settings'
// ... (keep persistence stuff) ...

// === Auth & PRO ===
const { user, userTier, authReady } = useAuth()
const { hasAccess, isEnabled } = usePro()
const checkAccess = (feature: any) => hasAccess(feature, userTier.value)
const isPro = computed(() => userTier.value !== 'free') // Keep for simple checks if needed, but per-feature is better

const handleLockedClick = () => {
    const { openProModal } = useProModal()
    if (userTier.value === 'free') {
        openProModal('PROプラン限定', 'この機能（モード変更や黒鍵の選択など）はPROプランで利用可能です。')
    } else {
        openProModal('PROプラン機能', 'この機能はPROプラン限定です。')
    }
}

interface AutoplayCookieSettings {
  chordIds: string[]
  revealType: string
  voiceEnabled: boolean
  immediate: boolean
  delay: number
  ratio: number
  isReviewWeighted: boolean
}

const autoplayCookie = useCookie<AutoplayCookieSettings>(AUTOPLAY_SETTINGS_KEY, {
  default: () => ({
    chordIds: [],
    revealType: 'icecream',
    voiceEnabled: false,
    immediate: false,
    delay: 3,
    ratio: 0.3,
    isReviewWeighted: false
  }),
  watch: true,
  maxAge: 60 * 60 * 24 * 365 * 100 // 100 years
})

const selectedChordIds = ref(new Set<string>(autoplayCookie.value.chordIds))
const isSaving = ref(false)

const syncToCookie = () => {
  autoplayCookie.value = {
    chordIds: Array.from(selectedChordIds.value),
    revealType: autoPlayRevealType.value,
    voiceEnabled: isVoiceEnabled.value,
    immediate: isAutoPlayImmediate.value,
    delay: revealDelay.value,
    ratio: parentChordRatio.value,
    isReviewWeighted: isReviewWeighted.value
  }
}

const loadFromCookie = () => {
  const s = autoplayCookie.value
  if (s.chordIds) selectedChordIds.value = new Set(s.chordIds)
  if (s.revealType) autoPlayRevealType.value = s.revealType
  if (s.voiceEnabled !== undefined) isVoiceEnabled.value = s.voiceEnabled
  if (s.immediate !== undefined) isAutoPlayImmediate.value = s.immediate
  if (s.delay) revealDelay.value = s.delay
  if (s.ratio) parentChordRatio.value = s.ratio
  if (s.isReviewWeighted !== undefined) isReviewWeighted.value = s.isReviewWeighted
}

const questions = ref<Chord[]>([])

const playedCount = computed(() => {
  if (view.value !== 'playing') return 0
  return isAutoPlayRevealed.value ? currentQuestionIndex.value + 1 : currentQuestionIndex.value
})

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler,
  loadNarration,
  playNarration,
  customVoiceEnabled
} = useAudio()

import { useVoiceSettings } from '~/composables/useVoiceSettings'
const { availableVoices, fetchAvailableVoices, fetchSettings, updateSettings } = useVoiceSettings()

const autoPlayTimeout = ref<any>(null)
const isAutoPlayRevealed = ref(false)
const isAutoPlayImmediate = ref(false)
const isVoiceEnabled = ref(true)
const revealDelay = ref(2.5) // seconds before revealing/speaking
const autoPlayRevealType = ref('full') // 'full' | 'icecream' | 'train' | 'vehicle' | 'cat' | 'cute_cat' | 'video_cat' | 'cat_flag' | 'train_front'

const selectedChords = computed(() => {
  return TEST_CHORDS.value.filter(c => selectedChordIds.value.has(c.id))
})

const missingRecordingChords = computed(() => {
  return selectedChords.value.filter(chord => !availableVoices.value.has(chord.colorName))
})

const hasAllRecordings = computed(() => {
  return missingRecordingChords.value.length === 0
})

const handleToggleCustomVoice = async () => {
  if (!customVoiceEnabled.value) {
    // 録音がない和音が一つでもある場合は有効化させない
    if (!hasAllRecordings.value) {
      const names = missingRecordingChords.value.map(c => c.colorName).join('、')
      alert(`以下の選択された和音の録音が見つかりません：\n${names}\n\n全ての和音の録音を完了させてから有効にしてください。`)
      return
    }
  }
  await updateSettings(!customVoiceEnabled.value)
}


const {
  parentChordRatio,
  isReviewWeighted,
  parentChord,
  otherChords,
  otherChordsDisplay,
  otherChordsWithWeights,
  getRandomChord
} = useChordFrequency(selectedChords)





const whiteKeyChords = computed(() => TEST_CHORDS.value.filter(c => (c.sortOrder || 0) <= 9))
const blackKeyChords = computed(() => TEST_CHORDS.value.filter(c => (c.sortOrder || 0) > 9))



// === Helper Functions ===
const cleanupSideEffects = () => {
  if (autoPlayTimeout.value) clearTimeout(autoPlayTimeout.value)
}

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const iceCreamHistory = computed<HistoryItem[]>(() => {
  if (view.value !== 'playing') return []
  
  const history: HistoryItem[] = []
  
  for (let i = 0; i < currentQuestionIndex.value; i++) {
    const q = questions.value[i]
    if (q) {
      history.push({
        question: q,
        answer: q,
        isCorrect: true 
      })
    }
  }

  if (isAutoPlayRevealed.value && currentQuestion.value) {
    history.push({
      question: currentQuestion.value,
      answer: currentQuestion.value,
      isCorrect: true
    })
  }
  
  return history
})

const speakColor = async (text: string) => {
  await playNarration(text)
}

const isLightColor = (hex: string) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180
}

// === Core Logic ===
const playCurrentQuestion = async () => {
  cleanupSideEffects()

  // Reset reveal state depending on mode
  // Move this to top to prevent "flash" of answer before sound if there are awaits below
  if (!isAutoPlayImmediate.value) {
    isAutoPlayRevealed.value = false
  } else {
    isAutoPlayRevealed.value = true
  }
  
  // Wait for samplers if they are still loading (max 5s)
  let waitAttempts = 0
  const checkLoaded = () => samplers[selectedInstrument.value] && isSamplerLoaded.value
  
  while (!checkLoaded() && waitAttempts < 50) {
    console.log('Waiting for sampler to load...')
    await new Promise(r => setTimeout(r, 100))
    waitAttempts++
  }

  const s = samplers[selectedInstrument.value]
  if (!s || !isSamplerLoaded.value) {
    console.error('Sampler failed to load in time')
    stopAutoPlay()
    return
  }

  if (Tone.context.state !== 'running') {
    await Tone.start()
    try {
      await Tone.context.resume()
    } catch (e) {
      console.warn('Context resume failed:', e)
    }
  }
  
  const chord = currentQuestion.value
  if (!chord) return
  
  
  // Determine duration based on mode
  
  const soundDuration = autoPlayRevealType.value === 'cat_flag' ? 8 : 8
  s.triggerAttackRelease(chord.notes, soundDuration)
  
  // Narration timing: Use 5s for flag mode as requested
  const delayMs = autoPlayRevealType.value === 'cat_flag' 
    ? 5000 
    : revealDelay.value * 1000

  if (isAutoPlayImmediate.value) {
    const nextDelay = autoPlayRevealType.value === 'cat_flag' ? 3500 : DELAYS.NEXT_QUESTION
    autoPlayTimeout.value = setTimeout(() => {
      if (isVoiceEnabled.value) speakColor(chord.displayColor || '')
      autoPlayTimeout.value = setTimeout(nextQuestion, nextDelay)
    }, delayMs)
  } else {
    const nextDelay = autoPlayRevealType.value === 'cat_flag' ? 3500 : DELAYS.NEXT_QUESTION
    autoPlayTimeout.value = setTimeout(() => {
      isAutoPlayRevealed.value = true
      if (isVoiceEnabled.value) speakColor(chord.displayColor || '')
      autoPlayTimeout.value = setTimeout(nextQuestion, nextDelay)
    }, delayMs)
  }
}

const nextQuestion = async () => {
  if (view.value !== 'playing') return
  
  // Prevent answer flash: Hide previous answer BEFORE loading new chord data
  if (!isAutoPlayImmediate.value) {
    isAutoPlayRevealed.value = false
    await nextTick()
  }

  const next = getRandomChord()
  if (next) questions.value.push(next)
  currentQuestionIndex.value++
  
  // In immediate mode, we might want to keep showing previous until next sound? 
  // But playCurrentQuestion handles the reset.
  playCurrentQuestion()
}

const toggleChordSelection = (id: string) => {
  const targetChord = TEST_CHORDS.value.find(c => c.id === id)
  if (!targetChord) return

  const newSet = new Set()
  TEST_CHORDS.value.forEach(c => {
    if ((c.sortOrder || 0) <= (targetChord.sortOrder || 0)) newSet.add(c.id)
  })
  selectedChordIds.value = newSet as Set<string>
  syncToCookie()
}

const saveSession = async () => {
  if (isSaving.value || questions.value.length === 0) return
  
  const currentCount = playedCount.value
  if (currentCount === 0) return
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return
  
  isSaving.value = true
  try {
    const sessionDetails = questions.value.slice(0, currentCount).map(q => ({
      question: { ...q },
      answer: { ...q },
      isCorrect: true,
      isSkipped: false,
      mode: 'autoplay'
    }))

    await supabase.from('training_sessions').insert({
      user_id: currentUser.id,
      score: currentCount,
      total_questions: currentCount,
      details: sessionDetails,
      settings: {
        mode: 'autoplay',
        instrument: selectedInstrument.value,
        voice: isVoiceEnabled.value,
        delay: revealDelay.value,
        reveal_type: autoPlayRevealType.value,
        selected_chords: Array.from(selectedChordIds.value)
      }
    } as any)
  } catch (e) {
    console.error('Failed to save autoplay session:', e)
  } finally {
    isSaving.value = false
  }
}



const startAutoPlay = async () => {
  const firstChord = getRandomChord()
  if (!firstChord) return

  // IMPORTANT: Tone.start() must be awaited inside user gesture to unlock audio
  try {
    await Tone.start()
    await Tone.context.resume()
    console.log('Audio context started/resumed successfully')
  } catch (e) {
    console.error('Failed to start audio context:', e)
  }
  
  // Load narration in background (non-blocking for UI)
  if (isVoiceEnabled.value) {
    loadNarration().catch(console.error)
  }

  questions.value = firstChord ? [firstChord] : []
  currentQuestionIndex.value = 0
  view.value = 'playing'
  
  // Only start playback immediately if not in cat_flag mode (which waits for preloading)
  if (autoPlayRevealType.value !== 'cat_flag') {
    setTimeout(playCurrentQuestion, DELAYS.PLAYBACK_START)
  }
}

const stopAutoPlay = async () => {
  const currentCount = playedCount.value
  cleanupSideEffects()
  
  // Update UI immediately
  view.value = 'settings'
  isAutoPlayRevealed.value = false

  // Save session in background
  if (currentCount > 0) {
    saveSession()
  }
}

const handleHeaderBack = async (e: Event) => {
  if (view.value !== 'settings') {
    e.preventDefault()
    await stopAutoPlay()
  }
}

// Intercept browser back button
onBeforeRouteLeave(async (to, from) => {
  if (view.value !== 'settings') {
    await stopAutoPlay()
    return false
  }
  return true
})

// === Lifecycle ===

onMounted(async () => {
  await authReady
  loadFromCookie()

  // Default selection if nothing loaded or found
  if (selectedChordIds.value.size === 0 && TEST_CHORDS.value.length >= 2) {
    selectedChordIds.value.add(TEST_CHORDS.value[0]!.id)
    selectedChordIds.value.add(TEST_CHORDS.value[1]!.id)
    syncToCookie()
  }

  let preferred: 'yamaha' | 'steinway' = instrument.value as 'yamaha' | 'steinway'
  
  if (preferred === 'steinway' && !checkAccess('instrument_steinway')) {
    preferred = 'yamaha'
  }
  
  loadSampler(preferred)
  loadNarration()
  fetchAvailableVoices()
  fetchSettings()

  // Automation support via URL params
  if (route.query.start === 'true') {
    if (route.query.delay) revealDelay.value = parseFloat(route.query.delay as string)
    if (route.query.voice === 'false') isVoiceEnabled.value = false
    if (route.query.type) autoPlayRevealType.value = route.query.type as string
    if (route.query.ratio) parentChordRatio.value = parseFloat(route.query.ratio as string)
    syncToCookie()
    
    // Select all chords if requested
    if (route.query.chords === 'all') {
      selectedChordIds.value = new Set(TEST_CHORDS.value.map(c => c.id))
    } else if (route.query.chordId) {
      selectedChordIds.value = new Set([route.query.chordId as string])
    }

    // Wait for sampler and interactions to be ready
    setTimeout(async () => {
      // For automated recording, try to resume context if suspended
      if (Tone.context.state !== 'running') {
        try {
          await Tone.start()
        } catch (e) { console.warn(e) }
      }
      startAutoPlay()
    }, 2000)
  }
})

onUnmounted(() => {
  cleanupSideEffects()
})

// === Watchers for Persistence ===
watch([selectedChordIds, autoPlayRevealType, isVoiceEnabled, isAutoPlayImmediate, revealDelay, parentChordRatio, isReviewWeighted], () => {
  syncToCookie()
}, { deep: true })

</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased" style="backface-visibility: hidden;">
    <div class="min-h-screen flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden">


    <!-- Header -->
    <AppHeader 
      showBack 
      @back="handleHeaderBack"
    />

    <main class="w-full flex-grow overflow-y-auto px-4 py-6 scrollbar-hide" style="scrollbar-gutter: stable;">
      
      <!-- SETTINGS VIEW -->
      <div v-if="view === 'settings'" class="space-y-8 pb-40">
        <div class="text-center mb-6">
            <h2 class="text-xl font-black text-gray-900">和音の聞き流し</h2>
            <p class="text-xs text-gray-400 mt-1 font-bold">色と和音の対応を反復トレーニング</p>
        </div>

        <!-- Start Button at Top -->
        <div class="px-2">
          <button 
            @click="startAutoPlay"
            :disabled="selectedChordIds.size === 0"
            class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <span>自動再生を開始する</span>
          </button>
        </div>

        <!-- Reveal Style Selection (Moved to Top) -->
        <div class="px-2">
          <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">表示スタイル</p>
            <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
              <!-- Full Screen Option -->
              <button 
                @click="autoPlayRevealType = 'full'"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200"
                :class="autoPlayRevealType === 'full' 
                  ? 'bg-white border-gray-900 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                <div class="text-2xl mb-1">📱</div>
                <span class="text-xs font-black" :class="autoPlayRevealType === 'full' ? 'text-gray-900' : 'text-gray-400'">画面全体</span>
              </button>

              <!-- Ice Cream Option -->
              <button 
                v-if="isEnabled('mode_icecream')"
                @click="checkAccess('mode_icecream') ? autoPlayRevealType = 'icecream' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'icecream' 
                  ? 'bg-white border-pink-400 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                <div v-if="!checkAccess('mode_icecream')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_icecream') }">🍦</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'icecream' ? 'text-pink-500' : 'text-gray-400', !checkAccess('mode_icecream') && 'opacity-50']">アイス</span>
              </button>
              
              <!-- Cat Option -->
              <button 
                v-if="isEnabled('mode_cat')"
                @click="checkAccess('mode_cat') ? autoPlayRevealType = 'cat' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'cat' 
                  ? 'bg-white border-amber-500 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                <div v-if="!checkAccess('mode_cat')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_cat') }">🐱</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'cat' ? 'text-amber-600' : 'text-gray-400', !checkAccess('mode_cat') && 'opacity-50']">リアルねこ</span>
              </button>

              <!-- Cute Cat Option (New) -->
              <button 
                v-if="isEnabled('mode_cute_cat')"
                @click="checkAccess('mode_cute_cat') ? autoPlayRevealType = 'cute_cat' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'cute_cat' 
                  ? 'bg-white border-pink-400 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                <div v-if="!checkAccess('mode_cute_cat')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_cute_cat') }">😻</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'cute_cat' ? 'text-pink-500' : 'text-gray-400', !checkAccess('mode_cute_cat') && 'opacity-50']">ねこ</span>
              </button>

              <!-- Video Cat Option -->
              <button 
                v-if="isEnabled('mode_video_cat')"
                @click="checkAccess('mode_video_cat') ? autoPlayRevealType = 'video_cat' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'video_cat' 
                  ? 'bg-white border-stone-800 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                 <div v-if="!checkAccess('mode_video_cat')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_video_cat') }">🎥</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'video_cat' ? 'text-stone-800' : 'text-gray-400', !checkAccess('mode_video_cat') && 'opacity-50']">動画ねこ</span>
              </button>

              <!-- Train Front Option (New) -->
              <button 
                v-if="isEnabled('mode_train_front')"
                @click="checkAccess('mode_train_front') ? autoPlayRevealType = 'train_front' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'train_front' 
                  ? 'bg-white border-blue-600 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                <div v-if="!checkAccess('mode_train_front')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_train_front') }">🚄</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'train_front' ? 'text-blue-700' : 'text-gray-400', !checkAccess('mode_train_front') && 'opacity-50']">迫る電車</span>
              </button>


              <!-- Cat Flag Option -->
              <button 
                v-if="isEnabled('mode_cat_flag')"
                @click="checkAccess('mode_cat_flag') ? autoPlayRevealType = 'cat_flag' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'cat_flag' 
                  ? 'bg-white border-red-500 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                 <div v-if="!checkAccess('mode_cat_flag')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_cat_flag') }">🚩</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'cat_flag' ? 'text-red-600' : 'text-gray-400', !checkAccess('mode_cat_flag') && 'opacity-50']">ねこ旗揚げ</span>
              </button>

              <!-- Train Option -->
              <button 
                v-if="isEnabled('mode_train')"
                @click="checkAccess('mode_train') ? autoPlayRevealType = 'train' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'train' 
                  ? 'bg-white border-green-500 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                 <div v-if="!checkAccess('mode_train')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_train') }">🚃</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'train' ? 'text-green-600' : 'text-gray-400', !checkAccess('mode_train') && 'opacity-50']">電車</span>
              </button>

              <!-- Vehicle Option -->
              <button 
                v-if="isEnabled('mode_vehicle')"
                @click="checkAccess('mode_vehicle') ? autoPlayRevealType = 'vehicle' : handleLockedClick()"
                class="flex-1 flex flex-col items-center justify-center py-4 min-w-[80px] rounded-xl border-2 transition-all duration-200 relative overflow-hidden"
                :class="autoPlayRevealType === 'vehicle' 
                  ? 'bg-white border-red-400 shadow-md transform scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-gray-100 text-gray-400'"
              >
                 <div v-if="!checkAccess('mode_vehicle')" class="absolute top-2 right-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></div>
                <div class="text-2xl mb-1" :class="{ 'opacity-50 grayscale': !checkAccess('mode_vehicle') }">🚒</div>
                <span class="text-xs font-black" :class="[autoPlayRevealType === 'vehicle' ? 'text-red-600' : 'text-gray-400', !checkAccess('mode_vehicle') && 'opacity-50']">車</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Chord Selection -->
        <section>
          <div class="flex items-center justify-between mb-4 px-1">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">出題する和音</label>
          </div>
          
          <!-- White Keys -->
          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-900 mb-3 flex items-center">
              <span class="w-1 h-4 bg-gray-900 rounded-full mr-2"></span>
              白鍵の和音
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <template v-for="(chord, index) in whiteKeyChords" :key="chord.id">
                <ChordSelectionButton 
                  :chord="chord" 
                  :selected="selectedChordIds.has(chord.id)"
                  :locked="!checkAccess(`autoplay_chord_${chord.id}`)"
                  @toggle="toggleChordSelection(chord.id)"
                  @locked-click="handleLockedClick"
                />
              </template>
            </div>
          </div>
 
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-900 flex items-center">
                <span class="w-1 h-4 bg-gray-900 rounded-full mr-2"></span>
                黒鍵の和音
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
               <ChordSelectionButton 
                 v-for="chord in blackKeyChords" 
                 :key="chord.id"
                 :chord="chord"
                 :selected="selectedChordIds.has(chord.id)"
                 :locked="!checkAccess(`autoplay_chord_${chord.id}`)"
                 @toggle="toggleChordSelection(chord.id)"
                 @locked-click="handleLockedClick"
               />
            </div>
        </section>

        <!-- Options -->
        <section class="space-y-4 pb-40 px-1">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">オプション</label>
          
          <!-- Toggles Group -->
          <div class="space-y-3">
            <!-- Immediate Reveal Toggle -->
            <div 
              @click="isAutoPlayImmediate = !isAutoPlayImmediate"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-colors active:bg-gray-100"
            >
              <div>
                <p class="text-sm font-black text-gray-900">答えをすぐに表示</p>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">音がなると同時に色を見せる</p>
              </div>
              <div 
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="isAutoPlayImmediate ? 'bg-gray-900' : 'bg-gray-200'"
              >
                <div 
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                  :class="isAutoPlayImmediate ? 'translate-x-4' : ''"
                ></div>
              </div>
            </div>

            <!-- Voice Toggle -->
            <div 
              @click="isVoiceEnabled = !isVoiceEnabled"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-colors active:bg-gray-100"
            >
              <div>
                <p class="text-sm font-black text-gray-900">色の名前を読み上げる</p>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">正解の色を音声でガイド</p>
              </div>
              <div 
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="isVoiceEnabled ? 'bg-gray-900' : 'bg-gray-200'"
              >
                <div 
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                  :class="isVoiceEnabled ? 'translate-x-4' : ''"
                ></div>
              </div>
            </div>
            
            <!-- Custom Parent Voice Toggle -->
            <div 
              v-if="isEnabled('parent_voice')"
              class="flex flex-col p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-black text-gray-900">保護者の声で読み上げる</p>
                  <p class="text-[10px] font-bold text-gray-400 mt-0.5">録音したあなたの声でガイド</p>
                </div>
                <div 
                  @click="handleToggleCustomVoice"
                  class="w-10 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer"
                  :class="customVoiceEnabled ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <div 
                    class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                    :class="customVoiceEnabled ? 'translate-x-4' : ''"
                  ></div>
                </div>
              </div>
              
              <div class="flex items-center justify-between pt-1">
                <span class="text-[10px] font-bold text-indigo-400">
                  {{ availableVoices.size }} / 14 色 録音済み
                </span>
                <NuxtLink 
                  to="/voice-settings"
                  class="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <span>声を録音・管理する</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <div class="pt-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">出現頻度の調整</label>
            <FrequencySettings 
              v-model:parentChordRatio="parentChordRatio"
              v-model:isReviewWeighted="isReviewWeighted"
              :parentChord="parentChord"
              :otherChords="otherChords"
              :otherChordsDisplay="otherChordsDisplay"
              :otherChordsWithWeights="otherChordsWithWeights"
              :selectedCount="selectedChords.length"
            />
          </div>

          <!-- Reveal Delay Slider -->
          <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm font-black text-gray-900">回答までの時間</p>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">音が鳴ってから正解を伝えるまで</p>
              </div>
              <span class="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{{ revealDelay }}s</span>
            </div>
            <input 
              type="range" 
              v-model.number="revealDelay" 
              min="1.0" 
              max="5.0" 
              step="0.5"
              class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            >
            <div class="flex justify-between text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
              <span>1.0s (速い)</span>
              <span>5.0s (ゆっくり)</span>
            </div>
          </div>



        </section>
      </div>

      <!-- PLAYING VIEW -->
      <div v-if="view === 'playing'" class="z-40 h-full w-full">

        <!-- Auto-Play Reveal: Full Screen Style -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'full' && isAutoPlayRevealed" 
            class="fixed inset-0 z-40 flex items-center justify-center transition-all duration-500"
            :style="{ backgroundColor: currentQuestion!.color }"
          >
          </div>
        </transition>

        <!-- Auto-Play Reveal: Ice Cream Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'icecream'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <IceCreamGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : null"
               :isQuestionChanging="false"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button (custom for Ice Cream mode since it has its own UI) -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- Auto Play Reveal: Cat Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'cat'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <CatGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : null"
               :isQuestionChanging="false"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- Auto Play Reveal: Cute Cat Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'cute_cat'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <CuteCatGameMode 
               :currentQuestion="currentQuestion"
               :isAutoPlay="true"
               @play="playCurrentQuestion"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- Auto Play Reveal: Video Cat Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'video_cat'" 
            class="fixed inset-0 z-40 bg-black"
          >
             <VideoCatGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : undefined"
               :isQuestionChanging="false"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-black/50 backdrop-blur-md text-white/80 hover:text-red-400 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/10"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- Auto Play Reveal: Cat Flag Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'cat_flag'" 
            class="fixed inset-0 z-40 bg-stone-100"
          >
             <CatFlagGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : undefined"
               :isQuestionChanging="false"
               :isAutoPlay="true"
               @ready="playCurrentQuestion"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-stone-900/50 backdrop-blur-md text-white font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/10"
                >
                  <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- AutoPlay Reveal: Train Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'train'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <TrainGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : null"
               :isQuestionChanging="false"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button (custom for Train mode) -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- AutoPlay Reveal: Train Front Mode (New) -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'train_front'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <TrainFrontGameMode 
               :key="currentQuestionIndex"
               :currentQuestion="currentQuestion"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click.stop="stopAutoPlay"
                  class="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-800 px-6 py-2 rounded-full border border-slate-200/50 flex items-center shadow-lg transition-transform active:scale-95 text-sm font-bold"
                >
                  <span class="mr-2">●</span> 停止する
                </button>
             </div>
          </div>
        </transition>

        <!-- AutoPlay Reveal: Vehicle Mode -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'vehicle'" 
            class="fixed inset-0 z-40 bg-white"
          >
             <VehicleGameMode 
               :currentQuestion="currentQuestion"
               :choices="selectedChords"
               :correctHistory="iceCreamHistory"
               :userAnswer="isAutoPlayRevealed ? currentQuestion : null"
               :isQuestionChanging="false"
               :isAutoPlay="true"
             />
             
             <!-- Overlay Stop Button -->
             <div class="absolute bottom-12 left-0 right-0 flex justify-center z-[60] pointer-events-none">
                <button 
                  @click="stopAutoPlay"
                  class="pointer-events-auto px-6 py-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
                  <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
                </button>
             </div>
          </div>
        </transition>

        <!-- Stop Button (Standard) -->
        <div v-if="autoPlayRevealType === 'full'" class="fixed bottom-10 left-0 right-0 flex justify-center z-[60]">
          <button 
            @click="stopAutoPlay"
            class="px-6 py-2.5 bg-black/5 hover:bg-black/10 backdrop-blur-sm text-gray-400 hover:text-gray-600 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 border border-black/5"
            :class="{ 'text-white/70 hover:text-white bg-white/10 border-white/10': isAutoPlayRevealed && autoPlayRevealType === 'full' && !isLightColor(currentQuestion!.color) }"
          >
            <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
            <span class="text-[10px] tracking-[0.2em] font-black mr-1">停止する</span>
          </button>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
</style>
