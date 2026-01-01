<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
import * as Tone from 'tone'
import abcjs from 'abcjs'

import { Levels } from '../constants/chords.js'

const levels = ref(Levels)

const currentChord = ref(null)
const isSamplerLoaded = ref(false)
const selectedInstrument = ref('yamaha') // 'yamaha' | 'steinway' | 'xylophone'
const activeLevelIndex = ref(0)

let yamahaSampler = null
let steinwaySampler = null

// Yamaha C5 (Salamander) mapping
const YAMAHA_C5_SAMPLES = {
  "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3"
}

// Steinway B (nbrosowsky) mapping - Sparse set for performance
const STEINWAY_B_SAMPLES = {
  "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3"
}

// Xylophone samples from nbrosowsky/tonejs-instruments (as close to Kalimba as available in this library)
const XYLOPHONE_SAMPLES = {
  "G4": "G4.mp3",
  "C5": "C5.mp3", "G5": "G5.mp3",
  "C6": "C6.mp3", "G6": "G6.mp3",
  "C7": "C7.mp3", "G7": "G7.mp3"
}

// Rain Drum (mapped to Nylon Guitar for similar soft pluck) - Samples from nbrosowsky
// Rain Drum (mapped to Nylon Guitar for similar soft pluck) - Samples from nbrosowsky
const RAIN_DRUM_SAMPLES = {
  "A2": "A2.mp3", "B2": "B2.mp3", "B3": "B3.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3" 
}

const VIOLIN_SAMPLES = {
  "A3": "A3.mp3", "C4": "C4.mp3", "G4": "G4.mp3", "A4": "A4.mp3",
  "A5": "A5.mp3", "A6": "A6.mp3"
}

const FLUTE_SAMPLES = {
  "A4": "A4.mp3", "C5": "C5.mp3", "A5": "A5.mp3", "A6": "A6.mp3"
}

// Nylon Guitar samples
const GUITAR_SAMPLES = {
  "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3",
  "B3": "B3.mp3", "E4": "E4.mp3", "G4": "G4.mp3"
}

const user = ref(null)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  yamahaSampler = new Tone.Sampler({
    urls: YAMAHA_C5_SAMPLES,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
      if (selectedInstrument.value === 'yamaha') isSamplerLoaded.value = true
    }
  }).toDestination()

  steinwaySampler = new Tone.Sampler({
    urls: STEINWAY_B_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/",
    onload: () => {
      if (selectedInstrument.value === 'steinway') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Steinway loading error:", err)
  }).toDestination()
  
  // Render empty score initially (using 'y' as spacer to ensure staff lines appear)
  nextTick(() => {
    renderScore('y')
  })
})

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

const playChord = (notes) => {
  if (Tone.context.state !== 'running') Tone.start()
  
  let currentSampler
  if (selectedInstrument.value === 'yamaha') currentSampler = yamahaSampler
  else if (selectedInstrument.value === 'steinway') currentSampler = steinwaySampler

  if (currentSampler && currentSampler.loaded) {
    currentSampler.triggerAttackRelease(notes, 3)
  }
}

const toggleChord = async (chord) => {
  playChord(chord.notes)
  currentChord.value = chord
  await nextTick()
  renderScore(chord.abc)
}

const selectInstrument = (instrument) => {
  selectedInstrument.value = instrument
  
  // Play 'Do' (C4) to confirm instrument sound
  // Short delay to ensure state update propagates if needed, though reactive trigger is better handled directly
  // Actually we can just play immediately as the sampler should be loaded by now (except arguably on first load, but user is switching)
  
  // Determine if the target sampler is loaded
  let targetSampler
  if (instrument === 'yamaha') targetSampler = yamahaSampler
  else if (instrument === 'steinway') targetSampler = steinwaySampler

  if (targetSampler && targetSampler.loaded) {
    isSamplerLoaded.value = true
    if (Tone.context.state !== 'running') Tone.start()
    targetSampler.triggerAttackRelease('C4', '8n')
  } else {
    isSamplerLoaded.value = false // Let the loading indicator pulse
    // Check loading status if needed, but the onload callbacks handle isSamplerLoaded
  }
}

const getInstrumentName = (type) => {
  switch (type) {
    case 'yamaha': return 'Grand Piano: Yamaha C5'
    case 'steinway': return 'Grand Piano: Steinway'
    default: return ''
  }
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
    class="flex flex-col h-[100dvh] w-full sm:max-w-md mx-auto shadow-2xl relative transition-colors duration-500 overflow-hidden bg-white"
  >
    <!-- Header -->
    <header class="pt-10 pb-6 px-4 flex items-center justify-between shrink-0">
      <div class="w-10"></div> <!-- Spacer -->
      <div class="flex flex-col items-center">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-16 w-auto object-contain" />
      </div>
      <router-link to="/auth" class="p-2 hover:bg-black/5 rounded-full transition-colors group">
        <svg v-if="!user" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <div v-else class="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase">
          {{ user.email.charAt(0) }}
        </div>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-8 overflow-y-auto">
      <!-- Score Visualization -->
      <section class="flex flex-col items-center mb-2 text-center">
        <div class="w-full max-w-[150px] max-h-[400px] bg-gray-50 rounded-3xl p-4 flex flex-col items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
          <div id="chord-score" class="w-full flex justify-center items-center pointer-events-none"></div>
          <div v-if="currentChord" class="mt-2 text-[13px] font-bold text-gray-700 flex flex-col items-center">
            <span v-html="currentChord.name + ' (' + currentChord.colorName + ')'"></span>
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
              class="relative flex-grow border-x-[0.5px] border-gray-200 first:border-l-0 last:border-r-0 rounded-b-sm transition-colors duration-300"
              :class="[isNoteActive(note) ? '' : 'bg-white']"
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
                  class="absolute right-0 translate-x-1/2 w-3/5 h-full rounded-b-sm border-x border-b border-gray-800 transition-colors duration-300 z-10"
                  :class="[isNoteActive(getBlackKeyNote(note.note)) ? '' : 'bg-gray-800']"
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
          class="flex-1 py-2 rounded-lg text-[10px] font-bold transition-all text-center"
          :class="activeLevelIndex === index ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
        >
          {{ level.shortName }}
        </button>
      </div>

      <!-- Active Level Content -->
      <div class="mb-12 transition-all duration-300">
        <section class="space-y-4">
          <div class="px-2">
            <h2 class="text-sm font-bold text-gray-800 flex items-center">
              <span class="w-1.5 h-4 bg-gray-900 rounded-full mr-2"></span>
              {{ levels[activeLevelIndex].name }}
            </h2>
            <p class="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{{ levels[activeLevelIndex].description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div 
              v-for="(chord, index) in levels[activeLevelIndex].chords" 
              :key="chord.id"
              @click="toggleChord(chord)"
              class="flex items-center p-2 border-2 rounded-xl cursor-pointer transition-all duration-300"
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
              <!-- Step Number Bubble -->
              <div 
                class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black mr-2 shrink-0 border border-black/5"
                :style="{ 
                  backgroundColor: chord.color, 
                  color: isLightColor(chord.color) ? '#000' : '#fff' 
                }"
              >
                {{ (activeLevelIndex === 0 ? 0 : levels.slice(0, activeLevelIndex).reduce((acc, l) => acc + l.chords.length, 0)) + index + 1 }}
              </div>

              <div class="flex items-baseline space-x-1 overflow-hidden min-w-0">
                <span class="font-bold text-[13px] leading-tight truncate" v-html="chord.name"></span>
                <span class="text-[8px] font-medium opacity-60 shrink-0">({{ chord.colorName }})</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Settings -->
      <div class="space-y-4">
        <section class="flex flex-col items-center">
          <!-- Instrument Selector -->
          <div class="flex bg-gray-100 p-1 rounded-xl mb-4 border border-gray-200">
            <button 
              @click="selectInstrument('yamaha')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'yamaha' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Yamaha C5
            </button>
            <button 
              disabled
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
            >
              Steinway <span class="text-[8px] font-normal block sm:inline">(Coming Soon)</span>
            </button>
          </div>
        </section>
      </div>

      <!-- Footer Links -->
      <div class="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center space-y-4">
        <router-link to="/method" class="text-xs text-gray-400 hover:text-gray-600 font-medium">トレーニング方法</router-link>
        <router-link to="/about" class="text-xs text-gray-400 hover:text-gray-600 font-medium">サービス概要</router-link>
        <router-link to="/company" class="text-xs text-gray-400 hover:text-gray-600 font-medium">運営会社情報</router-link>
        <router-link to="/privacy" class="text-xs text-gray-400 hover:text-gray-600 font-medium">プライバシーポリシー</router-link>
        <router-link to="/premium" class="text-xs text-amber-500 hover:text-amber-600 font-bold">プレミアムプラン</router-link>
        <footer class="text-center text-gray-300 text-[10px] pt-4 pb-8">
          &copy; 2026 Akatsuki Inc.
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Score coloring removed to keep notes black */
</style>
