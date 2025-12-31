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

const currentChord = ref(null)
const isSamplerLoaded = ref(false)

let sampler = null

// Yamaha C5 samples from a reliable CDN
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
  // Sampler for Yamaha C5 sound
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
    scale: 1.1,
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

const startTraining = () => {
  console.log('Starting training')
}
</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-500 flex flex-col max-w-md mx-auto relative overflow-hidden"
    :style="{ backgroundColor: currentChord ? `${currentChord.color}15` : 'white' }"
  >
    <!-- Screen Overlay -->
    <div 
      class="absolute inset-0 pointer-events-none transition-opacity duration-300"
      :style="{ backgroundColor: currentChord?.color, opacity: currentChord ? 0.05 : 0 }"
    ></div>

    <div class="relative z-10 flex flex-col flex-grow">
      <!-- Header -->
      <header class="pt-12 pb-8 px-4 text-center">
        <h1 class="flex flex-col items-center">
          <span class="text-lg font-medium text-blue-500 tracking-[0.2em] mb-1">いろおと</span>
          <span class="text-3xl font-bold text-gray-900 tracking-tight">絶対音感トレーニング</span>
        </h1>
      </header>

      <!-- Main Content -->
      <main class="flex-grow px-4 pb-12 overflow-y-auto">
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
        <div class="space-y-6 pb-8">
          <!-- Current Sound Indicator -->
          <section class="flex flex-col items-center">
            <div class="inline-flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-green-500 mr-2" :class="{ 'animate-pulse': isSamplerLoaded }"></span>
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engine: Yamaha C5 Grand Piano</span>
            </div>
            <p class="text-[9px] text-gray-400 mt-2">※音が鳴らない場合は端末のマナーモードを解除してください</p>
          </section>

          <!-- Score Visualization -->
          <section class="flex flex-col items-center">
            <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">譜面表示</h2>
            <div class="w-full bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[110px] border border-gray-100 shadow-inner overflow-hidden">
              <div v-show="currentChord" id="chord-score" class="w-full flex justify-center items-center overflow-hidden"></div>
              <p v-if="!currentChord" class="text-gray-400 text-sm italic">和音ボタンを押すと譜面が表示されます</p>
            </div>
            <p v-if="currentChord" class="mt-2 text-lg font-bold text-gray-700">
              {{ currentChord.name }} ({{ currentChord.symbol }})
            </p>
          </section>

        </div>

        <!-- Service Info & Company Info -->
        <div class="mt-8 space-y-12 pb-12 border-t border-gray-100 pt-12">
          <!-- Service Description -->
          <section>
            <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">サービス概要</h2>
            <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p class="text-gray-600 leading-relaxed text-sm">
                「いろおと 絶対音感トレーニング」は、ピアノの和音を聞いてその種類を当てることで、絶対音感を養うためのトレーニングツールです。
                多様な和音パターンと、高品質なグランドピアノ（Yamaha C5）の音源を使用し、日々の練習をサポートします。
              </p>
            </div>
          </section>

          <!-- Company Info -->
          <section>
            <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">運営会社情報</h2>
            <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <h3 class="text-lg font-bold text-gray-900 mb-2">株式会社暁</h3>
              <p class="text-gray-500 text-sm">Akatsuki Inc.</p>
              <div class="mt-4 pt-4 border-t border-gray-50 flex flex-col items-center space-y-2">
                <a href="https://akatsuki.works" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center">
                  公式サイト
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <footer class="text-center text-gray-400 text-[10px] pb-4">
            &copy; {{ new Date().getFullYear() }} Akatsuki Inc. All rights reserved.
          </footer>
        </div>
      </main>


    </div>
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
}
#chord-score svg {
  background: transparent !important;
}
</style>
