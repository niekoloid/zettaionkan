<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 overflow-hidden font-['Noto_Sans_JP']">
    
    <!-- Dynamic Background (Soft Pulse) -->
    <div 
      class="absolute inset-0 transition-colors duration-1000 ease-in-out"
      :style="{ backgroundColor: currentActionColor ? currentActionColor + '20' : '#f5f5f4' }"
    ></div>
    
    <!-- Floating Particles/Notes -->
    <div v-if="isPlaying" class="absolute inset-0 overflow-hidden pointer-events-none">
       <div v-for="n in 8" :key="n" class="absolute animate-float text-4xl" 
            :style="{ 
              left: Math.random() * 80 + 10 + '%', 
              top: '80%', 
              animationDelay: Math.random() * 0.5 + 's',
              color: currentActionColor,
              opacity: 0.7
            }">
         {{ ['♪', '♫', '♥', '★', '🐟'][Math.floor(Math.random() * 5)] }}
       </div>
    </div>

    <!-- Main Character Container -->
    <div 
      class="relative w-80 h-80 sm:w-96 sm:h-96 cursor-pointer transform transition-transform active:scale-95 touch-manipulation z-10"
      @click="$emit('play', currentQuestion)"
    >
      <!-- Kawaii Cat SVG -->
      <svg viewBox="0 0 400 400" class="w-full h-full drop-shadow-xl" 
           :class="actionClass">
        <defs>
          <filter id="cute-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Body Group -->
        <g transform="translate(200, 250)">
          <!-- Tail -->
          <path 
            d="M-60,50 Q-90,50 -100,20 T-80,-20" 
            fill="none" 
            :stroke="catTheme.stroke" 
            stroke-width="20" 
            stroke-linecap="round"
            class="origin-bottom-left"
          />

          <!-- Main Body (Soft Round Shape) -->
          <ellipse cx="0" cy="20" rx="90" ry="80" :fill="catTheme.body" />
          
          <!-- White Belly -->
          <ellipse cx="0" cy="30" rx="55" ry="45" fill="#FFF" opacity="0.8" />
          
           <!-- Arms/Paws (Visible/Moving only if explicitly set, but now static) -->
           <!-- Removed complex action-based arms for simplicity/cleanliness or left as fallback -->
           
        </g>

        <!-- Head Group -->
        <g transform="translate(200, 160)">
          <!-- Ears -->
          <path d="M-70,-50 L-90,-110 L-20,-80 Z" :fill="catTheme.body" />
          <path d="M70,-50 L90,-110 L20,-80 Z" :fill="catTheme.body" />
          <!-- Inner Ears -->
          <path d="M-70,-50 L-80,-90 L-35,-70 Z" :fill="catTheme.earInner" />
          <path d="M70,-50 L80,-90 L35,-70 Z" :fill="catTheme.earInner" />

          <!-- Head Base -->
          <ellipse cx="0" cy="0" rx="100" ry="85" :fill="catTheme.body" />

          <!-- Striped Marking on Forehead -->
          <g v-if="catTheme.hasStripes" :stroke="catTheme.stripe" stroke-width="8" stroke-linecap="round" opacity="0.5">
             <path d="M-20,-60 L-20,-40" />
             <path d="M0,-65 L0,-45" />
             <path d="M20,-60 L20,-40" />
          </g>

          <!-- Face -->
          <g transform="translate(0, 10)">
            <!-- Eyes Container -->
            <!-- Always show happy eyes when playing, normal when idle -->
            <g v-if="!isPlaying">
              <!-- Open Eyes (Normal) -->
              <circle cx="-40" cy="-10" r="10" fill="#333">
                 <animate attributeName="r" values="10;10;1;10" keyTimes="0;0.9;0.95;1" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="-36" cy="-14" r="3" fill="white" /> 
              
              <circle cx="40" cy="-10" r="10" fill="#333">
                 <animate attributeName="r" values="10;10;1;10" keyTimes="0;0.9;0.95;1" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="44" cy="-14" r="3" fill="white" /> 
            </g>
            <g v-else>
                 <!-- Happy Eyes (Closed Curves) default for playing -->
                 <path d="M-55,-10 Q-40,-25 -25,-10" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round" />
                 <path d="M25,-10 Q40,-25 55,-10" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round" />
            </g>

            <!-- Nose -->
            <path d="M-8,15 L8,15 L0,23 Z" fill="#Pink" />
            
            <!-- Mouth -->
            <g v-if="!isPlaying">
               <path d="M-8,23 Q-15,35 0,35 Q15,35 8,23" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
            </g>
            <g v-else>
                 <ellipse cx="0" cy="35" rx="10" ry="12" fill="#F88" stroke="#333" stroke-width="2" />
            </g>

            <!-- Cheeks & Whiskers -->
            <ellipse cx="-65" cy="20" rx="12" ry="8" fill="#FFB7B2" opacity="0.6" />
            <ellipse cx="65" cy="20" rx="12" ry="8" fill="#FFB7B2" opacity="0.6" />
            <g stroke="#333" stroke-width="2" opacity="0.3">
               <path d="M-70,10 L-100,5" />
               <path d="M-70,20 L-100,20" />
               <path d="M70,10 L100,5" />
               <path d="M70,20 L100,20" />
            </g>
          </g>
        </g>
        
        <!-- Accessories: Bow tie -->
        <g transform="translate(200, 255)">
           <path d="M-15,-5 L-30,-20 L-30,10 L-15,-5" :fill="accessoryColor" />
           <path d="M15,-5 L30,-20 L30,10 L15,-5" :fill="accessoryColor" />
           <circle cx="0" cy="-5" r="8" :fill="accessoryColor" />
        </g>
        
      </svg>
    </div>

    <!-- Message / Play Hint -->
    <div class="mt-8 text-center z-10 h-16 flex items-center justify-center">
       <div v-if="!isPlaying" class="animate-pulse">
         <p class="text-stone-400 font-bold text-sm tracking-widest rounded-full bg-white px-6 py-2 shadow-sm border border-stone-100">
           TAP TO PLAY
         </p>
       </div>
       <div v-else class="transition-all duration-300 transform scale-100">
          <p class="text-4xl font-black tracking-widest drop-shadow-sm transition-colors duration-300" 
             :style="{ color: currentActionColor }">
            {{ formatColorName(currentQuestion?.colorName || '') }}
          </p>
       </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { PropType } from 'vue'
import type { Chord } from '~/constants/chords'
import { useAppSettings } from '~/composables/useAppSettings'

const { formatColorName } = useAppSettings()

const props = defineProps({
  currentQuestion: Object as PropType<Chord | null>,
  isAutoPlay: { type: Boolean, default: false },
})

defineEmits(['play'])

const isPlaying = ref(false)
// const currentAction = ref<string | null>(null) // Removed usage

watch(() => props.currentQuestion, async (newVal) => {
  if (newVal) {
    isPlaying.value = true
    // No specific random action needed, CSS animation handles the entrance
  }
}, { immediate: true })

const currentActionColor = computed(() => {
  return props.currentQuestion?.color || '#ccc'
})

const accessoryColor = computed(() => {
    return props.currentQuestion?.color || '#FF6B6B'
})

const catTheme = computed(() => {
    const color = props.currentQuestion?.color || '#ccc'
    return {
        body: color,
        stroke: '#fff', // White stroke for better contrast on colored body
        earInner: '#fff', // White inner ears
        stripe: 'rgba(255,255,255,0.3)', // Subtle white stripes
        hasStripes: true
    }
})

const actionClass = computed(() => {
  if (!isPlaying.value) return '' // No idle animation or maybe just breathe? User said "no tail movement".
  // Actually, user wants "Jump and rotate from right to left".
  return 'animate-enter-right' 
})

</script>

<style scoped>
/* Common / Utility */
@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-150px) rotate(45deg); opacity: 0; }
}
.animate-float { animation: float 2.5s linear forwards; }

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
.animate-breathe { animation: breathe 3s ease-in-out infinite; }

/* Right-to-Left Jump & Spin Entrance */
@keyframes enterRightSpin {
  0% { 
    transform: translateX(100vw) rotate(0deg) scale(0.5); 
    opacity: 0;
  }
  50% { 
    transform: translateX(0) rotate(-360deg) scale(1.2); 
    opacity: 1; 
  }
  100% { 
    transform: translateX(0) rotate(-720deg) scale(1); 
    opacity: 1; 
  }
}
.animate-enter-right { 
    animation: enterRightSpin 1.0s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
}

/* Tail animations removed as requested */
</style>
