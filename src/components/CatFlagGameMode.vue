<template>
  <div class="fixed inset-0 flex flex-col bg-black overflow-hidden font-['Noto_Sans_JP']">
    <!-- Video Player Container (Full Screen) -->
    <div class="absolute inset-0 z-0 bg-black">
      <transition name="video-fade" mode="out-in">
        <video 
          v-if="currentVideoSrc && !hasVideoError && isPreloaded"
          :key="currentVideoSrc"
          :src="currentVideoSrc"
          muted
          playsinline
          class="w-full h-full object-cover"
          @error="handleVideoError"
          ref="videoPlayer"
        ></video>
        
        <!-- Fallback / Loading -->
        <div v-else class="w-full h-full flex flex-col items-center justify-center bg-stone-900">
           <div v-if="!isPreloaded" class="flex flex-col items-center">
             <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
             <p class="text-white/50 font-black tracking-widest text-[10px] uppercase">Preloading Videos...</p>
             <p class="text-white/30 text-[9px] mt-1">{{ preloadProgress }}%</p>
           </div>
           <div v-else class="flex flex-col items-center">
             <div class="text-6xl mb-4 animate-pulse">🚩</div>
             <p class="text-white/40 font-black tracking-widest text-sm uppercase">No Video Signal</p>
             <p class="text-[10px] text-white/20 mt-2">Level {{ currentLevel }} - {{ currentColorEn }}</p>
           </div>
        </div>
      </transition>

      <!-- Full Screen Ambient Gradient (Revealed) -->
      <transition name="fade">
        <div 
          v-if="userAnswer"
          class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none transition-opacity duration-1000"
        ></div>
      </transition>
    </div>

    <!-- Status Overlay (Always visible but subtle) -->
    <div 
      v-if="userAnswer"
      class="absolute top-12 left-0 right-0 flex flex-col items-center pointer-events-none z-10"
    >
      <div class="px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transform transition-all duration-500 scale-110">
        <span class="text-white font-black text-2xl tracking-tight">{{ userAnswer.colorName }}</span>
      </div>
      
      <!-- Colored indicator -->
      <div 
        class="mt-4 w-1 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-700"
        :style="{ backgroundColor: userAnswer.color, boxShadow: `0 0 30px ${userAnswer.color}` }"
      ></div>
    </div>

    <!-- Hidden Preload Container -->
    <div class="hidden">
      <video 
        v-for="url in preloadUrls" 
        :key="url" 
        :src="url" 
        preload="auto"
      ></video>
    </div>

    <!-- Bottom Selection UI (Subtle Overlay for Autoplay Stop/Stats) -->
    <div class="absolute bottom-10 left-0 right-0 z-50 px-6">
       <!-- Progress track -->
       <div v-if="!isAutoPlay" class="max-w-md mx-auto grid grid-cols-5 gap-2 pb-6">
          <div 
            v-for="chord in choices" 
            :key="chord.id"
            class="h-1 rounded-full overflow-hidden"
            :class="userAnswer?.id === chord.id ? 'bg-white' : 'bg-white/10'"
          ></div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  currentQuestion: Object,
  choices: {
    type: Array,
    default: () => []
  },
  correctHistory: {
    type: Array,
    default: () => []
  },
  userAnswer: Object,
  isQuestionChanging: Boolean,
  isAutoPlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['answer', 'play', 'ready'])

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
  '黄緑': 'lightgreen',
  'ベージュ': 'beige',
  '薄紫': 'lightpurple',
  'グレー': 'grey',
  '水色': 'lightblue'
}

const hasVideoError = ref(false)
const currentVariant = ref(1)
const isPreloaded = ref(false)
const preloadProgress = ref(0)

// Helper to check if a color has multiple variants
// Currently only Red (lv1) has two videos.
const hasMultipleVariants = (colorName) => {
  return colorName === '赤'
}

const randomizeVariant = (colorName) => {
  if (hasMultipleVariants(colorName)) {
    currentVariant.value = Math.random() > 0.5 ? 2 : 1
  } else {
    currentVariant.value = 1
  }
}

const currentLevel = computed(() => {
  const target = props.userAnswer || props.currentQuestion
  return target?.sortOrder || 1
})

const currentColorEn = computed(() => {
  const target = props.userAnswer || props.currentQuestion
  return COLOR_TO_EN[target?.colorName] || 'red'
})

const currentVideoSrc = computed(() => {
  const target = props.userAnswer || props.currentQuestion
  if (!target) return null
  
  const enColor = COLOR_TO_EN[target.colorName]
  if (!enColor) return null
  
  const level = target.sortOrder
  
  // Base path for flag raising videos.
  return `/videos/cats_raise_flags/cat_flag_lv${level}_${enColor}_${currentVariant.value}.mp4`
})

// Generate all possible video URLs for preloading
const preloadUrls = computed(() => {
  const urls = []
  props.choices.forEach(chord => {
    const enColor = COLOR_TO_EN[chord.colorName]
    if (enColor) {
      const level = chord.sortOrder
      urls.push(`/videos/cats_raise_flags/cat_flag_lv${level}_${enColor}_1.mp4`)
      if (hasMultipleVariants(chord.colorName)) {
        urls.push(`/videos/cats_raise_flags/cat_flag_lv${level}_${enColor}_2.mp4`)
      }
    }
  })
  return urls
})

const preloadVideos = async () => {
  if (preloadUrls.value.length === 0) {
    isPreloaded.value = true
    return
  }

  let loadedCount = 0
  const total = preloadUrls.value.length

  const promises = preloadUrls.value.map(url => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = url
      video.preload = 'auto'
      
      const onDone = () => {
        loadedCount++
        preloadProgress.value = Math.round((loadedCount / total) * 100)
        video.removeEventListener('loadedmetadata', onDone)
        video.removeEventListener('error', onDone)
        resolve()
      }

      video.addEventListener('loadedmetadata', onDone)
      video.addEventListener('error', onDone)
      
      // Start loading
      video.load()
    })
  })

  // Set a timeout of 5s so we don't wait forever
  const timeout = new Promise(resolve => setTimeout(() => {
    console.warn('Preload timed out')
    resolve()
  }, 5000))
  
  await Promise.race([Promise.all(promises), timeout])
  isPreloaded.value = true
  emit('ready')
}

onMounted(() => {
  const target = props.userAnswer || props.currentQuestion
  if (target) randomizeVariant(target.colorName)
  preloadVideos()
})

// When preloading finishes, if we already have a video to show, play it.
watch(isPreloaded, (val) => {
  if (val && currentVideoSrc.value) {
    playVideo()
  }
})

// Randomize variant on question change AND play
watch(() => props.currentQuestion, async (newVal) => {
  if (newVal) {
    randomizeVariant(newVal.colorName)
    hasVideoError.value = false
    await playVideo()
  }
})

const handleVideoError = (e) => {
  console.warn('Flag video load failed:', e.target.src)
  hasVideoError.value = true
}
</script>

<style scoped>
.video-fade-enter-active,
.video-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.video-fade-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.video-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
