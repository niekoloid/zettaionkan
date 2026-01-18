<template>
  <transition name="slide-up">
    <div v-if="isLoading" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md">
      <div class="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex items-center space-x-4">
        <!-- Spinner / Icon -->
        <div class="relative shrink-0 w-10 h-10">
          <svg class="animate-spin w-full h-full text-blue-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-700">
            {{ Math.round(loadingProgress) }}%
          </div>
        </div>

        <!-- Info -->
        <div class="flex-grow min-w-0">
          <div class="flex justify-between items-center mb-1">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider">
              {{ isPreloading ? '全ての音源を準備中...' : '音源を読み込み中...' }}
            </h3>
            <span class="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
              {{ isPreloading ? 'Full Load' : currentInstrumentLabel }}
            </span>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
              :style="{ width: `${loadingProgress}%` }"
            ></div>
          </div>
          
          <p class="text-[9px] text-gray-400 mt-1 truncate font-medium">
            {{ loadingFile || 'サンプルデータを準備しています' }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useAudio } from '~/composables/useAudio'

const { isLoading, isPreloading, loadingProgress, loadingFile, selectedInstrument } = useAudio()

const currentInstrumentLabel = computed(() => {
  if (selectedInstrument.value === 'steinway') return 'Steinway Piano'
  if (selectedInstrument.value === 'yamaha') return 'Yamaha Piano'
  return selectedInstrument.value
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  transform: translate(-50%, 100%) scale(0.9);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translate(-50%, 100%) scale(0.9);
  opacity: 0;
}
</style>
