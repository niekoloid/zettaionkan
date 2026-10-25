<script setup lang="ts">
const config = useRuntimeConfig()
const name = ref('')
const email = ref('')
const phone = ref('')
const subject = ref('question')
const message = ref('')

const subjects = [
  { id: 'question', label: '一般的なご質問' },
  { id: 'request', label: '改善・機能要望' },
  { id: 'media', label: 'メディア・取材関係' },
  { id: 'other', label: 'その他' }
]
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
          <img src="/logo_irooto.png" alt="いろおと" class="h-20 w-auto object-contain" />
        </div>
        <div class="w-10"></div>
      </header>

      <main class="flex-grow px-6 pb-20 overflow-y-auto">
        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm transition-all duration-500">
          <div class="text-center mb-10">
            <h1 class="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Contact Us</h1>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h2>
            <p class="text-xs text-gray-500 leading-relaxed">ご質問やご要望、取材のご依頼など、<br>お気軽にお問い合わせください。</p>
          </div>

          <form :action="config.public.formspreeEndpoint" method="POST" class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">おなまえ <span class="text-red-400">*</span></label>
              <input 
                name="name"
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
                name="email"
                v-model="email"
                type="email" 
                required
                placeholder="example@mail.com"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">電話番号 <span class="text-xs text-gray-300 font-normal ml-1">(任意)</span></label>
              <input 
                name="phone"
                v-model="phone"
                type="tel" 
                placeholder="090-0000-0000"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">お問い合わせ種別</label>
              <div class="relative">
                <select 
                  name="subject"
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
                name="message"
                v-model="message"
                required
                rows="6"
                placeholder="メッセージを入力してください"
                class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
              ></textarea>
            </div>



            <button 
              type="submit"
              class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>この内容で送信する</span>
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
