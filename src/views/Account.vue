<script setup>
import { ref, onMounted } from 'vue'
import { supabase, checkPremiumStatus } from '../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const userTier = ref('free')
const isLoading = ref(true)
const isPortalLoading = ref(false)

const hasCustomer = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    router.push('/auth')
    return
  }
  user.value = data.user
  
  const status = await checkPremiumStatus()
  userTier.value = status.tier
  hasCustomer.value = status.hasCustomer
  isLoading.value = false
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

const getTierName = (tier) => {
  switch (tier) {
    case 'entry': return 'エントリープラン'
    case 'standard': return 'スタンダードプラン'
    case 'premium': return 'プレミアムプラン'
    default: return '無料プラン'
  }
}

const openCustomerPortal = async () => {
  if (!hasCustomer.value) {
    alert('お支払い情報が見つかりません。プランへの加入履歴がありません。')
    return
  }

  isPortalLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

    // Edge Function 'create-portal-session' を呼び出す
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { return_url: window.location.origin + '/account' },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
    
    if (error) throw error
    if (data?.url) {
      window.location.href = data.url
    }
  } catch (err) {
    console.error('Portal error:', err)
    alert('管理画面の準備中にエラーが発生しました。しばらく時間をおいてから再度お試しください。')
  } finally {
    isPortalLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
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

    <main v-if="!isLoading" class="flex-grow px-8 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <h1 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">My Account</h1>
        <h2 class="text-xl font-bold text-gray-900 mb-2">マイページ</h2>
      </div>

      <div class="space-y-8">
        <!-- User Info Card -->
        <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl font-bold text-gray-400 uppercase">
              {{ user?.email?.charAt(0) }}
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">メールアドレス</p>
              <p class="text-sm font-bold text-gray-900 truncate max-w-[200px]">{{ user?.email }}</p>
            </div>
          </div>

          <div class="pt-6 border-t border-white flex justify-between items-center">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">現在のプラン</p>
              <p class="text-base font-black text-gray-900">{{ getTierName(userTier) }}</p>
            </div>
            <router-link v-if="userTier === 'free'" to="/subscription" class="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              プラン一覧を見る
            </router-link>
          </div>
        </div>

        <!-- Management Menu -->
        <div class="space-y-3">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">各種設定</p>
          
          <button 
            v-if="hasCustomer"
            @click="openCustomerPortal"
            :disabled="isPortalLoading"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700">{{ isPortalLoading ? '準備中...' : 'お支払い情報の管理・解約' }}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-red-50 transition-all group"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mr-3 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span class="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">ログアウト</span>
            </div>
          </button>
        </div>
      </div>
    </main>

    <div v-else class="flex-grow flex items-center justify-center">
      <div class="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
