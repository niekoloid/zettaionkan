<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave, useRoute } from 'vue-router'
import * as Tone from 'tone'
import { ChordDefinitions } from '../constants/chords'
import { useAudio } from '../composables/useAudio'
import { useAuth } from '../composables/useAuth'
import { useAudioSettings } from '../composables/useAudioSettings'

import AppHeader from '../components/AppHeader.vue'
import ChordSelectionButton from '../components/ChordSelectionButton.vue'

const router = useRouter()
const route = useRoute()

// === Constants ===
const TEST_CHORDS = [
  { ...ChordDefinitions.DOMISO, label: '1', displayColor: '赤', sortOrder: 1 },
  { ...ChordDefinitions.DOFARA, label: '2', displayColor: '黄色', sortOrder: 2 },
  { ...ChordDefinitions.SHIRESO, label: '3', displayColor: '青', sortOrder: 3 },
  { ...ChordDefinitions.RADOFA, label: '4', displayColor: '黒', sortOrder: 4 },
  { ...ChordDefinitions.RESOSHI, label: '5', displayColor: '緑', sortOrder: 5 },
  { ...ChordDefinitions.MISODO, label: '6', displayColor: 'オレンジ', sortOrder: 6 },
  { ...ChordDefinitions.FARADO, label: '7', displayColor: '紫', sortOrder: 7 },
  { ...ChordDefinitions.SOSHIRE, label: '8', displayColor: 'ピンク', sortOrder: 8 },
  { ...ChordDefinitions.SODOMI, label: '9', displayColor: '茶色', sortOrder: 9 },
  { ...ChordDefinitions.LA_CIS_MI, label: '10', displayColor: '黄緑', sortOrder: 10 },
  { ...ChordDefinitions.RE_FIS_LA, label: '11', displayColor: '肌色', sortOrder: 11 },
  { ...ChordDefinitions.MI_GIS_SI, label: '12', displayColor: '薄紫', sortOrder: 12 },
  { ...ChordDefinitions.BE_RE_FA, label: '13', displayColor: 'グレー', sortOrder: 13 },
  { ...ChordDefinitions.ES_SO_BE, label: '14', displayColor: '水色', sortOrder: 14 },
]

const DELAYS = {
  REVEAL: 3000,
  NEXT_QUESTION: 2000,
  PLAYBACK_START: 500,
}

// === Reactive State ===
const view = ref('settings')
const currentQuestionIndex = ref(0)
const selectedChordIds = ref(new Set([TEST_CHORDS[0].id, TEST_CHORDS[1].id]))
const questions = ref([])

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler,
  playNarration
} = useAudio()

const autoPlayTimeout = ref(null)
const isAutoPlayRevealed = ref(false)
const isAutoPlayImmediate = ref(true)
const isVoiceEnabled = ref(true)
const revealDelay = ref(2.5) // seconds before revealing/speaking
const autoPlayRevealType = ref('full') // 'full' | 'grid'
const isRecordingMode = ref(false)
const isDev = import.meta.env.DEV

// === Computed ===
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const whiteKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder <= 9))
const blackKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder > 9))

// === Helper Functions ===
const cleanupSideEffects = () => {
  if (autoPlayTimeout.value) clearTimeout(autoPlayTimeout.value)
}

const getRandomChord = () => {
  const availableChords = TEST_CHORDS.filter(c => selectedChordIds.value.has(c.id))
  return availableChords[Math.floor(Math.random() * availableChords.length)]
}

const speakColor = (text) => {
  playNarration(text)
}

const isLightColor = (hex) => {
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
  const s = samplers[selectedInstrument.value]
  if (!s || !isSamplerLoaded.value) return
  if (Tone.context.state !== 'running') await Tone.start()
  
  const chord = currentQuestion.value
  
  // Reset reveal state depending on mode
  if (!isAutoPlayImmediate.value) {
    isAutoPlayRevealed.value = false
  } else {
    isAutoPlayRevealed.value = true
  }
  
  s.triggerAttackRelease(chord.notes, 2)
  
  const delayMs = revealDelay.value * 1000

  if (isAutoPlayImmediate.value) {
    autoPlayTimeout.value = setTimeout(() => {
      if (isVoiceEnabled.value) speakColor(chord.displayColor)
      autoPlayTimeout.value = setTimeout(nextQuestion, DELAYS.NEXT_QUESTION)
    }, delayMs)
  } else {
    autoPlayTimeout.value = setTimeout(() => {
      isAutoPlayRevealed.value = true
      if (isVoiceEnabled.value) speakColor(chord.displayColor)
      autoPlayTimeout.value = setTimeout(nextQuestion, DELAYS.NEXT_QUESTION)
    }, delayMs)
  }
}

const nextQuestion = () => {
  if (view.value !== 'playing') return
  
  questions.value.push(getRandomChord())
  currentQuestionIndex.value++
  
  // In immediate mode, we might want to keep showing previous until next sound? 
  // But playCurrentQuestion handles the reset.
  playCurrentQuestion()
}

const toggleChordSelection = (id) => {
  const targetChord = TEST_CHORDS.find(c => c.id === id)
  if (!targetChord) return

  const newSet = new Set()
  TEST_CHORDS.forEach(c => {
    if (c.sortOrder <= targetChord.sortOrder) newSet.add(c.id)
  })
  selectedChordIds.value = newSet
}



const startAutoPlay = async () => {
  const firstChord = getRandomChord()
  if (!firstChord) return

  // Start Tone.js within user gesture
  if (Tone.context.state !== 'running') await Tone.start()

  questions.value = [firstChord]
  currentQuestionIndex.value = 0
  view.value = 'playing'
  
  setTimeout(playCurrentQuestion, DELAYS.PLAYBACK_START)
}

const stopAutoPlay = () => {
  cleanupSideEffects()
  view.value = 'settings'
  isAutoPlayRevealed.value = false
}

const handleHeaderBack = (e) => {
  if (view.value !== 'settings') {
    e.preventDefault()
    stopAutoPlay()
  }
}

// Intercept browser back button
onBeforeRouteLeave((to, from) => {
  if (view.value !== 'settings') {
    stopAutoPlay()
    return false
  }
})

// === Lifecycle ===
const { user, userTier, authReady } = useAuth()

onMounted(async () => {
  await authReady
  const { getPreferredInstrument } = useAudioSettings()
  let preferred = getPreferredInstrument(userTier.value)
  
  if (preferred === 'steinway' && userTier.value !== 'premium') {
    preferred = 'yamaha'
  }
  
  loadSampler(preferred)

  window.addEventListener('keydown', handleKeyDown)

  // Automation support via URL params
  if (route.query.start === 'true') {
    if (route.query.recording === 'true') isRecordingMode.value = true
    if (route.query.delay) revealDelay.value = parseFloat(route.query.delay)
    if (route.query.voice === 'false') isVoiceEnabled.value = false
    if (route.query.type) autoPlayRevealType.value = route.query.type
    
    // Select all chords if requested
    if (route.query.chords === 'all') {
      selectedChordIds.value = new Set(TEST_CHORDS.map(c => c.id))
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
  window.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isRecordingMode.value) {
    isRecordingMode.value = false
    stopAutoPlay()
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased" style="backface-visibility: hidden;">
    <div class="min-h-screen flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden">


    <!-- Header -->
    <AppHeader 
      v-if="view !== 'playing'" 
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
                  @toggle="toggleChordSelection(chord.id)"
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
                 @toggle="toggleChordSelection(chord.id)"
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

          <!-- Reveal Style Selection -->
          <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">表示スタイル</p>
            <div class="flex bg-gray-200 p-1 rounded-xl border border-gray-200">
              <button 
                @click="autoPlayRevealType = 'full'"
                class="flex-1 py-2 rounded-lg text-[10px] font-black transition-all text-center"
                :class="autoPlayRevealType === 'full' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-500'"
              >
                画面全体
              </button>
              <button 
                @click="autoPlayRevealType = 'grid'"
                class="flex-1 py-2 rounded-lg text-[10px] font-black transition-all text-center"
                :class="autoPlayRevealType === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-500'"
              >
                タイル
              </button>
            </div>
          </div>

          <!-- Recording Mode (Dev Only) -->
          <div v-if="isDev" class="p-5 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
            <div @click="isRecordingMode = !isRecordingMode" class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-xs font-black text-rose-900">録画専用モード (ローカル限定)</p>
                <p class="text-[9px] font-bold text-rose-400 mt-0.5">UIをすべて非表示にします。解除はESCキー。</p>
              </div>
              <div 
                class="w-10 h-6 rounded-full transition-colors relative shrink-0"
                :class="isRecordingMode ? 'bg-rose-500' : 'bg-rose-200'"
              >
                <div 
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                  :class="isRecordingMode ? 'translate-x-4' : ''"
                ></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- PLAYING VIEW -->
      <div v-if="view === 'playing'" class="z-40 h-full w-full">
        <!-- Auto-Play Reveal: Grid Style -->
        <div 
          v-if="autoPlayRevealType === 'grid'" 
          class="fixed inset-0 z-40 bg-white flex flex-col pt-32 pb-40 overflow-hidden"
        >
          <div v-if="!isRecordingMode" class="px-10 mb-4 flex justify-between items-end">
            <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">和音の記録</span>
            <span class="text-[10px] font-bold text-gray-200">{{ currentQuestionIndex + (isAutoPlayRevealed ? 1 : 0) }} 枚</span>
          </div>
          <div class="flex-grow overflow-y-auto px-10 pb-10">
            <div class="flex flex-wrap gap-2 max-w-full justify-start w-full content-start">
              <div 
                v-for="(q, idx) in questions.slice(0, currentQuestionIndex + (isAutoPlayRevealed ? 1 : 0))" 
                :key="idx"
                class="w-12 h-12 rounded-lg shadow-sm transition-all duration-300"
                :class="{ 
                  'animate-bounce-in border-2 border-white ring-2 ring-gray-100': idx === (currentQuestionIndex) && isAutoPlayRevealed,
                  'opacity-40 scale-90': idx < currentQuestionIndex
                }"
                :style="{ backgroundColor: q.color }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Auto-Play Reveal: Full Screen Style -->
        <transition name="fade">
          <div 
            v-if="autoPlayRevealType === 'full' && isAutoPlayRevealed" 
            class="fixed inset-0 z-40 flex items-center justify-center transition-all duration-500"
            :style="{ backgroundColor: currentQuestion.color }"
          >
          </div>
        </transition>

        <!-- Stop Button -->
        <div v-if="!isRecordingMode" class="fixed bottom-10 left-0 right-0 flex justify-center z-[60]">
          <button 
            @click="stopAutoPlay"
            class="px-6 py-2.5 bg-black/5 hover:bg-black/10 backdrop-blur-sm text-gray-400 hover:text-gray-600 font-bold rounded-full transition-all active:scale-95 flex items-center space-x-2 border border-black/5"
            :class="{ 'text-white/70 hover:text-white bg-white/10 border-white/10': isAutoPlayRevealed && autoPlayRevealType === 'full' && !isLightColor(currentQuestion.color) }"
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
