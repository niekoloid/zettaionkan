<script setup lang="ts">

onMounted(() => {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex'
  document.head.appendChild(meta)
})
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
        <img src="/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-20 w-auto object-contain" />
      </div>
      <div class="w-10"></div> <!-- Spacer -->
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div class="text-center mb-10">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Company Info</h1>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">株式会社暁</h2>
          <p class="text-xs text-gray-400 font-medium tracking-widest uppercase">Akatsuki Inc.</p>
        </div>

        <div class="space-y-6">
          <div class="border-b border-gray-100 pb-4">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">設立</p>
            <p class="text-sm text-gray-700 font-bold leading-relaxed">2025年4月30日</p>
          </div>

          <div class="border-b border-gray-100 pb-4">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">資本金</p>
            <p class="text-sm text-gray-700 font-bold leading-relaxed">300,000円</p>
          </div>

          <div class="border-b border-gray-100 pb-4">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">所在地</p>
            <p class="text-sm text-gray-700 font-bold leading-relaxed">長野県長野市大字鶴賀緑町1418番地</p>
          </div>

          <div class="border-b border-gray-100 pb-4">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">代表者</p>
            <p class="text-sm text-gray-700 font-bold leading-relaxed">司空 舜</p>
          </div>

          <div class="pb-4">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">事業内容</p>
            <p class="text-sm text-gray-700 font-bold leading-relaxed">インターネットサービスの企画・開発・運営</p>
          </div>
        </div>
      </div>

      <div class="mt-12 space-y-4 text-center">
        <p class="text-xs text-gray-500 leading-relaxed">
          私たちは最新のテクノロジーを活用し、<br>
          「できた！」という喜びを創造します。
        </p>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
