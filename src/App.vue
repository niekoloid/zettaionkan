<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as Tone from 'tone'
import abcjs from 'abcjs'

const chords = ref([
  { id: 'domiso', name: 'ドミソ', symbol: 'C', color: '#EF4444', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
  { id: 'dofara', name: 'ドファラ', symbol: 'F', color: '#EAB308', notes: ['F3', 'A3', 'C4'], abc: '[F,A,C]' },
  { id: 'shireso', name: 'シレソ', symbol: 'G', color: '#3B82F6', notes: ['G3', 'B3', 'D4'], abc: '[G,B,D]' },
  { id: 'radofa', name: 'ラドファ', symbol: 'F', color: '#1F2937', notes: ['F4', 'A4', 'C5'], abc: '[fac]' },
  { id: 'resoshi', name: 'レソシ', symbol: 'G', color: '#22C55E', notes: ['G4', 'B4', 'D5'], abc: '[gbd\']' },
  { id: 'misodo', name: 'ミソド', symbol: 'C', color: '#F97316', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
  { id: 'fadorado', name: 'ファラド', symbol: 'F', color: '#A855F7', notes: ['F4', 'A4', 'C5'], abc: '[fac]' },
  { id: 'sorushire', name: 'ソシレ', symbol: 'G', color: '#EC4899', notes: ['G4', 'B4', 'D5'], abc: '[gbd\']' },
  { id: 'sodomi', name: 'ソドミ', symbol: 'C', color: '#A3744D', notes: ['G3', 'C4', 'E4'], abc: '[G,CE]' },
  { id: 'radosharpmi', name: 'ラド#ミ', symbol: 'A', color: '#84CC16', notes: ['A3', 'C#4', 'E4'], abc: '[A,^CE]' },
  { id: 'refasharpara', name: 'レファ#ラ', symbol: 'D', color: '#F4A460', notes: ['D4', 'F#4', 'A4'], abc: '[D^FA]' },
  { id: 'misosharpshi', name: 'ミソ#シ', symbol: 'E', color: '#DDA0DD', notes: ['E4', 'G#4', 'B4'], abc: '[E^G B]' },
  { id: 'shiflatrefa', name: 'シ♭レファ', symbol: 'B♭', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'], abc: '[_B,DF]' },
  { id: 'miflatshiblat', name: 'ミ♭ソシ♭', symbol: 'E♭', color: '#06B6D4', notes: ['Eb4', 'G4', 'Bb4'], abc: '[_E G _B]' },
])

const soundEnabled = ref(true)
const currentChord = ref(null)

let synth = null

onMounted(() => {
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  }).toDestination()
})

const renderScore = (abc) => {
  abcjs.renderAbc('chord-score', `L:1/4\nK:C\n| ${abc} |`, {
    responsive: 'resize',
    scale: 1.5,
    paddingtop: 0,
    paddingbottom: 0,
    staffwidth: 200,
    add_classes: true
  })
}

const playChord = (notes) => {
  if (!soundEnabled.value || !synth) return
  if (Tone.context.state !== 'running') Tone.start()
  synth.triggerAttackRelease(notes, '2n')
}

const toggleChord = async (chord) => {
  playChord(chord.notes)
  currentChord.ref = chord
  currentChord.value = chord
  await nextTick()
  renderScore(chord.abc)
}

const startTraining = () => {
  console.log('Starting training')
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 text-center">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
        絶対音感トレーニング
      </h1>
    </header>

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-32 overflow-y-auto">
      <!-- Chord Selection -->
      <div class="grid grid-cols-2 gap-3 mb-10">
        <div 
          v-for="chord in chords" 
          :key="chord.id"
          @click="toggleChord(chord)"
          class="flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100"
        >
          <div 
            class="w-3 h-3 rounded-full mr-3 shrink-0" 
            :style="{ backgroundColor: chord.color }"
          ></div>
          <div class="flex items-baseline space-x-1 overflow-hidden">
            <span class="font-bold text-xl leading-none truncate">{{ chord.name }}</span>
            <span class="text-sm font-medium opacity-60">({{ chord.symbol }})</span>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="space-y-8 pb-12">
        <!-- Sound Toggle -->
        <section>
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">音の有無</h2>
          <div class="flex bg-gray-100 p-1 rounded-xl">
            <button 
              @click="soundEnabled = true"
              :class="[
                'flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-bold transition-all duration-200',
                soundEnabled ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <span class="mr-2">🔊</span> 音あり
            </button>
            <button 
              @click="soundEnabled = false"
              :class="[
                'flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-bold transition-all duration-200',
                !soundEnabled ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <span class="mr-2">🔇</span> 音なし
            </button>
          </div>
        </section>

        <!-- Score Visualization -->
        <section class="flex flex-col items-center">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">譜面表示</h2>
          <div class="w-full bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] border border-gray-100 shadow-inner">
            <div v-show="currentChord" id="chord-score" class="w-full flex justify-center items-center overflow-hidden"></div>
            <p v-if="!currentChord" class="text-gray-400 text-sm italic">和音ボタンを押すと譜面が表示されます</p>
          </div>
          <p v-if="currentChord" class="mt-2 text-lg font-bold text-gray-700">
            {{ currentChord.name }} ({{ currentChord.symbol }})
          </p>
        </section>
      </div>
    </main>

    <!-- Footer Action -->
    <footer class="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <button 
        @click="startTraining"
        class="pointer-events-auto w-full bg-gray-900 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-gray-200 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 group"
      >
        <span class="text-xl tracking-widest">記録開始</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </footer>
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
}
/* abcjs styling overrides */
#chord-score svg {
  background: transparent !important;
}
</style>
