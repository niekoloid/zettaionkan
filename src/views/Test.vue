<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as Tone from 'tone'
import { ChordDefinitions } from '../constants/chords'

const router = useRouter()

// === Constants & Data ===
// ユーザー指定の順序とラベルでリスト化
const TEST_CHORDS = [
  { ...ChordDefinitions.DOMISO, label: '①', displayColor: '赤', sortOrder: 1 },
  { ...ChordDefinitions.DOFARA, label: '②', displayColor: '黄色', sortOrder: 2 },
  { ...ChordDefinitions.SHIRESO, label: '③', displayColor: '青', sortOrder: 3 },
  { ...ChordDefinitions.RADOFA, label: '④', displayColor: '黒', sortOrder: 4 },
  { ...ChordDefinitions.RESOSHI, label: '⑤', displayColor: '緑', sortOrder: 5 },
  { ...ChordDefinitions.MISODO, label: '⑥', displayColor: 'オレンジ', sortOrder: 6 },
  { ...ChordDefinitions.FARADO, label: '⑦', displayColor: '紫', sortOrder: 7 },
  { ...ChordDefinitions.SOSHIRE, label: '⑧', displayColor: 'ピンク', sortOrder: 8 },
  { ...ChordDefinitions.SODOMI, label: '⑨', displayColor: '茶色', sortOrder: 9 },
  { ...ChordDefinitions.LA_CIS_MI, label: '❶', displayColor: '黄緑', sortOrder: 10 },
  { ...ChordDefinitions.RE_FIS_LA, label: '❷', displayColor: '薄橙', sortOrder: 11 }, // colorNameは肌色だが表示は薄橙
  { ...ChordDefinitions.MI_GIS_SI, label: '❸', displayColor: '藤色', sortOrder: 12 },
  { ...ChordDefinitions.BE_RE_FA, label: '❹', displayColor: '灰色', sortOrder: 13 },
  { ...ChordDefinitions.ES_SO_BE, label: '❺', displayColor: '水色', sortOrder: 14 },
]

// Comprehensive mapping for 88 keys
const ALL_NOTES = [
  "A0", "Bb0", "B0",
  "C1", "Db1", "D1", "Eb1", "E1", "F1", "Gb1", "G1", "Ab1", "A1", "Bb1", "B1",
  "C2", "Db2", "D2", "Eb2", "E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2",
  "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
  "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
  "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5",
  "C6", "Db6", "D6", "Eb6", "E6", "F6", "Gb6", "G6", "Ab6", "A6", "Bb6", "B6",
  "C7", "Db7", "D7", "Eb7", "E7", "F7", "Gb7", "G7", "Ab7", "A7", "Bb7", "B7",
  "C8"
]

const isSubsetNote = (note) => {
  const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)(\d)/)
  if (!match) return false
  const name = match[1].replace('♯', '#').replace('♭', 'b')
  const octave = parseInt(match[2])
  const normalizedName = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' }[name] || name
  if (normalizedName === 'A') return octave >= 1 && octave <= 7
  if (normalizedName === 'C') return octave >= 1 && octave <= 8
  if (normalizedName === 'Eb') return octave >= 1 && octave <= 7
  if (normalizedName === 'Gb') return octave >= 1 && octave <= 6
  return false
}

const STEINWAY_MAP = {}
ALL_NOTES.forEach(note => {
  if (isSubsetNote(note)) {
    STEINWAY_MAP[note] = `${note}.wav`
  }
})

Object.keys(STEINWAY_MAP).forEach(note => {
  if (note.includes('b')) {
    const sharp = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')
    if (sharp !== note) STEINWAY_MAP[sharp] = STEINWAY_MAP[note]
  }
})

const YAMAHA_MAP = {
  "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3"
}

Object.keys(YAMAHA_MAP).forEach(note => {
  if (note.includes('#')) {
    const flat = note.replace('C#', 'Db').replace('D#', 'Eb').replace('F#', 'Gb').replace('G#', 'Ab').replace('A#', 'Bb')
    if (flat !== note) YAMAHA_MAP[flat] = YAMAHA_MAP[note]
  }
})

// === State ===
const view = ref('settings') // 'settings' | 'quiz' | 'result'
const selectedChordIds = ref(new Set()) // Default empty

const whiteKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder <= 9))
const blackKeyChords = computed(() => TEST_CHORDS.filter(c => c.sortOrder > 9))
const questionCountPromise = ref(20)
const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const resultMessage = ref(null) // 'correct' | 'incorrect'
const isSamplerLoaded = ref(false)
const isLoading = ref(false)
const loadingProgress = ref(0)
const userTier = ref('free')
const selectedInstrument = ref('yamaha')
const samplers = {}
const namingConvention = ref('italian') // 'german' | 'italian'

// === Computed ===
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const isAllSelected = computed(() => selectedChordIds.value.size > 0)

const currentLayoutChords = computed(() => {
  // Check if any black key is selected (sortOrder > 9)
  const hasBlackKeys = Array.from(selectedChordIds.value).some(id => {
    const chord = TEST_CHORDS.find(c => c.id === id)
    return chord && chord.sortOrder > 9
  })

  if (hasBlackKeys) {
    // Return all 14 chords (white + gap + black)
    // Indexes 0-8 are white keys
    // Indexes 9-13 are black keys
    // We want to insert a gap between white and black
    const whiteKeys = TEST_CHORDS.slice(0, 9)
    const blackKeys = TEST_CHORDS.slice(9)
    return [...whiteKeys, { id: null }, ...blackKeys]
  } else {
    // Return only white keys (9 chords)
    return TEST_CHORDS.filter(c => c.sortOrder <= 9)
  }
})

const hasBlackKeysInSelection = computed(() => {
  return Array.from(selectedChordIds.value).some(id => {
    const chord = TEST_CHORDS.find(c => c.id === id)
    return chord && chord.sortOrder > 9
  })
})

// === Methods ===
const toggleChordSelection = async (id) => {
  // Find the selected chord and its sort order
  const targetChord = TEST_CHORDS.find(c => c.id === id)
  if (!targetChord) return

  const targetOrder = targetChord.sortOrder

  // Select all chords with sortOrder <= targetOrder
  // Deselect all chords with sortOrder > targetOrder
  selectedChordIds.value.clear()
  TEST_CHORDS.forEach(c => {
    if (c.sortOrder <= targetOrder) {
      selectedChordIds.value.add(c.id)
    }
  })
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedChordIds.value.clear()
    // Keep at least one selected to avoid empty state issues, e.g., the first one
    selectedChordIds.value.add(TEST_CHORDS[0].id)
  } else {
    TEST_CHORDS.forEach(c => selectedChordIds.value.add(c.id))
  }
}

const loadSampler = async (instrumentId) => {
  if (samplers[instrumentId]) {
    selectedInstrument.value = instrumentId
    isSamplerLoaded.value = true
    return
  }

  isLoading.value = true
  loadingProgress.value = 0
  isSamplerLoaded.value = false

  let urls, baseUrl
  if (instrumentId === 'yamaha') {
    urls = YAMAHA_MAP
    baseUrl = "https://tonejs.github.io/audio/salamander/"
  } else if (instrumentId === 'steinway') {
    baseUrl = `/samples/steinway/ff/`
    urls = STEINWAY_MAP
  }

  try {
    const s = new Tone.Sampler({
      urls,
      baseUrl,
      onload: () => {
        samplers[instrumentId] = s
        selectedInstrument.value = instrumentId
        isSamplerLoaded.value = true
        isLoading.value = false
        loadingProgress.value = 100
      },
      onerror: (err) => {
        console.error(`${instrumentId} load error:`, err)
        isLoading.value = false
      }
    }).toDestination()

    let fakeProgress = 0
    const interval = setInterval(() => {
      if (!isLoading.value) {
        clearInterval(interval)
        return
      }
      fakeProgress += Math.random() * 15
      if (fakeProgress > 95) fakeProgress = 95
      loadingProgress.value = Math.floor(fakeProgress)
    }, 200)

  } catch (err) {
    console.error('Sampler initialization error:', err)
    isLoading.value = false
  }
}

const selectInstrument = (instrumentId) => {
  if (instrumentId === 'steinway' && userTier.value !== 'premium') {
    if (confirm('STEINWAY B音源を利用するにはプレミアムプラン（月額1,980円）への登録が必要です。プラン一覧を確認しますか？')) {
      router.push('/subscription')
    }
    return
  }

  if (instrumentId === selectedInstrument.value) {
    return
  }
  
  loadSampler(instrumentId)
}

const startTest = () => {
  // Generate questions
  const availableChords = TEST_CHORDS.filter(c => selectedChordIds.value.has(c.id))
  if (availableChords.length === 0) return

  const count = questionCountPromise.value
  const newQuestions = []

  while (newQuestions.length < count) {
    const deck = [...availableChords]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    newQuestions.push(...deck)
  }
  
  questions.value = newQuestions.slice(0, count)
  currentQuestionIndex.value = 0
  score.value = 0
  view.value = 'quiz'
  
  setTimeout(() => playCurrentQuestion(), 500)
}

const playCurrentQuestion = async () => {
  const s = samplers[selectedInstrument.value]
  if (!s || !isSamplerLoaded.value) return
  if (Tone.context.state !== 'running') await Tone.start()
  
  const chord = currentQuestion.value
  s.triggerAttackRelease(chord.notes, 2)
}

const submitAnswer = (chord) => {
  if (resultMessage.value) return 

  const isCorrect = chord.id === currentQuestion.value.id
  if (isCorrect) score.value++
  
  resultMessage.value = isCorrect ? 'correct' : 'incorrect'
  
  setTimeout(() => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
      resultMessage.value = null
      setTimeout(() => playCurrentQuestion(), 300)
    } else {
      finishTest()
    }
  }, 1000)
}

const finishTest = () => {
  view.value = 'result'
}

const resetTest = () => {
  view.value = 'settings'
  resultMessage.value = null
}

const isLightColor = (hex) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180
}

// === Lifecycle ===
onMounted(async () => {
  try {
    const { supabase } = await import('../lib/supabase')
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      const { checkPremiumStatus } = await import('../lib/supabase')
      const status = await checkPremiumStatus()
      userTier.value = status.tier
    }

    if (userTier.value === 'premium') {
      loadSampler('steinway')
    } else {
      loadSampler('yamaha')
    }
  } catch (err) {
    console.error('Test view onMounted error:', err)
    loadSampler('yamaha')
  }
})

onUnmounted(() => {
  Object.values(samplers).forEach(s => s.dispose())
})
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
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
    <header class="w-full pt-8 pb-4 px-4 flex items-center justify-between border-b border-gray-100 bg-white z-10">
      <router-link to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1 class="text-base font-bold text-gray-800 tracking-wider">和音テスト</h1>
      <div class="w-10"></div>
    </header>

    <main class="w-full flex-grow overflow-y-auto px-4 py-6 scrollbar-hide">
      
      <!-- SETTINGS VIEW -->
      <div v-if="view === 'settings'" class="space-y-8 pb-20">
        <!-- Sound Source Selection -->
        <section class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 w-full text-left">デモ音源を選択</label>
          <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full">
            <button 
              @click="selectInstrument('yamaha')"
              class="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
              :class="selectedInstrument === 'yamaha' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              YAMAHA C5
            </button>
            <button 
              @click="selectInstrument('steinway')"
              class="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center"
              :class="selectedInstrument === 'steinway' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              <svg v-if="userTier !== 'premium'" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              STEINWAY B
            </button>
          </div>
          <p v-if="isSamplerLoaded" class="text-[9px] text-gray-400 font-medium mt-2 w-full text-center">
            READY: {{ selectedInstrument === 'steinway' ? 'Steinway & Sons Model B (ff)' : 'Yamaha C5 Grand Piano' }}
          </p>
        </section>

        <!-- Number of Questions -->
        <section class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">問題数</label>
          <div class="flex items-center space-x-2">
            <button 
              v-for="count in [10, 20, 50, 100]" 
              :key="count"
              @click="questionCountPromise = count"
              class="flex-1 py-3 rounded-xl font-bold transition-all text-sm border-2"
              :class="questionCountPromise === count ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-2 hover:border-gray-200'"
            >
              {{ count }}問
            </button>
          </div>
        </section>

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
                <div 
                  @click="toggleChordSelection(chord.id)"
                  class="relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group"
                  :class="[
                    selectedChordIds.has(chord.id) 
                      ? 'bg-white shadow-md border-transparent' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  ]"
                  :style="selectedChordIds.has(chord.id) ? { borderColor: chord.color } : {}"
                >
                  <!-- Color Indicator Bar for Unselected -->
                  <div 
                    v-if="!selectedChordIds.has(chord.id)"
                    class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg opacity-30 group-hover:opacity-60 transition-opacity"
                    :style="{ backgroundColor: chord.color }"
                  ></div>

                  <!-- Check Circle -->
                  <div 
                    class="w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 transition-all duration-200 border"
                    :class="selectedChordIds.has(chord.id) ? 'border-transparent scale-110' : 'border-gray-200 bg-gray-50'"
                    :style="selectedChordIds.has(chord.id) ? { backgroundColor: chord.color } : {}"
                  >
                    <svg v-if="selectedChordIds.has(chord.id)" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :class="isLightColor(chord.color) ? 'text-gray-900' : 'text-white'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>

                  <div>
                    <p class="text-[10px] font-bold mb-0.5 transition-colors" :class="selectedChordIds.has(chord.id) ? 'text-gray-500' : 'text-gray-400'">{{ chord.label }} {{ chord.displayColor }}</p>
                    <p class="text-sm font-bold transition-colors" :class="selectedChordIds.has(chord.id) ? 'text-gray-900' : 'text-gray-400'">
                      <span v-html="namingConvention === 'german' ? chord.name : chord.nameIt"></span>
                    </p>
                  </div>
                </div>
              </template>
            </div>
          </div>

            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-900 flex items-center">
                <span class="w-1 h-4 bg-gray-900 rounded-full mr-2"></span>
                黒鍵の和音
              </h3>
              
              <!-- Naming Convention Toggle (Compact) -->
              <div class="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0 shadow-inner scale-90 origin-right">
                <button 
                  @click="namingConvention = 'italian'"
                  class="px-2.5 py-1 rounded-md text-[9px] font-bold transition-all"
                  :class="namingConvention === 'italian' ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-400 hover:text-gray-500'"
                >
                  伊
                </button>
                <button 
                  @click="namingConvention = 'german'"
                  class="px-2.5 py-1 rounded-md text-[9px] font-bold transition-all"
                  :class="namingConvention === 'german' ? 'bg-white shadow-sm text-gray-900 border border-gray-100' : 'text-gray-400 hover:text-gray-500'"
                >
                  独
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div 
                v-for="chord in blackKeyChords" 
                :key="chord.id"
                @click="toggleChordSelection(chord.id)"
                class="relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group"
                :class="[
                  selectedChordIds.has(chord.id) 
                    ? 'bg-white shadow-md border-transparent' 
                    : 'bg-white border-gray-100 hover:border-gray-200'
                ]"
                :style="selectedChordIds.has(chord.id) ? { borderColor: chord.color } : {}"
              >
               <!-- Color Indicator Bar for Unselected -->
                  <div 
                    v-if="!selectedChordIds.has(chord.id)"
                    class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg opacity-30 group-hover:opacity-60 transition-opacity"
                    :style="{ backgroundColor: chord.color }"
                  ></div>

                <!-- Check Circle -->
                <div 
                  class="w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 transition-all duration-200 border"
                  :class="selectedChordIds.has(chord.id) ? 'border-transparent scale-110' : 'border-gray-200 bg-gray-50'"
                  :style="selectedChordIds.has(chord.id) ? { backgroundColor: chord.color } : {}"
                >
                  <svg v-if="selectedChordIds.has(chord.id)" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :class="isLightColor(chord.color) ? 'text-gray-900' : 'text-white'" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>

                <div>
                  <p class="text-[10px] font-bold mb-0.5 transition-colors" :class="selectedChordIds.has(chord.id) ? 'text-gray-500' : 'text-gray-400'">{{ chord.label }} {{ chord.displayColor }}</p>
                  <p class="text-sm font-bold transition-colors" :class="selectedChordIds.has(chord.id) ? 'text-gray-900' : 'text-gray-400'">
                    <span v-html="namingConvention === 'german' ? chord.name : chord.nameIt"></span>
                  </p>
                </div>
            </div>
          </div>
        </section>

        <!-- Common Settings -->
        <div class="mt-8 pb-32 w-full border-t border-gray-100 pt-8 flex flex-col items-center space-y-8">
          <!-- Instrument Selector -->
          <section class="flex flex-col items-center w-full px-4">
            <p class="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-widest text-center">Sound Source</p>
            <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full max-w-[280px]">
              <button 
                @click="selectInstrument('yamaha')"
                class="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
                :class="selectedInstrument === 'yamaha' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
              >
                YAMAHA C5
              </button>
              <button 
                @click="selectInstrument('steinway')"
                class="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center"
                :class="selectedInstrument === 'steinway' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
              >
                <svg v-if="userTier !== 'premium'" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                STEINWAY B
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- QUIZ VIEW -->
      <div v-if="view === 'quiz'" class="h-full flex flex-col items-center">
        <!-- Progress & Replay -->
        <div class="w-full mb-8">
          <div class="flex justify-between items-end text-xs font-bold text-gray-400 mb-2">
            <span>Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
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
          <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gray-900 transition-all duration-300 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Feedback Overlay -->
        <div v-if="resultMessage" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div 
            class="transform transition-all duration-300 scale-150 drop-shadow-2xl"
          >
            <img 
              :src="resultMessage === 'correct' ? '/quiz_correct.png' : '/quiz_incorrect.png'" 
              alt="Result Feedback" 
              class="w-96 max-w-full h-auto object-contain"
              :class="resultMessage === 'incorrect' ? 'animate-shake' : 'animate-bounce-in'"
            />
          </div>
        </div>

        <!-- Answer Options -->
        <div class="w-full grid grid-cols-2 gap-3 mb-8">
            <template v-for="(chord, index) in currentLayoutChords" :key="chord.id || index">
              <div v-if="!chord.id" class="col-span-2 h-4"></div>
              <button
                v-else
                @click="submitAnswer(chord)"
                :disabled="!!resultMessage"
                class="relative h-24 rounded-xl shadow-sm transition-all duration-200 active:scale-95 border-2"
                :class="[
                  !!resultMessage 
                    ? (chord.id === currentQuestion.id 
                        ? 'border-green-500 ring-4 ring-green-200 z-10' 
                        : 'opacity-20 border-transparent')
                    : 'border-transparent hover:shadow-md'
                ]"
                :style="{ backgroundColor: chord.color }"
              >
                <span 
                  class="absolute top-2 left-3 text-xs font-bold"
                  :class="isLightColor(chord.color) ? 'text-black/40' : 'text-white/60'"
                >
                  {{ chord.label }}
                </span>
                <span class="text-xs font-bold" :class="isLightColor(chord.color) ? 'text-black' : 'text-white'">
                  <span v-html="namingConvention === 'german' ? chord.name : (chord.nameIt || chord.name)"></span>
                </span>
              </button>
            </template>
        </div>
      </div>

      <!-- RESULT VIEW -->
      <div v-if="view === 'result'" class="h-full flex flex-col items-center justify-center text-center">
        <div class="mb-8">
          <p class="text-sm font-bold text-gray-400 mb-2">SCORE</p>
          <div class="text-6xl font-black text-gray-900 mb-2">
            <span class="text-blue-500">{{ score }}</span>
            <span class="text-gray-300 text-4xl">/{{ questions.length }}</span>
          </div>
          <p class="text-lg font-bold text-gray-600">
            {{ score === questions.length ? 'Perfect! 🎉' : score >= questions.length * 0.8 ? 'Great Job! 👍' : 'Keep Practicing! 💪' }}
          </p>
        </div>

        <div class="w-full space-y-4 max-w-xs">
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
    <div v-if="view === 'settings'" class="w-full p-4 bg-white border-t border-gray-100 shrink-0 z-10 box-border absolute bottom-0">
      <button 
        @click="startTest"
        :disabled="selectedChordIds.size === 0 || !isSamplerLoaded"
        class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
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
