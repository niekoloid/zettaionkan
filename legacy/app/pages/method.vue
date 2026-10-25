<script setup lang="ts">
import { ChordDefinitions } from '~/constants/chords.js'

const mainChords = [
  ChordDefinitions.DOMISO,
  ChordDefinitions.DOFARA,
  ChordDefinitions.SHIRESO,
  ChordDefinitions.RADOFA,
  ChordDefinitions.RESOSHI,
  ChordDefinitions.MISODO,
  ChordDefinitions.FARADO,
  ChordDefinitions.SOSHIRE,
  ChordDefinitions.SODOMI,
  ChordDefinitions.LA_CIS_MI,
  ChordDefinitions.RE_FIS_LA,
  ChordDefinitions.MI_GIS_SI,
  ChordDefinitions.BE_RE_FA,
  ChordDefinitions.ES_SO_BE
]
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
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-3">Training Method</h1>
          <h2 class="text-2xl font-black text-gray-900 leading-tight">
            14種類の「音の色」を覚える<br/>独自の絶対音感メソッド
          </h2>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto text-left">
            「いろおと」は、<strong>9つの白鍵の和音</strong>と、<strong>5つの黒鍵の和音</strong>、合計14種類の音の響きを「色」と結びつけることで、楽しみながら絶対音感を身につける知育アプリです。
          </p>
        </div>

        <!-- Corrected Roadmap: Process Focus -->
        <section class="space-y-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">上達の3ステップ</h3>
          
          <div class="space-y-4">
            <!-- Step 1: Listening -->
            <div class="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center ring-2 ring-indigo-500/20">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 mr-4 shadow-lg shadow-indigo-200">
                <span class="text-xl font-black text-white">1</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">和音の聞き流し（インプット）</h4>
                <p class="text-[10px] text-gray-600 leading-relaxed">まずは「和音の聞き流し」で脳に音の色を覚えさせます。これがトレーニングの核となります。</p>
              </div>
            </div>
            <!-- Step 2: Identification -->
            <div class="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center">
              <div class="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0 mr-4">
                <span class="text-xl font-black text-gray-400">2</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">和音テストに挑戦（アウトプット）</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed">覚えた色をクイズ形式でテストします。正解することで脳が音を強く認識します。</p>
              </div>
            </div>
            <!-- Step 3: Perfection -->
            <div class="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center">
              <div class="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0 mr-4">
                <span class="text-xl font-black text-gray-400">3</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">単音の聞き分け</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed">和音が完璧になったら、1音だけの聞き分けにも挑戦。絶対音感を完成させます。</p>
              </div>
            </div>
          </div>
        </section>

        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center !mt-16 mb-6">トレーニング方法</h3>
        
        <!-- Pattern 1: AutoPlay (Main Feature) -->
        <section class="bg-gray-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-110"></div>
          <div class="flex items-start mb-6">
            <span class="bg-indigo-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4">MAIN</span>
            <div>
              <h4 class="font-black text-xl mb-1">日常に溶け込む「聞き流し」</h4>
              <p class="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Auto-Input Mode</p>
            </div>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed mb-6">
            「和音の聞き流し」は、本アプリで最も重要なトレーニングです。家事の合間や移動中、遊びの時間にBGMとして流すだけで、脳が自然と音と色を紐付けていきます。
          </p>
          <ul class="space-y-3">
            <li class="flex items-start text-[11px] text-indigo-200">
              <span class="mr-3 mt-1">👂</span>
              <span>無理に聴こうとしなくて構いません。「なんとなく聴こえている」状態を毎日作ることが、絶対音感への近道です。</span>
            </li>
            <li class="flex items-start text-[11px] text-indigo-200">
              <span class="mr-3 mt-1">📺</span>
              <span>YouTube公式チャンネルの連続動画も活用しましょう。画面の色をパッと見るだけでも効果的です。</span>
            </li>
          </ul>
        </section>

        <!-- Pattern 2: Parent-Child Quiz -->
        <section class="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-sm relative overflow-hidden group">
          <div class="flex items-start mb-6">
            <span class="bg-gray-100 text-gray-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4">GAME</span>
            <div>
              <h4 class="font-black text-gray-900 text-xl mb-1">親子で楽しく「色クイズ」</h4>
              <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Interaction Mode</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            親御様が音を鳴らし、お子様が色を答える。コミュニケーションを楽しみながら進めることで、お子様の意欲を最大限に引き出します。
          </p>
          <ul class="space-y-3">
            <li class="flex items-start text-[11px] text-gray-500">
              <span class="mr-3 mt-1">🚩</span>
              <span>実際の色の旗を用意したり、周囲にある「同じ色の物」を指差してもらったりすると、より盛り上がります。</span>
            </li>
            <li class="flex items-start text-[11px] text-gray-500">
              <span class="mr-3 mt-1">🙈</span>
              <span>「音だけで当てる」ために、時々目をつぶってチャレンジすると、聴覚への集中力が一段と高まります。</span>
            </li>
          </ul>
        </section>

        <!-- Sound Quality -->
        <section class="bg-indigo-50 rounded-[40px] p-10 border border-indigo-100 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div class="flex items-start mb-6">
            <div class="bg-indigo-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4 shrink-0">✨</div>
            <h4 class="font-black text-gray-900 text-xl">最高峰の音色を、黄金期の耳へ</h4>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            最も音を吸収する時期だからこそ、提供する音質には一切妥協しません。電子音では得られない「本物のピアノだけが持つ豊かな倍音」が、感性を根底から育てます。
          </p>
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
            <div class="flex -space-x-2">
              <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-black">YMH</div>
              <div class="w-10 h-10 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">STN</div>
            </div>
            <p class="text-[10px] text-gray-500 font-medium">
              Yamaha C5 / Steinway B<br/>
              厳選された2つの名機のサンプリング音源を搭載。
            </p>
          </div>
        </section>

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
                <p class="text-[10px] text-amber-700 leading-relaxed">一度に長時間やるより、1〜2分（和音5個分など）を「1日5回」分けるほうが脳に定着します。</p>
              </div>
            </div>
            <div class="flex items-start">
              <div class="bg-white p-2 rounded-xl shadow-sm mr-4 mt-1">🎼</div>
              <div>
                <p class="text-xs font-black text-amber-900 mb-1">音質にこだわる</p>
                <p class="text-[10px] text-amber-700 leading-relaxed">正確なピッチが大切です。できるだけ高品質な音源設定（Steinwayなど）での練習をお勧めします。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="space-y-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">よくある質問</h3>
          <div class="space-y-4">
            <div v-for="(faq, i) in [
              { q: '何歳から始めるのがいいですか？', a: '聴覚の発達がピークを迎える2歳〜6歳が最適です。それ以降でも相対音感の発達に繋がりますが、絶対音感を身につけるには早めのスタートをお勧めします。' },
              { q: '毎日どれくらい練習すればいい？', a: '1回1〜2分の「聞き流し」で十分です。それよりも「毎日欠かさず」続けること、生活リズムに組み込むことが重要です。' },
              { q: '間違えてばかりで心配です...', a: '全く問題ありません。間違えた音も脳にとっては「比較対象」として重要なデータになります。「音が聞こえたね」と肯定し、リラックスして楽しみましょう。' }
            ]" :key="i" class="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <p class="text-xs font-black text-gray-900 mb-2 flex items-start">
                <span class="text-blue-500 mr-3">Q.</span>
                {{ faq.q }}
              </p>
              <p class="text-[11px] text-gray-500 leading-relaxed flex items-start pl-6">
                {{ faq.a }}
              </p>
            </div>
          </div>
        </section>

        <!-- Setup Info -->
        <section class="py-12 border-t border-gray-100 text-center">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">アプリの設定</h3>
          <div class="max-w-[240px] mx-auto">
             <InstallPwa />
          </div>
          <p class="mt-4 text-[9px] text-gray-400 leading-relaxed px-8">
            ※ホーム画面に追加すると、Webブラウザの制限を受けず、より安定した音声再生とフルスクリーンでの没入体験が可能になります。
          </p>
        </section>
      </div>

      <div class="mt-4 mb-20 text-center">
        <NuxtLink to="/" class="group flex items-center justify-center space-x-2 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
          <span>トレーニングを開始する</span>
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </NuxtLink>
      </div>
    </main>

    <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
      <NuxtLink to="/terms" class="text-gray-400 hover:text-gray-600 transition-colors text-[10px]">利用規約</NuxtLink>
      <NuxtLink to="/privacy" class="text-gray-400 hover:text-gray-600 transition-colors text-[10px]">プライバシーポリシー</NuxtLink>
    </div>
    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
