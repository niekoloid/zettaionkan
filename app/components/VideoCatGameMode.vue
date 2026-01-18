<template>
  <div class="absolute inset-0 flex flex-col bg-black overflow-hidden font-['Noto_Sans_JP']">
    <!-- Video Player Container -->
    <div class="flex-grow relative flex items-center justify-center bg-black">
      
      <!-- Video Element -->
      <transition name="fade" mode="out-in">
        <video 
          v-if="currentVideoSrc"
          :key="currentVideoSrc"
          :src="currentVideoSrc"
          muted
          playsinline
          class="absolute inset-0 w-full h-full object-contain"
          @error="handleVideoError"
          ref="videoPlayer"
        ></video>
        
        <!-- Fallback if video missing or error -->
        <div v-else class="absolute inset-0 flex items-center justify-center bg-stone-100">
           <!-- Re-use the realistic cat SVG logic here or minimal fallback -->
           <div class="flex flex-col items-center">
             <span class="text-6xl mb-4">🐱</span>
             <p class="text-stone-400 font-bold">No Signal...</p>
           </div>
        </div>
      </transition>

      <!-- Overlay for Color/Text if needed (Optional, user asked for video focus) -->
      <!-- Only show subtle indicator if revealed -->
      <div 
        v-if="userAnswer"
        class="absolute top-10 left-0 right-0 text-center pointer-events-none"
      >
        <span 
          class="inline-block px-6 py-2 rounded-full bg-black/50 text-white font-black text-xl backdrop-blur-md"
          :style="{ borderColor: userAnswer.color, borderWidth: '2px' }"
        >
          {{ userAnswer.colorName }}
        </span>
      </div>

    </div>

    <!-- Bottom Controls: Video Cat Types -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.5)] p-4 pb-8 z-50 border-t border-white/10">
      <div class="flex justify-between items-center mb-3 px-2">
        <h3 class="text-xs font-black text-white/60 uppercase tracking-widest flex items-center">
          <span class="mr-2 text-base">🎥</span> Video Collection
        </h3>
        
        <!-- Replay Button (Small) -->
        <button 
          v-if="!isAutoPlay"
          @click="$emit('play')"
          :disabled="!!userAnswer"
          class="bg-white/20 text-white rounded-full p-2 hover:bg-white/30 active:scale-90 transition-all disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div class="grid gap-2" :class="gridColsClass">
        <button
          v-for="chord in choices" 
          :key="chord.id"
          @click="!isAutoPlay && $emit('answer', chord)"
          :disabled="!!userAnswer || isAutoPlay"
          class="group relative flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200"
          :class="[
            !isAutoPlay && 'active:scale-95 cursor-pointer hover:bg-white/10',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-30 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'z-10 bg-white/20 ring-1 ring-white/50' : ''
          ]"
        >
             <!-- Cat Head Icon -->
            <div 
              class="mb-1 w-8 h-8 rounded-full shadow-inner flex items-center justify-center transform transition-transform group-hover:scale-110 overflow-hidden bg-white/10 border border-white/20"
            >
               <span class="text-sm">🐱</span>
            </div>
            
            <div class="flex flex-col items-center leading-none">
               <span class="text-[9px] font-bold text-white/60 mb-0.5 whitespace-nowrap">
                 {{ chord.colorName }}
               </span>
            </div>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { type PropType } from 'vue'
import type { Chord } from '~/constants/chords'
import type { HistoryItem } from '~/types/app'

const props = defineProps({
  currentQuestion: Object as PropType<Chord | null>,
  choices: {
    type: Array as PropType<Chord[]>,
    default: () => []
  },
  correctHistory: {
    type: Array as PropType<HistoryItem[]>,
    default: () => []
  },
  userAnswer: Object as PropType<Chord | null>,
  isQuestionChanging: Boolean,
  isAutoPlay: {
    type: Boolean,
    default: false
  }
})

defineEmits(['answer', 'play'])

// Constants for Color Mapping to En filenames
const COLOR_TO_EN = {
  '赤': 'red',
  '黄色': 'yellow',
  '青': 'blue',
  '黒': 'black',
  '緑': 'green',
  'オレンジ': 'orange',
  '紫': 'purple',
  'ピンク': 'pink',
  '茶色': 'brown',
  '黄緑': 'lightgreen', // or whatever user names it
  'ベージュ': 'beige',
  '薄紫': 'lightpurple',
  'グレー': 'grey',
  '水色': 'lightblue'
}

const MAX_VARIANTS = 5

const currentVideoSrc = computed(() => {
  // If no question/answer active, maybe show nothing or idle?
  // Use currentQuestion if nothing else.
  const target = props.userAnswer || props.currentQuestion
  if (!target) return null
  
  const colorName = target.colorName
  const enColor = (COLOR_TO_EN as Record<string, string>)[colorName]
  if (!enColor) return null

  // Determine Level: White Key (<=9) is lv1? Black Key (>9) is lv2?
  // Basing this on AutoPlay.vue constants: whiteKeyChords sortOrder <= 9
  // The user said "videos in cats/lv1 and lv2".
  // Assuming 1-9 = lv1, 10-14 (Black keys) = lv2?
  // Let's assume standard logic: 
  // Is it dependent on sortOrder?
  
  // Actually, let's just Try to match specific filenames we know exist first.
  // We found: cat_lv1_red_video_1.mp4 and cat_lv2_yellow_video_1.mp4
  // Wait, Yellow is normally a white key (Level 1/2 in absolute pitch training).
  // In this app, Yellow is ID 2?
  // Maybe "lv1" and "lv2" refer to difficulty levels of videos, or just random folders?
  // But the file naming is `cat_lv1_red...`
  
  // Let's deduce level from the chord/question if possible.
  // Or just try to construct path.
  // Since I don't know the exact logic the user used to name "lv1" vs "lv2" for Yellow (which is usually basic),
  // I will assume simple mapping or just checking both?
  // No, browser can't check file existence easily without trying to load.
  // I'll stick to a simple heuristic:
  // If sortOrder <= 7 (Standard Do Re Mi...) -> lv1?
  // But Yellow is Re (2).
  // The user found `cat_lv2_yellow`.
  // Maybe Yellow is Level 2?
  // Let's try to map dynamically or just hardcode for now if I can't be sure?
  // Actually, I'll construct a path that matches the patterns I saw. 
  // But wait, `cat_lv1_red` vs `cat_lv2_yellow`.
  // Red is C (1). Yellow is D (2).
  // Maybe Level equals ID?
  // If so, `cat_lv{id}_{color}`?
  // Let's try `cat_lv${target.sortOrder}_${enColor}_video_1.mp4`.
  // If `red` is sortOrder 1 -> `cat_lv1_red`. Matches.
  // If `yellow` is sortOrder 2 -> `cat_lv2_yellow`. Matches.
  // This seems to be the pattern! Level == Chord ID (Sort Order).
  
  const level = target.sortOrder
  return `/videos/cats/cat_lv${level}_${enColor}_video_1.mp4`
})

const videoPlayer = ref<HTMLVideoElement | null>(null)
const videoUrl = ref('')
const isVideoLoaded = ref(false)
const videoError = ref(false)

const handleVideoError = (e: Event) => {
  const target = e.target as HTMLVideoElement
  if (!target) return
  console.warn('Video load failed:', target.src)
  target.style.display = 'none' // Hide broken video
  // Could trigger a fallback state here
}

const gridColsClass = computed(() => {
  const count = props.choices.length
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-4 sm:grid-cols-5'
  return 'grid-cols-5 sm:grid-cols-7'
})

const playVideo = async () => {
  await nextTick()
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0
    try {
      await videoPlayer.value.play()
    } catch (e) {
      console.error("Autoplay prevented:", e)
    }
  }
}

// Watch for source changes to play
watch(currentVideoSrc, async (newVal) => {
  if (newVal) {
    await playVideo()
  }
}, { immediate: true })

// Also watch for "play" emit? No, parent handles sound play. 
// If we want re-play video on user "Replay" click, we might need a prop or method.
// But for now, focus on initial auto-play.
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
