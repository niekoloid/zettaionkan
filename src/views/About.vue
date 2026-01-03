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
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Our Vision</h1>
          <h2 class="text-3xl font-black text-gray-900 leading-tight mb-6">
            すべての子供に、<br/>一生ものの「音」のギフトを。
          </h2>
          <p class="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            音楽は、言葉以上に感情を豊かにし、人生を彩ります。私たちは、テクノロジーの力で、世界中の子供たちが「絶対音感」という魔法を身につけられる未来を目指しています。
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
            他の音と比較することなく、聞こえた音の高さを即座に認識できる能力のことです。<br/><br/>
            これは「才能」だと思われがちですが、実は聴覚が発達する2歳〜6歳頃に適切なトレーニングを行えば、多くの子が身につけることができる「技術」です。
          </p>
        </section>

        <!-- Features Grid -->
        <section class="space-y-8">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">サービスの特徴</h3>
          <div class="grid grid-cols-1 gap-6">
            <div class="flex items-center p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mr-5 shrink-0">🎨</div>
              <div>
                <h4 class="font-bold text-gray-900 text-sm mb-1">音と色を同時に記憶</h4>
                <p class="text-[11px] text-gray-500 leading-relaxed">抽象的な音を「色」という具体的な情報とセットにすることで、記憶を定着させます。</p>
              </div>
            </div>
            
            <div class="flex items-center p-6 bg-pink-50 rounded-[2rem] border border-pink-100">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mr-5 shrink-0">🎹</div>
              <div>
                <h4 class="font-bold text-gray-900 text-sm mb-1">世界最高峰の音色</h4>
                <p class="text-[11px] text-gray-500 leading-relaxed">正確なピッチはもちろん、美しくリアルなピアノ音源に触れることで豊かな感性を育みます。</p>
              </div>
            </div>

            <div class="flex items-center p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mr-5 shrink-0">🎮</div>
              <div>
                <h4 class="font-bold text-gray-900 text-sm mb-1">遊びが学びに変わる</h4>
                <p class="text-[11px] text-gray-500 leading-relaxed">クイズ形式のテストや、オートプレイ機能で、日常の中に自然に音楽を取り入れられます。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Message from Akatsuki -->
        <section class="text-center py-10">
          <div class="inline-block p-1 rounded-full bg-gray-100 mb-6">
             <img src="../assets/logo_irooto.png" alt="Akatsuki Inc." class="w-12 h-12 rounded-full grayscale" />
          </div>
          <h3 class="font-bold text-gray-900 mb-4">運営チームより</h3>
          <p class="text-[11px] text-gray-400 leading-relaxed max-w-sm mx-auto">
            私たちが大切にしているのは、スキマ時間の1分を「ワクワク」に変えることです。お子様が「またやりたい！」と言えるような体験を、これからも追求し続けます。
          </p>
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
