<script setup lang="ts">
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()


const name = ref('')
const email = ref('')
const subject = ref('question')
const message = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)
const error = ref('')

const subjects = [
  { id: 'question', label: '一般的なご質問' },
  { id: 'request', label: '改善・機能要望' },
  { id: 'media', label: 'メディア・取材関係' },
  { id: 'other', label: 'その他' }
]

const handleSubmit = async () => {
  if (!name.value || !email.value || !message.value) {
    error.value = 'お名前、メールアドレス、お問い合わせ内容は必須です。'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // 1. Save to Supabase table (Optional but recommended)
    const { error: dbError } = await supabase
      .from('inquiries')
      .insert([
        { 
          name: name.value, 
          email: email.value, 
          subject: subject.value, 
          message: message.value 
        }
      ] as any)
    
    // If table doesn't exist, we might get an error, but we still try to call the function
    if (dbError) {
      console.warn('Database save failed, continuing to send email:', dbError)
    }

    // 2. Call Edge Function to send email
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error: fnError } = await supabase.functions.invoke('send-inquiry', {
      body: {
        name: name.value,
        email: email.value,
        subject: subjects.find(s => s.id === subject.value)?.label,
        message: message.value
      },
      headers: session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : {}
    })

    if (fnError) throw fnError

    isSubmitted.value = true
  } catch (err) {
    console.error('Inquiry submission error:', err)
    error.value = '送信中にエラーが発生しました。しばらく時間をおいて再度お試しいただくか、公式SNS等からお問い合わせください。'
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
        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm transition-all duration-500" :class="{ 'scale-95 opacity-50': isLoading }">
          <div class="text-center mb-10">
            <h1 class="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Contact Us</h1>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h2>
            <p class="text-xs text-gray-500 leading-relaxed">ご質問やご要望、取材のご依頼など、<br>お気軽にお問い合わせください。</p>
          </div>

          <div v-if="isSubmitted" class="py-12 text-center animate-bounce-in">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">お問い合わせを送信しました</h3>
            <p class="text-xs text-gray-500 mb-8 leading-relaxed">
              内容を確認し、担当者より折り返しご連絡いたします。<br>
              通常、1〜3営業日以内に回答を差し上げております。
            </p>
            <NuxtLink to="/" class="inline-block px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-all">
              ホームへ戻る
            </NuxtLink>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">おなまえ <span class="text-red-400">*</span></label>
              <input 
                v-model="name"
                type="text" 
                required
                placeholder="山田 太郎"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">メールアドレス <span class="text-red-400">*</span></label>
              <input 
                v-model="email"
                type="email" 
                required
                placeholder="example@mail.com"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">お問い合わせ種別</label>
              <div class="relative">
                <select 
                  v-model="subject"
                  class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none"
                >
                  <option v-for="item in subjects" :key="item.id" :value="item.id">{{ item.label }}</option>
                </select>
                <div class="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">お問い合わせ内容 <span class="text-red-400">*</span></label>
              <textarea 
                v-model="message"
                required
                rows="6"
                placeholder="メッセージを入力してください"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
              ></textarea>
            </div>

            <p v-if="error" class="text-xs text-red-500 font-medium px-1">{{ error }}</p>

            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? '送信中...' : 'この内容で送信する' }}</span>
            </button>
          </form>
        </div>
      </main>

      <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
        &copy; 2026 Akatsuki Inc.
      </footer>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
</style>
