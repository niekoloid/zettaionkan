<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
import * as Tone from 'tone'
import abcjs from 'abcjs'

import { Levels } from '../constants/chords.js'

const router = useRouter()
const levels = ref(Levels.filter(l => !['STEP 4', 'STEP 5'].includes(l.shortName)))

const currentChord = ref(null)
const isSamplerLoaded = ref(false)
const userTier = ref('free') // 'free' | 'entry' | 'standard' | 'premium'
const activeLevelIndex = ref(0)
const namingConvention = ref('italian') // 'german' | 'italian'
const loadingProgress = ref(0)
const isLoading = ref(false)
const selectedInstrument = ref('yamaha')
const pressedNotes = ref(new Set())

const samplers = {} // Cache for Tone.Sampler instances

// Comprehensive mapping for 88 keys
import { 
  ALL_NOTES, 
  STEINWAY_MAP, 
  YAMAHA_MAP
} from '../constants/instruments.js'

const user = ref(null)

onMounted(async () => {
  try {
    const { data } = await supabase.auth.getUser()
    user.value = data?.user || null
    if (user.value) {
      const { checkPremiumStatus } = await import('../lib/supabase')
      const status = await checkPremiumStatus()
      userTier.value = status.tier
    }
  } catch (err) {
    console.error('Supabase auth error:', err)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (user.value) {
      const { checkPremiumStatus } = await import('../lib/supabase')
      const status = await checkPremiumStatus()
      userTier.value = status.tier
    } else {
      userTier.value = 'free'
    }
  })

  // Initial load
  if (userTier.value === 'premium') {
    loadSampler('steinway')
  } else {
    loadSampler('yamaha')
  }
  
  // Set initial chord and render its score
  if (levels.value.length > 0 && levels.value[0].chords.length > 0) {
    currentChord.value = levels.value[0].chords[0]
  }

  nextTick(() => {
    if (currentChord.value) {
      renderScore(currentChord.value.abc)
    } else {
      renderScore('y')
    }
  })
})

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
    const sampler = new Tone.Sampler({
      urls,
      baseUrl,
      onload: () => {
        console.log(`${instrumentId} loaded`)
        samplers[instrumentId] = sampler
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

    // Tone.js doesn't provide easy per-sampler progress, 
    // but we can fake it or use a global listener if needed.
    // Here we'll just show it's working.
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

const renderScore = (abc) => {
  abcjs.renderAbc('chord-score', `L:1\nK:C\n${abc}`, {
    responsive: 'resize',
    scale: 1.5, 
    paddingtop: 0,
    paddingbottom: 0,
    paddingleft: 0,
    paddingright: 0,
    staffwidth: 70, 
    add_classes: true
  })
}

const playChord = async (notes) => {
  if (Tone.context.state !== 'running') await Tone.start()
  
  const currentSampler = samplers[selectedInstrument.value]

  if (currentSampler && isSamplerLoaded.value) {
    currentSampler.triggerAttackRelease(notes, 3)
    notes.forEach(note => pressedNotes.value.add(note))
    setTimeout(() => {
      notes.forEach(note => pressedNotes.value.delete(note))
    }, 3000)
    console.log('Playing chord:', notes)
  } else {
    console.warn('Sampler not ready or missing:', selectedInstrument.value)
  }
}

const playNote = async (note) => {
  if (Tone.context.state !== 'running') await Tone.start()
  
  const currentSampler = samplers[selectedInstrument.value]

  if (currentSampler && isSamplerLoaded.value) {
    currentSampler.triggerAttackRelease(note, '2n')
    pressedNotes.value.add(note)
    setTimeout(() => pressedNotes.value.delete(note), 1000) // Increased duration for more distinct visual feedback
    console.log('Playing note:', note)
  } else {
    console.warn('Sampler not ready or missing:', selectedInstrument.value)
  }
}

  // 和音が制限されているか（音が出るか）の判定
  const isChordRestricted = (levelIdx, chordIdx) => {
    // 最初の和音 (Level 1 の index 0) は未ログインでも全員OK
    if (levelIdx === 0 && chordIdx === 0) return false
    
    // それ以外（Level 1の2つ目以降含む）は最低限ログインが必要
    if (!user.value) return true

    // ログイン済み無料ユーザー (free)
    if (userTier.value === 'free') {
      // Level 1 のみOK
      return levelIdx > 0
    }
    
    // エントリープラン (entry)
    if (userTier.value === 'entry') {
      // Level 2 までOK
      return levelIdx > 1
    }
    
    // スタンダードプラン以上 (standard, premium)
    // 制限なし
    return false
  }

  const toggleChord = async (chord, index) => {
    // 視覚情報（楽譜、鍵盤の着色）は常に更新
    currentChord.value = chord
    await nextTick()
    renderScore(chord.abc)

    if (isChordRestricted(activeLevelIndex.value, index)) {
      if (!user.value) {
        if (confirm('ドミソ以外の和音を鳴らすにはログインが必要です。ログイン画面に移動しますか？')) {
          router.push('/auth')
        }
      } else {
        const neededPlan = activeLevelIndex.value === 1 ? 'エントリー' : 'スタンダード'
        if (confirm(`このレベルの和音を鳴らすには${neededPlan}プラン以上への加入が必要です。プラン一覧を確認しますか？`)) {
          router.push('/subscription')
        }
      }
      return
    }

    // 条件クリアなら音を鳴らす
    playChord(chord.notes)
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

const getInstrumentName = (type) => {
  return 'Grand Piano: Yamaha C5'
}

// Piano Keyboard Logic
const whiteKeys = ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']
const keyboardLayout = [
  { note: 'F3', type: 'white' }, { note: 'F#3', type: 'black' },
  { note: 'G3', type: 'white' }, { note: 'G#3', type: 'black' },
  { note: 'A3', type: 'white' }, { note: 'A#3', type: 'black' },
  { note: 'B3', type: 'white' },
  { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' },
  { note: 'D4', type: 'white' }, { note: 'D#4', type: 'black' },
  { note: 'E4', type: 'white' },
  { note: 'F4', type: 'white' }, { note: 'F#4', type: 'black' },
  { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' },
  { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' },
  { note: 'B4', type: 'white' },
  { note: 'C5', type: 'white' }, { note: 'C#5', type: 'black' },
  { note: 'D5', type: 'white' }, { note: 'D#5', type: 'black' },
  { note: 'E5', type: 'white' },
  { note: 'F5', type: 'white' }, { note: 'F#5', type: 'black' },
  { note: 'G5', type: 'white' }
]

const isNoteActive = (note) => {
  if (!currentChord.value) return false
  
  // Normalize checking note to sharp if it's flat (though keyboard layout uses sharps)
  const toSharp = (n) => {
    // Handle special replacements for flats to sharps
    const map = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }
    // Replace traditional flat symbol first
    let clean = n.replace('♭', 'b')
    // Replace note name part
    for (const [flat, sharp] of Object.entries(map)) {
      if (clean.startsWith(flat)) {
        return clean.replace(flat, sharp)
      }
    }
    return clean
  }

  const normalizedChordNotes = currentChord.value.notes.map(toSharp)
  const targetNote = toSharp(note)

  return normalizedChordNotes.includes(targetNote)
}

const hasBlackKey = (whiteNote) => {
  const noteName = whiteNote.replace(/\d/, '')
  return !['B', 'E'].includes(noteName)
}

const getBlackKeyNote = (whiteNote) => {
  const noteName = whiteNote.replace(/\d/, '')
  const octave = whiteNote.match(/\d/)[0]
  return `${noteName}#${octave}`
}
const isLightColor = (hex) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Contrast formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180 // Threshold for bright colors
}
</script>

<template>
  <div 
    :style="{ 
      '--chord-color': currentChord?.color || '#EF4444',
      backgroundColor: currentChord ? currentChord.color + '4D' : 'white'
    }"
    class="min-h-screen transition-colors duration-500 font-['Noto_Sans_JP'] antialiased"
    style="backface-visibility: hidden;"
  >
    <div 
      class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden"
    >
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
    <header class="pt-10 pb-6 px-4 flex items-center justify-between shrink-0">
      <div class="w-10"></div> <!-- Spacer -->
      <div class="flex flex-col items-center">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-20 w-auto object-contain" />
      </div>
      <router-link :to="user ? '/account' : '/auth'" class="p-2 hover:bg-black/5 rounded-full transition-colors group">
        <svg v-if="!user" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <div v-else 
          class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border-2 transition-all"
          :class="[
            userTier === 'free' ? 'bg-black/5 text-gray-400 border-transparent' : 
            userTier === 'entry' ? 'bg-blue-50 text-blue-500 border-blue-200' :
            'bg-amber-50 text-amber-500 border-amber-200'
          ]"
        >
          {{ user?.email?.charAt(0) || '?' }}
        </div>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-8 overflow-y-auto" style="scrollbar-gutter: stable;">
      <!-- Score Visualization -->
      <section class="flex flex-col items-center mb-2 text-center">
        <div class="w-[180px] h-[200px] bg-gray-50 rounded-3xl p-4 flex flex-col items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
          <div id="chord-score" class="w-full flex justify-center items-center pointer-events-none"></div>
          <div v-if="currentChord" class="mt-2 text-[14px] font-bold text-gray-700 flex flex-col items-center">
            <span v-html="(namingConvention === 'german' ? currentChord.name : currentChord.nameIt) + ' (' + currentChord.colorName + ')'"></span>
            <span class="text-[10px] font-normal text-gray-400 mt-0.5">{{ currentChord.symbol }}</span>
          </div>
        </div>
      </section>

      <!-- Keyboard Visualization -->
      <section class="flex flex-col items-center mb-4">
        <div class="w-full -mx-4 px-0">
          <div class="relative flex justify-center h-24 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
            <!-- White Keys -->
            <div 
              v-for="note in whiteKeys" 
              :key="note"
              @click="playNote(note)"
              class="relative flex-grow border-x-[0.5px] border-gray-200 first:border-l-0 last:border-r-0 rounded-b-sm transition-all duration-75 cursor-pointer active:opacity-90"
              :class="[
                isNoteActive(note) ? '' : 'bg-white',
                pressedNotes.has(note) ? 'translate-y-1.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-[0.98] z-10' : ''
              ]"
              :style="isNoteActive(note) ? { backgroundColor: currentChord?.color } : {}"
            >
              <span 
                class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold uppercase transition-colors duration-300"
                :class="[isNoteActive(note) ? (isLightColor(currentChord?.color) ? 'text-black/40' : 'text-white/60') : 'text-gray-300']"
              >
                {{ note.replace(/\d/, '') }}
              </span>
            </div>
            
            <!-- Black Keys -->
            <div class="absolute inset-x-1 top-1 h-14 pointer-events-none flex">
              <div v-for="(note, index) in keyboardLayout" :key="'gap-'+index" 
                class="flex-grow relative h-full"
                :class="{'hidden': note.type === 'black'}"
              >
                <div 
                  v-if="hasBlackKey(note.note)"
                  @click.stop="playNote(getBlackKeyNote(note.note))"
                  class="absolute right-0 translate-x-1/2 w-3/5 h-full rounded-b-sm border-x border-b border-gray-800 transition-all duration-75 z-20 cursor-pointer pointer-events-auto"
                  :class="[
                    isNoteActive(getBlackKeyNote(note.note)) ? '' : 'bg-gray-800',
                    pressedNotes.has(getBlackKeyNote(note.note)) ? 'translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.7)] brightness-150 scale-95 ring-2 ring-white z-30' : ''
                  ]"
                  :style="isNoteActive(getBlackKeyNote(note.note)) ? { backgroundColor: currentChord?.color, borderColor: 'white' } : {}"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Level Selector -->
      <div class="flex bg-gray-100 p-1 rounded-xl mb-6 border border-gray-200">
        <button 
          v-for="(level, index) in levels" 
          :key="index"
          @click="activeLevelIndex = index"
          class="flex-1 py-2 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center"
          :class="activeLevelIndex === index ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
        >
          <!-- ロックアイコンの表示ロジック -->
          <template v-if="index > 0 && user">
            <!-- ログイン済みで、未課金またはプラン不足の場合 -->
            <svg v-if="userTier === 'free'" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="index >= 2 && userTier === 'entry'" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
          </template>
          {{ level.shortName }}
        </button>
      </div>

      <!-- Active Level Content -->
      <div class="mb-12 transition-all duration-300">
        <section class="space-y-4">
          <div class="px-2 flex items-center justify-between">
            <div class="flex-grow min-w-0">
              <h2 class="text-sm font-bold text-gray-800 flex items-center">
                <span v-if="activeLevelIndex !== 2" class="w-1.5 h-4 bg-gray-900 rounded-full mr-2"></span>
                {{ levels[activeLevelIndex].name }}
              </h2>
              <p class="text-[10px] text-gray-400 mt-0.5 leading-relaxed truncate">{{ levels[activeLevelIndex].description }}</p>
            </div>

            <!-- Notation Toggle (Only for Black Key Level) -->
            <div v-if="activeLevelIndex === 2" class="flex bg-gray-100 p-0.5 rounded-lg border border-gray-100 ml-4 shrink-0 shadow-inner">
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

          <div class="grid gap-3" :class="activeLevelIndex === 0 ? 'grid-cols-1' : 'grid-cols-2'">
            <div 
              v-for="(chord, index) in levels[activeLevelIndex].chords" 
              :key="chord.id"
              @click="toggleChord(chord, index)"
              class="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
              :class="[
                currentChord?.id === chord.id 
                  ? ('shadow-md border-transparent ' + (isLightColor(chord.color) ? 'text-gray-900' : 'text-white'))
                  : 'text-gray-900 border-opacity-30'
              ]"
              :style="[
                currentChord?.id === chord.id 
                  ? { backgroundColor: chord.color } 
                  : { backgroundColor: chord.color + '14', borderColor: chord.color + '4D' }
              ]"
            >
              <!-- Lock Icon for restricted chords -->
              <div v-if="isChordRestricted(activeLevelIndex, index)" class="absolute top-1 right-1 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :class="user ? 'text-amber-500' : 'text-gray-300'" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <!-- Step Number Bubble -->
              <div 
                class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black mr-3 shrink-0 border border-black/5"
                :style="{ 
                  backgroundColor: chord.color, 
                  color: isLightColor(chord.color) ? '#000' : '#fff' 
                }"
              >
                {{ (activeLevelIndex === 0 ? 0 : levels.slice(0, activeLevelIndex).reduce((acc, l) => acc + l.chords.length, 0)) + index + 1 }}
              </div>

              <div class="flex items-baseline space-x-2 overflow-hidden min-w-0">
                <span class="font-bold text-[17px] leading-tight truncate" v-html="namingConvention === 'german' ? chord.name : chord.nameIt"></span>
                <span class="text-[11px] font-medium opacity-70 shrink-0">({{ chord.colorName }})</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Settings -->
      <div class="space-y-4">
        <section class="flex flex-col items-center">
          <p class="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest">Sound Source</p>
          
          <!-- Instrument Selector -->
          <div class="flex bg-gray-100 p-1 rounded-xl mb-4 border border-gray-200 w-full max-w-[280px]">
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
          <p v-if="isSamplerLoaded" class="text-[9px] text-gray-400 font-medium">
            READY: {{ selectedInstrument === 'steinway' ? 'Steinway & Sons Model B (ff)' : 'Yamaha C5 Grand Piano' }}
          </p>
        </section>

      </div>

      <!-- Footer Links -->
      <div class="mt-20 border-t border-gray-100 pt-16 pb-12">
        <div class="px-6">
          <!-- Main Feature: Chord Test -->
          <div class="mb-16 text-center">
            <router-link to="/test" class="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="relative z-10">
                <p class="text-blue-100 text-xs font-bold tracking-widest uppercase mb-2">Try it now</p>
                <h3 class="text-2xl font-black text-white mb-2">和音テストに挑戦</h3>
                <p class="text-blue-100 text-sm font-medium mb-6">あなたの音感レベルをチェックしてみましょう</p>
                <span class="inline-block bg-white text-blue-600 px-6 py-2 rounded-full text-sm font-bold shadow-sm group-hover:bg-blue-50 transition-colors">
                  テストを始める
                </span>
              </div>
              <!-- Decorative Circle -->
              <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
            </router-link>
          </div>

          <div class="grid grid-cols-2 gap-x-8 gap-y-12 mb-16">
            <!-- Training & Plans -->
            <div class="space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1 pl-1">Training</p>
              <div class="flex flex-col space-y-3">
                <router-link to="/method" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  トレーニング方法
                </router-link>
                <router-link to="/subscription" class="text-sm text-amber-500 hover:text-amber-600 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2.5"></span>
                  料金プラン
                </router-link>
              </div>
            </div>

            <!-- About & Support -->
            <div class="space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1 pl-1">Support</p>
              <div class="flex flex-col space-y-3">
                <router-link to="/about" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  サービス概要
                </router-link>
                <router-link to="/contact" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  お問い合わせ
                </router-link>
              </div>
            </div>
          </div>

          <!-- Legal & Corporate -->
          <div class="border-t border-gray-100 pt-8">
            <div class="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-8">
              <router-link to="/company" class="text-[10px] text-gray-400 hover:text-gray-600 font-medium whitespace-nowrap">運営会社</router-link>
              <router-link to="/privacy" class="text-[10px] text-gray-400 hover:text-gray-600 font-medium whitespace-nowrap">プライバシーポリシー</router-link>
              <router-link to="/legal" class="text-[10px] text-gray-400 hover:text-gray-600 font-medium whitespace-nowrap">特定商取引法に基づく表記</router-link>
            </div>
            
            <footer class="text-center">
              <p class="text-[10px] text-gray-300 font-medium">&copy; 2026 Akatsuki Inc.</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for loading overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
