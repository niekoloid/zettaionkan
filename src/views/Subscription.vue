<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const isLoading = ref(false)

const plans = [
  {
    id: 'entry',
    name: 'エントリー',
    price: 100,
    description: '白鍵の和音をすべて学べる基本プラン。',
    features: ['Level 2 (白鍵 2) の全開放', 'すべての基本機能へのアクセス'],
    color: 'bg-blue-50 border-blue-100 text-blue-600'
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: 980,
    description: '黒鍵や転回形まで含めた完全版。',
    features: ['Level 3〜5 (黒鍵) の全開放', 'すべてのアップデートへのアクセス'],
    color: 'bg-amber-50 border-amber-100 text-amber-600',
    popular: true
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
       throw new Error('No active session')
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        tier: tier,
        return_url: window.location.origin + '/subscription/success'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
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
  <div class="min-h-screen bg-white flex flex-col max-w-3xl mx-auto relative overflow-hidden shadow-2xl font-['Noto_Sans_JP']">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0">
      <router-link to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="../assets/logo_irooto.png" alt="いろおと" class="h-20 w-auto object-contain" />
      </div>
      <div class="w-10"></div>
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Pricing Plans</h1>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">料金プラン</h2>
        <p class="text-sm text-gray-500 leading-relaxed">全ての音を演奏するにはプランへの加入が必要です。</p>
      </div>

      <div class="space-y-6">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="rounded-3xl p-6 border transition-all relative overflow-hidden border-gray-100"
          :class="[plan.color]"
        >
          <div v-if="plan.popular" class="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">Popular</div>
          
          <h3 class="text-lg font-bold mb-1 text-gray-900">{{ plan.name }}</h3>
          <p class="text-[11px] mb-4 text-gray-400 font-medium">{{ plan.description }}</p>
          
          <div class="text-2xl font-black mb-6 text-gray-900">
            ¥{{ plan.price.toLocaleString() }}<span class="text-xs font-normal text-gray-400 ml-1 italic">/月</span>
          </div>
          
          <ul class="space-y-3 mb-8">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center text-[11px] font-bold text-gray-600">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <button 
            @click="handleSubscribe(plan.id)" 
            :disabled="isLoading"
            class="w-full font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 text-[13px] bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-black/5"
          >
            {{ isLoading ? '処理中...' : plan.name + 'プランに加入する' }}
          </button>
        </div>
      </div>

      <p class="text-[10px] text-gray-400 mt-12 text-center font-medium leading-relaxed">
        決済はStripeを通じて安全に行われます。<br>
        いつでもマイページからキャンセル可能です。
      </p>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
