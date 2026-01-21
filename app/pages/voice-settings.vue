<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChordDefinitions } from '~/constants/chords'
import VoiceRecorder from '~/components/voice/VoiceRecorder.vue'

useHead({
  title: '親の声の設定 - いろおと'
})

import { useVoiceSettings } from '~/composables/useVoiceSettings'
const { 
  availableVoices, 
  uploadVoice, 
  deleteVoice, 
  fetchAvailableVoices,
  fetchSettings,
  getVoiceUrl
} = useVoiceSettings()

const chords = [
  ChordDefinitions.DOMISO,
  ChordDefinitions.DOFARA,
  ChordDefinitions.SHIRESO,
  ChordDefinitions.RADOFA,
  ChordDefinitions.RESOSHI,
  ChordDefinitions.MISODO,
  ChordDefinitions.FARADO,
  ChordDefinitions.SOSHIRE,
  ChordDefinitions.SODOMI,
  ChordDefinitions.LA_CIS_MI,
  ChordDefinitions.RE_FIS_LA,
  ChordDefinitions.MI_GIS_SI,
  ChordDefinitions.BE_RE_FA,
  ChordDefinitions.ES_SO_BE,
]

const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref<string | null>(null)

const handleRecorded = async (colorName: string, blob: Blob) => {
  const success = await uploadVoice(colorName, blob)
  if (success) {
    // Optionally show a toast
  }
}

const playVoice = (colorName: string) => {
  const url = getVoiceUrl(colorName)
  if (url && audioPlayer.value) {
    audioPlayer.value.src = url
    audioPlayer.value.play()
    isPlaying.value = colorName
    audioPlayer.value.onended = () => {
      isPlaying.value = null
    }
  }
}

const removeVoice = async (colorName: string) => {
  if (confirm(`${colorName}の録音を削除しますか？`)) {
    await deleteVoice(colorName)
  }
}

onMounted(() => {
  fetchAvailableVoices()
  fetchSettings()
})
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
      <!-- Header -->
      <header class="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0">
        <NuxtLink to="/autoplay" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div class="absolute left-1/2 transform -translate-x-1/2">
           <span class="text-lg font-black text-gray-900">親の声の設定</span>
        </div>
        <div class="w-10"></div>
      </header>

      <main class="flex-grow px-6 pb-20 overflow-y-auto">
        <div class="mb-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
           <h3 class="text-indigo-900 font-bold mb-2 flex items-center">
             <span class="text-xl mr-2">🎙️</span>
             お子様に届ける「親の声」
           </h3>
           <p class="text-xs text-indigo-700 leading-relaxed">
             各色の名前をあなたの声で録音しましょう。録音された声は、自動再生（聞き流し）モードで読み上げ音声として使用できます。
           </p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="chord in chords" 
            :key="chord!.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <div class="flex items-center space-x-4">
              <div 
                class="w-10 h-10 rounded-full shadow-inner"
                :style="{ backgroundColor: chord!.color }"
              ></div>
              <div>
                <p class="text-sm font-black text-gray-900" v-html="chord!.colorName"></p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest" v-html="chord!.name"></p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <template v-if="availableVoices.has(chord!.colorName)">
                <button 
                  @click="playVoice(chord!.colorName)"
                  class="p-3 rounded-full bg-white border border-gray-100 hover:bg-gray-100 transition-colors shadow-sm"
                  :class="{ 'text-indigo-500 animate-pulse': isPlaying === chord!.colorName }"
                >
                  <svg v-if="isPlaying !== chord!.colorName" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  @click="removeVoice(chord!.colorName)"
                  class="p-3 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </template>
              
              <VoiceRecorder 
                v-else
                :colorName="chord!.colorName"
                :colorHex="chord!.color"
                @recorded="(blob: Blob) => handleRecorded(chord!.colorName, blob)"
              />
            </div>
          </div>
        </div>
      </main>

      <audio ref="audioPlayer" class="hidden"></audio>
    </div>
  </div>
</template>
