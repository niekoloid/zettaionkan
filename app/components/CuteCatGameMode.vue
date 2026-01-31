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
            :class="{ 'animate-tail-wag': !isPlaying, 'animate-tail-excited': isPlaying }"
          />

          <!-- Main Body (Soft Round Shape) -->
          <ellipse cx="0" cy="20" rx="90" ry="80" :fill="catTheme.body" />
          
          <!-- White Belly -->
          <ellipse cx="0" cy="30" rx="55" ry="45" fill="#FFF" opacity="0.8" />
          
           <!-- Arms/Paws (Visible/Moving during some animations) -->
           <path v-if="currentAction === 'peek' || currentAction === 'pounce'" d="M-60,50 Q-80,80 -50,90" fill="none" :stroke="catTheme.body" stroke-width="15" stroke-linecap="round" />
           <path v-if="currentAction === 'peek' || currentAction === 'pounce'" d="M60,50 Q80,80 50,90" fill="none" :stroke="catTheme.body" stroke-width="15" stroke-linecap="round" />
           
           <g v-if="currentAction === 'scratch'">
              <path d="M-60,40" stroke="#333" stroke-width="15" stroke-linecap="round" class="animate-scratch-left" />
              <path d="M60,40" stroke="#333" stroke-width="15" stroke-linecap="round" class="animate-scratch-right" />
           </g>
        </g>

        <!-- Head Group -->
        <g transform="translate(200, 160)" :class="{ 'animate-head-bob': currentAction === 'sing' }">
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
            <g v-if="!isPlaying || currentAction === 'idle'">
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
               <!-- Variable Eyes based on Action -->
               <template v-if="currentAction === 'laugh'">
                 <!-- > < Eyes -->
                 <path d="M-55,-15 L-40,-5 L-55,5" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                 <path d="M55,-15 L40,-5 L55,5" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="scale(-1, 1) translate(-100, 0)"/> 
                 <path d="M55,-15 L40,-5 L55,5" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
               </template>
               
               <template v-else-if="currentAction === 'spin' || currentAction === 'zoomies'">
                  <!-- Dizzy Eyes (X X) or Vertigo -->
                 <path d="M-50,-20 L-30,0 M-30,-20 L-50,0" stroke="#333" stroke-width="4" stroke-linecap="round" />
                 <path d="M30,-20 L50,0 M50,-20 L30,0" stroke="#333" stroke-width="4" stroke-linecap="round" />
               </template>

               <template v-else-if="currentAction === 'jump' || currentAction === 'pounce' || currentAction === 'scratch'">
                 <!-- Wide Open Eyes (O O) -->
                 <circle cx="-40" cy="-10" r="14" fill="#333" />
                 <circle cx="-34" cy="-16" r="4" fill="white" />
                 <circle cx="40" cy="-10" r="14" fill="#333" />
                 <circle cx="46" cy="-16" r="4" fill="white" />
               </template>

               <template v-else-if="currentAction === 'sleep_wake'">
                 <!-- Closed/Sleepy Eyes (- -) -->
                 <path d="M-55,-10 L-25,-10" stroke="#333" stroke-width="4" stroke-linecap="round" />
                 <path d="M25,-10 L55,-10" stroke="#333" stroke-width="4" stroke-linecap="round" />
               </template>

               <template v-else-if="currentAction === 'chase_ball'">
                  <!-- Focused Eyes (looking sideways) -->
                 <circle cx="-35" cy="-10" r="10" fill="#333" />
                 <circle cx="45" cy="-10" r="10" fill="#333" />
               </template>

               <template v-else>
                 <!-- Happy Eyes (Closed Curves) default -->
                 <path d="M-55,-10 Q-40,-25 -25,-10" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round" />
                 <path d="M25,-10 Q40,-25 55,-10" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round" />
               </template>
            </g>

            <!-- Nose -->
            <path d="M-8,15 L8,15 L0,23 Z" fill="#Pink" />
            
            <!-- Mouth -->
            <g v-if="!isPlaying || currentAction === 'idle'">
               <path d="M-8,23 Q-15,35 0,35 Q15,35 8,23" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
            </g>
            <g v-else>
               <template v-if="currentAction === 'laugh'">
                  <path d="M-15,25 Q0,50 15,25" fill="#900" stroke="#333" stroke-width="2" /> 
                  <path d="M-15,25 Q0,45 15,25 Z" fill="#F88" stroke="#333" stroke-width="2" />
               </template>
               <template v-else-if="currentAction === 'peek' || currentAction === 'sleep_wake'">
                  <circle cx="0" cy="30" r="5" fill="#333" />
               </template>
               <template v-else>
                 <ellipse cx="0" cy="35" rx="10" ry="12" fill="#F88" stroke="#333" stroke-width="2" />
               </template>
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
        
        <!-- Extra Items: Yarn Ball -->
        <g v-if="currentAction === 'chase_ball'" transform="translate(300, 300)" class="animate-ball-roll">
           <circle cx="0" cy="0" r="25" :fill="accessoryColor" />
           <path d="M-20,-5 Q0,-20 20,-5 M-15,10 Q0,25 15,10" stroke="white" stroke-width="2" fill="none" opacity="0.5"/>
        </g>

        <!-- Extra Items: Zzz -->
        <g v-if="currentAction === 'sleep_wake'" transform="translate(280, 100)">
           <text x="0" y="0" font-size="40" fill="#888" class="animate-zzz">Zzz...</text>
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
       <div v-else class="transition-all duration-300 transform scale-100" :class="{'scale-110': currentAction === 'jump'}">
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
const currentAction = ref<string | null>(null) 

// Expanded List of 10+ Animations
const ANIMATIONS = [
  'sing',        // 0. Standard Sing
  'jump',        // 1. High Jump
  'wiggle',      // 2. Body Wiggle
  'spin',        // 3. 360 Spin
  'laugh',       // 4. Laughing
  'peek',        // 5. Peek-a-boo
  'chase_ball',  // 6. Chase Yarn Ball
  'zoomies',     // 7. Fast Run Side-to-Side
  'pounce',      // 8. Crouch and Pounce
  'scratch',     // 9. Scratching screen
  'sleep_wake',  // 10. Sleep then Wake
  'stretch',     // 11. Stretch Up
  'curious'      // 12. Head Tilt
]

// Keep track of last action to avoid repetition if possible
let lastActionIndex = -1

const getRandomAction = () => {
  let attempts = 0
  let newIndex = Math.floor(Math.random() * ANIMATIONS.length)
  
  // Try strictly to get a different one (max 10 attempts)
  while (newIndex === lastActionIndex && attempts < 10) {
     newIndex = Math.floor(Math.random() * ANIMATIONS.length)
     attempts++
  }
  
  lastActionIndex = newIndex
  return ANIMATIONS[newIndex] || 'sing'
}

watch(() => props.currentQuestion, async (newVal) => {
  if (newVal) {
    isPlaying.value = true
    
    // Force reset animation by momentarily clearing action
    currentAction.value = null
    await nextTick()
    
    // Slight delay to ensure DOM reflow happens if needed, though nextTick usually enough
    // Using simple requestAnimationFrame or small timeout also works to restart CSS animations
    setTimeout(() => {
        currentAction.value = getRandomAction()
    }, 10) 
  }
}, { immediate: true })

const currentActionColor = computed(() => {
  return props.currentQuestion?.color || '#ccc'
})

const accessoryColor = computed(() => {
    return props.currentQuestion?.color || '#FF6B6B'
})

const catTheme = computed(() => ({
    body: '#FDFCF8',
    stroke: '#E0E0DB',
    earInner: '#FFE4E1',
    stripe: '#EEE',
    hasStripes: true
}))

const actionClass = computed(() => {
  if (!isPlaying.value) return 'animate-breathe'
  if (!currentAction.value) return '' // Reset state
  
  switch (currentAction.value) {
    case 'jump': return 'animate-cat-jump'
    case 'wiggle': return 'animate-cat-wiggle'
    case 'spin': return 'animate-cat-spin'
    case 'laugh': return 'animate-cat-laugh'
    case 'peek': return 'animate-cat-peek'
    case 'chase_ball': return 'animate-cat-chase'
    case 'zoomies': return 'animate-cat-zoomies'
    case 'pounce': return 'animate-cat-pounce'
    case 'scratch': return 'animate-cat-scratch'
    case 'sleep_wake': return 'animate-cat-sleep-wake'
    case 'stretch': return 'animate-cat-stretch'
    case 'curious': return 'animate-cat-curious'
    case 'sing': default: return 'animate-bounce-gentle'
  }
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

/* 1. JUMP */
@keyframes catJump {
  0% { transform: scale(1,1) translateY(0); }
  10% { transform: scale(1.1, 0.9) translateY(10px); }
  40% { transform: scale(0.9, 1.1) translateY(-80px); }
  60% { transform: scale(0.9, 1.1) translateY(-80px); }
  90% { transform: scale(1.1, 0.9) translateY(0); }
  100% { transform: scale(1,1) translateY(0); }
}
.animate-cat-jump { animation: catJump 0.8s ease-out; }

/* 2. WIGGLE */
@keyframes catWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
.animate-cat-wiggle { animation: catWiggle 0.4s ease-in-out infinite; }

/* 3. SPIN */
@keyframes catSpin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(0.8); }
  100% { transform: rotate(360deg) scale(1); }
}
.animate-cat-spin { animation: catSpin 0.8s ease-in-out; }

/* 4. LAUGH */
@keyframes catLaugh {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-5px) rotate(-3deg); }
  75% { transform: translateY(-5px) rotate(3deg); }
}
.animate-cat-laugh { animation: catLaugh 0.4s ease-in-out infinite; }

/* 5. PEEK */
@keyframes catPeek {
  0% { transform: translateY(0); }
  20% { transform: translateY(150px); }
  40% { transform: translateY(150px); }
  50% { transform: translateY(20px); }
  60% { transform: translateY(20px); }
  80% { transform: translateY(0); }
}
.animate-cat-peek { animation: catPeek 1.5s ease-in-out; }

/* 6. CHASE BALL */
@keyframes catChase {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-40px) rotate(-5deg); }
  75% { transform: translateX(40px) rotate(5deg); }
}
.animate-cat-chase { animation: catChase 1.2s ease-in-out infinite; }
@keyframes ballRoll {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-150px) rotate(-180deg); opacity: 1;}
  75% { transform: translateX(50px) rotate(180deg); opacity: 1;}
}
.animate-ball-roll { animation: ballRoll 1.2s ease-in-out infinite; }

/* 7. ZOOMIES */
@keyframes catZoomies {
  0% { transform: translateX(0) scaleX(1); }
  20% { transform: translateX(-100px) scaleX(1); }
  21% { transform: translateX(-100px) scaleX(-1); }
  50% { transform: translateX(100px) scaleX(-1); }
  51% { transform: translateX(100px) scaleX(1); }
  80% { transform: translateX(-50px) scaleX(1); }
  100% { transform: translateX(0) scaleX(1); }
}
.animate-cat-zoomies { animation: catZoomies 1s linear; }

/* 8. POUNCE */
@keyframes catPounce {
  0% { transform: scale(1) translateY(0); }
  20% { transform: scale(1.1, 0.7) translateY(20px); } /* Crouch */
  30% { transform: scale(1.1, 0.7) translateY(20px); } /* Hold */
  40% { transform: scale(0.9, 1.1) translateY(-50px); } /* Pounce */
  60% { transform: scale(1) translateY(0); }
  70% { transform: scale(1.05, 0.95) translateY(5px); } /* Land */
  100% { transform: scale(1) translateY(0); }
}
.animate-cat-pounce { animation: catPounce 1s ease-in-out; }

/* 9. SCRATCH */
@keyframes catScratch {
  0% { transform: translateY(0); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
}
.animate-cat-scratch { animation: catScratch 0.1s linear infinite; }
@keyframes scratchPaw {
  0% { transform: translateY(0); }
  100% { transform: translateY(20px); }
}
.animate-scratch-left { animation: scratchPaw 0.2s alternate infinite; }
.animate-scratch-right { animation: scratchPaw 0.2s alternate-reverse infinite; }

/* 10. SLEEP WAKE */
@keyframes catSleepWake {
  0% { transform: scale(0.95) translateY(10px); } /* Sleeping */
  40% { transform: scale(0.95) translateY(10px); }
  45% { transform: scale(1.1) translateY(-20px); } /* Startle */
  60% { transform: scale(1) translateY(0); }
  100% { transform: scale(1) translateY(0); }
}
.animate-cat-sleep-wake { animation: catSleepWake 2s ease-in-out; }
@keyframes floatZzz {
  0% { opacity: 0; transform: translate(0, 0); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(20px, -30px); }
}
.animate-zzz { animation: floatZzz 1s linear infinite; }

/* 11. STRETCH */
@keyframes catStretch {
  0% { transform: scale(1, 1); }
  50% { transform: scale(0.8, 1.2) translateY(-20px); }
  100% { transform: scale(1, 1); }
}
.animate-cat-stretch { animation: catStretch 1.5s ease-in-out; }

/* 12. CURIOUS */
@keyframes catCurious {
  0% { transform: rotate(0deg); }
  30% { transform: rotate(-20deg); }
  60% { transform: rotate(20deg); }
  100% { transform: rotate(0deg); }
}
.animate-cat-curious { animation: catCurious 1.5s ease-in-out; }


/* Standard Bounce */
@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.animate-bounce-gentle { animation: bounceGentle 0.6s ease-in-out infinite; }

@keyframes tailWag {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
.animate-tail-wag { animation: tailWag 3s ease-in-out infinite; }

@keyframes tailExcited {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
}
.animate-tail-excited { animation: tailExcited 0.2s ease-in-out infinite; }

@keyframes headBob {
  0%, 100% { transform: translate(200px, 160px) rotate(0deg); }
  25% { transform: translate(200px, 162px) rotate(2deg); }
  75% { transform: translate(200px, 158px) rotate(-2deg); }
}
.animate-head-bob { animation: headBob 0.6s ease-in-out infinite; }

</style>
