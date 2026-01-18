<template>
  <div 
    @click="$emit('toggle')"
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
        {{ chord.displayColor }}
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
  </div>
</template>

<script setup>
import { useAppSettings } from '../composables/useAppSettings'

const { namingConvention, formatChordName } = useAppSettings()
const props = defineProps({
  chord: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const isLightColor = (hex) => {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180
}
</script>
