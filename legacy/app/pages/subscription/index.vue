<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isLoading = ref(false)
const billingCycle = ref<'monthly' | 'yearly'>('monthly')



const handleSubscribe = async (tierArg: 'standard' | 'premium' = 'premium') => {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Debug: User ID:', user.value?.id)
    console.log('Debug: Session exists:', !!session)
    console.log('Debug: Access Token (prefix):', session?.access_token?.substring(0, 20))

    if (!user.value || !session) {
      alert('セッションが切れているか、ログインしていません。もう一度ログインしてください。')
      navigateTo('/auth')
      return
    }

    // Determine if we are in test mode based on the publishable key
    const stripeKey = useRuntimeConfig().public.stripePublishableKey || ''
    const isTest = stripeKey.startsWith('pk_test')
    console.log('Debug: Utilizing Stripe Key Mode (Test?):', isTest)

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        tier: tierArg,
        interval: billingCycle.value,
        return_url: window.location.origin + '/subscription/success',
        is_test: isTest
      }
      // Note: Authorization header is automatically added by the Supabase client
    })

    if (error) throw error
    if (data?.url) {
      window.location.href = data.url
    }
  } catch (err: any) {
    console.error('Subscription error:', err)
    // Extract error message if available
    const errorMessage = err?.message || JSON.stringify(err) || '不明なエラー'
    alert(`エラーが発生しました: ${errorMessage}\n\n(詳細はコンソールを確認してください)`)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative relative">
    <!-- Header -->
    <header class="pt-8 pb-6 px-4 flex items-center justify-between relative shrink-0">
      <NuxtLink to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="/logo_irooto.png" alt="いろおと" class="h-16 w-auto object-contain" />
      </div>
      <div class="w-10"></div>
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-2">Upgrade to Pro</h1>
        <h2 class="text-2xl font-black text-gray-900 mb-2">Proプランで才能を開花させる</h2>
        <p class="text-sm text-gray-500 leading-relaxed font-medium">黒鍵を含む全ての和音と、最高級の音源で<br>本物の絶対音感を身につけましょう。</p>
      </div>

      <!-- Billing Cycle Toggle -->
      <div class="flex justify-center mb-8">
        <div class="bg-gray-100 p-1 rounded-xl flex shadow-inner">
          <button 
            @click="billingCycle = 'monthly'"
            class="px-5 py-2 rounded-lg text-xs font-bold transition-all"
            :class="billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-md transform scale-105' : 'text-gray-400 hover:text-gray-600'"
          >
            月額払い
          </button>
          <button 
            @click="billingCycle = 'yearly'"
            class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center group"
            :class="billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-md transform scale-105' : 'text-gray-400 hover:text-gray-600'"
          >
            年額払い
            <span class="ml-1.5 text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full group-hover:bg-amber-200 transition-colors">お得</span>
          </button>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4 mb-8">
        <!-- Free Plan -->
        <div class="rounded-3xl p-6 border border-gray-100 bg-gray-50/50 flex flex-col">
          <h3 class="text-lg font-black text-gray-900 mb-1">Free</h3>
          <p class="text-[11px] text-gray-400 mb-4 font-bold">まずは基本から</p>
          <div class="text-3xl font-black text-gray-900 mb-6">¥0<span class="text-xs font-medium text-gray-400 ml-1">/月</span></div>
          <button disabled class="w-full py-3 rounded-xl bg-gray-200 text-gray-400 font-bold text-xs mb-6 cursor-default">現在のプラン</button>
          <ul class="space-y-3 flex-grow">
            <!-- Free Features -->
            <li class="flex items-center text-[11px] font-bold text-gray-600">
              <svg class="h-4 w-4 mr-2 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              <span>白鍵の和音 (9種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-300 line-through decoration-gray-300 decoration-2 opacity-60">
              <svg class="h-4 w-4 mr-2 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              <span>黒鍵の和音 (全14種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-300 line-through decoration-gray-300 decoration-2 opacity-60">
              <svg class="h-4 w-4 mr-2 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              <span>自動再生 (全モード)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-300 line-through decoration-gray-300 decoration-2 opacity-60">
              <svg class="h-4 w-4 mr-2 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              <span>Steinway B 音源</span>
            </li>
          </ul>
        </div>

        <!-- Standard Plan -->
        <div class="rounded-3xl p-6 border-2 border-indigo-100 bg-white relative overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
          <h3 class="text-lg font-black text-gray-900 mb-1">Standard</h3>
          <p class="text-[11px] text-gray-400 mb-4 font-bold">基本をしっかり</p>
          <div class="flex items-baseline mb-6">
            <span class="text-3xl font-black text-gray-900">¥{{ billingCycle === 'monthly' ? '980' : '9,800' }}</span>
            <span class="text-xs font-medium text-gray-400 ml-1">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
          </div>
          <button 
            @click="handleSubscribe('standard')" 
            :disabled="isLoading"
            class="w-full py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs mb-6 hover:bg-indigo-100 transition-all active:scale-95 relative overflow-hidden group"
          >
            <span class="relative z-10 flex items-center justify-center">
              <span>{{ isLoading ? '処理中...' : 'Standardを選ぶ' }}</span>
            </span>
          </button>
           <ul class="space-y-3 flex-grow">
            <!-- Standard Features -->
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>白鍵の和音 (9種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>黒鍵の和音 (全14種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>自動再生 (全モード)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-300 line-through decoration-gray-300 decoration-2 opacity-60">
              <svg class="h-4 w-4 mr-2 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              <span>Steinway B 音源</span>
            </li>
          </ul>
        </div>

        <!-- Premium Plan -->
        <div class="rounded-3xl p-6 border-2 border-amber-400 bg-white relative overflow-hidden shadow-xl shadow-amber-100/50 flex flex-col">
          <div class="absolute top-0 right-0 bg-amber-400 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-sm tracking-wide">RECOMMENDED</div>
          <h3 class="text-lg font-black text-gray-900 mb-1">Premium</h3>
          <p class="text-[11px] text-gray-400 mb-4 font-bold">最高品質の環境を</p>
          <div class="flex items-baseline mb-6">
            <span class="text-3xl font-black text-gray-900">¥{{ billingCycle === 'monthly' ? '1,980' : '15,000' }}</span>
            <span class="text-xs font-medium text-gray-400 ml-1">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
          </div>
          <button 
            @click="handleSubscribe('premium')" 
            :disabled="isLoading"
            class="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-xs mb-6 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200 relative overflow-hidden group"
          >
            <span class="relative z-10 flex items-center justify-center">
              <span>{{ isLoading ? '処理中...' : 'Premiumにアップグレード' }}</span>
              <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
           <ul class="space-y-3 flex-grow">
             <!-- Premium Features -->
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>白鍵の和音 (9種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>黒鍵の和音 (全14種類)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>自動再生 (全モード)</span>
            </li>
            <li class="flex items-center text-[11px] font-bold text-gray-900">
              <svg class="h-4 w-4 mr-2 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Steinway B 音源</span>
            </li>
          </ul>
        </div>
      </div>

      <p class="text-[10px] text-gray-400 mt-8 text-center font-medium leading-relaxed">
        決済はStripeを通じて安全に行われます。<br>
        いつでもマイページからキャンセル可能です。<br>
        <NuxtLink to="/terms" class="hover:underline">利用規約</NuxtLink> | 
        <NuxtLink to="/privacy" class="hover:underline">プライバシーポリシー</NuxtLink> | 
        <NuxtLink to="/legal" class="hover:underline">特定商取引法に基づく表記</NuxtLink>
      </p>
    </main>
    </div>
  </div>
</template>
