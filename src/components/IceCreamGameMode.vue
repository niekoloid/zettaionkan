<template>
  <div class="absolute inset-0 flex flex-col bg-sky-100 overflow-hidden font-['Noto_Sans_JP']">
    
    <!-- Background Clouds (Decorations) -->
    <div class="absolute top-10 left-10 text-white/40 opacity-50"><svg width="60" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5,12c-1.1,0-2.1,0.3-2.9,0.9c-0.6-2.5-2.9-4.4-5.6-4.4c-3.1,0-5.6,2.3-5.9,5.2C3.9,13.9,4,14,4,14H3 c-1.7,0-3,1.3-3,3s1.3,3,3,3h15.5c1.9,0,3.5-1.6,3.5-3.5S20.4,12,18.5,12z"/></svg></div>
    <div class="absolute top-20 right-10 text-white/40 opacity-40"><svg width="80" height="50" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5,12c-1.1,0-2.1,0.3-2.9,0.9c-0.6-2.5-2.9-4.4-5.6-4.4c-3.1,0-5.6,2.3-5.9,5.2C3.9,13.9,4,14,4,14H3 c-1.7,0-3,1.3-3,3s1.3,3,3,3h15.5c1.9,0,3.5-1.6,3.5-3.5S20.4,12,18.5,12z"/></svg></div>

    <!-- Main Game Area (Tower) -->
    <div class="flex-grow relative flex items-end justify-center pb-32 mb-40"> <!-- Adjusted padding/margin for buttons space -->
      <div class="relative w-40 flex flex-col-reverse items-center z-10 ice-cream-tower">
        
        <!-- The Cone -->
        <div class="relative w-24 h-32 shrink-0 z-20 cone-wobble-base">
          <svg viewBox="0 0 100 130" class="w-full h-full drop-shadow-xl" style="filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));">
            <path d="M10,10 L90,10 L50,125 Z" fill="#f6d588" stroke="#e0be6e" stroke-width="2" />
            <!-- Waffle pattern -->
            <path d="M20,10 L50,125" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M35,10 L50,125" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M65,10 L50,125" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M80,10 L50,125" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M15,30 L85,30" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M25,60 L75,60" stroke="#e6c67a" stroke-width="1" fill="none" />
            <path d="M35,90 L65,90" stroke="#e6c67a" stroke-width="1" fill="none" />
          </svg>
        </div>

        <!-- The Stacked Scoops -->
        <TransitionGroup name="scoop" tag="div" class="flex flex-col-reverse items-center w-full relative -mb-6 z-30">
          <div 
            v-for="(history, index) in correctHistory" 
            :key="history.question.id + '-' + index"
            class="relative w-28 h-24 -mb-10 z-30 scoop-item origin-bottom"
            :style="{ 
              zIndex: correctHistory.length - index + 30,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' 
            }"
          >
            <!-- Scoop Shape (SVG) -->
            <svg viewBox="0 0 120 100" class="w-full h-full overflow-visible">
              <defs>
                <!-- Ice Cream Texture Filter -->
                <filter :id="'texture-' + index" x="-20%" y="-20%" width="140%" height="140%">
                  <!-- Create noise for bumpiness -->
                  <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
                  <!-- Lighting effect on the noise -->
                  <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="2" result="diffuse">
                    <feDistantLight azimuth="45" elevation="60" />
                  </feDiffuseLighting>
                  <!-- Blend texture with source color -->
                  <feComposite operator="in" in="diffuse" in2="SourceGraphic" result="textured" />
                  <feBlend mode="multiply" in="textured" in2="SourceGraphic" result="blended" />
                </filter>
                
                <!-- Inner Shadow for 3D feel -->
                <radialGradient :id="'grade-' + index" cx="30%" cy="30%" r="70%" fx="40%" fy="40%">
                  <stop offset="0%" stop-color="#fff" stop-opacity="0.3" />
                  <stop offset="80%" stop-color="#000" stop-opacity="0.1" />
                  <stop offset="100%" stop-color="#000" stop-opacity="0.3" />
                </radialGradient>
              </defs>

              <g :filter="'url(#texture-' + index + ')'">
                <!-- Realistic Scoop Shape with 'Skirt' -->
                <path 
                  d="M15,50 
                     C15,20 35,5 60,5 
                     C85,5 105,20 105,50 
                     C108,55 110,65 100,75 
                     C95,80 90,75 85,80 
                     C80,85 75,90 65,85 
                     C60,82 55,88 50,85 
                     C40,90 35,80 30,82 
                     C20,85 15,80 10,75 
                     C0,65 10,55 15,50 Z" 
                  :fill="history.question.color"
                />
              </g>

              <!-- Apply gradient overlay for volume (without texture filter so it stays smooth-ish) -->
              <path 
                d="M15,50 
                   C15,20 35,5 60,5 
                   C85,5 105,20 105,50 
                   C108,55 110,65 100,75 
                   C95,80 90,75 85,80 
                   C80,85 75,90 65,85 
                   C60,82 55,88 50,85 
                   C40,90 35,80 30,82 
                   C20,85 15,80 10,75 
                   C0,65 10,55 15,50 Z" 
                :fill="'url(#grade-' + index + ')'"
                style="mix-blend-mode: overlay;"
              />
            </svg>
          </div>
        </TransitionGroup>

      </div>
    </div>

    <!-- Bottom Controls: Flavor Tubs -->
    <div class="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-50">
      <div class="flex justify-between items-center mb-3 px-2">
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest">フレーバー</h3>
        
        <!-- Replay Button (Small) -->
        <button 
          v-if="!isAutoPlay"
          @click="$emit('play')"
          :disabled="userAnswer"
          class="bg-indigo-500 text-white rounded-full p-2 shadow-lg hover:bg-indigo-600 active:scale-90 transition-all disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div class="grid gap-2"
        :class="gridColsClass"
      >
        <button
          v-for="chord in choices" 
          :key="chord.id"
          @click="!isAutoPlay && $emit('answer', chord)"
          :disabled="userAnswer || isAutoPlay"
          class="group relative flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200"
          :class="[
            !isAutoPlay && 'active:scale-95 cursor-pointer',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-30 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 z-10' : (!isAutoPlay ? 'hover:bg-gray-50' : '')
          ]"
        >
            <!-- Large Flavor Icon (Image or Emoji) -->
            <div class="mb-1 filter drop-shadow-sm transform transition-transform group-hover:scale-110 flex items-center justify-center h-9 w-9">
              <img 
                v-if="getFlavorImage(chord.colorName)" 
                :src="getFlavorImage(chord.colorName)" 
                class="w-full h-full object-contain drop-shadow-md"
                alt="icon"
              />
              <span v-else class="text-3xl">
                {{ getFlavorIcon(chord.colorName) }}
              </span>
            </div>
            
            <div class="flex flex-col items-center leading-none">
              <!-- Color Name (Small) -->
              <span class="text-[9px] font-bold text-gray-400 mb-0.5" :style="{ color: chord.color }">
                {{ chord.colorName }}
              </span>
              <!-- Flavor Name (Main) -->
              <span class="text-[10px] font-black text-gray-800 mb-1 whitespace-nowrap">
                {{ getFlavorName(chord.colorName) }}
              </span>
            </div>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

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

defineEmits(['answer', 'play'])

const FLAVOR_MAP = {
  '赤': 'いちご',
  '黄色': 'バナナ',
  '青': 'ブルーベリー',
  '黒': 'コーラ',
  '緑': '抹茶',
  'オレンジ': 'オレンジ',
  '紫': 'ぶどう',
  'ピンク': 'ピーチ',
  '茶色': 'ミルクチョコ',
  '黄緑': 'メロン',
  'ベージュ': 'バニラ',
  '薄紫': '紅芋',
  'グレー': '黒ゴマ',
  '水色': 'ラムネ'
}

const FLAVOR_ICON_MAP = {
  '赤': '🍓',
  '黄色': '🍌',
  '青': '🫐',
  '黒': '🥤',
  '緑': '🍵',
  'オレンジ': '🍊',
  '紫': '🍇',
  'ピンク': '🍑',
  '茶色': '🍫',
  '黄緑': '🍈',
  'ベージュ': '🍨',
  '薄紫': '🍠',
  'グレー': '⚫️',
  '水色': '🍬'
}

const FLAVOR_IMAGE_MAP = {
  '黒': '/assets/icons/cola.png',
  '水色': '/assets/icons/ramune.png',
  'グレー': '/assets/icons/black_sesame.png'
}

const getFlavorName = (colorName) => {
  return FLAVOR_MAP[colorName] || colorName
}

const getFlavorIcon = (colorName) => {
  return FLAVOR_ICON_MAP[colorName] || ''
}

const getFlavorImage = (colorName) => {
  return FLAVOR_IMAGE_MAP[colorName] || null
}

const gridColsClass = computed(() => {
  const count = props.choices.length
  if (count <= 4) return 'grid-cols-2' // e.g., 2x2 for small sets
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-4 sm:grid-cols-5'
  return 'grid-cols-5 sm:grid-cols-7' // For 14 items
})
</script>

<style scoped>
/* Stacking Animation */
.scoop-enter-active {
  animation: drop-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.scoop-leave-active {
  transition: all 0.5s ease;
}
.scoop-enter-from {
  transform: translateY(-500px) scaleX(0.8) scaleY(1.2);
  opacity: 0;
}
.scoop-leave-to {
  transform: scale(0);
  opacity: 0;
}

@keyframes drop-bounce {
  0% { transform: translateY(-500px) scaleX(0.5) scaleY(1.5); opacity: 0; }
  60% { transform: translateY(20px) scaleX(1.3) scaleY(0.7); opacity: 1; } /* Squash on impact */
  80% { transform: translateY(-10px) scaleX(0.9) scaleY(1.1); } /* Rebound stretch */
  100% { transform: translateY(0) scaleX(1) scaleY(1); } /* Settle */
}

/* Base Wobble details */
.cone-wobble-base {
  transform-origin: bottom center;
  animation: gentle-sway 4s ease-in-out infinite;
}
.ice-cream-tower {
  /* Give the whole tower (scoops) a slight counter-sway or sync sway */
}

@keyframes gentle-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
</style>
