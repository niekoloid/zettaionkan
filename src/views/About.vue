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

        <section class="space-y-6">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">特徴</h2>
          
          <div class="grid gap-4">
            <div class="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              <h3 class="font-bold text-gray-800 mb-2">本物のグランドピアノ音源</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                世界中のコンサートホールで愛用されているヤマハのグランドピアノ「C5」を丁寧にサンプリングした高品質な音源を使用しています。
              </p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              <h3 class="font-bold text-gray-800 mb-2">視覚的なフィードバック</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                音が鳴ると同時に、その和音が持つイメージカラーと譜面が表示され、聴覚と視覚を組み合わせて記憶を定着させます。
              </p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              <h3 class="font-bold text-gray-800 mb-2">厳選された和音パターン</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                基本となる三和音から、トレーニングに適した多様なパターンを用意しています。
              </p>
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
