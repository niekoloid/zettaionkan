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
        <!-- Vision -->
        <section class="text-center pt-4">
          <h1 class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Our Mission</h1>
          <h2 class="text-3xl font-black text-gray-900 leading-tight">
            「才能」は、本物の「音」と<br/>「習慣」で作られる。
          </h2>
          <p class="mt-4 text-[13px] text-gray-500 font-medium">
            科学が証明したメソッドを、世界最高峰の響きで。
          </p>
        </section>

        <!-- Point Card -->
        <section class="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <h3 class="text-lg font-black mb-4 flex items-center">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
              絶対音感は「技術」です
            </h3>
            <p class="text-xs text-gray-400 leading-relaxed">
              聴覚が発達する2歳〜6歳の「黄金期」に適切な刺激を与えることで、どの子も一生ものの音感を身につけることが可能です。いろおとは、科学的根拠に基づき、最短のステップでその習得をサポートします。
            </p>
          </div>
        </section>

        <!-- Features -->
        <section class="space-y-4">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-6">いろおとが選ばれる理由</h3>
          
          <div class="grid grid-cols-1 gap-4">
            <!-- Feature 1 -->
            <div class="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
              <div class="flex items-center mb-3">
                <span class="text-2xl mr-3">🎹</span>
                <h4 class="font-black text-gray-900 text-sm">一生ものの耳を育てる「本物」の音</h4>
              </div>
              <ul class="text-[11px] text-gray-600 space-y-2 list-none pl-1">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">●</span>
                  世界唯一、スタインウェイD-274のフルサンプリング音源を採用
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">●</span>
                  電子音では再現できない「豊かな倍音」が、脳の成長を促します
                </li>
              </ul>
            </div>

            <!-- Feature 2 -->
            <div class="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/50">
              <div class="flex items-center mb-3">
                <span class="text-2xl mr-3">🔬</span>
                <h4 class="font-black text-gray-900 text-sm">心理学論文に基づく確かなメソッド</h4>
              </div>
              <ul class="text-[11px] text-gray-600 space-y-2 list-none pl-1">
                <li class="flex items-start">
                  <span class="text-emerald-500 mr-2">●</span>
                  Sakakibara (2014) の実証された習得プロセスをシステム化
                </li>
                <li class="flex items-start">
                  <span class="text-emerald-500 mr-2">●</span>
                  「和音から単音へ」脳の認知プロセスに合わせた最適な順序
                </li>
              </ul>
            </div>

            <!-- Feature 3 -->
            <div class="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/50">
              <div class="flex items-center mb-3">
                <span class="text-2xl mr-3">⏳</span>
                <h4 class="font-black text-gray-900 text-sm">親子の負担をゼロにする「継続」の設計</h4>
              </div>
              <ul class="text-[11px] text-gray-600 space-y-2 list-none pl-1">
                <li class="flex items-start">
                  <span class="text-amber-500 mr-2">●</span>
                  1回1分、スマホ1台。楽器の準備や送り迎えは必要ありません
                </li>
                <li class="flex items-start">
                  <span class="text-amber-500 mr-2">●</span>
                  遊び感覚で触りたくなるUIが、毎日の「習慣化」を助けます
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Disclaimer -->
        <section class="border-t border-gray-100 pt-8 pb-4">
          <div class="bg-gray-50 rounded-2xl p-6">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">免責事項・運営について</h3>
            <p class="text-[10px] text-gray-500 leading-relaxed font-medium">
              本アプリは学術的研究を参考に独自開発されたものであり、特定の音楽教室や団体とは無関係です。監修・公認を受けたものでもありません。お問い合わせは<router-link to="/contact" class="text-blue-500 hover:underline">フォーム</router-link>よりお願いいたします。
            </p>
          </div>
        </section>

        <div class="pt-4 text-center pb-20">
          <router-link to="/test" class="block w-full bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-sm shadow-xl hover:bg-black active:scale-[0.98] transition-all">
            無料トレーニングを始める
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
