<script setup lang="ts">
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()


const { user, userTier, authReady } = useAuth()
const { namingConvention, formatChordName } = useAppSettings()

import type { HistoryItem } from '~/types/app'

interface TrainingSession {
  id: string
  created_at: string
  score: number
  total_questions: number
  details: HistoryItem[]
  settings: { mode: string; type?: string } | null
}

const trainingHistory = ref<TrainingSession[]>([])
const expandedSessionId = ref<string | null>(null)
const isLoadingHistory = ref(true)

const formatDate = (dateString: string) => {
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

const toggleSession = (sessionId: string) => {
  if (expandedSessionId.value === sessionId) {
    expandedSessionId.value = null
  } else {
    expandedSessionId.value = sessionId
  }
}

const deleteSession = async (sessionId: string) => {
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

  trainingHistory.value = trainingHistory.value.filter(s => s.id !== sessionId)
}

onMounted(async () => {
  try {
    await authReady
    
    if (user.value) {
      isLoadingHistory.value = true
      const { data: history } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(10)
        
      if (history) {
        trainingHistory.value = history
      }
    }
  } finally {
    isLoadingHistory.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative">
      <AppHeader showBack />

      <main class="flex-grow px-6 py-8">
        <div class="mb-8">
          <h2 class="text-2xl font-black text-gray-900 mb-2">学習履歴</h2>
          <p class="text-sm text-gray-400 font-bold">これまでのトレーニング成果を確認できます</p>
        </div>

        <!-- Training History Section -->
        <section class="space-y-6">
          <div v-if="isLoadingHistory" class="flex justify-center py-10">
            <div class="w-6 h-6 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="trainingHistory.length > 0" class="space-y-3">
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
                     <template v-if="session.settings?.mode === 'autoplay'">
                       <span class="text-[9px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-tighter">和音の聞き流し</span>
                     </template>
                     <template v-else-if="session.settings?.mode === 'chord_quizz'">
                       <span class="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-tighter">和音テスト</span>
                     </template>
                     <template v-else-if="session.settings?.mode === 'single_note_quizz' || session.settings?.type === 'single_note'">
                       <span class="text-[9px] font-black bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md border border-sky-100 uppercase tracking-tighter">単音テスト</span>
                     </template>
                     <template v-else>
                       <span class="text-[9px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100 uppercase tracking-tighter">和音トレーニング</span>
                     </template>

                     <span v-if="session.settings?.mode !== 'autoplay' && session.score === session.total_questions" class="text-[9px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-md font-black shadow-sm">PERFECT</span>
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
                        
                        <!-- Question Info -->
                        <div class="flex flex-col items-center space-y-1">
                          <div 
                            v-if="log?.question?.color"
                            class="w-8 h-8 rounded-lg shadow-sm border border-gray-100"
                            :style="{ backgroundColor: log.question.color }"
                          ></div>
                          <div v-else class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {{ log?.question?.name?.charAt(0) }}
                          </div>
                          <span class="text-[8px] font-bold text-gray-400 leading-none truncate max-w-[40px]">{{ formatChordName(log?.question) }}</span>
                        </div>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>

                        <!-- Answer Info -->
                        <div class="flex flex-col items-center space-y-1">
                          <template v-if="log && !log.isSkipped && log.answer">
                            <div v-if="log.answer?.color"
                              class="w-8 h-8 rounded-lg shadow-sm border border-gray-100"
                              :style="{ backgroundColor: log.answer.color }"
                            ></div>
                            <div v-else class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400"
                            >
                              {{ log.answer.name?.charAt(0) }}
                            </div>
                            <span class="text-[8px] font-bold" :class="log.isCorrect ? 'text-green-500' : 'text-rose-500'">{{ formatChordName(log.answer) }}</span>
                          </template>
                          <span v-else class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">SKIP</span>
                        </div>
                      </div>

                      <!-- Result Icon (Only for training) -->
                      <div v-if="session.settings?.mode !== 'autoplay'">
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
                    <p class="text-[10px] font-bold text-gray-500 mb-3">詳細情報の閲覧はスタンダードプラン以上限定です</p>
                    <NuxtLink to="/subscription" class="inline-block text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
                        プランを確認する
                    </NuxtLink>
                  </div>
              </div>
            </div>
            <p class="text-center text-[10px] text-gray-400 mt-4">直近の10件を表示しています</p>
          </div>
          <div v-else class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p class="text-sm text-gray-400 font-bold">履歴はまだありません</p>
            <NuxtLink to="/chordquizz" class="inline-block mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-600">
              トレーニングを開始する
            </NuxtLink>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
