<script setup lang="ts">
const supabase = useSupabaseClient()


const isLoading = ref(false)

const plans = [
  {
    id: 'entry',
    name: 'エントリー',
    price: 100,
    trial: '初月無料',
    description: '白鍵の和音をすべて学べる基本プラン。',
    features: ['初月1ヶ月無料', '白鍵の和音を全開放', 'すべての基本機能へのアクセス'],
    color: 'bg-blue-50 border-blue-100 text-blue-600'
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: 980,
    trial: '初月無料',
    description: '黒鍵や転回形まで含めた完全版。',
    features: ['初月1ヶ月無料', '黒鍵・転回形を全開放', 'すべてのアップデートへのアクセス'],
    color: 'bg-amber-50 border-amber-100 text-amber-600',
    popular: true
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: 1980,
    trial: '初月無料',
    description: 'プロ仕様のSTEINWAY B音源を利用できる最高峰プラン。',
    features: ['初月1ヶ月無料', 'STEINWAY B音源の利用可能', '最高の音質でのトレーニング', '全レベル・全機能の開放'],
    color: 'bg-gray-900 border-gray-800 text-white',
    premium: true
  }
]

const handleSubscribe = async (tier: string) => {
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
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0">
      <NuxtLink to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="../assets/logo_irooto.png" alt="いろおと" class="h-20 w-auto object-contain" />
      </div>
      <div class="w-10"></div>
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Pricing Plans</h1>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">料金プラン</h2>
        <p class="text-sm text-gray-500 leading-relaxed">全ての音を演奏するにはプランへの加入が必要です。<br><span class="text-amber-500 font-bold">今ならすべてのプランが初月無料で始められます。</span></p>
      </div>

      <div class="space-y-6">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="rounded-3xl p-6 border transition-all relative overflow-hidden border-gray-100"
          :class="[plan.color]"
        >
          <div v-if="plan.popular" class="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">Popular</div>
          
          <h3 class="text-lg font-bold mb-1" :class="plan.premium ? 'text-white' : 'text-gray-900'">{{ plan.name }}</h3>
          <p class="text-[11px] mb-4 font-medium" :class="plan.premium ? 'text-gray-400' : 'text-gray-400'">{{ plan.description }}</p>
          
          <div class="flex items-baseline mb-6" :class="plan.premium ? 'text-white' : 'text-gray-900'">
            <span class="text-2xl font-black">¥{{ plan.price.toLocaleString() }}</span>
            <span class="text-xs font-normal ml-1 italic" :class="plan.premium ? 'text-gray-500' : 'text-gray-400'">/月</span>
            <span v-if="plan.trial" class="ml-3 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white animate-pulse">
              {{ plan.trial }}
            </span>
          </div>
          
          <ul class="space-y-3 mb-8">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center text-[11px] font-bold" :class="plan.premium ? 'text-gray-300' : 'text-gray-600'">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <button 
            @click="handleSubscribe(plan.id)" 
            :disabled="isLoading"
            class="w-full font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 text-[13px] shadow-lg shadow-black/5"
            :class="plan.premium ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'"
          >
            {{ isLoading ? '処理中...' : plan.name + 'プランに加入する' }}
          </button>
        </div>
      </div>

      <p class="text-[10px] text-gray-400 mt-12 text-center font-medium leading-relaxed">
        決済はStripeを通じて安全に行われます。<br>
        いつでもマイページからキャンセル可能です。<br>
        <NuxtLink to="/terms" class="hover:underline">利用規約</NuxtLink> | 
        <NuxtLink to="/privacy" class="hover:underline">プライバシーポリシー</NuxtLink> | 
        <NuxtLink to="/legal" class="hover:underline">特定商取引法に基づく表記</NuxtLink>
      </p>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
