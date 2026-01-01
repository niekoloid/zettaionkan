<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const isLoading = ref(false)

const plans = [
  {
    id: 'entry',
    name: 'エントリー',
    price: 100,
    description: 'まずは手軽に。',
    features: ['Level 3 までの全開放', 'Steinway音源（一部）'],
    color: 'bg-blue-50 border-blue-100 text-blue-600'
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: 980,
    description: '一番人気のプラン。',
    features: ['全レベルの全開放', '音源の全種類利用可能', '広告非表示'],
    color: 'bg-amber-50 border-amber-100 text-amber-600',
    popular: true
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: 1980,
    description: 'プロを目指すお子様に。',
    features: ['全機能利用可能', '新機能の先行体験', '優先サポート'],
    color: 'bg-gray-900 border-gray-800 text-white'
  }
]

const handleSubscribe = async (tier) => {
  isLoading.value = true
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('決済を行うにはログインが必要です。')
      return
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        user_id: user.id,
        tier: tier, // プラン情報を送信
        return_url: window.location.origin + '/premium/success'
      }
    })

    if (error) throw error
    if (data?.url) {
      window.location.href = data.url
    }
  } catch (err) {
    console.error('Subscription error:', err)
    alert('決済の準備中にエラーが発生しました。しばらく時間をおいて再度お試しください。')
  } finally {
    isLoading.value = false
  }
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

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Pricing Plans</h1>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">料金プラン</h2>
        <p class="text-sm text-gray-500 leading-relaxed">目的に合わせた3つのプランをご用意しました。</p>
      </div>

      <div class="space-y-6">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="rounded-3xl p-6 border transition-all relative overflow-hidden"
          :class="[plan.color, plan.id === 'premium' ? 'shadow-xl' : 'shadow-sm']"
        >
          <div v-if="plan.popular" class="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Popular</div>
          
          <h3 class="text-lg font-bold mb-1" :class="plan.id === 'premium' ? 'text-white' : 'text-gray-900'">{{ plan.name }}</h3>
          <p class="text-xs mb-4 opacity-70">{{ plan.description }}</p>
          
          <div class="text-2xl font-bold mb-6" :class="plan.id === 'premium' ? 'text-white' : 'text-gray-900'">
            ¥{{ plan.price.toLocaleString() }}<span class="text-xs font-normal opacity-60 ml-1">/月</span>
          </div>
          
          <ul class="space-y-3 mb-8">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center text-xs">
              <svg class="h-4 w-4 mr-2 shrink-0" :class="plan.id === 'premium' ? 'text-blue-400' : 'text-amber-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span :class="plan.id === 'premium' ? 'text-gray-300' : 'text-gray-600'">{{ feature }}</span>
            </li>
          </ul>

          <button 
            @click="handleSubscribe(plan.id)" 
            :disabled="isLoading"
            class="w-full font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm"
            :class="[
              plan.id === 'premium' 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            ]"
          >
            {{ isLoading ? '処理中...' : plan.name + 'を始める' }}
          </button>
        </div>
      </div>

      <p class="text-[10px] text-gray-400 mt-12 text-center">
        決済はStripeを通じて安全に行われます。<br>
        いつでもマイページからキャンセル可能です。
      </p>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
