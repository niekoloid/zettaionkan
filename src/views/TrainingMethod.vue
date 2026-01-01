<script setup>
import InstallPwa from '../components/InstallPwa.vue'
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col font-['Noto_Sans_JP'] max-w-3xl mx-auto relative overflow-hidden shadow-2xl">
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
      <div class="space-y-10">
        <div class="text-center mb-6">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Training Method</h1>
          <h2 class="text-xl font-bold text-gray-900">親子で楽しくトレーニング</h2>
        </div>

        <!-- Step 1: Parent-Child Role -->
        <section class="relative">
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">1</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">親子でクイズ形式</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                基本的には<span class="font-bold text-gray-800">二人一組（親と子）</span>で行います。
                お子様には画面を見せないようにして、親御様がアプリで和音を鳴らします。
                お子様は、聞こえた音に対応する「色」を答えます（色のついた旗や折り紙を用意するとよりスムーズです）。
              </p>
            </div>
          </div>
        </section>

        <!-- Step 2: Feedback -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">2</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">答え合わせ</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                親御様は、お子様の回答が正解かどうかをアプリ画面で確認します。
                正解したらたくさん褒めてあげましょう。間違えた場合は、もう一度正しい音を聞かせ、視覚（画面の色）と聴覚をセットにして印象付けます。
              </p>
            </div>
          </div>
        </section>

        <!-- Step 3: Frequency -->
        <section>
          <div class="flex items-start space-x-4">
            <div class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-sm">3</div>
            <div class="space-y-2">
              <h3 class="font-bold text-gray-900 text-base">効果的なトレーニング間隔</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-2">
                効果的な絶対音感トレーニングでは、以下のペースが推奨されています。
              </p>
              <ul class="text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <li class="flex items-center">
                  <span class="text-blue-500 mr-2">●</span>
                  <span><strong>1日4〜5回</strong>（朝・昼・夕・夜など）</span>
                </li>
                <li class="flex items-center">
                  <span class="text-blue-500 mr-2">●</span>
                  <span><strong>1回 1〜2分</strong>（短時間で集中して）</span>
                </li>
                <li class="flex items-center">
                  <span class="text-blue-500 mr-2">●</span>
                  <span><strong>毎日続ける</strong>ことが最も重要です</span>
                </li>
              </ul>
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
              <InstallPwa class="mt-3" />
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
