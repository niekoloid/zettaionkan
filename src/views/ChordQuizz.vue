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
const QUIZZ_CHORDS = [
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

const selectedChordIds = ref(new Set([QUIZZ_CHORDS[0].id, QUIZZ_CHORDS[1].id]))
const questions = ref([])
const quizzHistory = ref([])
const shuffledIds = ref([])

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
const whiteKeyChords = computed(() => QUIZZ_CHORDS.filter(c => c.sortOrder <= 9))
const blackKeyChords = computed(() => QUIZZ_CHORDS.filter(c => c.sortOrder > 9))
const currentLayoutChords = computed(() => {
  if (view.value === 'quiz') {
    return shuffledIds.value.map(id => QUIZZ_CHORDS.find(c => c.id === id))
  }
  return QUIZZ_CHORDS.filter(c => selectedChordIds.value.has(c.id))
})

// Dynamic Grid Logic
const gridCols = computed(() => {
  const count = currentLayoutChords.value.length
  if (count <= 3) return 1
  if (count <= 8) return 2
  return 3
})

const gridRows = computed(() => {
  return Math.ceil(currentLayoutChords.value.length / gridCols.value)
})

const shuffleChords = () => {
  const ids = Array.from(selectedChordIds.value)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]]
  }
  shuffledIds.value = ids
}

// === Helper Functions ===
const cleanupSideEffects = () => {
  // No specific timeouts or intervals to clear for now unrelated to auto-play
}

const getRandomChord = () => {
  const availableChords = QUIZZ_CHORDS.filter(c => selectedChordIds.value.has(c.id))
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
  const targetChord = QUIZZ_CHORDS.find(c => c.id === id)
  if (!targetChord) return

  const newSet = new Set()
  QUIZZ_CHORDS.forEach(c => {
    if (c.sortOrder <= targetChord.sortOrder) newSet.add(c.id)
  })
  selectedChordIds.value = newSet
}



const startQuizz = async () => {
  const firstChord = getRandomChord()
  if (!firstChord) return

  // Start Tone.js within user gesture
  if (Tone.context.state !== 'running') await Tone.start()

  questions.value = [firstChord]
  currentQuestionIndex.value = 0
  score.value = 0
  quizzHistory.value = []
  shuffleChords() // Initial shuffle
  view.value = 'quiz'
  
  setTimeout(playCurrentQuestion, DELAYS.PLAYBACK_START)
}

const moveNext = () => {
  questions.value.push(getRandomChord())
  currentQuestionIndex.value++
  resultMessage.value = null
  shuffleChords() // Shuffle for each question
  
  setTimeout(playCurrentQuestion, DELAYS.TRANSITION)
}

const submitAnswer = (chord) => {
  if (resultMessage.value) return 
  cleanupSideEffects()

  const isCorrect = chord.id === currentQuestion.value.id
  if (isCorrect) score.value++
  
  quizzHistory.value.push({
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

  quizzHistory.value.push({
    question: { ...currentQuestion.value },
    answer: null,
    isCorrect: false,
    isSkipped: true
  })

  moveNext()
}

const finishQuizz = async () => {
  cleanupSideEffects()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && quizzHistory.value.length > 0) {
    isSaving.value = true
    try {
      await supabase.from('training_sessions').insert({
        user_id: user.id,
        score: score.value,
        total_questions: quizzHistory.value.length,
        details: quizzHistory.value,
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

const resetQuizz = () => {
  cleanupSideEffects()
  view.value = 'settings'
  resultMessage.value = null
}

const handleHeaderBack = (e) => {
  if (view.value !== 'settings') {
    e.preventDefault()
    resetQuizz()
  }
}

// Intercept browser back button
onBeforeRouteLeave((to, from) => {
  if (view.value !== 'settings') {
    resetQuizz()
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


    <!-- Header -->
    <AppHeader 
      showBack 
      @back="handleHeaderBack"
    />

    <main 
      class="w-full flex-grow flex flex-col scrollbar-hide" 
      :class="view === 'quiz' ? 'p-0 overflow-hidden' : 'px-4 py-6 overflow-y-auto'"
      style="scrollbar-gutter: stable;"
    >
      
      <!-- SETTINGS VIEW -->
      <div v-if="view === 'settings'" class="space-y-8 pb-40">
        <div class="text-center mb-2">
            <h2 class="text-xl font-black text-gray-900">和音クイズ</h2>
            <p class="text-xs text-gray-400 mt-1 font-bold">覚えた色をテストしてみましょう</p>
        </div>

        <!-- Start Button at Top -->
        <div class="px-2">
          <button 
            @click="startQuizz"
            :disabled="selectedChordIds.size === 0"
            class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <span>テストを開始する</span>
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


      </div>

      <!-- QUIZ VIEW -->
      <div v-if="view === 'quiz'" class="flex-grow w-full flex flex-col bg-white relative">
        <!-- Minimal Top Info -->
        <div class="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
          <div class="flex items-center space-x-2">
            <!-- Premium Question Indicator -->
            <div class="flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg overflow-hidden ring-1 ring-black/5 h-8">
              <div class="px-3 h-full flex items-center bg-white/10 border-r border-white/5">
                <span class="text-[8px] text-gray-300 font-black uppercase tracking-widest leading-none">Question</span>
              </div>
              <div class="px-4 h-full flex items-center min-w-[3rem] justify-center">
                <span class="text-[11px] text-white font-black leading-none">{{ currentQuestionCount }}</span>
              </div>
            </div>
          </div>

          <button 
            @click="finishQuizz"
            class="pointer-events-auto bg-black/40 backdrop-blur-md text-[10px] text-white font-black rounded-full px-4 h-8 hover:bg-black/50 transition-colors border border-white/10 shadow-lg drop-shadow-sm flex items-center"
          >
            テストを終了
          </button>
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

        <!-- Answer Options: Full Screen Grid -->
        <div 
          class="flex-grow grid gap-0.5 w-full h-full"
          :style="{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
          }"
        >
            <template v-for="chord in currentLayoutChords" :key="chord.id">
              <button
                @click="submitAnswer(chord)"
                :disabled="!!resultMessage"
                class="relative w-full h-full transition-all duration-150 active:scale-95 flex items-center justify-center overflow-hidden"
                :class="[
                  !!resultMessage 
                    ? (chord.id === currentQuestion.id 
                        ? 'z-10 ring-inset ring-8 ring-white/50' 
                        : 'opacity-10')
                    : 'hover:brightness-105 active:brightness-90'
                ]"
                :style="{ backgroundColor: chord.color }"
              >

              </button>
            </template>
        </div>

        <!-- Bottom Controls Overlay -->
        <div class="absolute bottom-10 left-0 right-0 z-50 flex justify-center items-center space-x-4 pointer-events-none">
          <button 
            v-if="!resultMessage"
            @click="playCurrentQuestion"
            class="pointer-events-auto bg-black/40 backdrop-blur-md text-[10px] text-white font-black rounded-full px-6 py-2.5 hover:bg-black/50 transition-colors border border-white/20 shadow-lg drop-shadow-sm flex items-center space-x-2 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            <span>再再生</span>
          </button>

          <button 
            v-if="!resultMessage"
            @click="skipQuestion"
            class="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full text-white font-black hover:bg-black/50 transition-all flex items-center space-x-2 active:scale-95 border border-white/10 shadow-lg drop-shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span class="text-[10px] uppercase tracking-widest">スキップ</span>
          </button>
        </div>
      </div>

      <!-- RESULT VIEW -->
      <div v-if="view === 'result'" class="h-full flex flex-col items-center">
        <div class="mb-8 text-center pt-8">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quiz Finished</p>
          <div class="text-6xl font-black text-gray-900 mb-2">
            <span class="text-blue-500">{{ score }}</span>
            <span class="text-gray-300 text-4xl">/{{ quizzHistory.length }}</span>
          </div>
          <p class="text-lg font-bold text-gray-600 mb-6">
            {{ score === quizzHistory.length ? 'Perfect! 🎉' : score >= quizzHistory.length * 0.8 ? 'Great Job! 👍' : 'Keep Practicing! 💪' }}
          </p>
        </div>

        <!-- Result History List -->
        <div class="w-full bg-gray-50 rounded-3xl border border-gray-100 mb-10 overflow-hidden flex flex-col max-h-[400px]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">問題ごとの結果</span>
            <span class="text-[10px] font-bold text-gray-900">{{ score }} / {{ quizzHistory.length }} 正解</span>
          </div>
          <div class="flex-grow overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
            <div 
              v-for="(history, idx) in quizzHistory" 
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
            @click="startQuizz"
            class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
          >
            もう一度挑戦する
          </button>
          <button 
            @click="resetQuizz"
            class="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            設定に戻る
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
