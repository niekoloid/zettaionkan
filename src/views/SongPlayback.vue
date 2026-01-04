
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { SONGS } from '../constants/songs'
import { ChordDefinitions } from '../constants/chords'
import { useAudio } from '../composables/useAudio'
import { useAuth } from '../composables/useAuth'
import AppHeader from '../components/AppHeader.vue'

const { samplers, selectedInstrument, isSamplerLoaded, loadSampler } = useAudio()
const { userTier } = useAuth()

const selectedSong = ref(SONGS[0])
const isPlaying = ref(false)
const currentChordIndex = ref(-1)
const playbackPart = ref(null)
const playbackMode = ref('chord') // 'chord' | 'single'
const singleNotePosition = ref('high') // 'low' | 'mid' | 'high'

const CHORD_GROUPS = [
  ['domiso', 'misodo', 'sodomi'],
  ['farado', 'radofa', 'dofara'],
  ['soshire', 'shireso', 'resoshi'],
  ['lacismi', 'cismila', 'milacis'],
  ['refisla', 'fislare', 'larefis'],
  ['migissi', 'gissimi', 'simigis'],
  ['berefa', 'refabe', 'fabere'],
  ['essobe', 'sobees', 'beesso']
]

const getTransformedChord = (baseChord, position) => {
  if (!baseChord) return null
  if (position === 'low') return baseChord
  
  const group = CHORD_GROUPS.find(g => g.includes(baseChord.id))
  if (!group) return baseChord
  
  const i = group.indexOf(baseChord.id)
  let targetId = baseChord.id
  if (position === 'mid') {
    targetId = group[(i + 2) % 3]
  } else if (position === 'high') {
    targetId = group[(i + 1) % 3]
  }
  
  // Find the chord object by ID in ChordDefinitions
  const chordKey = Object.keys(ChordDefinitions).find(k => ChordDefinitions[k].id === targetId)
  return ChordDefinitions[chordKey] || baseChord
}

const speakColor = (text) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = 1.2 // Slightly faster for music
  window.speechSynthesis.speak(utterance)
}

const currentChord = computed(() => {
  if (currentChordIndex.value === -1) return null
  const base = selectedSong.value.sequence[currentChordIndex.value]?.chord
  if (!base) return null
  return getTransformedChord(base, singleNotePosition.value)
})

const stopPlayback = () => {
  if (playbackPart.value) {
    playbackPart.value.stop()
    playbackPart.value.dispose()
    playbackPart.value = null
  }
  Tone.Transport.stop()
  Tone.Transport.cancel()
  if (window.speechSynthesis) window.speechSynthesis.cancel()
  isPlaying.value = false
  currentChordIndex.value = -1
}

const startPlayback = async () => {
  if (isPlaying.value) {
    stopPlayback()
    return
  }

  if (Tone.context.state !== 'running') {
    await Tone.start()
  }

  // Ensure sampler is loaded
  if (!samplers[selectedInstrument.value]) {
    await loadSampler(selectedInstrument.value)
  }
  
  const s = samplers[selectedInstrument.value]
  if (!s) return

  isPlaying.value = true
  Tone.Transport.bpm.value = selectedSong.value.bpm

  const events = []
  let totalTime = 0
  
  selectedSong.value.sequence.forEach((item, index) => {
    events.push({
      time: totalTime,
      chord: item.chord,
      index: index,
      duration: item.duration
    })
    totalTime += Tone.Time(item.duration).toSeconds()
  })

  playbackPart.value = new Tone.Part((time, event) => {
    currentChordIndex.value = event.index
    if (event.chord) {
      const transformed = getTransformedChord(event.chord, singleNotePosition.value)
      const noteIndex = singleNotePosition.value === 'high' ? 2 : (singleNotePosition.value === 'mid' ? 1 : 0)
      
      const notesToPlay = playbackMode.value === 'single' 
        ? [transformed.notes[noteIndex]] 
        : transformed.notes
      
      try {
        s.triggerAttackRelease(notesToPlay, event.duration, time)
      } catch (err) {
        console.error('Playback error:', err)
      }

      if (playbackMode.value === 'single' && isVoiceEnabled.value) {
        Tone.Draw.schedule(() => {
          speakColor(transformed.colorName)
        }, time)
      }
    }
  }, events).start(0)

  Tone.Transport.start()
  
  // Schedule the stop exactly at the end of the sequence
  Tone.Transport.schedule(() => {
    Tone.Draw.schedule(() => {
      stopPlayback()
    }, Tone.now())
  }, totalTime + 0.5)
}

const selectSong = (song) => {
  stopPlayback()
  selectedSong.value = song
}

onMounted(() => {
  // Sampler should be preloaded by App.vue, but we ensure it's selected
})

onUnmounted(() => {
  stopPlayback()
})

watch(selectedSong, () => {
  stopPlayback()
})
const isLightColor = (hex) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180
}
</script>

<template>
  <div 
    class="min-h-screen transition-all duration-500 font-['Noto_Sans_JP'] antialiased"
    :style="{ backgroundColor: currentChord ? currentChord.color : 'white' }"
  >
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
      <AppHeader :transparent="!!currentChord" showBack />

      <main class="flex-grow px-6 py-8 flex flex-col items-center">
        <!-- Title & Intro -->
        <div class="text-center mb-10 w-full transition-colors duration-500" :class="currentChord && !isLightColor(currentChord.color) ? 'text-white' : 'text-gray-900'">
          <h1 class="text-xs font-bold uppercase tracking-[0.2em] mb-2 font-black" :class="currentChord && !isLightColor(currentChord.color) ? 'text-white/80' : 'text-blue-500'">Song Playback</h1>
          <h2 class="text-2xl font-black leading-tight">和音で聴く名曲</h2>
          <p class="mt-2 text-[11px] font-bold" :class="currentChord && !isLightColor(currentChord.color) ? 'text-white/60' : 'text-gray-400'">14色の音色で奏でるクラシックの世界</p>
        </div>

        <!-- Song Selector -->
        <div class="w-full flex flex-wrap justify-center gap-2 mb-8 px-2">
          <button 
            v-for="song in SONGS" 
            :key="song.id"
            @click="selectSong(song)"
            class="px-4 py-2 rounded-full text-[11px] font-black transition-all whitespace-nowrap"
            :class="selectedSong.id === song.id 
              ? 'bg-gray-900 text-white shadow-lg scale-105' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 active:bg-gray-200'"
          >
            {{ song.title }}
          </button>
        </div>

        <!-- Visualizer Area -->
        <div class="flex-grow w-full flex flex-col items-center justify-center relative">
          <!-- Background Glow -->
          <transition name="fade">
            <div 
              v-if="currentChord" 
              class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 blur-[80px] opacity-20 -z-10 transition-all duration-300"
              :style="{ backgroundColor: currentChord.color }"
            ></div>
          </transition>

          <!-- Main Chord Card -->
          <div 
            class="w-full aspect-square max-w-[280px] rounded-[48px] shadow-2xl transition-all duration-300 flex flex-col items-center justify-center relative bg-white border border-gray-100"
            :class="{ 'scale-105': isPlaying && currentChord }"
          >
            <div 
              class="w-40 h-40 rounded-full transition-all duration-300 shadow-lg"
              :style="{ 
                backgroundColor: currentChord ? currentChord.color : '#f3f4f6',
                transform: isPlaying && currentChord ? 'scale(1.1)' : 'scale(1)'
              }"
            ></div>
            
            <div class="mt-8 text-center h-12">
              <template v-if="currentChord">
                <span class="text-lg font-black text-gray-900 block leading-tight">{{ currentChord.nameIt }}</span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ currentChord.colorName }}</span>
              </template>
              <template v-else-if="isPlaying">
                <span class="text-lg font-black text-gray-200">...</span>
              </template>
              <template v-else>
                <span class="text-sm font-bold text-gray-300">再生ボタンを押してください</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="mt-8 w-full max-w-xs flex flex-col items-center space-y-8 pb-10">
          
          <!-- Mode Switch -->
          <div class="flex bg-gray-100 p-1 rounded-full w-48 shadow-inner">
            <button 
              @click="playbackMode = 'chord'"
              class="flex-1 py-2 rounded-full text-[10px] font-black transition-all"
              :class="playbackMode === 'chord' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-500'"
            >
              和音
            </button>
            <button 
              @click="playbackMode = 'single'"
              class="flex-1 py-2 rounded-full text-[10px] font-black transition-all"
              :class="playbackMode === 'single' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-500'"
            >
              単音
            </button>
          </div>

          <!-- Note Position Selector (Only for Single Note) -->
          <div v-if="playbackMode === 'single'" class="flex flex-col items-center space-y-3">
            <div class="flex bg-gray-50 p-1 rounded-xl border border-gray-100 scale-90">
              <button 
                v-for="pos in [{k:'low', l:'低音'}, {k:'mid', l:'中音'}, {k:'high', l:'高音'}]" 
                :key="pos.k"
                @click="singleNotePosition = pos.k"
                class="px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                :class="singleNotePosition === pos.k ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-500'"
              >
                {{ pos.l }}
              </button>
            </div>
          </div>

          <!-- Voice Reading Toggle (Only for Single Note) -->
          <div 
            v-if="playbackMode === 'single'"
            @click="isVoiceEnabled = !isVoiceEnabled"
            class="flex items-center space-x-3 cursor-pointer group"
          >
            <div 
              class="w-8 h-4 bg-gray-200 rounded-full relative transition-colors duration-200"
              :class="{ 'bg-gray-900': isVoiceEnabled }"
            >
              <div 
                class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200"
                :class="{ 'translate-x-4': isVoiceEnabled }"
              ></div>
            </div>
            <span class="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">色を読み上げる</span>
          </div>

          <!-- Main Play Button -->
          <button 
            @click="startPlayback"
            class="w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 group"
            :class="[
              currentChord && !isLightColor(currentChord.color) 
                ? 'bg-white text-gray-900' 
                : 'bg-gray-900 text-white'
            ]"
          >
            <transition name="fade" mode="out-in">
              <svg v-if="isPlaying" key="stop" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <svg v-else key="play" class="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </transition>
          </button>

          <!-- Info Box -->
          <div class="bg-blue-50/50 rounded-2xl p-4 w-full border border-blue-100/50">
            <div class="flex items-center space-x-3">
              <span class="text-xl">💡</span>
              <p class="text-[10px] text-blue-900/60 font-bold leading-relaxed">
                覚えた和音が実際の曲の中でどう使われているかを感じてみましょう。
              </p>
            </div>
          </div>
        </div>
      </main>
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
</style>
