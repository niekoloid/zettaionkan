<script setup lang="ts">
const route = useRoute()
const { authReady } = useAuth()

onMounted(async () => {
  // Don't wait for auth or load audio logic on LP to keep it lean and fast
  if (route.path === '/lp') {
    return
  }

  await authReady

  // Global audio context resume handler
  const resumeAudio = async () => {
    // Dynamic import to keep Tone.js out of the initial entry bundle
    const Tone = await import('tone')
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
    <template v-if="route.path !== '/lp'">
      <AudioLoadingStatus />
      <CommonProModal />
    </template>
  </div>
</template>

<style>
/* Global styles are handled in assets/css/main.css usually, but specific overrides can go here */
#chord-score svg {
  background: transparent !important;
}
</style>
