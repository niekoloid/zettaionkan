<script setup lang="ts">
definePageMeta({
  middleware: [
    (to) => navigateTo('/')
  ]
})
</script>

<template>
  <div>Redirecting...</div>
</template>
