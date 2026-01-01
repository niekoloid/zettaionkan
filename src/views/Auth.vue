<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isSignUp = ref(false)
const message = ref('')
const isDev = import.meta.env.DEV

const handleAuth = async () => {
  isLoading.value = true
  message.value = ''
  
  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      message.value = '確認メールを送信しました。メールボックスをご確認ください。'
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      router.push('/')
    }
  } catch (error) {
    message.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl font-['Noto_Sans_JP']">
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

    <main class="flex-grow px-8 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Account</h1>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ isSignUp ? '新規登録' : 'ログイン' }}</h2>
        <p class="text-xs text-gray-500">トレーニング結果を保存して、<br>複数端末で同期できます。</p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">メールアドレス</label>
          <input 
            v-model="email"
            type="email" 
            required
            placeholder="example@mail.com"
            class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">パスワード</label>
          <input 
            v-model="password"
            type="password" 
            required
            placeholder="••••••••"
            class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <button 
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {{ isLoading ? '処理中...' : (isSignUp ? 'アカウントを作成' : 'ログイン') }}
        </button>

        <p v-if="message" class="text-xs text-center font-medium" :class="message.includes('送信') ? 'text-green-600' : 'text-red-500'">
          {{ message }}
        </p>

        <div class="text-center space-y-4">
          <button 
            type="button"
            @click="isSignUp = !isSignUp"
            class="text-xs text-gray-400 hover:text-gray-600 font-medium block w-full"
          >
            {{ isSignUp ? '既にアカウントをお持ちの方はこちら' : '新しくアカウントを作成する' }}
          </button>

          <!-- Debug Login Button (Development Only) -->
          <div v-if="!isSignUp && isDev" class="pt-4 border-t border-gray-50">
            <button 
              type="button"
              @click="email = 'test@example.com'; password = 'password123'; handleAuth()"
              class="text-[10px] text-gray-300 hover:text-gray-500 font-medium px-4 py-2 rounded-lg border border-dashed border-gray-100 hover:border-gray-200 transition-all uppercase tracking-widest"
            >
              🛠️ Debug Test Login
            </button>
          </div>
        </div>
      </form>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
