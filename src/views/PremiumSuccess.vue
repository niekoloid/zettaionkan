<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 3秒後にホームへリダイレクト
  setTimeout(() => {
    router.push('/')
  }, 5000)
})
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl items-center justify-center px-8 text-center">
    <div class="mb-8 bg-green-50 p-6 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-4">プレミアムプランへの登録が<br>完了しました！</h1>
    <p class="text-sm text-gray-500 leading-relaxed mb-8">
      ご利用ありがとうございます。<br>
      全ての機能をお楽しみいただけます。
    </p>
    
    <div class="space-y-4 w-full">
      <router-link to="/" class="block w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all">
        トレーニングに戻る
      </router-link>
      <p class="text-[10px] text-gray-400">5秒後に自動的にホーム画面に戻ります</p>
    </div>
  </div>
</template>
