<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as Tone from 'tone'
import abcjs from 'abcjs'

import { Levels } from '../constants/chords.js'

import { useAudio } from '../composables/useAudio'
import { useAudioSettings } from '../composables/useAudioSettings'

import AppHeader from '../components/AppHeader.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
// Filter out unnecessary levels
const rawLevels = Levels.filter(l => !['STEP 4', 'STEP 5'].includes(l.shortName))

const currentChord = ref(null)
const pressedNotes = ref(new Set())
const isChordPlaying = ref(false)
const playbackTimeout = ref(null)
const namingConvention = ref('italian') // 'german' | 'italian'

// === Single List Logic ===
// Flatten all chords into a single list with metadata
const allChords = computed(() => {
  const result = []
  rawLevels.forEach((level, levelIdx) => {
    level.chords.forEach((chord, chordIdx) => {
      // Calculate global index (1-based)
      const globalIndex = result.length + 1
      result.push({
        ...chord,
        originalLevelIndex: levelIdx,
        originalChordIndex: chordIdx,
        globalIndex
      })
    })
  })
  return result
})

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler 
} = useAudio()

const { user, userTier, authReady } = useAuth()
const { getPreferredInstrument, setPreferredInstrument } = useAudioSettings()

const handleInstrumentChange = (instrument) => {
  if (instrument === selectedInstrument.value) return
  
  if (instrument === 'steinway' && userTier.value !== 'premium') {
    // Optional: Show upgrade modal or alert
    alert('Steinway B音源はプレミアムプラン限定です。')
    return
  }

  loadSampler(instrument)
  setPreferredInstrument(instrument)
}

onMounted(async () => {
  // Wait for auth state to be confirmed to avoid loading wrong instrument initially
  await authReady
  
  // Initial load
  const preferred = getPreferredInstrument()
  
  if (userTier.value === 'premium' && preferred === 'steinway') {
    loadSampler('steinway')
  } else {
    loadSampler('yamaha')
  }
  
  // Set initial chord
  if (allChords.value.length > 0) {
    currentChord.value = allChords.value[0]
  }
})



const playChord = async (notes) => {
  if (Tone.context.state !== 'running') await Tone.start()
  
  const currentSampler = samplers[selectedInstrument.value]

  if (currentSampler && isSamplerLoaded.value) {
    if (playbackTimeout.value) {
      clearTimeout(playbackTimeout.value)
      playbackTimeout.value = null
    }

    currentSampler.releaseAll()
    pressedNotes.value.clear()
    isChordPlaying.value = false

    // Give a clearer reset state before starting next
    await nextTick()

    isChordPlaying.value = true
    currentSampler.triggerAttackRelease(notes, 6)
    notes.forEach(note => pressedNotes.value.add(note))
    
    playbackTimeout.value = setTimeout(() => {
      notes.forEach(note => pressedNotes.value.delete(note))
      isChordPlaying.value = false
      playbackTimeout.value = null
    }, 6000)
    
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
    setTimeout(() => pressedNotes.value.delete(note), 1000)
    console.log('Playing note:', note)
  } else {
    console.warn('Sampler not ready or missing:', selectedInstrument.value)
  }
}

  // 全ての和音を制限なしで開放
  const isChordRestricted = (chord) => {
    return false
  }

  const toggleChord = async (chord) => {
    // 視覚情報（楽譜、鍵盤の着色）は常に更新
    currentChord.value = chord

    // 全ての和音を制限なしで再生
    playChord(chord.notes)
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
      backgroundColor: isChordPlaying && currentChord ? currentChord.color : 'white'
    }"
    class="min-h-screen transition-colors duration-500 font-['Noto_Sans_JP'] antialiased"
    style="backface-visibility: hidden;"
  >
    <div 
      class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden"
    >

    <!-- Header -->
    <AppHeader transparent />

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-8 overflow-y-auto" style="scrollbar-gutter: stable;">


      <!-- Score Visualization (Abstracted Component) -->
      <section class="flex flex-col items-center mb-2 text-center">
        <ScoreDisplay :abc="currentChord?.abc" :is-answered="true">
          <template #footer v-if="currentChord">
            <div class="mt-2 text-[14px] font-bold text-gray-700 flex flex-col items-center animate-bounce-in">
              <span v-html="(namingConvention === 'german' ? currentChord.name : currentChord.nameIt) + ' (' + currentChord.colorName + ')'"></span>
            </div>
          </template>
        </ScoreDisplay>
      </section>

      <!-- Keyboard Visualization -->
      <section class="flex flex-col items-center mb-8">
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
                    pressedNotes.has(getBlackKeyNote(note.note)) ? 'translate-y-1.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-95 z-30' : ''
                  ]"
                  :style="isNoteActive(getBlackKeyNote(note.note)) ? { backgroundColor: currentChord?.color } : {}"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Chord List (All Levels) -->
      <section class="mb-8">


          <div class="grid grid-cols-5 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(chord) in allChords" 
              :key="chord.id"
              @click="toggleChord(chord)"
              class="relative cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm group
                     aspect-square rounded-full
                     md:aspect-auto md:rounded-2xl md:h-20"
              :class="[
                 currentChord?.id === chord.id 
                    ? 'ring-4 ring-offset-2 ring-gray-200 z-10 scale-105 shadow-md' 
                    : 'hover:shadow-md'
              ]"
              :style="{ backgroundColor: chord.color }"
            >

              <!-- Mobile Content: Center Number -->
              <div class="absolute inset-0 flex items-center justify-center md:hidden">
                 <span 
                   class="text-lg font-black"
                   :style="{ color: isLightColor(chord.color) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }"
                 >
                   {{ chord.globalIndex }}
                 </span>
              </div>

              <!-- Desktop Content: Detail View -->
              <div class="hidden md:flex items-center w-full h-full px-4">
                <!-- Number Circle -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 text-Base font-black shadow-sm border-2 border-white/20"
                  :style="{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: isLightColor(chord.color) ? '#1f2937' : 'white'
                  }"
                >
                  {{ chord.globalIndex }}
                </div>
                
                <!-- Text Info -->
                <div class="flex flex-col text-left overflow-hidden justify-center h-full">
                  <span 
                    class="font-black text-[15px] leading-tight"
                    :class="isLightColor(chord.color) ? 'text-gray-900' : 'text-white'"
                  >
                    {{ namingConvention === 'german' ? chord.name : chord.nameIt }}
                  </span>
                  <span 
                    class="text-[10px] font-bold leading-none mt-1 opacity-90"
                    :class="isLightColor(chord.color) ? 'text-gray-600' : 'text-white'"
                  >
                    {{ chord.colorName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
      </section>

      <section class="mb-10 px-4">
        <div class="flex flex-col gap-4">
          <!-- Auto Play -->
          <router-link to="/autoplay" class="group relative flex items-center w-full h-16 overflow-hidden rounded-2xl bg-white border border-indigo-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div class="relative z-10 flex items-center w-full px-6">
              <!-- Icon Container -->
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- Text Content -->
              <div class="ml-4 flex flex-col items-start justify-center flex-grow">
                <h3 class="text-sm font-black text-indigo-900 tracking-wider">和音の聞き流し</h3>
                <p class="text-[10px] font-bold text-indigo-400 mt-0.5">自動で和音が出題され続けます</p>
              </div>

              <!-- Arrow -->
              <div class="text-indigo-200 group-hover:text-indigo-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </router-link>

          <!-- Chord Training -->
          <div 
            @click="router.push('/chordquizz')" 
            class="group relative flex items-center w-full h-16 overflow-hidden rounded-2xl bg-white border border-amber-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            <div class="relative z-10 flex items-center w-full px-6">
              <!-- Icon Container -->
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <!-- Bolt Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- Text Content -->
              <div class="ml-4 flex flex-col items-start justify-center flex-grow">
                <h3 class="text-sm font-black text-amber-900 tracking-wider">和音テストに挑戦</h3>
                <p class="text-[10px] font-bold text-amber-500 mt-0.5">和音を色で認識できるかテスト</p>
              </div>

              <!-- Arrow -->
              <div class="text-amber-200 group-hover:text-amber-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Single Note Training -->
          <router-link to="/singlenotetest" class="group relative flex items-center w-full h-16 overflow-hidden rounded-2xl bg-white border border-sky-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div class="relative z-10 flex items-center w-full px-6">
              <!-- Icon Container -->
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 text-sky-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl font-black">?</span>
              </div>

              <!-- Text Content -->
              <div class="ml-4 flex flex-col items-start justify-center flex-grow">
                <h3 class="text-sm font-black text-sky-900 tracking-wider">単音テストに挑戦</h3>
                <p class="text-[10px] font-bold text-sky-400 mt-0.5">ドレミの音を一つずつ当ててみましょう</p>
              </div>

              <!-- Arrow -->
              <div class="text-sky-200 group-hover:text-sky-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </router-link>

          <!-- Song Playback -->
          <router-link to="/songs" class="group relative flex items-center w-full h-16 overflow-hidden rounded-2xl bg-white border border-emerald-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div class="relative z-10 flex items-center w-full px-6">
              <!-- Icon Container -->
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
                  <path fill-rule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.571v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.17a.75.75 0 01.546-.721l10.5-3a.75.75 0 01.836.202z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- Text Content -->
              <div class="ml-4 flex flex-col items-start justify-center flex-grow">
                <h3 class="text-sm font-black text-emerald-900 tracking-wider">曲を聴いてみる</h3>
                <p class="text-[10px] font-bold text-emerald-500 mt-0.5">名曲を14色の和音で奏でます</p>
              </div>

              <!-- Arrow -->
              <div class="text-emerald-200 group-hover:text-emerald-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Instrument Toggle -->
      <section class="flex flex-col items-center justify-center">
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">グランドピアノ音源</h3>
        <div class="bg-gray-100 p-1 rounded-full flex items-center shadow-inner">
          <button 
            @click="handleInstrumentChange('yamaha')"
            class="px-5 py-2 rounded-full text-[11px] font-bold transition-all duration-300 active:scale-95"
            :class="selectedInstrument === 'yamaha' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
          >
            Yamaha C5
          </button>
          <div class="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            @click="handleInstrumentChange('steinway')"
            class="px-5 py-2 rounded-full text-[11px] font-bold transition-all duration-300 flex items-center active:scale-95"
            :class="selectedInstrument === 'steinway' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
          >
            Steinway B
            <span v-if="userTier !== 'premium'" class="ml-1.5 text-[10px] opacity-70">🔒</span>
          </button>
        </div>
      </section>

      <!-- Footer Links -->
      <div class="mt-20 border-t border-gray-100 pt-16 pb-12">
        <div class="px-6">
          <div class="grid grid-cols-2 gap-x-8 gap-y-12 mb-16">
            <!-- Training & Plans -->
            <div class="space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1 pl-1">Training</p>
              <div class="flex flex-col space-y-3">
                <router-link to="/method" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  トレーニング方法
                </router-link>
                <router-link to="/about" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  サービス概要
                </router-link>
              </div>
            </div>

            <!-- About & Support -->
            <div class="space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1 pl-1">Support</p>
              <div class="flex flex-col space-y-3">
                <router-link to="/subscription" class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center">
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5"></span>
                  料金プラン
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
