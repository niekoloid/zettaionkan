<script setup>
import { onMounted } from 'vue'
import { useAudio } from './composables/useAudio'
import { useAuth } from './composables/useAuth'
import AudioLoadingStatus from './components/AudioLoadingStatus.vue'

const { preloadAll } = useAudio()
const { authReady } = useAuth()

onMounted(async () => {
  // Wait for auth to be ready so we know user tier if needed
  await authReady
})
</script>

<template>
  <div class="relative min-h-screen">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global Audio Loading Status -->
    <AudioLoadingStatus />
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}

#chord-score svg {
  background: transparent !important;
}
</style>
