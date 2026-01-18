<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const deferredPrompt = ref(null)
const showButton = ref(false)
const isIOS = ref(false)
const showIOSInstruction = ref(false)

onMounted(() => {
  // Check if running on iOS
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value = /iphone|ipad|ipod/.test(userAgent)

  // Check if already in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator.standalone === true)

  if (isStandalone) {
    showButton.value = false
    return
  }

  // Handle Android PWA prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showButton.value = true
  })

  // Handle iOS (Show button if generic mobile check passes or just ensure logic flows)
  // Since we want to show "Only on smartphone", we can refine the check.
  // But strictly, PWA installability on Desktop is also a thing. 
  // User requested "Smartphone only", so we check generic mobile UA or screen width if needed.
  // For iOS, there is no event, so we just show the button if it's iOS and not standalone.
  if (isIOS.value && !isStandalone) {
    showButton.value = true
  }
})

const handleClick = async () => {
  if (isIOS.value) {
    showIOSInstruction.value = true
  } else if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    if (outcome === 'accepted') {
      showButton.value = false
    }
  } else {
    // Android fallback if event didn't fire but button is shown (unlikely with current logic)
    // or Desktop Chrome
    alert('ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。')
  }
}
</script>

<template>
  <div v-if="showButton" class="w-full">
    <button 
      @click="handleClick"
      class="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span>ホーム画面に追加する</span>
    </button>

    <!-- iOS Instruction Modal -->
    <div v-if="showIOSInstruction" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4" style="background-color: rgba(0,0,0,0.5);">
      <div class="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up relative">
        <button @click="showIOSInstruction = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 class="text-lg font-bold text-gray-900 mb-4 text-center">ホーム画面への追加方法</h3>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <p class="text-sm text-gray-700">1. 画面下部の<span class="font-bold">「共有アイコン」</span>をタップ</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p class="text-sm text-gray-700">2. メニューから<span class="font-bold">「ホーム画面に追加」</span>を選択</p>
          </div>

          <div class="flex items-center space-x-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <span class="text-lg font-bold">右上の「追加」</span>
            </div>
            <p class="text-sm text-gray-700">3. 画面右上の<span class="font-bold">「追加」</span>をタップ</p>
          </div>
        </div>

        <div class="mt-6 text-center">
          <button @click="showIOSInstruction = false" class="text-sm text-blue-500 font-bold">閉じる</button>
        </div>
        
        <!-- Decoration Triangle pointing down to mimic system tooltip if needed, but centering modal is better -->
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
