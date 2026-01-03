<script setup>
import AppHeader from '../components/AppHeader.vue'
import InstallPwa from '../components/InstallPwa.vue'

const getChordInfo = (num) => {
  const chords = {
    1: { color: '#FF0000', name: 'ドミソ', displayColor: '赤' },
    2: { color: '#FFFF00', name: 'ドファラ', displayColor: '黄色' },
    3: { color: '#0000FF', name: 'シレソ', displayColor: '青' },
    4: { color: '#000000', name: 'ラドファ', displayColor: '黒' },
    5: { color: '#008000', name: 'レソシ', displayColor: '緑' },
    6: { color: '#FFA500', name: 'ミソド', displayColor: 'オレンジ' },
    7: { color: '#800080', name: 'ファラド', displayColor: '紫' },
    8: { color: '#FFC0CB', name: 'ソシレ', displayColor: 'ピンク' },
    9: { color: '#8B4513', name: 'ソドミ', displayColor: '茶色' }
  }
  return chords[num]
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <AppHeader showBack />

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="space-y-12">
        <!-- Lead Section -->
        <div class="text-center pt-4">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-3">About Irooto</h1>
          <h2 class="text-2xl font-black text-gray-900 leading-tight">
            音に「色」をつける<br/>新しい耳のトレーニング
          </h2>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            「いろおと」は、幼児期の黄金期に音と色を結びつけることで、絶対音感を楽しみながら身につけるための知育アプリです。
          </p>
        </div>

        <!-- The Power of Absolute Pitch -->
        <section class="relative">
          <div class="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r-full"></div>
          <h3 class="font-black text-gray-900 text-lg mb-3">なぜ「2歳から6歳」なの？</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            絶対音感は、聴覚が急激に発達する2歳〜6歳の間にしか身につかないと言われています。この時期に特定の音を「色」などの具体的なイメージと結びつけることで、脳に音の記憶を定着させやすくなります。
          </p>
        </section>

        <!-- The Methodology (Colors) -->
        <nav class="space-y-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">基本の9つの和音</h3>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="i in 9" :key="i" class="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100">
              <div class="w-8 h-8 rounded-full shadow-sm mb-1" :style="{ backgroundColor: getChordInfo(i).color }"></div>
              <span class="text-[9px] font-bold text-gray-900">{{ getChordInfo(i).name }}</span>
              <span class="text-[8px] text-gray-400">{{ getChordInfo(i).displayColor }}</span>
            </div>
          </div>
        </nav>

        <!-- Training Patterns -->
        <div class="space-y-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">トレーニング方法</h3>
          
          <!-- Pattern 1 -->
          <section class="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-110"></div>
            <div class="flex items-start mb-4">
              <span class="bg-blue-500 text-white w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs mr-3">01</span>
              <h4 class="font-black text-lg">親子でクイズ</h4>
            </div>
            <p class="text-sm text-gray-300 leading-relaxed mb-6">
              親御様がホーム画面で音を鳴らし、お子様がその「色」を答えます。お子様にスマホを見せないのがコツです。
            </p>
            <ul class="space-y-2">
              <li class="flex items-center text-[11px] text-blue-200">
                <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                色の旗を用意するとより効果的です
              </li>
              <li class="flex items-center text-[11px] text-blue-200">
                <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                正解したら大げさに褒めてあげましょう
              </li>
            </ul>
          </section>

          <!-- Pattern 2 -->
          <section class="bg-white rounded-[32px] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden group">
            <div class="flex items-start mb-4">
              <span class="bg-gray-100 text-gray-400 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs mr-3">02</span>
              <h4 class="font-black text-gray-900 text-lg">ひとりでテスト</h4>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
              「和音テスト」モードでは、アプリが自動で出題します。正解の色が視覚的に表示されるため、お子様一人でも進められます。
            </p>
            <ul class="space-y-2">
              <li class="flex items-center text-[11px] text-gray-400">
                <svg class="w-3 h-3 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                「オートプレイ」で聞き流し学習も可能
              </li>
              <li class="flex items-center text-[11px] text-gray-400">
                <svg class="w-3 h-3 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                履歴から日々の成長を確認できます
              </li>
            </ul>
          </section>
        </div>

        <!-- Success Tips -->
        <section class="bg-amber-50 rounded-[32px] p-8 border border-amber-100">
          <div class="flex items-center justify-center mb-6">
            <span class="text-2xl mr-2">💡</span>
            <h3 class="font-black text-amber-900 text-base">継続のためのヒント</h3>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex items-start">
              <div class="bg-white p-2 rounded-xl shadow-sm mr-4 mt-1">⏳</div>
              <div>
                <p class="text-xs font-black text-amber-900 mb-1">短時間をこまめに</p>
                <p class="text-[10px] text-amber-700 leading-relaxed">一度に長時間やるより、1〜2分の練習を「1日5回」など分けるほうが脳に定着します。</p>
              </div>
            </div>
            <div class="flex items-start">
              <div class="bg-white p-2 rounded-xl shadow-sm mr-4 mt-1">🎼</div>
              <div>
                <p class="text-xs font-black text-amber-900 mb-1">音質にこだわる</p>
                <p class="text-[10px] text-amber-700 leading-relaxed">正確なピッチで聴くことが大切です。マナーモードを解除し、音量を適切に設定してください。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Setup Info -->
        <section class="py-12 border-t border-gray-100 text-center">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">アプリの設定</h3>
          <div class="max-w-[240px] mx-auto">
             <InstallPwa />
          </div>
          <p class="mt-4 text-[9px] text-gray-400 leading-relaxed">
            ※ホーム画面に追加すると、音声がより安定して出力され、フルスクリーンで快適にご利用いただけます。
          </p>
        </section>
      </div>

      <div class="mt-4 mb-20 text-center">
        <router-link to="/" class="group flex items-center justify-center space-x-2 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
          <span>トレーニングを開始する</span>
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </router-link>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
