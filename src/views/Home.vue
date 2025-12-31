<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as Tone from 'tone'
import abcjs from 'abcjs'

const levels = ref([
  {
    name: 'Level 1: 基本の3和音',
    description: 'まずはここから。最も見分けやすい基本の響き。',
    chords: [
      { id: 'domiso', name: 'ドミソ', symbol: 'C', color: '#EF4444', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
      { id: 'dofara', name: 'ドファラ', symbol: 'F', color: '#EAB308', notes: ['F3', 'A3', 'C4'], abc: '[F,A,C]' },
      { id: 'shireso', name: 'シレソ', symbol: 'G', color: '#3B82F6', notes: ['G3', 'B3', 'D4'], abc: '[G,B,D]' }
    ]
  },
  {
    name: 'Level 2: 転回形に慣れる',
    description: '基本の和音をひっくり返した響き。少し難しくなります。',
    chords: [
      { id: 'radofa', name: 'ラドファ', symbol: 'F', color: '#1F2937', notes: ['F4', 'A4', 'C5'], abc: '[fac]' },
      { id: 'resoshi', name: 'レソシ', symbol: 'G', color: '#22C55E', notes: ['G4', 'B4', 'D5'], abc: '[gbd\']' },
      { id: 'misodo', name: 'ミソド', symbol: 'C', color: '#F97316', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
      { id: 'fadorado', name: 'ファラド', symbol: 'F', color: '#A855F7', notes: ['F4', 'A4', 'C5'], abc: '[fac]' },
      { id: 'sorushire', name: 'ソシレ', symbol: 'G', color: '#EC4899', notes: ['G4', 'B4', 'D5'], abc: '[gbd\']' },
      { id: 'sodomi', name: 'ソドミ', symbol: 'C', color: '#A3744D', notes: ['G3', 'C4', 'E4'], abc: '[G,CE]' }
    ]
  },
  {
    name: 'Level 3: 変化のある和音',
    description: 'シャープやフラットを含む、より複雑な色の響き。',
    chords: [
      { id: 'radosharpmi', name: 'ラド#ミ', symbol: 'A', color: '#84CC16', notes: ['A3', 'C#4', 'E4'], abc: '[A,^CE]' },
      { id: 'refasharpara', name: 'レファ#ラ', symbol: 'D', color: '#F4A460', notes: ['D4', 'F#4', 'A4'], abc: '[D^FA]' },
      { id: 'misosharpshi', name: 'ミソ#シ', symbol: 'E', color: '#DDA0DD', notes: ['E4', 'G#4', 'B4'], abc: '[E^G B]' },
      { id: 'shiflatrefa', name: 'シ♭レファ', symbol: 'B♭', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'], abc: '[_B,DF]' },
      { id: 'miflatshiblat', name: 'ミ♭ソシ♭', symbol: 'E♭', color: '#06B6D4', notes: ['Eb4', 'G4', 'Bb4'], abc: '[_E G _B]' }
    ]
  }
])

const currentChord = ref(null)
const isSamplerLoaded = ref(false)
const selectedPiano = ref('yamaha') // 'yamaha' or 'steinway'
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

// Steinway B (nbrosowsky) mapping - using standard note names as expected by that repo
const STEINWAY_B_SAMPLES = {
  "A0": "A0.mp3", "C1": "C1.mp3", "C#1": "Cs1.mp3", "D1": "D1.mp3", "D#1": "Ds1.mp3", "E1": "E1.mp3", "F1": "F1.mp3", "F#1": "Fs1.mp3", "G1": "G1.mp3", "G#1": "Gs1.mp3", "A1": "A1.mp3", "A#1": "As1.mp3", "B1": "B1.mp3",
  "C2": "C2.mp3", "C#2": "Cs2.mp3", "D2": "D2.mp3", "D#2": "Ds2.mp3", "E2": "E2.mp3", "F2": "F2.mp3", "F#2": "Fs2.mp3", "G2": "G2.mp3", "G#2": "Gs2.mp3", "A2": "A2.mp3", "A#2": "As2.mp3", "B2": "B2.mp3",
  "C3": "C3.mp3", "C#3": "Cs3.mp3", "D3": "D3.mp3", "D#3": "Ds3.mp3", "E3": "E3.mp3", "F3": "F3.mp3", "F#3": "Fs3.mp3", "G3": "G3.mp3", "G#3": "Gs3.mp3", "A3": "A3.mp3", "A#3": "As3.mp3", "B3": "B3.mp3",
  "C4": "C4.mp3", "C#4": "Cs4.mp3", "D4": "D4.mp3", "D#4": "Ds4.mp3", "E4": "E4.mp3", "F4": "F4.mp3", "F#4": "Fs4.mp3", "G4": "G4.mp3", "G#4": "Gs4.mp3", "A4": "A4.mp3", "A#4": "As4.mp3", "B4": "B4.mp3",
  "C5": "C5.mp3", "C#5": "Cs5.mp3", "D5": "D5.mp3", "D#5": "Ds5.mp3", "E5": "E5.mp3", "F5": "F5.mp3", "F#5": "Fs5.mp3", "G5": "G5.mp3", "G#5": "Gs5.mp3", "A5": "A5.mp3", "A#5": "As5.mp3", "B5": "B5.mp3",
  "C6": "C6.mp3", "C#6": "Cs6.mp3", "D6": "D6.mp3", "D#6": "Ds6.mp3", "E6": "E6.mp3", "F6": "F6.mp3", "F#6": "Fs6.mp3", "G6": "G6.mp3", "G#6": "Gs6.mp3", "A6": "A6.mp3", "A#6": "As6.mp3", "B6": "B6.mp3",
  "C7": "C7.mp3", "C#7": "Cs7.mp3", "D7": "D7.mp3", "D#7": "Ds7.mp3", "E7": "E7.mp3", "F7": "F7.mp3", "F#7": "Fs7.mp3", "G7": "G7.mp3", "G#7": "Gs7.mp3", "A7": "A7.mp3", "A#7": "As7.mp3", "B7": "B7.mp3",
  "C8": "C8.mp3"
}

onMounted(() => {
  yamahaSampler = new Tone.Sampler({
    urls: YAMAHA_C5_SAMPLES,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
      if (selectedPiano.value === 'yamaha') isSamplerLoaded.value = true
    }
  }).toDestination()

  // Use a more robust CDN source for Steinway MP3s
  steinwaySampler = new Tone.Sampler({
    urls: STEINWAY_B_SAMPLES,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/",
    onload: () => {
      if (selectedPiano.value === 'steinway') isSamplerLoaded.value = true
    },
    onerror: (err) => {
      console.error("Steinway loading error:", err)
    }
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
  
  const currentSampler = selectedPiano.value === 'yamaha' ? yamahaSampler : steinwaySampler
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
  return normalizedActive.some(n => {
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
    class="flex flex-col min-h-screen max-w-md mx-auto shadow-2xl relative transition-colors duration-500 overflow-hidden bg-white"
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
          <!-- Piano Selector -->
          <div class="flex bg-gray-100 p-1 rounded-xl mb-4 border border-gray-200">
            <button 
              @click="selectedPiano = 'yamaha'"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedPiano === 'yamaha' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Yamaha C5
            </button>
            <button 
              @click="selectedPiano = 'steinway'"
              class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              :class="selectedPiano === 'steinway' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'"
            >
              Steinway B
            </button>
          </div>

          <div class="inline-flex items-center bg-gray-50 border border-gray-100 rounded-full pl-3 pr-1 gap-2 py-1 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" :class="{ 'animate-pulse': isSamplerLoaded }"></span>
            <span class="text-[9px] font-bold text-gray-500 tracking-wider">🎹 {{ selectedPiano === 'yamaha' ? 'Grand Piano: Yamaha C5' : 'Grand Piano: Steinway B' }}</span>
            <button 
              @click="playChord(['C4', 'E4', 'G4'])" 
              class="bg-white border border-gray-100 text-gray-500 text-[8px] px-2.5 py-0.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all font-bold"
            >
              音テスト
            </button>
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
