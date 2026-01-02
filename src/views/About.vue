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
      <div class="mb-8 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        <img src="/ogp_image.png" alt="いろおと イメージ" class="w-full h-auto object-cover" />
      </div>

      <div class="space-y-8">
        <section>
          <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">About Service</h1>
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="bg-blue-500 w-1.5 h-6 rounded-full mr-3"></span>
              いろおと とは
            </h2>
            <p class="text-gray-600 leading-relaxed text-sm">
              「いろおと 絶対音感トレーニング」は、ピアノの和音を聞いてその種類を当てることで、絶対音感を養うためのトレーニングツールです。
            </p>
            <p class="text-gray-600 leading-relaxed text-sm mt-4">
              音を単なる記号としてではなく、その響きや「色」として捉える体験を通じて、楽しく効果的な学習をサポートします。音と色が結びつく「共感覚（シナスタジア）」のような感覚を育むことを目指しています。
            </p>
          </div>
        </section>

        <section class="space-y-8">
          <div class="px-2">
            <h2 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Features</h2>
            <h3 class="text-2xl font-bold text-gray-900">「いろおと」が選ばれる理由</h3>
          </div>
          
          <div class="grid gap-6">
            <!-- Feature 1: Sound -->
            <div class="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-3">極上の音色、本物の響き</h4>
                <p class="text-sm text-gray-500 leading-relaxed">
                  ヤマハの銘器「C5」と、世界最高峰「スタインウェイ Model B」を丁寧にサンプリング。コンサートホールの空気感まで再現した豊かな響きが、お子様の耳を育てます。
                </p>
              </div>
            </div>

            <!-- Feature 2: Visual -->
            <div class="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-3">色で感じる、音の個性</h4>
                <p class="text-sm text-gray-500 leading-relaxed">
                  音と色を同時に経験することで、抽象的な音階を具体的なイメージとして定着させます。共感覚（シナスタジア）の力を引き出し、楽しく直感的な学習を実現しました。
                </p>
              </div>
            </div>

            <!-- Feature 3: Curriculum -->
            <div class="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-3">着実なステップ、一生の財産</h4>
                <p class="text-sm text-gray-500 leading-relaxed">
                  音楽理論に基づき厳選された和音パターンを、14のレベルで体系化。無理なく続けられる設計で、お子様に「絶対音感」という一生消えないギフトを届けます。
                </p>
              </div>
            </div>
          </div>
        </section>



        <section>
          <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="bg-indigo-500 w-1.5 h-6 rounded-full mr-3"></span>
              ご利用を検討中の親御様へ
            </h2>
            <p class="text-gray-600 leading-relaxed text-sm">
              このサービスは、「子供に絶対音感という一生の財産をプレゼントしてあげたい」という一人の親の想いから生まれました。
            </p>
            <p class="text-gray-600 leading-relaxed text-sm mt-4">
              開発者自身はピアノを弾くことができません。また、自宅にはピアノを置く十分なスペースも、すぐに購入できる金銭的な余裕もありませんでした。
            </p>
            <p class="text-gray-600 leading-relaxed text-sm mt-4">
              「楽器の経験も、環境も、予算もない。それでも、子供の可能性を広げてあげたい」
            </p>
            <p class="text-gray-600 leading-relaxed text-sm mt-4">
              そんな葛藤の中で、誰もが手軽に、しかし本格的な音色でトレーニングができるツールがあればと思い、このアプリを開発しました。
            </p>
          </div>
        </section>
      </div>

      <div class="mt-12 text-center">
        <router-link to="/" class="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95">
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
