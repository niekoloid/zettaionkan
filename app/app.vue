<script setup lang="ts">
const { authReady } = useAuth()

onMounted(async () => {
  await authReady
})
</script>

<template>
  <div class="relative min-h-screen">
    <NuxtPage />
    <AudioLoadingStatus />
  </div>
</template>

<style>
/* Global styles are handled in assets/css/main.css usually, but specific overrides can go here */
#chord-score svg {
  background: transparent !important;
}
</style>
