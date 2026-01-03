<script setup>
import { useAuth } from '../composables/useAuth'

defineProps({
  showBack: {
    type: Boolean,
    default: false
  },
  transparent: {
    type: Boolean,
    default: false
  }
})

const { user, userTier } = useAuth()
</script>

<template>
  <header 
    class="w-full pt-10 pb-6 px-4 flex items-center justify-between shrink-0 relative z-20"
    :class="{ 'bg-white/80 backdrop-blur-md': !transparent }"
  >
    <!-- Left side: Back Button or Spacer -->
    <div class="w-10 flex items-center">
      <router-link 
        v-if="showBack" 
        to="/" 
        class="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
    </div>

    <!-- Center: Logo -->
    <div class="flex flex-col items-center">
      <router-link to="/">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-16 w-auto object-contain" />
      </router-link>
    </div>

    <!-- Right side: Account Icon -->
    <div class="w-10 flex items-center justify-end">
      <router-link 
        :to="user ? '/account' : '/auth'" 
        class="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors group flex items-center justify-center"
      >
        <svg v-if="!user" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <div v-else 
          class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border-2 transition-all shadow-sm"
          :class="[
            userTier === 'free' ? 'bg-white text-gray-400 border-gray-100' : 
            userTier === 'entry' ? 'bg-blue-50 text-blue-500 border-blue-200' :
            'bg-amber-50 text-amber-500 border-amber-200'
          ]"
        >
          {{ user?.email?.charAt(0) || '?' }}
        </div>
      </router-link>
    </div>
  </header>
</template>
