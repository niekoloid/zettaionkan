<template>
  <div 
    class="absolute inset-0 flex flex-col bg-sky-50 overflow-hidden font-['Noto_Sans_JP']"
  >
    <!-- High-Impact White Flash Layer (Visual Shutter) -->
    <Transition name="white-flash">
      <div 
        v-if="whiteFlashActive"
        class="absolute inset-0 z-[60] pointer-events-none bg-white opacity-100"
      ></div>
    </Transition>

    <!-- Vivid Color Pulse Transition Overlay -->
    <Transition name="color-pulse">
      <div 
        v-if="pulseActive"
        class="absolute inset-0 z-50 pointer-events-none opacity-40 transition-opacity"
        :style="{ backgroundColor: userAnswer?.color }"
      ></div>
    </Transition>

    <!-- Dynamic Background Sky -->
    <div 
      class="absolute inset-0 transition-colors duration-1000 z-0"
      :style="userAnswer ? { backgroundColor: userAnswer.color, opacity: 0.3 } : { backgroundColor: '#f0f9ff', opacity: 1 }"
    ></div>

    <!-- Siren Flash Overlay (Red only) -->
    <div 
      v-if="userAnswer?.colorName === '赤'" 
      class="absolute inset-0 z-0 pointer-events-none animate-siren-flash opacity-20"
      style="background: radial-gradient(circle, transparent 40%, red 100%);"
    ></div>

    <!-- Background Elements: Cityscape -->
    <div class="absolute bottom-40 left-0 right-0 h-32 flex items-end justify-around px-10 opacity-30 pointer-events-none select-none">
      <div v-for="i in 5" :key="i" class="w-16 bg-stone-400 rounded-t-lg" :style="{ height: `${20 + Math.random() * 60}%` }"></div>
    </div>
    
    <!-- Road / Ground Area -->
    <div class="absolute bottom-0 left-0 right-0 h-64 bg-stone-100 border-t-8 border-stone-200 z-10">
      <div class="absolute top-1/2 left-0 right-0 h-2 border-y-2 border-dashed border-stone-300 -translate-y-1/2"></div>
      
      <!-- Environmental Elements (Fire / Earth) based on Variant -->
      <div class="absolute inset-0 z-20 pointer-events-none">
        <!-- Fire for 'あか' (Persistent Fire) -->
        <template v-if="userAnswer?.colorName === '赤'">
            <div v-if="randomVariant === 1" class="absolute left-1/2 top-4 flex space-x-12 -translate-x-1/2">
                <span v-for="i in 3" :key="'f1-'+i" class="text-5xl animate-fire-float" :style="{ animationDelay: `${i*0.3}s` }">🔥</span>
            </div>
            <div v-else-if="randomVariant === 2" class="absolute inset-x-0 top-0 flex items-center justify-around px-10">
                <span v-for="i in 5" :key="'f2-'+i" class="text-4xl animate-fire-float" :style="{ animationDelay: `${i*0.2}s` }">🔥</span>
            </div>
            <div v-else class="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                <span class="text-6xl animate-fire-float">🔥</span>
                <span class="text-4xl animate-fire-float" style="animation-delay: 0.5s">🔥</span>
                <span class="text-6xl animate-fire-float" style="animation-delay: 0.2s">🔥</span>
            </div>
        </template>
        <!-- Earth/Rocks for 'きいろ' (Bulldozer Interaction) -->
        <template v-else-if="userAnswer?.colorName === '黄色'">
            <div v-if="randomVariant === 1" class="absolute left-1/2 bottom-12 text-6xl animate-push-out translate-x-20">⛰️</div>
            <div v-else-if="randomVariant === 2" class="absolute left-1/2 bottom-10 flex space-x-4 animate-push-out translate-x-12">
                <span v-for="i in 3" :key="'r1-'+i" class="text-4xl">🪨</span>
            </div>
            <div v-else class="absolute left-1/2 bottom-8 text-7xl animate-push-out translate-x-16">🪵</div>
        </template>
      </div>
    </div>

    <!-- Particles Emitter -->
    <div class="absolute inset-0 z-40 pointer-events-none">
        <!-- Water for Red -->
        <template v-if="userAnswer?.colorName === '赤'">
            <div v-for="i in 15" :key="'water-'+i" 
                 class="absolute w-4 h-4 bg-sky-300 rounded-full animate-water-particle opacity-0"
                 :style="{ 
                    left: randomVariant === 2 ? (i % 2 === 0 ? '40%' : '60%') : '50%', 
                    top: '40%',
                    animationDelay: `${Math.random() * 1.5}s`,
                    '--tx': `${(Math.random() - 0.5) * (randomVariant === 3 ? 600 : 300)}px`,
                    '--ty': `${-150 - Math.random() * 200}px`
                 }">
            </div>
        </template>
        <!-- Dust for Yellow -->
        <template v-if="userAnswer?.colorName === '黄色'">
            <div v-for="i in 20" :key="'dust-'+i" 
                 class="absolute w-3 h-3 bg-amber-600/50 rounded-full animate-dust-particle opacity-0"
                 :style="{ 
                    left: '60%', top: '70%',
                    animationDelay: `${Math.random() * 1}s`,
                    '--tx': `${(Math.random() - 0.2) * 200}px`,
                    '--ty': `${-80 - Math.random() * 120}px`
                 }">
            </div>
        </template>
    </div>

    <!-- Onomatopoeia Text Layer -->
    <div class="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
        <Transition name="pop-text">
            <div v-if="userAnswer" :key="'text-'+userAnswer.id+'-'+playCounter" class="relative">
                <div 
                    class="text-6xl md:text-8xl font-black italic tracking-tighter filter drop-shadow-lg animate-text-pop"
                    :style="{ color: userAnswer.color === '#000000' ? 'white' : userAnswer.color, WebkitTextStroke: '3px white' }"
                >
                    {{ getVehicleOnomatopoeia(userAnswer.colorName) }}
                </div>
            </div>
        </Transition>
    </div>

    <!-- Main Game Area: Vehicles -->
    <div class="flex-grow relative flex items-center justify-center z-30 pointer-events-none">
      <Transition :name="randomArrivalName">
        <div 
          v-if="userAnswer" 
          :key="userAnswer.id + '-' + playCounter"
          class="relative flex flex-col items-center"
        >
          <!-- Vehicle Container -->
          <div 
            class="relative scale-[2.5] md:scale-[3] transform transition-all duration-500 animate-impact"
          >
            <div 
               class="text-7xl md:text-8xl transition-all duration-500" 
               :class="getVehicleAnimation(userAnswer.colorName)"
               :style="{ filter: `drop-shadow(0 0 15px ${userAnswer.color}) drop-shadow(0 0 50px ${userAnswer.color}40)` }"
            >
              {{ getVehicleIcon(userAnswer.colorName) }}
            </div>
          </div>

          <!-- Info Bubble -->
          <div class="mt-24 bg-white/95 backdrop-blur-xl px-12 py-6 rounded-[3rem] shadow-2xl border-4 border-stone-100 flex flex-col items-center animate-bounce-subtle">
            <span class="text-[14px] font-black tracking-[0.4em] uppercase mb-1" :style="{ color: userAnswer.color }">
              {{ getHiraganaColor(userAnswer.colorName) }}
            </span>
            <span class="text-3xl font-black text-stone-900">
              {{ getVehicleName(userAnswer.colorName) }}
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- History: Fleet of Vehicles -->
    <div class="absolute inset-x-0 bottom-24 h-24 z-30 flex items-center overflow-x-auto scrollbar-hide px-8 pb-4">
      <TransitionGroup name="fleet">
        <div 
          v-for="(history, index) in correctHistory" 
          :key="history.question.id + '-' + index"
          class="shrink-0 w-20 h-20 bg-white/60 backdrop-blur rounded-[1.5rem] border-2 border-white shadow-lg flex items-center justify-center mx-2 relative group hover:scale-110 transition-transform"
        >
          <div class="text-4xl filter">{{ getVehicleIcon(history.question.colorName) }}</div>
          <div class="absolute bottom-0 inset-x-0 h-1.5" :style="{ backgroundColor: history.question.color }"></div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Bottom Controls -->
    <div class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t-2 border-stone-100 p-6 pb-12 z-50">
      <div class="flex justify-between items-center mb-4 px-2">
        <h3 class="text-[12px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center">
            <span class="mr-3 scale-125">🚛</span> しゃりょうずかん
        </h3>
      </div>
      
      <div class="grid gap-3" :class="gridColsClass">
        <button
          v-for="chord in choices" 
          :key="chord.id"
          @click="!isAutoPlay && $emit('answer', chord)"
          :disabled="userAnswer || isAutoPlay"
          class="group relative flex flex-col items-center justify-center p-3 rounded-3xl transition-all duration-300"
          :class="[
            !isAutoPlay && 'active:scale-90 cursor-pointer',
            userAnswer && userAnswer.id !== chord.id ? 'opacity-10 grayscale' : '',
            userAnswer && userAnswer.id === chord.id ? 'ring-6 ring-indigo-500/10 scale-110 z-10 bg-white shadow-2xl' : (!isAutoPlay ? 'hover:bg-indigo-50/50' : 'bg-white/40')
          ]"
        >
            <div class="text-3xl mb-1 filter drop-shadow-sm transform transition-transform group-hover:scale-125">
              {{ getVehicleIcon(chord.colorName) }}
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[10px] font-black text-stone-900 truncate px-1">
                {{ getVehicleName(chord.colorName) }}
              </span>
            </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  currentQuestion: Object,
  choices: {
    type: Array, default: () => []
  },
  correctHistory: {
    type: Array, default: () => []
  },
  userAnswer: Object,
  isQuestionChanging: Boolean,
  isAutoPlay: {
    type: Boolean, default: false
  }
})

defineEmits(['answer', 'play'])
const VEHICLE_MAP = {
  '赤': { name: 'しょうぼうしゃ', icon: '🚒', sound: ['ぴーぽー！', 'しゅっ！', 'つけろー！'], move: 'animate-siren' },
  '黄色': { name: 'ぶるどーざー', icon: '🚜', sound: ['ずどどっ！', 'おすよー！', 'がががっ！'], move: 'animate-bulldozer-push' },
  '青': { name: 'ぱとかー', icon: '🚓', sound: ['うーうー！', 'まってー！'], move: 'animate-drive' },
  'オレンジ': { name: 'きゅうきゅうしゃ', icon: '🚑', sound: ['ぴーぽー！', 'いそげー！'], move: 'animate-drive' },
  '緑': { name: 'ごみしゅうしゅうしゃ', icon: '🚛', sound: ['ぐるぐる！', 'きれいにするよ！'], move: 'animate-drive' },
  '黒': { name: 'たくしー', icon: '🚕', sound: ['ぶーん！', 'のる？'], move: 'animate-drive' },
  '紫': { name: 'ろーどろーらー', icon: '🚜', sound: ['どっしん！', 'ぺったんこ！'], move: 'animate-roll' },
  'ピンク': { name: 'きっちんかー', icon: '🚐', sound: ['おいしいよ！', 'いらっしゃい！'], move: 'animate-drive' },
  '茶色': { name: 'ぶるどーざー', icon: '🚜', sound: ['ずドドド！', 'おすよ！'], move: 'animate-bulldozer-push' },
  '黄緑': { name: 'みきさーしゃ', icon: '🚛', sound: ['まわるよ！', 'ぐるぐる！'], move: 'animate-drive' },
  'ベージュ': { name: 'だんぷかー', icon: '🚚', sound: ['どざーっ！', 'はこぶよ！'], move: 'animate-drive' },
  '薄紫': { name: 'こうじのくるま', icon: '🚧', sound: ['こうじちゅう！', 'きをつけて！'], move: 'animate-drive' },
  'グレー': { name: 'くれーんしゃ', icon: '🏗️', sound: ['ぐーん！', 'つるよ！'], move: 'animate-drive' },
  '水色': { name: 'ばす', icon: '🚌', sound: ['ぷっぷー！', 'のるひとー？'], move: 'animate-drive' }
}

const COLOR_HIRA_MAP = {
  '赤': 'あか', '黄色': 'きいろ', '青': 'あお', 'オレンジ': 'おれんじ', 
  '緑': 'みどり', '黒': 'くろ', '紫': 'むらさき', 'ピンク': 'ぴんく', 
  '茶色': 'ちゃいろ', '黄緑': 'きみどり', 'ベージュ': 'べーじゅ', 
  '薄紫': 'うすむらさき', 'グレー': 'ぐれー', '水色': 'みずいろ'
}

const randomVariant = ref(1)
const randomArrivalId = ref(1)
const lastAnswerId = ref(null)
const pulseActive = ref(false)
const whiteFlashActive = ref(false)
const playCounter = ref(0)

const getVehicleName = (colorName) => VEHICLE_MAP[colorName]?.name || colorName
const getVehicleIcon = (colorName) => VEHICLE_MAP[colorName]?.icon || '🚗'
const getHiraganaColor = (colorName) => COLOR_HIRA_MAP[colorName] || colorName

const getVehicleOnomatopoeia = (colorName) => {
    const sounds = VEHICLE_MAP[colorName]?.sound || ['ぶーん！']
    return sounds[randomVariant.value % sounds.length]
}

const randomArrivalName = computed(() => {
    const arrivals = ['vehicle-hyper', 'vehicle-jump', 'vehicle-spin']
    return arrivals[randomArrivalId.value % arrivals.length]
})

watch(() => props.userAnswer, (newAns) => {
    if (newAns) {
        playCounter.value++

        // Trigger White Flash (Visual Shutter)
        whiteFlashActive.value = true
        setTimeout(() => { whiteFlashActive.value = false }, 80)

        // Trigger Vivid Color Pulse
        setTimeout(() => {
            pulseActive.value = true
            setTimeout(() => { pulseActive.value = false }, 150)
        }, 80)

        // Ensure variety even if the note is the same
        randomVariant.value = Math.floor(Math.random() * 3) + 1
        randomArrivalId.value = Math.floor(Math.random() * 3)
    }
})

const getVehicleAnimation = (colorName) => {
  const baseMove = VEHICLE_MAP[colorName]?.move || 'animate-drive'
  if (colorName === '赤') {
     const fireMoves = ['animate-siren', 'animate-truck-tilt', 'animate-truck-jolt']
     return fireMoves[randomVariant.value % fireMoves.length]
  }
  if (colorName === '黄色') {
     const yellowMoves = ['animate-bulldozer-push', 'animate-bulldozer-heavy', 'animate-truck-jolt']
     return yellowMoves[randomVariant.value % yellowMoves.length]
  }
  return baseMove
}

const gridColsClass = computed(() => {
  const count = props.choices.length
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-4 sm:grid-cols-5'
  return 'grid-cols-5 sm:grid-cols-7'
})
</script>

<style scoped>
/* Transitions */
.vehicle-hyper-enter-active, .vehicle-jump-enter-active, .vehicle-spin-enter-active {
  transition: all 0.8s cubic-bezier(0.34, 1.7, 0.64, 1);
}
.vehicle-hyper-enter-from { transform: translateX(-150vw) scale(0.5) rotate(-20deg); opacity: 0; }
.vehicle-jump-enter-from { transform: translateY(-100vh) scale(2); opacity: 0; }
.vehicle-spin-enter-from { transform: translateX(-100vw) rotate(720deg) scale(0); opacity: 0; }

.vehicle-hyper-leave-to, .vehicle-jump-leave-to, .vehicle-spin-leave-to {
  transform: translateX(150vw) scale(1.5) rotate(20deg); opacity: 0;
}

/* Animations */
@keyframes color-pulse {
  0% { opacity: 0; }
  50% { opacity: 0.5; }
  100% { opacity: 0; }
}
.color-pulse-enter-active { animation: color-pulse 0.15s ease-out; }

@keyframes white-flash {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0; }
}
.white-flash-enter-active { animation: white-flash 0.1s ease-out; }
@keyframes fire-float {
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 10px orange); }
  50% { transform: translateY(-10px) scale(1.1); filter: drop-shadow(0 0 20px red); }
}
.animate-fire-float { animation: fire-float 1s ease-in-out infinite; }

@keyframes push-out {
  0% { transform: scale(1) translateX(40px); opacity: 1; }
  20% { transform: scale(1.1) translateX(35px); }
  100% { transform: scale(1.2) translateX(300px); opacity: 0; }
}
.animate-push-out { animation: push-out 1.2s ease-in forwards; }

@keyframes truck-tilt {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(-20deg) translateY(-10px); }
}
.animate-truck-tilt { animation: truck-tilt 0.6s ease-in-out infinite; }

@keyframes truck-jolt {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-15px); }
  75% { transform: translateX(15px); }
}
.animate-truck-jolt { animation: truck-jolt 0.2s infinite; }

@keyframes bulldozer-push {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(20px) scaleX(1.05); }
}
.animate-bulldozer-push { animation: bulldozer-push 0.5s infinite; }

@keyframes bulldozer-heavy {
  0%, 100% { transform: rotate(0) translateY(0); }
  50% { transform: rotate(5deg) translateY(5px); }
}
.animate-bulldozer-heavy { animation: bulldozer-heavy 0.8s infinite; }

@keyframes roll {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}
.animate-roll { animation: roll 1.5s infinite; }

@keyframes scoop-out {
  0% { transform: scale(1); opacity: 1; }
  70% { transform: translateY(0) rotate(10deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
}
.animate-scoop-out { animation: scoop-out 2s ease-in-out forwards; }

@keyframes water-particle {
  0% { transform: translate(0, 0) scale(0); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
}
.animate-water-particle { animation: water-particle 1.2s ease-out infinite; }

@keyframes excavator-varied {
  0%, 100% { transform: rotate(0); }
  30% { transform: rotate(-15deg) translateY(-10px); }
  60% { transform: rotate(10deg) translateY(5px); }
}
.animate-excavator-varied { animation: excavator-varied 1s ease-in-out infinite; }

@keyframes drive {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-drive { animation: drive 0.3s infinite; }

@keyframes text-pop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
.animate-text-pop { animation: text-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
@keyframes impact {
  0% { transform: scale(1); }
  20% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.animate-impact { animation: impact 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>

