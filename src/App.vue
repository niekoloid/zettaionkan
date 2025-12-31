<script setup>
import { ref, onMounted } from 'vue'
import * as Tone from 'tone'

const chords = ref([
  { id: 'domiso', name: 'ドミソ', symbol: 'C', color: '#EF4444', notes: ['C4', 'E4', 'G4'] },
  { id: 'dofara', name: 'ドファラ', symbol: 'F', color: '#EAB308', notes: ['F3', 'A3', 'C4'] },
  { id: 'shireso', name: 'シレソ', symbol: 'G', color: '#3B82F6', notes: ['G3', 'B3', 'D4'] },
  { id: 'radofa', name: 'ラドファ', symbol: 'F', color: '#1F2937', notes: ['F4', 'A4', 'C5'] },
  { id: 'resoshi', name: 'レソシ', symbol: 'G', color: '#22C55E', notes: ['G4', 'B4', 'D5'] },
  { id: 'misodo', name: 'ミソド', symbol: 'C', color: '#F97316', notes: ['C4', 'E4', 'G4'] },
  { id: 'fadorado', name: 'ファラド', symbol: 'F', color: '#A855F7', notes: ['F4', 'A4', 'C5'] },
  { id: 'sorushire', name: 'ソシレ', symbol: 'G', color: '#EC4899', notes: ['G4', 'B4', 'D5'] },
  { id: 'sodomi', name: 'ソドミ', symbol: 'C', color: '#A3744D', notes: ['G3', 'C4', 'E4'] },
  { id: 'radosharpmi', name: 'ラド#ミ', symbol: 'A', color: '#84CC16', notes: ['A3', 'C#4', 'E4'] },
  { id: 'refasharpara', name: 'レファ#ラ', symbol: 'D', color: '#F4A460', notes: ['D4', 'F#4', 'A4'] },
  { id: 'misosharpshi', name: 'ミソ#シ', symbol: 'E', color: '#DDA0DD', notes: ['E4', 'G#4', 'B4'] },
  { id: 'shiflatrefa', name: 'シ♭レファ', symbol: 'B♭', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'] },
  { id: 'miflatshiblat', name: 'ミ♭ソシ♭', symbol: 'E♭', color: '#06B6D4', notes: ['Eb4', 'G4', 'Bb4'] },
])

const selectedChords = ref(['domiso', 'dofara', 'shireso', 'radofa', 'resoshi', 'misodo', 'fadorado', 'sorushire', 'sodomi', 'radosharpmi', 'refasharpara', 'misosharpshi', 'shiflatrefa', 'miflatshiblat'])
const trialCount = ref(15)
const soundEnabled = ref(true)

let synth = null

onMounted(() => {
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle'
    },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  }).toDestination()
})

const playChord = (notes) => {
  if (!soundEnabled.value || !synth) return
  
  if (Tone.context.state !== 'running') {
    Tone.start()
  }

  synth.triggerAttackRelease(notes, '2n')
}

const toggleChord = (chord) => {
  const id = chord.id
  playChord(chord.notes)

  if (selectedChords.value.includes(id)) {
    if (selectedChords.value.length > 1) {
      selectedChords.value = selectedChords.value.filter(c => c !== id)
    }
  } else {
    selectedChords.value.push(id)
  }
}

const incrementTrials = () => {
  trialCount.value += 5
}

const decrementTrials = () => {
  if (trialCount.value > 5) {
    trialCount.value -= 5
  }
}

const startTraining = () => {
  console.log('Starting training with:', {
    selectedChords: selectedChords.value,
    trialCount: trialCount.value,
    soundEnabled: soundEnabled.value
  })
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
    <main class="flex-grow px-4 pb-24 overflow-y-auto">
      <!-- Chord Selection -->
      <div class="grid grid-cols-2 gap-3 mb-10">
        <div 
          v-for="chord in chords" 
          :key="chord.id"
          @click="toggleChord(chord)"
          :class="[
            'flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200',
            selectedChords.includes(chord.id) 
              ? 'border-blue-500 bg-blue-50 text-blue-900' 
              : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
          ]"
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
      <div class="space-y-8">
        <!-- Trial Count -->
        <section>
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">問題数</h2>
          <div class="flex items-center justify-between">
            <button 
              @click="decrementTrials"
              class="w-12 h-12 flex items-center justify-center rounded-full border border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" />
              </svg>
            </button>
            <span class="text-2xl font-bold text-gray-900">{{ trialCount }}問</span>
            <button 
              @click="incrementTrials"
              class="w-12 h-12 flex items-center justify-center rounded-full border border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </section>

        <!-- Sound Toggle -->
        <section>
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">音の有無</h2>
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
      </div>
    </main>

    <!-- Footer Action -->
    <footer class="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <button 
        @click="startTraining"
        class="pointer-events-auto w-full bg-gray-900 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-gray-200 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 group"
      >
        <span class="text-xl tracking-widest">トレーニング開始</span>
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
</style>
