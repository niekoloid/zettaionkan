<template>
  <div class="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden">
    <!-- Header -->
    <header class="pt-12 pb-8 px-4 flex items-center justify-between">
      <router-link to="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1 class="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        利用方法
      </h1>
      <div class="w-10"></div> <!-- Spacer -->
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="space-y-10">
        <!-- Step 1 -->
        <section class="relative">
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">1</div>
            <div class="space-y-2">
              <h2 class="font-bold text-gray-900">和音を選んで聴く</h2>
              <p class="text-sm text-gray-500 leading-relaxed">
                画面に並んでいる和音ボタンをタップしてください。高品質なグランドピアノ（Yamaha C5）の音が流れます。
              </p>
            </div>
          </div>
          <div class="mt-4 ml-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div class="flex items-center space-x-2 text-[10px] text-blue-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
              <span>💡 ヒント:</span>
              <span>何度も聴いて「響きの色」を感じてみましょう</span>
            </div>
          </div>
        </section>

        <!-- Step 2 -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">2</div>
            <div class="space-y-2">
              <h2 class="font-bold text-gray-900">譜面と名前を確認する</h2>
              <p class="text-sm text-gray-500 leading-relaxed">
                音が鳴ると同時に、画面下部にその和音の名前と実際の譜面が表示されます。視覚と聴覚を一致させることが上達の近道です。
              </p>
            </div>
          </div>
        </section>

        <!-- Step 3 -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">3</div>
            <div class="space-y-2">
              <h2 class="font-bold text-gray-900">アプリとしてインストール</h2>
              <p class="text-sm text-gray-500 leading-relaxed">
                iPhoneやAndroidのホーム画面に追加することで、次回から通常のアプリと同じようにフルスクリーンですぐに起動できます。
              </p>
            </div>
          </div>
          <div class="mt-6 ml-10 space-y-4">
            <div class="bg-gray-50 p-4 rounded-xl">
              <p class="text-[11px] font-bold text-gray-600 mb-2 flex items-center">
                <span class="mr-2"></span> iPhone / iPad の場合
              </p>
              <p class="text-[10px] text-gray-500 leading-relaxed">
                Safariで開き、共有ボタン（<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" /></svg>）をタップして「ホーム画面に追加」を選択してください。
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-xl">
              <p class="text-[11px] font-bold text-gray-600 mb-2 flex items-center">
                <span class="mr-2">🤖</span> Android の場合
              </p>
              <p class="text-[10px] text-gray-500 leading-relaxed">
                Chromeで開き、右上の設定（︙）から「アプリをインストール」または「ホーム画面に追加」をタップしてください。
              </p>
            </div>
          </div>
        </section>

        <!-- Notice -->
        <section class="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h2 class="text-amber-800 font-bold text-xs mb-2 flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            音が鳴らない場合
          </h2>
          <p class="text-[10px] text-amber-700 leading-relaxed">
            端末の物理的な「マナーモード」スイッチがオンになっていないか、または音量がゼロになっていないかご確認ください。
          </p>
        </section>
      </div>

      <div class="mt-12 text-center">
        <router-link to="/" class="text-blue-500 font-bold text-sm hover:underline">
          さっそく練習を始める
        </router-link>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; {{ new Date().getFullYear() }} Akatsuki Inc.
    </footer>
  </div>
</template>
