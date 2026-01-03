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
        <img src="../assets/logo_irooto.png" alt="いろおと" class="h-20 w-auto object-contain" />
      </div>
      <div class="w-10"></div>
    </header>

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="space-y-12">
        <!-- Key Message -->
        <section class="text-center pt-4">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Our Mission</h1>
          <h2 class="text-3xl font-black text-gray-900 leading-tight">
            「才能」は、本物の「音」と<br/>「習慣」で作られる。
          </h2>
        </section>

        <!-- 3 Points Summary -->
        <section class="grid grid-cols-1 gap-4">
          <div class="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl">
            <h3 class="text-lg font-black mb-6 flex items-center">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
              サクッとわかる「いろおと」
            </h3>
            <ul class="space-y-5">
              <li class="flex items-start">
                <span class="text-xl mr-3 mt-1">⏳</span>
                <div>
                  <p class="font-bold text-sm">2歳〜6歳が「黄金期」</p>
                  <p class="text-[11px] text-gray-400 leading-relaxed">聴覚が最も発達する今しか身につかない「一生の技術」です。</p>
                </div>
              </li>
              <li class="flex items-start">
                <span class="text-xl mr-3 mt-1">🎹</span>
                <div>
                  <p class="font-bold text-sm">最高峰「スタインウェイ」音源</p>
                  <p class="text-[11px] text-gray-400 leading-relaxed">脳が音を判断する手がかりとなる「本物の響き」を届けます。</p>
                </div>
              </li>
              <li class="flex items-start">
                <span class="text-xl mr-3 mt-1">🔬</span>
                <div>
                  <p class="font-bold text-sm">科学に基づいたステップ</p>
                  <p class="text-[11px] text-gray-400 leading-relaxed">心理学の研究に基づき、和音から単音へ正しく導きます。</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Feature Points -->
        <section class="space-y-8">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">選ばれる理由</h3>
          
          <div class="space-y-6">
            <div class="flex items-start group">
              <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0 mr-4 font-black">01</div>
              <div>
                <h4 class="font-black text-gray-900 mb-1">本物のグランドピアノ音源</h4>
                <p class="text-xs text-gray-500 leading-relaxed">コンサートホールで使用されるスタインウェイD-274を贅沢にサンプリング。豊かな倍音が、耳を正しく育てます。</p>
              </div>
            </div>

            <div class="flex items-start group">
              <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0 mr-4 font-black">02</div>
              <div>
                <h4 class="font-black text-gray-900 mb-1">効率的な1分トレーニング</h4>
                <p class="text-xs text-gray-500 leading-relaxed">準備不要、スマホ1台で完結。隙間時間の1分で、親子の負担なく毎日の「習慣」にできます。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Disclaimer (Compact) -->
        <section class="border-t border-gray-100 pt-8">
          <p class="text-[10px] text-gray-400 leading-relaxed">
            【免責事項】本アプリは Sakakibara (2014) の理論を参考に開発者が独自に実装したものであり、特定の音楽団体や公認施設とは関係ございません。お問い合わせは<router-link to="/contact" class="text-blue-500 hover:underline">こちら</router-link>まで。
          </p>
        </section>

        <div class="pt-4 text-center pb-20">
          <router-link to="/test" class="w-full bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all inline-block">
            まずは無料でお試し
          </router-link>
        </div>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
