<template>
  <div 
    @click="locked ? $emit('locked-click') : $emit('toggle')"
    class="flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.98] group"
    :class="[
      selected
        ? 'shadow-lg bg-white border-gray-200' 
        : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white'
    ]"
  >
    <!-- Top Highlight Bar -->
    <div 
      class="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
      :style="{ 
        backgroundColor: selected ? chord.color : 'transparent',
        opacity: selected ? 1 : 0
      }"
    ></div>

    <!-- Number Indicator Circle -->
    <div 
      class="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 text-[11px] font-black shadow-sm"
      :style="{ 
        backgroundColor: chord.color, 
        color: isLightColor(chord.color) ? '#000' : '#fff' 
      }"
    >
      {{ chord.sortOrder }}
    </div>

    <div class="flex flex-col items-start overflow-hidden min-w-0">
      <span class="font-bold text-gray-900 text-[15px] leading-tight truncate w-full">
        {{ formatChordName(chord) }}
      </span>
      <span class="text-[10px] font-medium text-gray-400 shrink-0 truncate w-full">
        {{ formatColorName(chord.displayColor || '') }}
      </span>
    </div>

    <!-- Selection Mark -->
    <div 
      v-if="selected" 
      class="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :style="{ color: isLightColor(chord.color) ? '#111827' : chord.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Locked Overlay -->
    <div v-if="locked" class="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex items-center justify-center z-10 cursor-not-allowed">
      <div class="bg-white/90 p-1.5 rounded-full shadow-sm border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppSettings } from '~/composables/useAppSettings'

import type { Chord } from '~/constants/chords'

const { namingConvention, formatChordName, formatColorName } = useAppSettings()
const props = defineProps({
  chord: {
    type: Object as PropType<Chord>,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  locked: {
    type: Boolean,
    default: false
  }
})

import { type PropType } from 'vue'

defineEmits(['toggle', 'locked-click'])

const isLightColor = (hex: string) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180
}
</script>
