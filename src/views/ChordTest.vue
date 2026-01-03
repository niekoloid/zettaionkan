<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import * as Tone from 'tone'
import { ChordDefinitions } from '../constants/chords'
import { supabase } from '../lib/supabase'
import { useAudio } from '../composables/useAudio'
import { useAudioSettings } from '../composables/useAudioSettings'
import { useAuth } from '../composables/useAuth'

import AppHeader from '../components/AppHeader.vue'
import ChordSelectionButton from '../components/ChordSelectionButton.vue'

const router = useRouter()

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
  { ...ChordDefinitions.MI_GIS_SI, label: '12', displayColor: '藤色', sortOrder: 12 },
  { ...ChordDefinitions.BE_RE_FA, label: '13', displayColor: '灰色', sortOrder: 13 },
  { ...ChordDefinitions.ES_SO_BE, label: '14', displayColor: '水色', sortOrder: 14 },
]

const DELAYS = {
  PLAYBACK_START: 500,
  TRANSITION: 300,
  FEEDBACK: 1000
}

// === Reactive State ===
const view = ref('settings')
const score = ref(0)
const isSaving = ref(false)
const currentQuestionIndex = ref(0)
const resultMessage = ref(null)

const selectedChordIds = ref(new Set([TEST_CHORDS[0].id, TEST_CHORDS[1].id]))
const questions = ref([])
const testHistory = ref([])

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler 
} = useAudio()

// === Computed ===
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const currentQuestionCount = computed(() => currentQuestionIndex.value + 1)
const isAllSelected = computed(() => selectedChordIds.value.size > 0)
const whiteKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder <= 9))
const blackKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder > 9))
const currentLayoutChords = computed(() => TEST_CHORDS.filter(c => selectedChordIds.value.has(c.id)))

// === Helper Functions ===
const cleanupSideEffects = () => {
  // No specific timeouts or intervals to clear for now unrelated to auto-play
}

const getRandomChord = () => {
  const availableChords = TEST_CHORDS.filter(c => selectedChordIds.value.has(c.id))
  return availableChords[Math.floor(Math.random() * availableChords.length)]
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
  s.triggerAttackRelease(chord.notes, 2)
}

const toggleChordSelection = (id) => {
  const targetChord = TEST_CHORDS.find(c => c.id === id)
  if (!targetChord) return

  selectedChordIds.value.clear()
  TEST_CHORDS.forEach(c => {
    if (c.sortOrder <= targetChord.sortOrder) selectedChordIds.value.add(c.id)
  })
}



const startTest = () => {
  const firstChord = getRandomChord()
  if (!firstChord) return

  questions.value = [firstChord]
  currentQuestionIndex.value = 0
  score.value = 0
  testHistory.value = []
  view.value = 'quiz'
  
  setTimeout(playCurrentQuestion, DELAYS.PLAYBACK_START)
}

const moveNext = () => {
  questions.value.push(getRandomChord())
  currentQuestionIndex.value++
  resultMessage.value = null
  
  setTimeout(playCurrentQuestion, DELAYS.TRANSITION)
}

const submitAnswer = (chord) => {
  if (resultMessage.value) return 
  cleanupSideEffects()

  const isCorrect = chord.id === currentQuestion.value.id
  if (isCorrect) score.value++
  
  testHistory.value.push({
    question: { ...currentQuestion.value },
    answer: { ...chord },
    isCorrect,
    isSkipped: false
  })

  // Preload feedback images is optional as browser likely caches them
  resultMessage.value = isCorrect ? 'correct' : 'incorrect'
  setTimeout(moveNext, DELAYS.FEEDBACK)
}

const skipQuestion = () => {
  if (resultMessage.value) return
  cleanupSideEffects()

  testHistory.value.push({
    question: { ...currentQuestion.value },
    answer: null,
    isCorrect: false,
    isSkipped: true
  })

  moveNext()
}

const finishTest = async () => {
  cleanupSideEffects()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && testHistory.value.length > 0) {
    isSaving.value = true
    try {
      await supabase.from('training_sessions').insert({
        user_id: user.id,
        score: score.value,
        total_questions: testHistory.value.length,
        details: testHistory.value,
        settings: {
           selected_chords: Array.from(selectedChordIds.value),
           instrument: selectedInstrument.value
        }
      })
    } catch (e) {
      console.error('Failed to save session:', e)
    } finally {
      isSaving.value = false
    }
  }
  view.value = 'result'
}

const resetTest = () => {
  cleanupSideEffects()
  view.value = 'settings'
  resultMessage.value = null
}

const handleHeaderBack = (e) => {
  if (view.value !== 'settings') {
    e.preventDefault()
    resetTest()
  }
}

// Intercept browser back button
onBeforeRouteLeave((to, from) => {
  if (view.value !== 'settings') {
    resetTest()
    return false // Cancel navigation away from this page
  }
})

// === Lifecycle ===
const { user, userTier, authReady } = useAuth()

onMounted(async () => {
  await authReady
  const { getPreferredInstrument } = useAudioSettings()
  const preferred = getPreferredInstrument()
  
  if (userTier.value === 'premium' && preferred === 'steinway') {
    loadSampler('steinway')
  } else {
    loadSampler('yamaha')
  }
  
  // Preload feedback images
  const img1 = new Image()
  img1.src = '/quiz_correct.png'
  const img2 = new Image()
  img2.src = '/quiz_incorrect.png'
})

onUnmounted(() => {
  cleanupSideEffects()
})
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased" style="backface-visibility: hidden;">
    <div class="min-h-screen flex flex-col items-center max-w-3xl mx-auto relative overflow-hidden">
      <!-- Loading Overlay -->
      <transition name="fade">
        <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <div class="w-64">
            <div class="flex justify-between mb-2">
              <span class="text-xs font-bold text-gray-700">音源を読み込み中...</span>
              <span class="text-xs font-bold text-gray-900">{{ loadingProgress }}%</span>
            </div>
            <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                class="bg-gray-900 h-full transition-all duration-300"
                :style="{ width: loadingProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </transition>

    <!-- Header -->
    <AppHeader 
      showBack 
      @back="handleHeaderBack"
    />

    <main class="w-full flex-grow overflow-y-auto px-4 py-6 scrollbar-hide" style="scrollbar-gutter: stable;">
      
      <!-- SETTINGS VIEW -->
      <div v-if="view === 'settings'" class="space-y-8 pb-40">
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
      </div>

      <!-- QUIZ VIEW -->
      <div v-if="view === 'quiz'" class="h-full flex flex-col items-center">
        <!-- Progress & Replay -->
        <div class="w-full mb-8">
          <div class="flex justify-between items-end text-xs font-bold text-gray-400 mb-2">
            <span>Question {{ currentQuestionCount }}</span>
            <button 
              @click="finishTest"
              class="text-[10px] text-red-400 hover:text-red-500 font-black border border-red-100 rounded-lg px-3 py-1 bg-red-50/30"
            >
              トレーニングを終了する
            </button>
          </div>
          <div class="flex justify-end mt-2">
            <button 
              @click="playCurrentQuestion" 
              class="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>もう一度聞く</span>
            </button>
          </div>
        </div>

        <!-- Feedback Overlay -->
        <div v-if="resultMessage" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div class="transform transition-all duration-300 scale-150 drop-shadow-2xl">
            <img 
              :src="resultMessage === 'correct' ? '/quiz_correct.png' : '/quiz_incorrect.png'" 
              alt="Result Feedback" 
              class="w-96 max-w-full h-auto object-contain"
              :class="resultMessage === 'incorrect' ? 'animate-shake' : 'animate-bounce-in'"
            />
          </div>
        </div>

        <!-- Answer Options -->
        <div class="w-full flex-grow grid grid-cols-2 gap-3 mb-4 auto-rows-[minmax(80px,1fr)]">
            <template v-for="chord in currentLayoutChords" :key="chord.id">
              <button
                @click="submitAnswer(chord)"
                :disabled="!!resultMessage"
                class="relative w-full h-full rounded-2xl shadow-sm transition-all duration-200 active:scale-95 border-2"
                :class="[
                  !!resultMessage 
                    ? (chord.id === currentQuestion.id 
                        ? 'border-green-500 ring-4 ring-green-200 z-10 scale-105' 
                        : 'opacity-20 border-transparent')
                    : 'border-transparent hover:shadow-md hover:scale-[1.02]'
                ]"
                :style="{ backgroundColor: chord.color }"
              >
              </button>
            </template>
        </div>

        <!-- Skip Button -->
        <button 
          @click="skipQuestion"
          :disabled="!!resultMessage"
          class="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors disabled:opacity-0"
        >
          この問題をスキップ
        </button>
      </div>

      <!-- RESULT VIEW -->
      <div v-if="view === 'result'" class="h-full flex flex-col items-center">
        <div class="mb-8 text-center pt-8">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quiz Finished</p>
          <div class="text-6xl font-black text-gray-900 mb-2">
            <span class="text-blue-500">{{ score }}</span>
            <span class="text-gray-300 text-4xl">/{{ testHistory.length }}</span>
          </div>
          <p class="text-lg font-bold text-gray-600 mb-6">
            {{ score === testHistory.length ? 'Perfect! 🎉' : score >= testHistory.length * 0.8 ? 'Great Job! 👍' : 'Keep Practicing! 💪' }}
          </p>
        </div>

        <!-- Result History List -->
        <div class="w-full bg-gray-50 rounded-3xl border border-gray-100 mb-10 overflow-hidden flex flex-col max-h-[400px]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">問題ごとの結果</span>
            <span class="text-[10px] font-bold text-gray-900">{{ score }} / {{ testHistory.length }} 正解</span>
          </div>
          <div class="flex-grow overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
            <div 
              v-for="(history, idx) in testHistory" 
              :key="idx"
              class="flex items-center space-x-4 p-3 rounded-2xl bg-white border border-gray-100"
            >
              <div class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shrink-0">
                {{ idx + 1 }}
              </div>
              
              <!-- Correct Chord Color -->
              <div class="flex-grow flex items-center space-x-3 min-w-0">
                <div class="flex flex-col items-center space-y-1">
                  <div class="w-10 h-10 rounded-lg shadow-sm shrink-0" :style="{ backgroundColor: history.question.color }"></div>
                  <span class="text-[8px] font-bold text-gray-400 leading-none">正解</span>
                </div>
                
                <div class="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div class="flex flex-col items-center space-y-1">
                  <div v-if="history.answer" class="w-10 h-10 rounded-lg shadow-sm shrink-0" :style="{ backgroundColor: history.answer.color }"></div>
                  <div v-else class="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
                    <span class="text-[8px] text-gray-300 font-bold">SKIP</span>
                  </div>
                  <span class="text-[8px] font-bold text-gray-400 leading-none">回答</span>
                </div>
              </div>

              <!-- Status Mark -->
              <div class="shrink-0 w-10 flex justify-center">
                <div v-if="history.isCorrect" class="text-green-500 font-black text-xl">
                  ○
                </div>
                <div v-else-if="history.isSkipped" class="text-gray-300 font-bold text-sm">
                  −
                </div>
                <div v-else class="text-red-500 font-black text-xl">
                  ×
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full space-y-4 px-6 mb-20">
          <button 
            @click="startTest"
            class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
          >
            もう一度挑戦する
          </button>
          <button 
            @click="resetTest"
            class="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            設定に戻る
          </button>
        </div>
      </div>

    </main>

    <!-- Footer Action (Settings View Only) -->
    <div v-if="view === 'settings'" class="w-full p-6 bg-gradient-to-t from-white via-white to-white/0 shrink-0 z-20 box-border absolute bottom-0 pb-10">
      <button 
        @click="startTest"
        :disabled="selectedChordIds.size === 0 || !isSamplerLoaded"
        class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700"
      >
        <span v-if="!isSamplerLoaded">読み込み中...</span>
        <span v-else>テストを開始する</span>
      </button>
    </div>

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

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
