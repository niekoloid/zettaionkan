<script setup>
import { loadStripe } from '@stripe/stripe-js'
import { ref } from 'vue'

const isLoading = ref(false)

const handleSubscribe = async () => {
  isLoading.value = true
  
  // Stripeの初期化
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  
  // ※本来はここでバックエンドのAPIを叩き、Checkout Session IDを取得します。
  // 現在バックエンドがないため、ここではプレースホルダーのアラートを表示します。
  alert('決済機能を有効にするには、Stripe管理画面で商品を作成し、バックエンド（API）でSessionを作成する必要があります。バックエンドの実装準備が整いましたら、接続のお手伝いをいたします！')
  
  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0">
      <router-link to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-10 w-auto object-contain" />
      </div>
      <div class="w-10"></div>
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto text-center">
      <div class="mb-8">
        <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Premium Plan</h1>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">プレミアムプラン</h2>
        <p class="text-sm text-gray-500 leading-relaxed">全ての機能を開放して、<br>さらに本格的なトレーニングを。</p>
      </div>

      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 shadow-sm mb-8">
        <div class="text-3xl font-bold text-gray-900 mb-1">¥500<span class="text-sm font-normal text-gray-500 ml-1">/月</span></div>
        <div class="text-xs text-amber-600 font-bold mb-6">初月無料キャンペーン中</div>
        
        <ul class="text-left space-y-4 mb-8">
          <li class="flex items-start">
            <svg class="h-5 w-5 text-amber-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-gray-700 font-medium">Steinway グランドピアノ音源の全開放</span>
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-amber-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-gray-700 font-medium">レベル3以降の全てのコード練習</span>
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-amber-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-gray-700 font-medium">広告の完全非表示</span>
          </li>
        </ul>

        <button 
          @click="handleSubscribe" 
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {{ isLoading ? '処理中...' : 'プランを申しむ' }}
        </button>
      </div>

      <p class="text-[10px] text-gray-400">
        決済はStripeを通じて安全に行われます。<br>
        いつでもマイページからキャンセル可能です。
      </p>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
