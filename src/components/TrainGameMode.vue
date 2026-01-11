<template>
  <div class="absolute inset-0 flex flex-col bg-white overflow-hidden font-['Noto_Sans_JP']">
    <!-- Dynamic Background Layer -->
    <div 
      class="absolute inset-0 transition-colors duration-1000"
      :class="!userAnswer ? 'bg-sky-200' : ''"
      :style="userAnswer ? { backgroundColor: userAnswer.color, opacity: 0.2 } : {}"
    ></div>
    
    <!-- Background: Sun, Clouds, Hills -->
    <div class="absolute top-8 left-8 text-yellow-500 animate-pulse-slow">
       <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" class="filter drop-shadow-lg"><circle cx="12" cy="12" r="5"/><path d="M12,2V5"/><path d="M12,19V22"/><path d="M22,12H19"/><path d="M5,12H2"/><path d="M19.07,4.93L16.95,7.05"/><path d="M7.05,16.95L4.93,19.07"/><path d="M19.07,19.07L16.95,16.95"/><path d="M7.05,7.05L4.93,4.93"/></svg>
    </div>
    
    <div class="absolute top-16 right-10 text-white/80 opacity-80 float-cloud-1">
      <svg width="100" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5,12c-1.1,0-2.1,0.3-2.9,0.9c-0.6-2.5-2.9-4.4-5.6-4.4c-3.1,0-5.6,2.3-5.9,5.2C3.9,13.9,4,14,4,14H3 c-1.7,0-3,1.3-3,3s1.3,3,3,3h15.5c1.9,0,3.5-1.6,3.5-3.5S20.4,12,18.5,12z"/></svg>
    </div>
    <div class="absolute top-28 left-1/3 text-white/60 opacity-60 float-cloud-2">
      <svg width="70" height="45" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5,12c-1.1,0-2.1,0.3-2.9,0.9c-0.6-2.5-2.9-4.4-5.6-4.4c-3.1,0-5.6,2.3-5.9,5.2C3.9,13.9,4,14,4,14H3 c-1.7,0-3,1.3-3,3s1.3,3,3,3h15.5c1.9,0,3.5-1.6,3.5-3.5S20.4,12,18.5,12z"/></svg>
    </div>

    <!-- Distant Hills -->
    <div class="absolute bottom-20 left-0 right-0 h-48 flex items-end opacity-80">
      <div class="w-full h-full bg-lime-300 rounded-t-[100%] scale-x-150 translate-y-20"></div>
    </div>
    <div class="absolute bottom-20 left-10 right-0 h-40 flex items-end opacity-90">
       <div class="w-full h-full bg-green-400 rounded-t-[80%] scale-x-125 translate-y-10"></div>
    </div>


    <!-- Main Game Area (Track & Train) -->
    <div class="flex-grow relative flex flex-col justify-end pb-32 overflow-x-hidden">
      
      <!-- Track Bed -->
      <div class="absolute bottom-0 h-8 w-full bg-stone-400 border-t-4 border-stone-500 z-10"></div>
      <!-- Rails and Sleepers are stylized in CSS or simplified -->
      <div class="absolute bottom-8 w-full h-4 bg-gray-600 z-10 shadow-md"></div>
      
      <!-- Train Container -->
      <!-- We want the train to 'grow' from left to right as new cars are added. 
           Newest car (current question) should probably be at the END (Right) or START (Left)?
           Typically trains are pulled. Let's say the engine is at the far RIGHT moving RIGHT, 
           and we add cars to the LEFT (tail). 
           OR: Engine is at LEFT moving LEFT, and we add cars to the RIGHT.
           
           Let's go with: Engine is on the LEFT, facing RIGHT. It pulls the train. 
           But wait, if we add history, the history grows. 
           Let's visualize: [Engine] - [Car 1] - [Car 2] - [Car 3 (Newest)]. 
           This feels like a train getting longer.
      -->
      <div class="relative w-full h-40 flex items-end z-20 overflow-visible mb-10 px-4">
        <TransitionGroup ref="trainContainerRef" name="train-car" tag="div" class="flex flex-row items-end gap-1 w-full justify-start overflow-x-auto scrollbar-hide pr-[50vw]">
            
            <!-- Engine (Static Leader) -->
            <div key="engine" class="relative shrink-0 w-32 h-28 z-30 train-engine filter drop-shadow-xl mr-1">
                <svg viewBox="0 0 100 80" class="w-full h-full">
                   <!-- Main Body -->
                   <path d="M10,80 L90,80 L90,40 L60,40 L60,20 L40,20 L40,40 L10,40 Z" fill="#374151" />
                   <!-- Cab Roof -->
                   <path d="M60,40 L90,40 L85,30 L65,30 Z" fill="#1f2937" />
                   <!-- Chimney -->
                   <rect x="20" y="20" width="10" height="20" fill="#1f2937" />
                   <path d="M15,20 L35,20 L30,10 L20,10 Z" fill="#111827" />
                   <!-- Cow Catcher -->
                   <path d="M85,80 L100,80 L90,40 Z" fill="#ef4444" />
                   <!-- Wheels -->
                   <circle cx="25" cy="80" r="10" fill="#9ca3af" stroke="#4b5563" stroke-width="2" />
                   <circle cx="50" cy="80" r="10" fill="#9ca3af" stroke="#4b5563" stroke-width="2" />
                   <circle cx="75" cy="80" r="10" fill="#9ca3af" stroke="#4b5563" stroke-width="2" />
                   <!-- Window -->
                   <rect x="65" y="45" width="20" height="15" fill="#93c5fd" />
                   
                   <!-- Smoke Puff Animation embedded in SVG? Or separate div. -->
                </svg>
                <!-- Steam -->
                <div class="absolute -top-10 left-4 text-white/70 animate-ping-slow text-2xl">☁️</div>
            </div>

            <!-- Cars (History) -->
            <div 
                v-for="(history, index) in correctHistory" 
                :key="history.question.id + '-' + index"
                class="relative shrink-0 w-24 h-24 z-20 train-car flex flex-col justify-end"
            >
                <!-- Connector -->
                <div class="absolute bottom-3 -left-2 w-4 h-2 bg-gray-800 z-0"></div>

                <svg viewBox="0 0 100 80" class="w-full h-full filter drop-shadow-lg transform transition-transform hover:scale-105 cursor-pointer">
                    <!-- Car Body with Dynamic Color -->
                    <rect x="5" y="20" width="90" height="50" rx="5" :fill="history.question.color" stroke="rgba(0,0,0,0.1)" stroke-width="2" />
                    <!-- Roof -->
                    <path d="M2,20 L98,20 L90,10 L10,10 Z" fill="rgba(255,255,255,0.3)" />
                    <!-- Windows -->
                    <rect x="15" y="30" width="20" height="20" rx="2" fill="#e0f2fe" />
                    <rect x="40" y="30" width="20" height="20" rx="2" fill="#e0f2fe" />
                    <rect x="65" y="30" width="20" height="20" rx="2" fill="#e0f2fe" />
                    <!-- Wheels -->
                    <circle cx="20" cy="75" r="8" fill="#4b5563" />
                    <circle cx="80" cy="75" r="8" fill="#4b5563" />
                    <!-- Stripe -->
                    <rect x="5" y="55" width="90" height="5" fill="rgba(0,0,0,0.1)" />
                </svg>
                
                <!-- Color Name Label on Car -->
                <div class="absolute top-1/2 left-0 right-0 text-center transform -translate-y-1/2 pointer-events-none">
                    <span 
                        class="text-[10px] font-black bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm"
                        :style="{ color: history.question.color }"
                    >
                        {{ history.question.colorName }}
                    </span>
                </div>
            </div>

        </TransitionGroup>
      </div>

    </div>

    <!-- Bottom Controls: Station Platform -->
    <div class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-50">
      <div class="flex justify-between items-center mb-3 px-2">
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest">きっぷ売り場 (カラー選択)</h3>
        
        <!-- Replay Button -->
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
      
      <div class="grid gap-2" :class="gridColsClass">
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
            <!-- Ticket / Icon representation -->
            <div 
                class="mb-1 w-10 h-6 rounded-md shadow-md flex items-center justify-center border-2 border-white transform transition-transform group-hover:-translate-y-1"
                :style="{ backgroundColor: chord.color }"
            >
                <div class="w-8 h-4 border border-white/30 border-dashed rounded-sm"></div>
            </div>
            
            <div class="flex flex-col items-center leading-none">
              <span class="text-[10px] font-black text-gray-800 mb-1 whitespace-nowrap">
                {{ chord.colorName }}
              </span>
            </div>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

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

const trainContainerRef = ref(null)

const scrollToNewestCar = async () => {
    if (!trainContainerRef.value) return
    
    // Wait for DOM updates and a bit of transition
    await nextTick()
    await new Promise(r => setTimeout(r, 50))
    
    // TransitionGroup with tag="div" will have the div as $el or the ref itself
    const container = trainContainerRef.value.$el || trainContainerRef.value
    if (!container || !container.querySelectorAll) return

    const cars = container.querySelectorAll('.train-car')
    if (cars.length > 0) {
        const lastCar = cars[cars.length - 1]
        lastCar.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        })
    } else {
        // Scroll to engine if it's the first thing
        const engine = container.querySelector('.train-engine')
        if (engine) {
            engine.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            })
        }
    }
}

watch(() => props.correctHistory.length, () => {
    scrollToNewestCar()
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
/* Train Car Entry Animation */
.train-car-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.train-car-leave-active {
  transition: all 0.5s ease;
}
.train-car-enter-from {
  transform: translateX(-50px) scale(0.5);
  opacity: 0;
}
.train-car-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Background Animations */
.animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.animate-ping-slow {
    animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.float-cloud-1 {
  animation: float-1 30s linear infinite;
}
.float-cloud-2 {
  animation: float-2 45s linear infinite;
}

@keyframes float-1 {
  0% { transform: translateX(0); }
  50% { transform: translateX(-40px); }
  100% { transform: translateX(0); }
}
@keyframes float-2 {
  0% { transform: translateX(0); }
  50% { transform: translateX(60px); }
  100% { transform: translateX(0); }
}

/* Hide scrollbar for train container */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
