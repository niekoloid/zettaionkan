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

let sampler = null

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

onMounted(() => {
  sampler = new Tone.Sampler({
    urls: YAMAHA_C5_SAMPLES,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
      isSamplerLoaded.value = true
    }
  }).toDestination()
})

const renderScore = (abc) => {
  abcjs.renderAbc('chord-score', `L:1/4\nK:C\n${abc}`, {
    responsive: 'resize',
    scale: 1.3,
    paddingtop: 0,
    paddingbottom: 0,
    paddingleft: 0,
    paddingright: 0,
    staffwidth: 80,
    add_classes: true
  })
}

const playChord = (notes) => {
  if (Tone.context.state !== 'running') Tone.start()
  if (isSamplerLoaded.value) {
    sampler.triggerAttackRelease(notes, '2n')
  }
}

const toggleChord = async (chord) => {
  playChord(chord.notes)
  currentChord.value = chord
  await nextTick()
  renderScore(chord.abc)
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
      <section class="flex flex-col items-center mb-10">
        <h2 class="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">譜面表示</h2>
        <div class="w-full max-w-[125px] max-h-[125px] aspect-square bg-gray-50 rounded-3xl p-2 flex flex-col items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
          <div v-show="currentChord" id="chord-score" class="w-full flex justify-center items-center"></div>
          <p v-if="!currentChord" class="text-gray-300 text-[9px] italic font-medium">タップ</p>
        </div>
      </section>

      <!-- Level Groups -->
      <div class="space-y-12 mb-12">
        <section v-for="level in levels" :key="level.name" class="space-y-4">
          <div class="px-2">
            <h2 class="text-sm font-bold text-gray-800 flex items-center">
              <span class="w-1.5 h-4 bg-gray-900 rounded-full mr-2"></span>
              {{ level.name }}
            </h2>
            <p class="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{{ level.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div 
              v-for="chord in level.chords" 
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
          <div class="inline-flex items-center bg-gray-50 border border-gray-100 rounded-full pl-3 pr-1 gap-2 py-1 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" :class="{ 'animate-pulse': isSamplerLoaded }"></span>
            <span class="text-[9px] font-bold text-gray-500 tracking-wider">🎹 Grand Piano: Yamaha C5</span>
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
#chord-score :deep(.abcjs-highlight) {
  fill: var(--chord-color) !important;
}
#chord-score :deep(.abcjs-note.abcjs-clicked) {
  fill: var(--chord-color) !important;
}
#chord-score :deep(svg g path[fill="#f00"]),
#chord-score :deep(svg g path[fill="red"]) {
  fill: var(--chord-color) !important;
}
</style>
