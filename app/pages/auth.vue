<script setup lang="ts">
import type { Provider } from '@supabase/supabase-js'

const supabase = useSupabaseClient()

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
        options: {
          emailRedirectTo: window.location.origin
        }
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
  } catch (error: any) {
    message.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleOAuthLogin = async (provider: Provider) => {
  try {
    const redirectTo = `${window.location.origin}/`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo
      }
    })
    if (error) throw error
  } catch (error: any) {
    console.error('OAuth Login Error:', error)
    message.value = `エラーが発生しました: ${error.message || '不明なエラー'}`
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="min-h-screen flex flex-col items-center justify-center p-4 max-w-3xl mx-auto relative overflow-hidden font-['Noto_Sans_JP']">
    <!-- Back Button -->
    <NuxtLink to="/" class="absolute top-8 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors group z-20">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </NuxtLink>

    <main class="flex-grow px-8 pb-20 overflow-y-auto">
      <div class="text-center mb-10">
        <div class="flex justify-center mb-8">
          <img src="~/assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-32 w-auto object-contain" />
        </div>
        <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Account</h1>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ isSignUp ? '新規登録' : 'ログイン' }}</h2>
        <p class="text-xs text-gray-500">ログインして、<br>和音を奏でよう。</p>
      </div>

      <div class="space-y-3 mb-8">
        <button 
          @click="handleOAuthLogin('google')"
          type="button"
          class="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
        >
          <svg class="w-5 h-5 mr-3" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Googleで{{ isSignUp ? '登録' : 'ログイン' }}
        </button>
      </div>

      <div class="relative mb-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-100"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-2 bg-white text-gray-400">またはメールアドレスで</span>
        </div>
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
  </div>
</template>
