<script setup>
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
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
      <div class="w-10"></div> <!-- Spacer -->
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div class="text-center mb-10">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Privacy Policy</h1>
          <h2 class="text-xl font-bold text-gray-900 mb-2">プライバシーポリシー</h2>
        </div>

        <div class="space-y-8">
          <section>
            <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
              <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
              情報の取得について
            </h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              当アプリ「いろおと 絶対音感トレーニング」は、ユーザーの皆様の個人情報を取得することはありません。
              アプリ内で入力されたデータやご利用状況（トレーニング履歴など）は、お使いの端末内でのみ一時的に処理され、外部のサーバーへ送信・保存されることは一切ございません。
            </p>
          </section>

          <section>
            <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
              <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
              アクセス解析ツールについて
            </h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              当サイトでは、品質向上のためにGoogleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
              このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
              このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
              <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
              免責事項
            </h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              当アプリの利用によって生じた、いかなるトラブルや損害に対しても、開発元は責任を負いかねますのでご了承ください。
            </p>
          </section>

          <section>
            <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
              <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
              お問い合わせ
            </h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              本ポリシーに関するお問い合わせは、運営会社情報ページに記載の連絡先までお願いいたします。
            </p>
          </section>
        </div>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
