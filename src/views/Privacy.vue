<script setup>
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 flex items-center justify-between relative shrink-0">
      <router-link to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="../assets/logo_irooto.png" alt="いろおと 絶対音感トレーニング" class="h-20 w-auto object-contain" />
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
                個人情報の取得と利用目的
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                株式会社暁（以下「当社」）は、本アプリ「いろおと」（以下「本サービス」）において、以下の目的のために個人情報を取得・利用いたします。
              </p>
              <ul class="text-xs text-gray-600 mt-2 list-disc pl-5 space-y-1">
                <li>本サービスへのログイン、本人確認のため</li>
                <li>有料プランのご利用状況管理および決済処理のため</li>
                <li>学習データの保存、同期機能の提供のため</li>
                <li>ユーザーサポートおよびお問い合わせ対応のため</li>
                <li>サービスの改善、新機能の開発、マーケティング分析のため</li>
              </ul>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
                取得する情報の種類
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                本サービスでは、以下の情報を取得する場合があります。
              </p>
              <ul class="text-xs text-gray-600 mt-2 list-disc pl-5 space-y-1">
                <li>メールアドレス、SNSログイン情報（Google等）</li>
                <li>決済に関する情報（Stripeを通じて処理され、当社サーバーにカード情報は保存されません）</li>
                <li>学習ログ（正誤記録、進捗レベル等）</li>
                <li>端末情報（OS種類、ブラウザ種別等）</li>
              </ul>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
                第三者への提供
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、決済処理（Stripe）やインフラ提供（Supabase, Google Cloud）等の業務委託先については、本サービスの運営に必要な範囲で情報を共有いたします。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
                セキュリティ
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                当社は、取得した個人情報の漏洩、滅失または毀損の防止、その他安全管理のために必要かつ適切な措置を講じます。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-blue-500 w-1 h-4 rounded-full mr-2"></span>
                プライバシーポリシーの変更
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                当社は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、サービス内でお知らせいたします。
              </p>
            </section>

            <div class="pt-8 text-right border-t border-gray-100">
              <p class="text-[10px] text-gray-400">
                最終更新日：2026年1月2日
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
