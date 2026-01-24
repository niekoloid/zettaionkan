<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(true)
const mainCtaRef = ref<HTMLElement | null>(null)

// Function to handle scroll and hide sticky CTA when main CTA is visible
// For now, we'll keep it simple and always show it on mobile, 
// or maybe hide it when the hero CTA is visible if we want strict behavior.
// The prompt says "Sticky CTA" fixed at a thumb-friendly position.

</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden">
    <div class="flex flex-col items-center">
      <a href="/auth?mode=signup" class="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-center py-4 rounded-full shadow-lg text-lg animate-pulse">
        今すぐ無料で始める
      </a>
      <p class="text-xs text-gray-500 mt-1">登録時のカード入力は不要・無料プランからスタート</p>
    </div>
  </div>
</template>
