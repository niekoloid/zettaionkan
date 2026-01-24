<script setup lang="ts">
const route = useRoute()
const isLp = computed(() => route.path.startsWith('/lp'))

// Only use auth logic if not on LP to avoid unnecessary auth initialization/OIDC requests
let auth: any = { authReady: Promise.resolve() }
if (!isLp.value) {
  auth = useAuth()
}
const { authReady } = auth

onMounted(async () => {
  if (isLp.value) return

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
    <template v-if="!isLp">
      <AudioLoadingStatus />
      <CommonProModal />
    </template>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  background-color: #f3f4f6;
  color: #111827;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: 'Noto Sans JP', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

#chord-score svg {
  background: transparent !important;
}
</style>
