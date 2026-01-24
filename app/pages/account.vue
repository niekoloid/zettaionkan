<script setup lang="ts">
const router = useRouter()
const supabase = useSupabaseClient()
const { checkProStatus } = usePro()
const { user, userTier, refreshStatus } = useAuth()
import type { SubscriptionTier } from '~/types/app'
const isLoading = ref(true)
const isPortalLoading = ref(false)
const hasCustomer = ref(false)

const handleRefresh = async () => {
  isLoading.value = true
  await refreshStatus()
  const status = await checkProStatus()
  hasCustomer.value = status.hasCustomer
  isLoading.value = false
}

onMounted(async () => {
  try {
    if (!user.value) {
      // Re-check once just in case of race condition during navigation
      await refreshStatus()
      if (!user.value) {
        router.push('/auth')
        return
      }
    }

    const status = await checkProStatus()
    hasCustomer.value = status.hasCustomer
  } catch (e) {
    console.error('Failed to load account info:', e)
  } finally {
    isLoading.value = false
  }
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

const getTierName = (tier: SubscriptionTier | undefined | null | string) => {
  if (tier === "premium") return 'PROプラン'
  if (tier === 'standard') return 'スタンダードプラン'
  if (tier === 'entry') return 'フリープラン'
  if (tier === 'free') return 'フリープラン（未ログイン）'
  return '無料プラン'
}

const openCustomerPortal = async () => {
  if (!hasCustomer.value) {
    // Try one last refresh before giving up
    await handleRefresh()
    
    if (!hasCustomer.value) {
      alert('お支払い情報が見つかりません。プランへの加入履歴がありません。\nプランに加入したばかりの場合は、反映まで数分かかることがあります。')
      return
    }
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

// Debug Support
const isDev = import.meta.dev
const setDebugTier = (tier: string | null) => {
  const cookie = useCookie('zettaionkan_debug_tier')
  cookie.value = tier
  // Force reload to apply changes if reactivity is stuck (though cookie should be reactive)
  if (confirm(`Debugging: Set tier to ${tier || 'Real'}. Reload?`)) {
    window.location.reload()
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <AppHeader showBack />

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
              <div class="flex items-center space-x-2">
                <p class="text-base font-black text-gray-900">{{ getTierName(userTier) }}</p>
                <button @click="handleRefresh" class="p-1 text-gray-400 hover:text-indigo-500 transition-colors" title="ステータスを更新">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <NuxtLink to="/subscription" class="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              プラン一覧を見る
            </NuxtLink>
          </div>
        </div>

        <!-- Management Menu -->
        <div class="space-y-3">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">各種設定</p>
          
          <button 
            v-if="userTier !== 'free' || hasCustomer"
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

        <!-- Back to Home Button -->
        <div class="pt-10">
          <NuxtLink 
            to="/" 
            class="flex items-center justify-center space-x-2 py-4 text-gray-400 hover:text-gray-600 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="text-sm font-bold">ホームに戻る</span>
          </NuxtLink>
        </div>

        <!-- Debug Section (Dev Only) -->
        <section v-if="isDev" class="opacity-50 hover:opacity-100 transition-opacity pt-8">
          <div class="border-t border-dashed border-gray-300 pt-6">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Development Debug</h3>
            <div class="flex gap-2 flex-wrap">
              <button 
                @click="setDebugTier('free')"
                class="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold hover:bg-gray-200"
              >
                Force Free
              </button>
              <button 
                @click="setDebugTier('entry')"
                class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold hover:bg-blue-200"
              >
                Force Entry
              </button>
              <button 
                @click="setDebugTier('standard')"
                class="px-3 py-1 bg-green-100 text-green-600 rounded text-xs font-bold hover:bg-green-200"
              >
                Force Standard
              </button>
              <button 
                @click="setDebugTier('premium')"
                class="px-3 py-1 bg-amber-100 text-amber-600 rounded text-xs font-bold hover:bg-amber-200"
              >
                Force PRO (Pro)
              </button>
              <button 
                @click="setDebugTier(null)"
                class="px-3 py-1 bg-white border border-gray-200 text-gray-400 rounded text-xs font-bold hover:bg-gray-50"
              >
                Reset to Real
              </button>
            </div>
          </div>
        </section>
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
