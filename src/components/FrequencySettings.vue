<script setup>
import { computed } from 'vue'

const props = defineProps({
  parentChordRatio: {
    type: Number,
    required: true
  },
  isReviewWeighted: {
    type: Boolean,
    required: true
  },
  parentChord: {
    type: Object,
    required: false
  },
  otherChords: {
    type: Array,
    required: true
  },
  otherChordsDisplay: {
    type: String,
    required: true
  },
  otherChordsWithWeights: {
    type: Array,
    required: true
  },
  selectedCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:parentChordRatio', 'update:isReviewWeighted'])

const internalRatio = computed({
  get: () => props.parentChordRatio,
  set: (val) => emit('update:parentChordRatio', val)
})

const internalReviewWeighted = computed({
  get: () => props.isReviewWeighted,
  set: (val) => emit('update:isReviewWeighted', val)
})
</script>

<template>
  <div v-if="selectedCount > 1" class="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-5">
    <div>
      <p class="text-sm font-black text-gray-900">出現割合の調整</p>
      <p class="text-[10px] font-bold text-gray-400 mt-0.5">新しい和音と復習の和音のバランス</p>
    </div>

    <!-- Visual Bar -->
    <div class="space-y-2">
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <div class="flex items-center space-x-1.5 mb-1">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: parentChord?.color }"></span>
              <span class="text-[10px] font-black text-gray-700">新音: {{ parentChord?.displayColor }}</span>
          </div>
          <span class="text-xl font-black text-gray-900">{{ Math.round(parentChordRatio * 10) }}</span>
        </div>
        <div class="text-gray-300 font-black text-xl">:</div>
        <div class="flex flex-col items-end">
          <div class="flex items-center space-x-1.5 mb-1">
            <span class="text-[10px] font-black text-gray-700">復習: {{ otherChordsDisplay }}</span>
            <div class="flex -space-x-1">
              <span 
                v-for="c in otherChords.slice(0, 3)" 
                :key="c.id" 
                class="w-2 h-2 rounded-full border border-white" 
                :style="{ backgroundColor: c.color }"
              ></span>
            </div>
          </div>
          <span class="text-xl font-black text-gray-900">{{ 10 - Math.round(parentChordRatio * 10) }}</span>
        </div>
      </div>

      <div class="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner border border-gray-100">
        <!-- New Chord Segment (Left) -->
        <div 
          class="h-full transition-all duration-500 ease-out relative group"
          :style="{ width: (parentChordRatio * 100) + '%', backgroundColor: parentChord?.color }"
        >
          <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
        <!-- Review Segment (Right) -->
        <div class="h-full flex" :style="{ width: ((1 - parentChordRatio) * 100) + '%' }">
           <div 
             v-for="c in otherChordsWithWeights" 
             :key="c.id" 
             class="h-full transition-all duration-500 shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]"
             :style="{ 
               width: (c.weight * 100) + '%', 
               backgroundColor: c.color 
             }"
           ></div>
        </div>
      </div>
    </div>

    <input 
      type="range" 
      v-model.number="internalRatio" 
      min="0.1" 
      max="0.5" 
      step="0.1"
      class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
    >
    
    <div class="flex justify-between px-1">
      <div class="text-center">
        <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">新音控えめ</p>
        <p class="text-[8px] font-bold text-gray-300 mt-0.5">1 : 9</p>
      </div>
      <div class="text-center">
        <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">バランス重視</p>
        <p class="text-[8px] font-bold text-gray-300 mt-0.5">3 : 7</p>
      </div>
      <div class="text-center">
        <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">新音たっぷり</p>
        <p class="text-[8px] font-bold text-gray-300 mt-0.5">5 : 5</p>
      </div>
    </div>

    <!-- Review Weighting Toggle -->
    <div 
      @click="internalReviewWeighted = !internalReviewWeighted"
      class="pt-4 border-t border-gray-100 flex items-center justify-between cursor-pointer group"
    >
      <div class="pr-4">
        <p class="text-[11px] font-black text-gray-800 flex items-center">
          復習の重み付け
        </p>
        <p class="text-[9px] font-bold text-gray-400 mt-0.5">Lv1に近い基礎の音をより多く、新音に近い音を少なめに出題</p>
      </div>
      <div 
        class="w-8 h-4.5 rounded-full transition-colors relative shrink-0"
        :class="internalReviewWeighted ? 'bg-blue-500' : 'bg-gray-200'"
      >
        <div 
          class="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm"
          :class="internalReviewWeighted ? 'translate-x-3.5' : ''"
        ></div>
      </div>
    </div>
  </div>
</template>
