<script setup lang="ts">
import * as Tone from 'tone'
const route = useRoute()
const { authReady } = useAuth()

onMounted(async () => {
  // Don't wait for auth on LP to speed up initial load
  if (route.path !== '/lp') {
    await authReady
  }

  // Global audio context resume handler
  const resumeAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
      console.log('AudioContext started via global gesture')
    }
    // Remove listeners after first successful interaction
    window.removeEventListener('click', resumeAudio)
    window.removeEventListener('touchstart', resumeAudio)
  }

  window.addEventListener('click', resumeAudio)
  window.addEventListener('touchstart', resumeAudio)
})
</script>

<template>
  <div class="relative min-h-screen">
    <NuxtPage />
    <AudioLoadingStatus />
    <CommonProModal />
  </div>
</template>

<style>
/* Global styles are handled in assets/css/main.css usually, but specific overrides can go here */
#chord-score svg {
  background: transparent !important;
}
</style>
