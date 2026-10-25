<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <AppHeader showBack />

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
      <div class="space-y-12">
        <!-- Vision -->
        <section class="text-center pt-4">
          <h1 class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Our Mission</h1>
          <h2 class="text-3xl font-black text-gray-900 leading-tight">
            「才能」は、本物の「音」と<br/>「習慣」で作られる。
          </h2>
          <p class="mt-4 text-[13px] text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            すべての子供に、一生ものの「音の感性」を。科学が証明したメソッドを、世界最高峰の響きで提供します。
          </p>
        </section>

        <!-- Point Card -->
        <section class="bg-gray-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div class="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <h3 class="text-xl font-black mb-6 flex items-center">
              <span class="w-2 h-8 bg-blue-500 rounded-full mr-4"></span>
              絶対音感は「技術」です
            </h3>
            <p class="text-sm text-gray-300 leading-relaxed mb-6">
              絶対音感は、決して選ばれた人だけの特殊能力ではありません。聴覚が急速に発達する2歳〜6歳の「黄金期」に適切な刺激を与えることで、どの子も一生ものの音感を身につけることが可能です。
            </p>
            <p class="text-sm text-gray-400 leading-relaxed">
              「いろおと」は、この貴重な時期を逃さず、家庭で手軽に、かつ科学的根拠に基づいた本格的なトレーニングができるように設計されました。※本アプリは相対音感のトレーニング用としては設計されていません。
            </p>
          </div>
        </section>

        <!-- Benefits Grid -->
        <section class="space-y-6">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">絶対音感がもたらす3つのメリット</h3>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex items-start space-x-4 p-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <span class="text-xl">🎨</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">感性と表現力を育む</h4>
                <p class="text-xs text-gray-500 leading-relaxed">音を瞬時に理解できることで、楽器演奏や歌唱において、より自由で深い表現が可能になります。</p>
              </div>
            </div>
            <div class="flex items-start space-x-4 p-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <span class="text-xl">🧠</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">言語能力・脳の発達</h4>
                <p class="text-xs text-gray-500 leading-relaxed">音の微細な違いを聞き分ける能力は、語学学習（特に発音）や数学的思考の土台となると言われています。</p>
              </div>
            </div>
            <div class="flex items-start space-x-4 p-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <span class="text-xl">✨</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">自信と成功体験</h4>
                <p class="text-xs text-gray-500 leading-relaxed">「聞こえる！」「正解した！」という日々の小さな成功体験が、お子様の自己肯定感を大きく育てます。</p>
              </div>
            </div>
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
                <h4 class="font-black text-gray-900 text-sm">本物の音色に対するこだわり</h4>
              </div>
              <ul class="text-[11px] text-gray-600 space-y-2 list-none pl-1">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">●</span>
                  グランドピアノYamaha C5 / Steinway Bの高音質サンプリング音源を採用
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
                <h4 class="font-black text-gray-900 text-sm">科学的根拠に基づく確かなメソッド</h4>
              </div>
              <ul class="text-[11px] text-gray-600 space-y-2 list-none pl-1">
                <li class="flex items-start">
                  <span class="text-emerald-500 mr-2">●</span>
                  再現性の高い絶対音感習得プロセスをシステム化
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
                  家にピアノを置くスペースがなくても、手軽にスマホ・タブレットからグランドピアノの本物の音源を利用できます
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
              本アプリは学術的研究を参考に独自開発されたものであり、特定の音楽教室や団体とは無関係です。監修・公認を受けたものでもありません。お問い合わせは<NuxtLink to="/contact" class="text-blue-500 hover:underline">フォーム</NuxtLink>よりお願いいたします。
            </p>
          </div>
        </section>

        <div class="pt-4 text-center pb-20">
          <NuxtLink to="/chordquizz" class="block w-full bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-sm shadow-xl hover:bg-black active:scale-[0.98] transition-all">
            無料トレーニングを始める
          </NuxtLink>
        </div>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
