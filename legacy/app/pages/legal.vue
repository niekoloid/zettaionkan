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
          <img src="/logo_irooto.png" alt="いろおと" class="h-20 w-auto object-contain" />
        </div>
        <div class="w-10"></div>
      </header>

      <main class="flex-grow px-6 pb-20 overflow-y-auto">
        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div class="text-center mb-10">
            <h1 class="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Specified Commercial Transactions</h1>
            <h2 class="text-xl font-bold text-gray-900 mb-2">特定商取引法に基づく表記</h2>
          </div>

          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">販売業者</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">株式会社暁</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">運営責任者</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">司空 舜</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">所在地</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">長野県長野市大字鶴賀緑町1418番地</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">お問い合わせ先</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">
                <NuxtLink to="/contact" class="text-blue-500 hover:underline font-bold">お問い合わせフォーム</NuxtLink>よりご連絡ください。
              </p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">販売価格</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">各プランのご購入ページ（料金プラン画面）に表示された価格に基づきます。表示価格は消費税を含みます。</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">商品代金以外に必要な料金</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">インターネット接続料金、通信料金等はお客様の負担となります。</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">お支払い方法</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">クレジットカード（Stripe決済）</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">代金の支払い時期</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">
                初回お申込みから1ヶ月間は無料期間となります。無料期間終了後、1ヶ月分のご利用料金が前払いで決済されます。以後、解約が行われない限り1ヶ月ごとに自動更新されます。
              </p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">サービスの提供時期</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed">決済完了後（無料期間開始後）、直ちにご利用いただけます。</p>
            </div>

            <div class="pb-4">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">返品・キャンセルについて</p>
              <p class="text-sm text-gray-700 font-bold leading-relaxed text-xs">
                デジタルコンテンツの特性上、購入確定後の返品・キャンセルはお受けできません。解約は次回の更新日前日までにマイページの設定からお手続きいただけます。解約後も有効期間内はサービスをご利用いただけます。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
        &copy; 2026 Akatsuki Inc.
      </footer>
    </div>
  </div>
</template>
