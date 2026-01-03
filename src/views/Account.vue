<script setup>
import { ref, onMounted } from 'vue'
import { supabase, checkPremiumStatus } from '../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const userTier = ref('free')
const isLoading = ref(true)
const isPortalLoading = ref(false)
const trainingHistory = ref([])
const expandedSessionId = ref(null)

const hasCustomer = ref(false)

const formatDate = (dateString) => {
  const d = new Date(dateString)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const weekDay = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  
  return `${year}年${month}月${day}日（${weekDay}） ${hours}:${minutes} ${ampm}`
}

const toggleSession = (sessionId) => {
  if (expandedSessionId.value === sessionId) {
    expandedSessionId.value = null
  } else {
    expandedSessionId.value = sessionId
  }
}

const deleteSession = async (sessionId) => {
  if (!confirm('この履歴を削除してもよろしいですか？')) return

  const { error } = await supabase
    .from('training_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Error deleting session:', error)
    alert('削除に失敗しました')
    return
  }

  // Remove from local list
  trainingHistory.value = trainingHistory.value.filter(s => s.id !== sessionId)
}

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

  // Fetch training history
  const { data: history, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(10)
    
  if (history) {
    trainingHistory.value = history
  }

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
        <!-- Training History -->
        <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <div class="flex items-center space-x-2 mb-6">
             <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
             </div>
             <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">トレーニング履歴</p>
          </div>

          <div v-if="trainingHistory.length > 0" class="space-y-3">
            <div 
              v-for="session in trainingHistory" 
              :key="session.id"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div 
                @click="toggleSession(session.id)"
                class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p class="text-[10px] text-gray-400 font-bold mb-1">{{ formatDate(session.created_at) }}</p>
                  <div class="flex items-center space-x-2">
                     <span class="text-sm font-bold text-gray-700">和音トレーニング</span>
                     <span v-if="session.score === session.total_questions" class="text-[9px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-bold">PERFECT</span>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="text-right">
                    <span class="text-xl font-black text-gray-900">{{ session.score }}</span>
                    <span class="text-xs font-bold text-gray-300">/{{ session.total_questions }}</span>
                  </div>
                  <button 
                    @click.stop="deleteSession(session.id)"
                    class="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                    title="削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 text-gray-300 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedSessionId === session.id }"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Detailed Log -->
              <div v-if="expandedSessionId === session.id" class="border-t border-gray-100 bg-gray-50/50 p-4">
                  <div v-if="['standard', 'premium'].includes(userTier)" class="space-y-2">
                    <div 
                      v-for="(log, idx) in session.details" 
                      :key="idx"
                      class="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100"
                    >
                      <div class="flex items-center space-x-3">
                        <span class="text-xs font-bold text-gray-300 w-4">{{ idx + 1 }}</span>
                        
                        <!-- Question Color -->
                        <div 
                          class="w-8 h-8 rounded-lg shadow-sm border border-gray-100"
                          :style="{ backgroundColor: log.question.color }"
                        ></div>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>

                        <!-- Answer Color or Skip -->
                        <div v-if="!log.isSkipped && log.answer"
                          class="w-8 h-8 rounded-lg shadow-sm border border-gray-100"
                          :style="{ backgroundColor: log.answer.color }"
                        ></div>
                        <span v-else class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">SKIP</span>
                      </div>

                      <!-- Result Icon -->
                      <div>
                        <div v-if="log.isCorrect" class="text-green-500 bg-green-50 p-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div v-else class="text-red-400 bg-red-50 p-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4">
                    <div class="mb-2 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p class="text-[10px] font-bold text-gray-500 mb-3">詳細（どの音を間違えたか等）の閲覧は<br>スタンダードプラン以上の機能です</p>
                    <router-link to="/subscription" class="inline-block text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                        プランを確認する
                    </router-link>
                  </div>
              </div>
            </div>
            
             <p class="text-center text-[10px] text-gray-400 mt-4">直近の10件を表示しています</p>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-sm text-gray-400 font-bold">履歴はまだありません</p>
            <router-link to="/test" class="inline-block mt-4 text-xs font-bold text-blue-500 hover:text-blue-600">
              トレーニングを開始する
            </router-link>
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
