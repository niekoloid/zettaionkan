<script setup lang="ts">
const { streakCount, fetchStreak } = useStreak()
const { user } = useAuth()

onMounted(() => {
  if (user.value) {
    fetchStreak()
  }
})

// Refetch when user changes (e.g. login)
watch(user, (newUser) => {
  if (newUser) {
    fetchStreak()
  } else {
    streakCount.value = 0
  }
})
</script>

<template>
  <div v-if="user && streakCount > 1" class="flex flex-col items-center mx-3 animate-pulse">
    <div class="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-1 rounded-full border border-orange-200">
      <span class="text-lg leading-none">🔥</span>
      <span class="text-xs font-black text-orange-600 font-mono">{{ streakCount }}</span>
    </div>
    <span class="text-[8px] font-bold text-orange-400 mt-0.5 uppercase tracking-tighter">Day Streak</span>
  </div>
  <!-- Minimal version for 0 or 1 streak (optional, or just hide) -->
  <div v-else-if="user" class="hidden sm:flex flex-col items-center mx-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="練習してストリークを伸ばそう！">
     <div class="flex items-center space-x-1 px-2 py-1 rounded-full border border-gray-200">
      <span class="text-lg leading-none">🔥</span>
      <span class="text-xs font-black text-gray-400 font-mono">{{ streakCount || 0 }}</span>
    </div>
  </div>
</template>
