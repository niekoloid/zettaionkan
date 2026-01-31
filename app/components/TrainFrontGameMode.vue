<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center overflow-hidden font-['Noto_Sans_JP']">
    
    <!-- Dynamic Background Layer -->
    <div 
      class="absolute inset-0 transition-colors duration-1000 ease-linear"
      :style="{ backgroundColor: currentActionColor ? currentActionColor : '#f0f9ff' }"
    >
      <!-- Radial Gradient Overlay to give depth without "wind" -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.1)_100%)]"></div>
      
      <!-- Track/Ground Lines (Optional: just simple perspective lines for context) -->
      <div class="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-black/10 to-transparent transform perspective-3d">
         <!-- Simple center line to show motion? Removed for now to be cleaner as requested. -->
      </div>
    </div>
    
    <!-- Center Point ( vanishing point visual ) -->
    <div class="absolute top-1/2 left-1/2 w-1 h-1 bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-sm"></div>

    <!-- Main Train Container -->
    <!-- Grows from scale 0 to 1.5 -->
    <div 
        v-if="isPlaying && trainType"
        class="relative z-10 drop-shadow-2xl will-change-transform"
        :class="trainAnimationClass"
    >
       <!-- 1. STEAM LOCOMOTIVE (SL) - BLACK -->
       <svg v-if="trainType === 'sl'" viewBox="0 0 400 400" class="w-96 h-96">
          <defs>
             <filter id="sl-shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="10" stdDeviation="5" flood-color="rgba(0,0,0,0.5)"/>
             </filter>
          </defs>
          <g transform="translate(200, 200)">
              <!-- Main Boiler Front -->
              <circle cx="0" cy="0" r="110" fill="#1a1a1a" stroke="#000" stroke-width="5" />
              <circle cx="0" cy="0" r="90" fill="#2a2a2a" stroke="#000" stroke-width="2" />
              
              <!-- Gold/Brass details -->
              <circle cx="0" cy="0" r="90" fill="none" stroke="#D4AF37" stroke-width="2" stroke-dasharray="10 10"/>

              <!-- Number Plate -->
              <rect x="-30" y="-40" width="60" height="20" fill="#000" stroke="#D4AF37" />
              <text x="0" y="-26" fill="#D4AF37" text-anchor="middle" font-size="12" font-weight="bold">SL</text>
              
              <!-- Headlight -->
              <circle cx="0" cy="-90" r="25" fill="#FFF9C4" filter="url(#sl-shadow)" stroke="#333" stroke-width="5">
                  <animate attributeName="opacity" values="0.9;1;0.9" dur="0.5s" repeatCount="indefinite" />
              </circle>
              
              <!-- Chimney Base (Top) -->
              <rect x="-30" y="-140" width="60" height="40" fill="#1a1a1a" />
              <ellipse cx="0" cy="-140" rx="35" ry="10" fill="#000" />
              
              <!-- Smoke Deflectors -->
              <path d="M-110,-50 L-130,100 L-110,100 Z" fill="#111" />
              <path d="M110,-50 L130,100 L110,100 Z" fill="#111" />
              
              <!-- Bumper / Cowcatcher (Bottom) -->
              <path d="M-130,100 L130,100 L110,160 L-110,160 Z" fill="#1a1a1a" stroke="#333" stroke-width="2" />
              <line x1="-90" y1="100" x2="-80" y2="160" stroke="#333" stroke-width="3" />
              <line x1="-45" y1="100" x2="-40" y2="160" stroke="#333" stroke-width="3" />
              <line x1="0" y1="100" x2="0" y2="160" stroke="#333" stroke-width="3" />
              <line x1="45" y1="100" x2="40" y2="160" stroke="#333" stroke-width="3" />
              <line x1="90" y1="100" x2="80" y2="160" stroke="#333" stroke-width="3" />
          </g>
       </svg>

       <!-- 2. KOMACHI (E6) - RED -->
       <svg v-else-if="trainType === 'komachi'" viewBox="0 0 400 400" class="w-96 h-96">
          <g transform="translate(200, 200)">
              <!-- Nose Shape (Narrower top) -->
              <path d="M-90,-150 Q0,-220 90,-150 L110,120 Q0,140 -110,120 Z" fill="#FFF" stroke="#DDD" stroke-width="1" />
              
              <!-- Red Top / Roof -->
              <path d="M-90,-150 Q0,-220 90,-150 L100,50 Q0,20 -100,50 Z" fill="#EF4444" />
              
              <!-- Cockpit Window -->
              <path d="M-60,-80 Q0,-100 60,-80 L65,-50 Q0,-65 -65,-50 Z" fill="#222" />
              
              <!-- Headlights (Arrow/Slant shape) -->
              <path d="M-80,20 L-50,10 L-50,30 Z" fill="#FCD34D" />
              <path d="M80,20 L50,10 L50,30 Z" fill="#FCD34D" />
              
              <!-- Skirt / Bottom -->
              <path d="M-105,100 L105,100 L90,140 L-90,140 Z" fill="#CCCCCC" />
          </g>
       </svg>

       <!-- 3. DR. YELLOW - YELLOW -->
       <svg v-else-if="trainType === 'dr_yellow'" viewBox="0 0 400 400" class="w-96 h-96">
          <g transform="translate(200, 200)">
               <!-- Body (Rounded 700 series style) -->
               <path d="M-110,-100 Q0,-180 110,-100 L120,120 Q0,140 -120,120 Z" fill="#FACC15" stroke="#EAB308" stroke-width="1" />
               
               <!-- Blue Stripe -->
               <path d="M-118,50 L118,50 L115,70 L-115,70 Z" fill="#1E3A8A" />
               
               <!-- Cockpit Window -->
               <path d="M-80,-70 Q0,-100 80,-70 L85,-40 Q0,-60 -85,-40 Z" fill="#222" />
               
               <!-- Headlights (Oval) -->
               <ellipse cx="-70" cy="20" rx="15" ry="10" fill="#FFF" stroke="#ccc" />
               <ellipse cx="70" cy="20" rx="15" ry="10" fill="#FFF" stroke="#ccc" />
               
               <!-- Nose Cone -->
               <circle cx="0" cy="80" r="10" fill="#EAB308" stroke="#CA8A04" />
          </g>
       </svg>

       <!-- 4. HAYABUSA (E5) - GREEN -->
       <svg v-else-if="trainType === 'hayabusa'" viewBox="0 0 400 400" class="w-96 h-96">
          <g transform="translate(200, 200)">
              <!-- Nose Shape (Very long) -->
              <path d="M-85,-180 Q0,-240 85,-180 L105,120 Q0,140 -105,120 Z" fill="#FFF" stroke="#DDD" stroke-width="1" />
              
              <!-- Green Top -->
              <path d="M-85,-180 Q0,-240 85,-180 L100,20 Q0,0 -100,20 Z" fill="#059669" /> <!-- Teal/Green -->
              
              <!-- Pink Stripe -->
              <path d="M-100,20 L100,20 L100,30 L-100,30 Z" fill="#EC4899" />
              
              <!-- Cockpit Window -->
              <path d="M-55,-100 Q0,-120 55,-100 L60,-70 Q0,-85 -60,-70 Z" fill="#222" />
              
              <!-- Headlights (High up) -->
              <ellipse cx="-40" cy="-30" rx="8" ry="15" fill="#FCD34D" transform="rotate(10)" />
              <ellipse cx="40" cy="-30" rx="8" ry="15" fill="#FCD34D" transform="rotate(-10)" />
              
              <!-- Skirt -->
              <path d="M-105,100 L105,100 L95,140 L-95,140 Z" fill="#9CA3AF" />
          </g>
       </svg>

       <!-- 5. KAGAYAKI (E7) - BLUE -->
       <svg v-else-if="trainType === 'kagayaki'" viewBox="0 0 400 400" class="w-96 h-96">
          <g transform="translate(200, 200)">
              <!-- Body -->
              <path d="M-100,-120 Q0,-180 100,-120 L120,120 Q0,140 -120,120 Z" fill="#FFF" stroke="#DDD" stroke-width="1" />
              
              <!-- Blue Roof -->
              <path d="M-100,-120 Q0,-180 100,-120 L115,0 Q0,-20 -115,0 Z" fill="#2563EB" />
              
              <!-- Copper/Gold Stripe -->
              <path d="M-115,0 L115,0 L112,15 L-112,15 Z" fill="#B45309" />
              
              <!-- Cockpit Window -->
              <path d="M-70,-70 Q0,-90 70,-70 L75,-40 Q0,-55 -75,-40 Z" fill="#222" />
              
              <!-- Headlights (Slant) -->
              <path d="M-90,50 L-60,40 L-50,60 Z" fill="#FCD34D" />
              <path d="M90,50 L60,40 L50,60 Z" fill="#FCD34D" />
          </g>
       </svg>

       <!-- 6. COMMUTER (Generic/Specific Line Colors) -->
       <svg v-else viewBox="0 0 400 400" class="w-96 h-96">
          <g transform="translate(200, 200)">
              <!-- Face (Boxy Silver) -->
              <rect x="-120" y="-120" width="240" height="240" rx="20" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2" />
              
              <!-- Windshield (Black) -->
              <path d="M-110,-80 L110,-80 L110,0 Q0,10 -110,0 Z" fill="#111" />
              
              <!-- Destination Sign (LED) -->
              <rect x="-60" y="-100" width="120" height="16" fill="#111" rx="2" />
              <text x="0" y="-88" fill="#FB923C" font-size="10" text-anchor="middle" font-family="monospace" letter-spacing="2">LOCAL</text>

              <!-- Color Stripe (Top) -->
              <rect x="-120" y="-130" width="240" height="20" :fill="commuterStripeColor" />
              
              <!-- Color Stripe (Middle/Bottom) -->
              <rect x="-120" y="20" width="240" height="40" :fill="commuterStripeColor" />
              
              <!-- Lights -->
              <rect x="-100" y="70" width="25" height="25" rx="5" fill="#FCD34D" stroke="#D97706" />
              <rect x="75" y="70" width="25" height="25" rx="5" fill="#FCD34D" stroke="#D97706" />
              
              <!-- Skirt -->
              <path d="M-110,120 L110,120 L100,150 L-100,150 Z" fill="#4B5563" />
          </g>
       </svg>
    </div>
    
    <!-- Color Label (Station Sign Style) -->
     <div v-if="isPlaying" class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black px-8 py-4 shadow-xl z-20 rounded-lg animate-sign-pop">
         <div class="text-center">
             <div class="text-xs text-gray-500 font-bold mb-1 tracking-widest">NEXT STATION</div>
             <div class="text-4xl font-black tracking-widest" :style="{ color: currentActionColor }">
                 {{ formatColorName(currentQuestion?.colorName || '') }}
             </div>
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

const isPlaying = ref(false)
const trainType = ref<'sl' | 'komachi' | 'dr_yellow' | 'hayabusa' | 'kagayaki' | 'commuter' | null>(null)
// For commuter trains, we determine the stripe color based on the chord color
const commuterStripeColor = ref('')

const currentActionColor = computed(() => {
  return props.currentQuestion?.color || '#ccc'
})

// Color Name -> Train Type Mapping
// names from constants/chords.ts
const getTrainTypeForColor = (colorName: string): string => {
  switch (colorName) {
    case '赤': return 'komachi'
    case '黄色': return 'dr_yellow'
    case '緑': return 'hayabusa'
    case '青': return 'kagayaki'
    case '黒': return 'sl'
    default: return 'commuter'
  }
}

watch(() => props.currentQuestion, async (newVal) => {
  if (newVal && newVal.colorName) {
    // Reset
    isPlaying.value = false
    trainType.value = null
    
    await nextTick()
    
    const type = getTrainTypeForColor(newVal.colorName)
    // TypeScript check/cast
    if (['sl', 'komachi', 'dr_yellow', 'hayabusa', 'kagayaki'].includes(type)) {
       trainType.value = type as any
    } else {
       trainType.value = 'commuter'
       commuterStripeColor.value = newVal.color // Use specific chord color for stripe
    }
    
    isPlaying.value = true
  }
}, { immediate: true })

const trainAnimationClass = computed(() => {
    return isPlaying.value ? 'animate-train-approach' : ''
})

</script>

<style scoped>
@keyframes trainApproach {
  0% { 
    transform: scale(0.1) translateY(40px); 
    opacity: 0; 
  }
  10% {
    opacity: 1;
  }
  100% { 
    transform: scale(1.6) translateY(0); 
    opacity: 1; 
  }
}
.animate-train-approach {
    animation: trainApproach 3.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

@keyframes signPop {
    0% { transform: translate(-50%, 100px); }
    80% { transform: translate(-50%, -10px); }
    100% { transform: translate(-50%, 0); }
}
.animate-sign-pop {
    animation: signPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: 0.5s;
}

.perspective-3d {
    perspective: 1000px;
}
</style>
