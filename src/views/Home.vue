<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as Tone from 'tone'
import abcjs from 'abcjs'

const levels = ref([
  {
    name: 'Level 1: 基本の3和音（赤・黄・青）',
    description: 'まずはここから。江口式メソッドの基本となる3つの和音。',
    chords: [
      { id: 'domiso', name: 'ドミソ', symbol: 'C', color: '#EF4444', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
      { id: 'dofara', name: 'ドファラ', symbol: 'F/C', color: '#EAB308', notes: ['C4', 'F4', 'A4'], abc: '[CFA]' },
      { id: 'shireso', name: 'シレソ', symbol: 'G/B', color: '#3B82F6', notes: ['B3', 'D4', 'G4'], abc: '[B,DG]' }
    ]
  },
  {
    name: 'Level 2: 白鍵の展開形（緑・オレンジ・紫など）',
    description: '基本の和音を展開した形。構成音が変わり、響きの色も変化します。',
    chords: [
      { id: 'resoshi', name: 'レソシ', symbol: 'G/D', color: '#22C55E', notes: ['D4', 'G4', 'B4'], abc: '[DGB]' },
      { id: 'misodo', name: 'ミソド', symbol: 'C/E', color: '#F97316', notes: ['E4', 'G4', 'C5'], abc: '[EGc]' },
      { id: 'radofa', name: 'ラドファ', symbol: 'F/A', color: '#A855F7', notes: ['A3', 'C4', 'F4'], abc: '[A,CF]' },
      { id: 'soshire', name: 'ソシレ', symbol: 'G', color: '#EC4899', notes: ['G4', 'B4', 'D5'], abc: '[GBd]' },
      { id: 'sodomi', name: 'ソドミ', symbol: 'C/G', color: '#A3744D', notes: ['G3', 'C4', 'E4'], abc: '[G,CE]' }
    ]
  },
  {
    name: 'Level 3: 黒鍵を含む和音',
    description: 'シャープやフラットを含む、より複雑な色の響き。',
    chords: [
      { id: 'radosharpmi', name: 'ラド#ミ', symbol: 'A', color: '#84CC16', notes: ['A3', 'C#4', 'E4'], abc: '[A,^CE]' },
      { id: 'refasharpara', name: 'レファ#ラ', symbol: 'D', color: '#F4A460', notes: ['D4', 'F#4', 'A4'], abc: '[D^FA]' },
      { id: 'misosharpshi', name: 'ミソ#シ', symbol: 'E', color: '#DDA0DD', notes: ['E4', 'G#4', 'B4'], abc: '[E^GB]' },
      { id: 'shiflatrefa', name: 'シ♭レファ', symbol: 'B♭', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'], abc: '[_B,DF]' },
      { id: 'miflatshiblat', name: 'ミ♭ソシ♭', symbol: 'E♭', color: '#06B6D4', notes: ['Eb4', 'G4', 'Bb4'], abc: '[_EG_B]' }
    ]
  }
])

const currentChord = ref(null)
const isSamplerLoaded = ref(false)
const selectedInstrument = ref('yamaha') // 'yamaha' | 'steinway' | 'xylophone'
const activeLevelIndex = ref(0)

let yamahaSampler = null
let steinwaySampler = null
let xylophoneSampler = null
let rainDrumSampler = null
let violinSampler = null
let fluteSampler = null
let guitarSampler = null

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

onMounted(() => {
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

  xylophoneSampler = new Tone.Sampler({
    urls: XYLOPHONE_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/xylophone/",
    onload: () => {
      if (selectedInstrument.value === 'xylophone') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Xylophone loading error:", err)
  }).toDestination()

  rainDrumSampler = new Tone.Sampler({
    urls: RAIN_DRUM_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
    volume: 5,
    onload: () => {
      if (selectedInstrument.value === 'raindrum') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Rain Drum loading error:", err)
  }).toDestination()

  violinSampler = new Tone.Sampler({
    urls: VIOLIN_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/violin/",
    onload: () => {
      if (selectedInstrument.value === 'violin') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Violin loading error:", err)
  }).toDestination()

  fluteSampler = new Tone.Sampler({
    urls: FLUTE_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/flute/",
    onload: () => {
      if (selectedInstrument.value === 'flute') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Flute loading error:", err)
  }).toDestination()

  guitarSampler = new Tone.Sampler({
    urls: GUITAR_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
    onload: () => {
      if (selectedInstrument.value === 'guitar') isSamplerLoaded.value = true
    },
    onerror: (err) => console.error("Guitar loading error:", err)
  }).toDestination()
})

const renderScore = (abc) => {
  abcjs.renderAbc('chord-score', `L:1/4\nK:C\n${abc}`, {
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
  else if (selectedInstrument.value === 'xylophone') currentSampler = xylophoneSampler
  else if (selectedInstrument.value === 'raindrum') currentSampler = rainDrumSampler
  else if (selectedInstrument.value === 'violin') currentSampler = violinSampler
  else if (selectedInstrument.value === 'flute') currentSampler = fluteSampler
  else if (selectedInstrument.value === 'guitar') currentSampler = guitarSampler

  if (currentSampler && currentSampler.loaded) {
    currentSampler.triggerAttackRelease(notes, '2n')
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
  else if (instrument === 'xylophone') targetSampler = xylophoneSampler
  else if (instrument === 'raindrum') targetSampler = rainDrumSampler
  else if (instrument === 'violin') targetSampler = violinSampler
  else if (instrument === 'flute') targetSampler = fluteSampler
  else if (instrument === 'guitar') targetSampler = guitarSampler

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
    case 'steinway': return 'Grand Piano: Steinway B'
    case 'xylophone': return 'Xylophone'
    case 'raindrum': return 'Rain Drum'
    case 'violin': return 'Violin'
    case 'flute': return 'Flute'
    case 'guitar': return 'Guitar (Nylon)'
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
  const normalizedActive = currentChord.value.notes.map(n => n.replace('♭', 'b'))
  // Removing octave check to highlight keys across all octaves if needed, or keeping it strict
  // Here we normalize note names
  return normalizedActive.some(n => {
    // Basic enharmonic check
    if (n === 'Bb3' && note === 'A#3') return true
    if (n === 'Eb4' && note === 'D#4') return true
    return n === note
  })
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
</script>

<template>
  <div 
    :style="{ 
      '--chord-color': currentChord?.color || '#EF4444',
      backgroundColor: currentChord ? currentChord.color + '4D' : 'white'
    }" 
    class="flex flex-col h-[100dvh] max-w-md mx-auto shadow-2xl relative transition-colors duration-500 overflow-hidden bg-white"
  >
    <!-- Header -->
    <header class="pt-10 pb-6 px-4 text-center shrink-0">
      <div class="flex flex-col items-center">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-16 w-auto object-contain" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-8 overflow-y-auto">
      <!-- Score Visualization -->
      <section class="flex flex-col items-center mb-10 text-center">
        <div class="w-full max-w-[150px] max-h-[400px] bg-gray-50 rounded-3xl p-4 flex flex-col items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
          <div v-show="currentChord" id="chord-score" class="w-full flex justify-center items-center"></div>
        </div>
      </section>

      <!-- Keyboard Visualization -->
      <section class="flex flex-col items-center mb-10">
        <div class="w-full max-w-sm px-4">
          <div class="relative flex justify-center h-24 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
            <!-- White Keys -->
            <div 
              v-for="note in whiteKeys" 
              :key="note"
              class="relative flex-grow border-x-[0.5px] border-gray-200 first:border-l-0 last:border-r-0 rounded-b-sm transition-colors duration-300"
              :class="[isNoteActive(note) ? '' : 'bg-white']"
              :style="isNoteActive(note) ? { backgroundColor: currentChord?.color } : {}"
            >
              <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] text-gray-300 font-bold uppercase">{{ note.replace(/\d/, '') }}</span>
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
          Level {{ index + 1 }}
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
              v-for="chord in levels[activeLevelIndex].chords" 
              :key="chord.id"
              @click="toggleChord(chord)"
              class="flex items-center p-2.5 border-2 rounded-xl cursor-pointer transition-all duration-300"
              :class="[
                currentChord?.id === chord.id 
                  ? 'shadow-md border-transparent text-white' 
                  : 'border-gray-50 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              ]"
              :style="currentChord?.id === chord.id ? { backgroundColor: chord.color } : {}"
            >
              <div 
                class="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0 border border-white/20" 
                :style="{ backgroundColor: chord.color }"
                v-show="currentChord?.id !== chord.id"
              ></div>
              <div class="flex items-baseline space-x-1 overflow-hidden">
                <span class="font-bold text-base leading-none truncate">{{ chord.name }}</span>
                <span class="text-[9px] font-medium opacity-60">({{ chord.symbol }})</span>
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
              @click="selectInstrument('steinway')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'steinway' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Steinway B
            </button>
            <button 
              @click="selectInstrument('xylophone')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'xylophone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Xylophone
            </button>
            <button 
              @click="selectInstrument('raindrum')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'raindrum' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Rain Drum
            </button>
          </div>
          
          <div class="flex bg-gray-100 p-1 rounded-xl mb-4 border border-gray-200">
             <button 
              @click="selectInstrument('violin')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'violin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Violin
            </button>
             <button 
              @click="selectInstrument('flute')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'flute' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Flute
            </button>
             <button 
              @click="selectInstrument('guitar')"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedInstrument === 'guitar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Guitar
            </button>
          </div>

          <div class="inline-flex items-center bg-gray-50 border border-gray-100 rounded-full pl-3 pr-3 gap-2 py-1 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" :class="{ 'animate-pulse': isSamplerLoaded }"></span>
            <span class="text-[9px] font-bold text-gray-500 tracking-wider">
               {{ 
                  selectedInstrument === 'raindrum' ? '🥁' : 
                  selectedInstrument === 'xylophone' ? '🪵' : 
                  selectedInstrument === 'violin' ? '🎻' : 
                  selectedInstrument === 'flute' ? '🪈' : 
                  selectedInstrument === 'guitar' ? '🎸' : 
                  '🎹' 
               }} {{ getInstrumentName(selectedInstrument) }}
            </span>
          </div>
        </section>
      </div>

      <!-- Footer Links -->
      <div class="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center space-y-4">
        <router-link to="/method" class="text-xs text-gray-400 hover:text-gray-600 font-medium">トレーニング方法</router-link>
        <router-link to="/about" class="text-xs text-gray-400 hover:text-gray-600 font-medium">サービス概要</router-link>
        <router-link to="/company" class="text-xs text-gray-400 hover:text-gray-600 font-medium">運営会社情報</router-link>
        <footer class="text-center text-gray-300 text-[10px] pt-4 pb-8">
          &copy; 2026 Akatsuki Inc.
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
#chord-score :deep(.abcjs-highlight),
#chord-score :deep(.abcjs-note.abcjs-clicked) {
  fill: var(--chord-color) !important;
}
#chord-score :deep(svg [fill="red"]),
#chord-score :deep(svg [fill="#f00"]),
#chord-score :deep(svg [fill="#ff0000"]),
#chord-score :deep(svg [stroke="red"]),
#chord-score :deep(svg [stroke="#f00"]),
#chord-score :deep(svg [stroke="#ff0000"]) {
  fill: var(--chord-color) !important;
  stroke: var(--chord-color) !important;
}
</style>
