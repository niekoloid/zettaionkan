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
      <div class="space-y-16">
        <!-- Vision -->
        <section class="text-center pt-8">
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Our Mission</h1>
          <h2 class="text-3xl font-black text-gray-900 leading-tight mb-6">
            「才能」は、正しい「音」と<br/>「習慣」で作られる。
          </h2>
          <p class="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto font-medium">
            科学が証明したメソッドを、最高峰のピアノ音源で。<br/>すべての子供に、一生ものの「音」のギフトを。
          </p>
        </section>

        <!-- What is Absolute Pitch? -->
        <section class="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <h3 class="text-xl font-black mb-6 flex items-center">
            <span class="w-2 h-8 bg-blue-500 rounded-full mr-4"></span>
            絶対音感とは？
          </h3>
          <p class="text-sm text-gray-300 leading-relaxed space-y-4">
            「才能」の一言で片付けられてきた絶対音感。実は、聴覚が発達する2歳〜6歳頃に適切なトレーニングを行えば、多くの子が技術として身につけることが可能です。<br/><br/>
            いろおとは、曖昧な教育論ではなく、科学的エビデンスに基づくシステムで、確実なステップアップをサポートします。
          </p>
        </section>

        <!-- Features Grid -->
        <section class="space-y-12">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">サービスの特徴</h3>
          <div class="space-y-12">
            <!-- Feature 1 -->
            <div class="relative pl-6 border-l-2 border-blue-500">
              <h4 class="text-gray-900 font-black text-xl mb-3">
                耳を育てる時期だからこそ。<br/>世界最高峰「スタインウェイ」の響きを。
              </h4>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                絶対音感の習得初期において、脳は音の高さだけでなく「音色（ねいろ）」を重要な手がかりとしています。だからこそ、電子的な合成音ではなく、本物のピアノの倍音成分を含んだ豊かな響きが必要なのです。<br/><br/>
                本アプリでは、世界中のコンサートホールで採用される最高峰グランドピアノ「スタインウェイ（D-274）」からサンプリングした音源を贅沢に使用。繊細な幼児の耳に、妥協のない「本物」の音を届けます。
              </p>
            </div>
            
            <!-- Feature 2 -->
            <div class="relative pl-6 border-l-2 border-emerald-500">
              <h4 class="text-gray-900 font-black text-xl mb-3">
                感覚ではなく「科学」。<br/>論文で実証された習得プロセスを完全再現。
              </h4>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                「才能」の一言で片付けられてきた絶対音感を、誰もが習得可能な「技術」へ。本アプリは、絶対音感習得プロセスに関する縦断的研究（Sakakibara, 2014）に基づき設計されています。<br/><br/>
                「和音と色の識別」から始まり、脳の認知プロセスに合わせた最適な順序で「単音」へと分化させていく――。学術的なエビデンス（根拠）に基づいたロジックが、確実なステップアップをサポートします。
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="relative pl-6 border-l-2 border-amber-500">
              <h4 class="text-gray-900 font-black text-xl mb-3">
                1回2分、タップするだけ。<br/>忙しい毎日でも「続く」設計。
              </h4>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                絶対音感トレーニングの最大の敵は「親の負担」と「飽き」による挫折です。ピアノの前に座らせる必要も、楽器を用意する必要もありません。アプリを開けば、わずか2タップでトレーニング開始。<br/><br/>
                隙間時間の2分間で完結するプログラム設計と、子供が自ら触りたくなる直感的な操作性により、最も難しい「毎日の継続」を強力にバックアップします。
              </p>
            </div>
          </div>
        </section>

        <div class="pt-8 text-center pb-20">
          <router-link to="/test" class="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all inline-block active:scale-95">
            まずは無料でお試し
          </router-link>
        </div>
      </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0 border-t border-gray-50 pt-8">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
