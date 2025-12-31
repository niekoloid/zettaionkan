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
        <img src="../assets/logo_irooto.png" alt="いろおと" class="h-10 w-auto object-contain" />
      </div>
      <div class="w-10"></div> <!-- Spacer -->
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="space-y-10">
        <div class="text-center mb-6">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Training Method</h1>
          <h2 class="text-xl font-bold text-gray-900">効率的なトレーニング方法</h2>
        </div>

        <!-- Step 1 -->
        <section class="relative">
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">1</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">音と色のイメージを結びつける</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                まずはボタンをタップして、和音を聴き込みましょう。
                いろおとでは、各和音に固有の「色」を割り当てています。
                「ドミソは情熱的な赤色」「シレソは爽やかな青色」といったように、<span class="font-bold text-gray-800">音を色としてイメージする</span>のが絶対音感習得への近道です。
              </p>
            </div>
          </div>
        </section>

        <!-- Step 2 -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">2</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">譜面の「形」をセットで覚える</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                音が鳴ると上部に小さな譜面が表示されます。
                音の高さ、重なりの形を視覚的に捉え、聴覚とセットで記憶に定着させましょう。
              </p>
            </div>
          </div>
        </section>

        <!-- Step 3 -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">3</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">「聴く前」に予想する</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                慣れてきたら、ボタンを押す前に「これから鳴るドミソの音」を頭の中で再現してみてください。
                その後にボタンを押して答え合わせをする。この繰り返しが絶対音感を鍛えます。
              </p>
            </div>
          </div>
        </section>

        <!-- Setup Info -->
        <section class="pt-8 border-t border-gray-100">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">アプリの準備</h3>
          
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-2xl">
              <p class="text-xs font-bold text-gray-700 mb-2 flex items-center">
                🏠 ホーム画面に追加して使う
              </p>
              <p class="text-[10px] text-gray-500 leading-relaxed">
                ブラウザのメニューから「ホーム画面に追加」を行うことで、フルスクリーンのアプリとして快適にトレーニングできます。
              </p>
            </div>

            <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p class="text-xs font-bold text-amber-800 mb-1 flex items-center">
                ⚠️ 音が鳴らない場合
              </p>
              <p class="text-[10px] text-amber-700 leading-relaxed">
                端末の消音スイッチ（マナーモード）がオンになっていないかご確認ください。
              </p>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-12 text-center">
        <router-link to="/" class="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-600 transition-all inline-block">
          トレーニングを始める
        </router-link>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
  </div>
</template>
