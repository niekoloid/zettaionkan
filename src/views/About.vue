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
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">About Service</h1>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">サービスについて</h2>
          <p class="text-xs text-gray-400 font-medium tracking-widest uppercase">Overview</p>
        </div>

        <div class="space-y-6">
          <div class="prose prose-sm prose-blue max-w-none">
            <p class="text-gray-600 leading-relaxed">
              「いろおと」は、音と色を結びつけることで、楽しみながら絶対音感を養うトレーニングアプリです。
            </p>
            <p class="text-gray-600 leading-relaxed mt-4">
              小さなお子様から大人まで、ゲーム感覚で毎日続けられるように設計されています。
            </p>
            <h3 class="font-bold text-gray-900 mt-6 mb-2">特徴</h3>
            <ul class="list-disc list-inside text-gray-600 space-y-2">
              <li>独自のカラーメソッドによる直感的な学習</li>
              <li>プロ仕様のピアノ音源（Steinway & Sons Model B）を使用</li>
              <li>段階的なレベル設定で無理なく上達</li>
            </ul>
             <h3 class="font-bold text-gray-900 mt-6 mb-2">推奨年齢</h3>
            <p class="text-gray-600 leading-relaxed">
              3歳〜6歳（聴覚が最も発達する時期）<br>
              ※大人の方の音感トレーニングとしてもご利用いただけます。
            </p>
          </div>
        </div>
      </div>
      
       <div class="mt-8 text-center">
        <router-link to="/test" class="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3 px-8 rounded-full shadow-lg transition-colors">
          まずは力試し（和音テスト）
        </router-link>
      </div>

    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
