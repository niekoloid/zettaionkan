<script setup>
import { onMounted } from 'vue'
import { useAudio } from './composables/useAudio'
import { useAuth } from './composables/useAuth'

const { preloadAll } = useAudio()
const { authReady } = useAuth()

onMounted(async () => {
  // Wait for auth to be ready so we know user tier if needed, 
  // but preloadAll handles both currently
  await authReady
  preloadAll()
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
body {
  font-family: 'Noto Sans JP', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

#chord-score svg {
  background: transparent !important;
}
</style>
