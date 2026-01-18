<template>
  <div class="absolute inset-0 flex flex-col bg-stone-100 overflow-hidden font-['Noto_Sans_JP']">
    <!-- Sophisticated Room Background -->
    <div 
      class="absolute inset-0 transition-colors duration-1000"
      :class="!userAnswer ? 'bg-stone-50' : ''"
      :style="userAnswer ? { backgroundColor: userAnswer.color, opacity: 0.1 } : {}"
    ></div>

    <!-- Background Texture -->
    <div class="absolute inset-0 opacity-10 pointer-events-none" 
         style="background-image: repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%); background-size: 10px 10px;">
    </div>

    <!-- Main Game Area (Single Cat Center Stage) -->
    <div class="flex-grow relative flex items-center justify-center pb-24"> 
      
      <!-- Single Cat Display -->
      <Transition name="cat-fade" mode="out-in">
        <div 
          v-if="currentCat"
          :key="currentCat.id"
          class="relative w-72 h-72 z-30 flex flex-col items-center justify-center"
        >
          <!-- Cat SVG (Realistic Silhouette/Outline) -->
          <svg viewBox="0 0 500 500" class="w-full h-full drop-shadow-2xl">
              <!-- Using a realistic cat silhouette path -->
              <defs>
                  <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" :stop-color="currentCat!.color" stop-opacity="0.9" />
                      <stop offset="100%" :stop-color="currentCat!.color" stop-opacity="0.7" />
                  </linearGradient>
                  
                  <!-- Fur texture filter -->
                  <filter id="fur" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.9" numOctaves="3" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                  </filter>
              </defs>

              <!-- Main Body: Sitting Cat Silhouette -->
              <g class="cat-body-group" filter="url(#fur)">
                   <!-- Realistic Sitting Cat Path -->
                   <path 
                     d="M175,450 
                        C140,450 120,420 120,380 
                        C120,300 140,200 190,150 
                        C200,140 190,120 180,105 
                        L150,70 L195,85 
                        C210,90 230,80 250,80 
                        C270,80 290,90 305,85 
                        L350,70 L320,105 
                        C310,120 300,140 310,150 
                        C360,200 380,300 380,380 
                        C380,420 360,450 325,450 
                        Z" 
                     :fill="currentCat!.color"
                     stroke="rgba(0,0,0,0.1)"
                     stroke-width="1"
                   />
                   
                   <!-- Tail (Wrapped around) -->
                   <path 
                     d="M325,440 
                        Q380,440 400,400 
                        Q420,360 400,340 
                        Q380,320 360,350 
                        Q350,380 370,400"
                     fill="none"
                     :stroke="currentCat!.color"
                     stroke-width="25"
                     stroke-linecap="round"
                   />
              </g>

              <!-- Face Details (Subtle, realistic placement) -->
              <g opacity="0.6" transform="translate(0, 10)">
                  <!-- Eyes (Cat-eye shape) -->
                  <path d="M210,180 Q230,160 250,180 Q230,200 210,180 Z" fill="#FFD700" />
                  <path d="M290,180 Q270,160 250,180 Q270,200 290,180 Z" fill="#FFD700" />
                  
                  <!-- Pupils -->
                  <ellipse cx="230" cy="180" rx="2" ry="8" fill="#000" />
                  <ellipse cx="270" cy="180" rx="2" ry="8" fill="#000" />
                  
                  <!-- Nose -->
                  <path d="M245,210 L255,210 L250,220 Z" fill="#333" />
                  
                  <!-- Whiskers -->
                  <path d="M220,220 L150,210" stroke="#fff" stroke-width="0.5" opacity="0.5" />
                  <path d="M220,225 L150,230" stroke="#fff" stroke-width="0.5" opacity="0.5" />
                  <path d="M280,220 L350,210" stroke="#fff" stroke-width="0.5" opacity="0.5" />
                  <path d="M280,225 L350,230" stroke="#fff" stroke-width="0.5" opacity="0.5" />
              </g>

          </svg>
          
          <!-- Cat Name (Elegant) -->
          <div class="mt-4 text-2xl font-black text-stone-600 tracking-widest uppercase opacity-80">
            {{ getCatName((currentCat as Chord).colorName) }}
          </div>
          
           <!-- Color Name (Subtle) -->
           <div class="text-sm font-bold text-stone-400 tracking-wider">
             {{ formatColorName((currentCat as Chord).colorName) }}
           </div>

        </div>
      </Transition>

    </div>

    <!-- Bottom Controls: Cat Types -->
    <div class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.05)] p-4 pb-8 z-50">
      <div class="flex justify-between items-center mb-3 px-2">
        <h3 class="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center">
          <span class="mr-2 text-base">👁️</span> Collection
        </h3>
        
        <!-- Replay Button (Small) -->
        <button 
          v-if="!isAutoPlay"
          @click="$emit('play')"
          :disabled="!!userAnswer"
          class="bg-stone-800 text-white rounded-full p-2 shadow-lg hover:bg-stone-700 active:scale-90 transition-all disabled:opacity-50"
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
            !isAutoPlay && 'active:scale-95 cursor-pointer hover:bg-stone-100',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-30 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'z-10 bg-stone-50 ring-1 ring-stone-200' : ''
          ]"
        >
            <!-- Cat Eye Icon -->
            <div 
              class="mb-1 w-8 h-8 rounded-full shadow-inner flex items-center justify-center transform transition-transform group-hover:scale-110 overflow-hidden bg-stone-200"
            >
               <!-- Simple Eye Pupil -->
               <div 
                 class="w-full h-full relative"
                :style="{ backgroundColor: chord.color }"
               >
                 <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-5 bg-black rounded-full opacity-60"></div>
               </div>
            </div>
            
            <div class="flex flex-col items-center leading-none">
               <span class="text-[9px] font-bold text-stone-500 mb-0.5 whitespace-nowrap">
                 {{ formatColorName(chord.colorName) }}
               </span>
            </div>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import type { Chord } from '~/constants/chords'
import type { HistoryItem } from '~/types/app'
import { useAppSettings } from '~/composables/useAppSettings'

const { formatColorName } = useAppSettings()

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

// Determine which cat to show:
// If userAnswer is present, it means we are "Revealed", show that.
// If isAutoPlay and no userAnswer, check history? Actually history logic in AutoPlay is:
// history has PAST + CURRENT(if revealed).
// So just take the last item of correctHistory if available?
const currentCat = computed(() => {
  if (props.userAnswer) return props.userAnswer
  if (props.correctHistory.length > 0) {
    const last = props.correctHistory[props.correctHistory.length - 1]
    if (!last) return null
    return (last.question || last.answer) as Chord
  }
  return null
})

const CAT_MAP = {
  '赤': 'AKATORA',
  '黄色': 'CHATORA',
  '青': 'RUSSIAN',
  '黒': 'KURO',
  '緑': 'FOREST',
  'オレンジ': 'MIKAN',
  '紫': 'VIOLET',
  'ピンク': 'MOMO',
  '茶色': 'CHOCO',
  '黄緑': 'MELON',
  'ベージュ': 'MILK',
  '薄紫': 'FUJI',
  'グレー': 'GREY',
  '水色': 'SKY'
}

const getCatName = (colorName: string) => {
  return (CAT_MAP as Record<string, string>)[colorName] || 'CAT'
}

const preloadUrls = computed(() => {
  const urls: string[] = []
  props.choices.forEach(chord => {
    const catName = getCatName(chord.colorName)
    urls.push(`/images/cats/${catName}.png`)
  })
  return urls
})

const gridColsClass = computed(() => {
  const count = props.choices.length
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-4 sm:grid-cols-5'
  return 'grid-cols-5 sm:grid-cols-7'
})
</script>

<style scoped>
/* Fade Transition */
.cat-fade-enter-active,
.cat-fade-leave-active {
  transition: all 0.5s ease;
}

.cat-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.cat-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
