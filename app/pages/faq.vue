<script setup lang="ts">

onMounted(() => {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex'
  document.head.appendChild(meta)
})

const faqs = [
  {
    q: '何歳から始められますか？',
    a: '一般的に絶対音感の習得は2歳から6歳の間が最も効果的と言われています。本アプリは、小さなお子様でも色と音を結びつけて楽しく学べるように設計されています。'
  },
  {
    q: '大人でも効果はありますか？',
    a: '大人の場合、絶対音感（音そのものを聴き分ける能力）の習得は難しいとされていますが、相対音感（音と音の幅を聴き分ける能力）やコード感の向上には非常に効果的です。'
  },
  {
    q: '毎日どのくらいトレーニングすればいいですか？',
    a: '1回数分、1日3回程度の短いセッションを毎日続けることが最も効果的です。長時間一度に行うよりも、日常の習慣に組み込むことをおすすめします。'
  },
  {
    q: 'PROプランで何ができますか？',
    a: 'Steinway B グランドピアノ音源の全88鍵盤開放、詳細な記録保存、そして全てのトレーニングモードが無制限でご利用いただけます。'
  },
  {
    q: '解約はいつでもできますか？',
    a: 'はい、アカウント設定画面からいつでもサブスクリプションの解約が可能です。次回更新日まではサービスをご利用いただけます。'
  }
]
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
      <!-- Header -->
      <AppHeader showBack />

      <main class="flex-grow px-6 pb-20 overflow-y-auto">
        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div class="text-center mb-10">
            <h1 class="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Questions & Answers</h1>
            <h2 class="text-xl font-bold text-gray-900 mb-2">よくあるご質問</h2>
            <p class="text-[10px] text-gray-400 font-bold">サービスについて困ったときはご確認ください</p>
          </div>

          <div class="space-y-6">
            <div v-for="(faq, index) in faqs" :key="index" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <span class="text-indigo-600 font-black text-sm">Q</span>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-sm mb-3 pt-1.5 leading-relaxed">{{ faq.q }}</h3>
                  <div class="flex items-start space-x-4">
                    <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <span class="text-amber-600 font-black text-sm">A</span>
                    </div>
                    <p class="text-xs text-gray-600 leading-relaxed pt-1.5">{{ faq.a }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 p-6 bg-indigo-900 rounded-2xl text-center">
            <p class="text-xs text-indigo-200 mb-4 font-bold">解決しない場合はお問い合わせください</p>
            <NuxtLink to="/contact" class="inline-block px-8 py-3 bg-white text-indigo-900 font-black rounded-full text-xs hover:bg-indigo-50 transition-colors">
              お問い合わせフォーム
            </NuxtLink>
          </div>
        </div>
      </main>

      <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
        &copy; 2026 Akatsuki Inc.
      </footer>
    </div>
  </div>
</template>
