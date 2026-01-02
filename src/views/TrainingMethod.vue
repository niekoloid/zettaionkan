<script setup>
import InstallPwa from '../components/InstallPwa.vue'
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
      <div class="space-y-10">
        <div class="text-center mb-6">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Training Method</h1>
          <h2 class="text-2xl font-bold text-gray-900">練習方法は2パターンあります</h2>
        </div>

        <!-- Pattern 1 -->
        <section class="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center mb-4">
            <div class="bg-blue-500 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-sm mr-3">1</div>
            <h3 class="font-bold text-gray-900 text-lg">親子でクイズ形式でやる方法</h3>
          </div>
          <div class="space-y-4 pl-11">
            <p class="text-sm text-gray-600 leading-relaxed font-medium">
              親御様がアプリ（ホーム画面）を操作し、お子様に見えないように音を鳴らします。お子様は聞こえた音の「色」を答えます。
            </p>
            <div class="bg-white/60 rounded-2xl p-4 text-[11px] text-gray-500 space-y-2 border border-blue-50/50">
              <p class="flex items-center"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>お子様にスマホが見えないように行います</p>
              <p class="flex items-center"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>正解したらたくさん褒めてあげましょう</p>
              <p class="flex items-center"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>色の旗を用意するとより楽しく取り組めます</p>
            </div>
          </div>
        </section>

        <!-- Pattern 2 -->
        <section class="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center mb-4">
            <div class="bg-blue-500 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-sm mr-3">2</div>
            <h3 class="font-bold text-gray-900 text-lg">子供が一人でクイズに取り組む方法</h3>
          </div>
          <div class="space-y-4 pl-11">
            <p class="text-sm text-gray-600 leading-relaxed font-medium">
              「和音テスト」機能を使えば、自動でクイズが出題されます。お子様が一人で遊びながら学ぶことができます。
            </p>
            <div class="bg-white/60 rounded-2xl p-4 text-[11px] text-gray-500 space-y-2 border border-blue-50/50">
              <p class="flex items-center"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>正解すると視覚的なフィードバックがあります</p>
              <p class="flex items-center"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>結果が保存され、成長を実感できます</p>
            </div>
          </div>
        </section>

        <!-- Frequency Info -->
        <section class="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6">
          <h3 class="font-bold text-gray-900 text-base mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            効果的なトレーニングのコツ
          </h3>
          <ul class="grid grid-cols-1 gap-3">
            <li class="flex items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span class="text-xs text-gray-600 font-bold">1日4〜5回、短時間で（1回1〜2分）</span>
            </li>
            <li class="flex items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span class="text-xs text-gray-600 font-bold">嫌がる時は無理強いしない</span>
            </li>
            <li class="flex items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span class="text-xs text-gray-600 font-bold">毎日続けることが最も重要です</span>
            </li>
          </ul>
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
  </div>
</template>
