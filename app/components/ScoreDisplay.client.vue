<script setup lang="ts">
import abcjs from 'abcjs'

const props = defineProps({
  abc: {
    type: String,
    default: ''
  },
  octave: {
    type: Number,
    default: null
  },
  isAnswered: {
    type: Boolean,
    default: true
  },
  placeholderText: {
    type: String,
    default: '?'
  },
  placeholderSubtext: {
    type: String,
    default: '聴き取り中...'
  },
  clef: {
    type: String,
    default: 'treble'
  },
  id: {
    type: String,
    default: 'score-display'
  },
  compact: {
    type: Boolean,
    default: false
  },
  scale: {
    type: Number,
    default: 1
  }
})

const scoreContainer = ref(null)
const uniqueId = `score-${Math.random().toString(36).substr(2, 9)}`

const render = () => {
  if (!props.isAnswered) return

  // Remove chord symbols if present (Home page requirement)
  const cleanAbc = (props.abc || 'y').replace(/"[^"]*"/g, "")
  const clefStr = props.clef === 'bass' ? 'clef=bass' : ''
  
  abcjs.renderAbc(uniqueId, `L:1\nK:C ${clefStr}\n${cleanAbc}`, {
    responsive: undefined,
    scale: props.scale * (props.compact ? 0.7 : 1),
    paddingtop: props.compact ? 0 : 15,
    paddingbottom: props.compact ? 0 : 15,
    paddingleft: 0,
    paddingright: 0,
    staffwidth: props.compact ? 50 : 70,
    add_classes: false
  })
}

onMounted(() => {
  render()
})

watch(() => [props.abc, props.isAnswered, props.octave], () => {
  if (props.isAnswered) {
    nextTick(render)
  }
})
</script>

<template>
  <div 
    :class="[
      compact 
        ? 'w-20 h-16 bg-gray-50/50 rounded-xl' 
        : 'w-[155px] h-[180px] bg-white rounded-3xl p-4 shadow-sm border border-gray-100'
    ]"
    class="flex flex-col items-center justify-center overflow-hidden relative"
  >
    <!-- Placeholder mask when not answered -->
    <div v-if="!isAnswered" class="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
      <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2 border border-gray-100">
        <span class="text-xl font-black text-indigo-500">{{ placeholderText }}</span>
      </div>
      <span v-if="placeholderSubtext" class="text-[7px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">
        {{ placeholderSubtext }}
      </span>
    </div>

    <!-- Staff Area -->
    <div v-show="isAnswered" :id="uniqueId" class="w-full flex justify-center items-center pointer-events-none animate-bounce-in" :class="{'scale-125': !compact}"></div>
    
    <slot name="footer" v-if="!compact"></slot>
  </div>
</template>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.15); opacity: 1; }
  70% { transform: scale(0.9); }
  100% { transform: scale(1.1); } /* Kept the scale 1.1 from the previous unified design */
}
.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
</style>
