<script setup>
import AppHeader from '../components/AppHeader.vue'
import InstallPwa from '../components/InstallPwa.vue'
import { ChordDefinitions } from '../constants/chords.js'

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
          <h1 class="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-3">About Irooto</h1>
          <h2 class="text-2xl font-black text-gray-900 leading-tight">
            14種類の「音の色」を覚える<br/>独自の絶対音感メソッド
          </h2>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto text-left">
            「いろおと」は、基本となる<strong>9つの白鍵の和音</strong>と、<strong>5つの黒鍵の和音</strong>、合計14種類の音の響きを「色」と結びつけることで、楽しみながら絶対音感を身につける知育アプリです。
          </p>
        </div>

        <!-- The Methodology (Colors) -->
        <nav class="space-y-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">基本の14種類の和音</h3>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="chord in mainChords" :key="chord.id" class="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-transform hover:scale-105">
              <div class="w-10 h-10 rounded-full shadow-sm mb-2" :style="{ backgroundColor: chord.color }"></div>
              <span class="text-[10px] font-black text-gray-900 leading-tight mb-0.5" v-html="chord.nameIt"></span>
              <span class="text-[9px] font-bold text-gray-400 opacity-80 uppercase tracking-tighter">{{ chord.colorName }}</span>
            </div>
          </div>
        </nav>

        <!-- Training Patterns -->
        <div class="space-y-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">ステップアップ・ロードマップ</h3>
          
          <div class="space-y-4">
            <!-- Level 1 -->
            <div class="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center">
              <div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 mr-4">
                <span class="text-xl font-black text-red-500">Lv.1</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">基本の3色（赤・黄・青）</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed">まずは一番聞き分けやすい「ドミソ」「ドファラ」「シレソ」の3つからスタートします。</p>
              </div>
            </div>
            <!-- Level 2 -->
            <div class="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center opacity-60">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 mr-4">
                <span class="text-xl font-black text-amber-500">Lv.2</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">白鍵の9色を完成させる</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed">少しずつ新しい音（色）を増やしていき、白鍵すべての和音を覚えます。</p>
              </div>
            </div>
            <!-- Level 3 -->
            <div class="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center opacity-60">
              <div class="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0 mr-4">
                <span class="text-xl font-black text-white">Lv.3</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 text-sm mb-1">黒鍵と単音への挑戦</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed">最終的に黒鍵を含む14色、そして和音から1音だけを聞き分ける「単音」へと進みます。</p>
              </div>
            </div>
          </div>

          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mt-12 mb-6">トレーニング方法</h3>
          
          <!-- Pattern 1 -->
          <section class="bg-gray-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-110"></div>
            <div class="flex items-start mb-6">
              <span class="bg-blue-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4">01</span>
              <div>
                <h4 class="font-black text-xl mb-1">親子で楽しく「色クイズ」</h4>
                <p class="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Co-Learning Mode</p>
              </div>
            </div>
            <p class="text-sm text-gray-300 leading-relaxed mb-6">
              親御様がホーム画面で音を鳴らし、お子様がその「色」を答えます。<strong>「お子様に画面を見せないこと」</strong>が、耳を集中させる最大のポイントです。
            </p>
            <ul class="space-y-3">
              <li class="flex items-start text-[11px] text-blue-200">
                <span class="mr-3 mt-1">🚩</span>
                <span>実際の色の旗（色紙など）を用意して、それを挙げてもらうとゲーム性が高まり、飽きずに続けられます。</span>
              </li>
              <li class="flex items-start text-[11px] text-blue-200">
                <span class="mr-3 mt-1">🎉</span>
                <span>正解したら「すごい！」「大正解！」と大げさに褒めてあげてください。喜びが脳への定着を加速させます。</span>
              </li>
            </ul>
          </section>

          <!-- Pattern 2 -->
          <section class="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-sm relative overflow-hidden group">
            <div class="flex items-start mb-6">
              <span class="bg-gray-100 text-gray-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4">02</span>
              <div>
                <h4 class="font-black text-gray-900 text-xl mb-1">ひとりで集中「和音テスト」</h4>
                <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Self-Training Mode</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
              「和音テスト」モードでは、アプリが自動で出題から判定までを行います。忙しい時でも、お子様がゲーム感覚で自分一人で進めることができます。
            </p>
            <ul class="space-y-3">
              <li class="flex items-start text-[11px] text-gray-500">
                <span class="mr-3 mt-1">🎧</span>
                <span>騒がしい場所ではイヤホンの使用も推奨されます。正確な「音の成分」を届けることが重要です。</span>
              </li>
              <li class="flex items-start text-[11px] text-gray-500">
                <span class="mr-3 mt-1">📈</span>
                <span>履歴機能で、正解率の変化をチェック。成長が目に見えることで、親御様のモチベーションにも繋がります。</span>
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
              最も音を吸収する時期だからこそ、提供する音質には一切妥協しません。電子音（サイン波）では絶対に得られない「本物のピアノだけが持つ豊かな倍音」が、お子様の脳を刺激し、音楽的な感性を根底から育てます。
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

        <!-- FAQ Section -->
        <section class="space-y-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">よくある質問</h3>
          <div class="space-y-4">
            <div v-for="(faq, i) in [
              { q: '何歳から始めるのがいいですか？', a: '聴覚の発達がピークを迎える2歳〜6歳が最適です。それ以降でも相対音感の発達に繋がりますが、絶対音感を身につけるには早めのスタートをお勧めします。' },
              { q: '毎日どれくらい練習すればいい？', a: '1回1〜2分で十分です。それよりも「毎日欠かさず」続けること、そして「朝起きたら」や「お風呂上がり」など生活リズムに組み込むことが重要です。' },
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
