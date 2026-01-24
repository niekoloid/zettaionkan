<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StickyCta from '~/components/lp/StickyCta.vue'

definePageMeta({
  layout: false,
  pageTransition: false
})

const faqOpen = ref<number | null>(null)

const toggleFaq = (index: number) => {
  faqOpen.value = faqOpen.value === index ? null : index
}

// Intersection Observer for fade-in animation
const observer = ref<IntersectionObserver | null>(null)

// Mask sensitive info from search index
const devInfo = ref({ name: '', title: '' })
onMounted(() => {
  devInfo.value = {
    name: '司空 舜',
    title: '株式会社暁 代表'
  }
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0')
        entry.target.classList.remove('opacity-0', 'translate-y-10')
        observer.value?.unobserve(entry.target)
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.value?.observe(el)
  })
})

onUnmounted(() => {
  observer.value?.disconnect()
})

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Move font loading script to useHead for better SSR compatibility
useHead({
  script: [
    {
      innerHTML: `(function() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@700&display=swap';
        link.media = 'all';
        document.head.appendChild(link);
      })();`,
      type: 'text/javascript'
    }
  ]
})
// SEO Setup
useSeoMeta({
  title: '絶対音感の習得を、もっと簡単に。 | いろおと',
  description: 'こどもの耳の『黄金期』を逃さない。再現性の高い科学的メソッドで、スマホひとつで身につく絶対音感トレーニング。',
  ogTitle: '絶対音感の習得を、もっと簡単に。 | いろおと',
  ogDescription: 'こどもの耳の『黄金期』を逃さない。再現性の高い科学的メソッドで、スマホひとつで身につく絶対音感トレーニング。',
  ogImage: 'https://zettaionkan.jp/images/lp/ogp_image.webp',
  ogUrl: 'https://zettaionkan.jp/',
  ogType: 'website',
  ogSiteName: 'いろおと',
  twitterCard: 'summary_large_image',
  twitterTitle: '絶対音感の習得を、もっと簡単に。 | いろおと',
  twitterDescription: 'こどもの耳の『黄金期』を逃さない。再現性の高い科学的メソッドで、スマホひとつで身につく絶対音感トレーニング。',
  twitterImage: 'https://zettaionkan.jp/images/lp/ogp_image.webp',
})
</script>

<template>
  <div class="font-sans text-gray-800 bg-white">
    <!-- Header/Nav (Simplified for LP) -->
    <header class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center md:justify-between items-center h-16">
          <div class="flex-shrink-0 flex items-center cursor-pointer" @click="scrollToTop">
             <!-- Text Logo or Image Logo if available -->
             <img src="~/assets/logo_irooto_only_name.webp" alt="いろおと" class="h-8 w-auto" width="100" height="32" />
          </div>
          <nav class="hidden md:flex space-x-8">
            <button @click="scrollToTop" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">トップ</button>
            <a href="#solution" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">特徴</a>
            <a href="#method" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">仕組み</a>
            <a href="#benefits" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">メリット</a>
            <a href="#comparison" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">比較表</a>
            <a href="#pricing" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">料金プラン</a>
            <a href="#faq" class="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Q&A</a>
          </nav>
          <div class="hidden md:flex items-center">
             <a href="/auth?mode=signup" class="ml-8 inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
               無料で始める
             </a>
          </div>
        </div>
      </div>
    </header>

    <main class="pt-16">
      <!-- 1. First View (Hero) -->
      <section class="relative overflow-hidden pt-10 pb-16 lg:pt-20 lg:pb-28">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <!-- Removed animation/transition from hero for instant LCP -->
            <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 class="block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl text-gray-900 leading-tight text-balance">
                <span class="inline-block">絶対音感の習得を、</span><span class="inline-block">もっと簡単に。</span>
              </h1>
              <p class="mt-5 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl font-medium">
                <span class="inline-block">こどもの耳の『黄金期』を逃さない。</span><br class="hidden sm:inline" />
                <span class="inline-block">再現性の高い科学的メソッドで、</span><span class="inline-block">スマホひとつで身につける</span><span class="inline-block">絶対音感トレーニング。</span>
              </p>
              <div class="mt-8 sm:mt-12 hidden lg:flex lg:justify-start">
                <div class="w-full sm:max-w-xs">
                  <a href="/auth?mode=signup" class="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transform transition hover:scale-105 shadow-xl">
                    今すぐ無料で始める
                  </a>
                </div>
              </div>
            </div>
            <!-- Removed animation/transition from hero for instant LCP -->
            <div class="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div class="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden">
                <!-- Hero Image -->
                <img class="w-full h-full object-cover" src="/images/lp/hero.webp" alt="親子が笑顔で顔を見合わせ、スマホには黄色いねこ" width="1024" height="1024" loading="eager" decoding="async" fetchpriority="high" />
              </div>
              
              <!-- Mobile Only CTA -->
              <div class="mt-8 flex justify-center lg:hidden">
                <div class="w-full max-w-xs">
                  <a href="/auth?mode=signup" class="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transform transition hover:scale-105 shadow-xl">
                    今すぐ無料で始める
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Decorative blobs -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50 z-0"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 z-0"></div>
      </section>

      <!-- 2. Pain & Agony -->
      <!-- 2. Pain & Agony -->
      <section class="py-16 md:py-24 bg-gray-50 overflow-hidden relative">
        <!-- Decorative background elements -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div class="absolute -top-24 -left-24 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div class="absolute top-1/2 right-0 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <span class="text-gray-500 font-semibold tracking-wide uppercase text-sm">Pain Points</span>
            <h2 class="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl text-balance leading-tight">
              あんなに意気込んで始めたのに、<br />
              毎日の<span class="text-red-500 bg-red-50 px-1 rounded mx-1 relative inline-block">『準備』</span>と
              <span class="text-red-500 bg-red-50 px-1 rounded mx-1 relative inline-block">『つきっきり』</span>に<br class="hidden md:inline"/>
              疲れていませんか？
            </h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left items-center">
              <!-- Image Side -->
              <div class="relative animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
                 <div class="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                   <div class="absolute inset-0 bg-gray-900/10 z-10"></div> <!-- Slight darken overlay -->
                   <img src="/images/lp/pain.webp" alt="散らかったリビングで頭を抱える親" class="w-full h-auto object-cover" width="600" height="400" />
                   <!-- Caption Overlay -->
                   <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6 z-20">
                     <p class="text-white font-bold text-lg">「もう、やめたい...」</p>
                     <p class="text-gray-200 text-sm">理想と現実のギャップに悩む日々</p>
                   </div>
                 </div>
                 <!-- Decorative element -->
                 <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 z-0"></div>
              </div>

              <!-- Cards Side -->
              <div class="space-y-6">
                 <!-- Card 1 -->
                 <div class="flex items-start p-6 bg-white rounded-2xl shadow-lg border-l-4 border-gray-300 animate-on-scroll opacity-0 translate-x-10 transition-all duration-1000 ease-out delay-100 hover:shadow-xl hover:translate-x-1 transform transition-all group">
                   <div class="flex-shrink-0 mr-4">
                     <div class="w-12 h-12 bg-gray-100 text-2xl flex items-center justify-center rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                       😫
                     </div>
                   </div>
                   <div>
                     <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">楽器の前に座るだけでも一苦労</h3>
                     <p class="text-gray-600 text-sm leading-relaxed">
                       「練習しよう」と声をかけても、遊びに夢中で聞いてくれない。楽器の準備をするだけで親の体力が削られていく...。
                     </p>
                   </div>
                 </div>

                 <!-- Card 2 -->
                 <div class="flex items-start p-6 bg-white rounded-2xl shadow-lg border-l-4 border-gray-300 animate-on-scroll opacity-0 translate-x-10 transition-all duration-1000 ease-out delay-200 hover:shadow-xl hover:translate-x-1 transform transition-all group">
                   <div class="flex-shrink-0 mr-4">
                      <div class="w-12 h-12 bg-gray-100 text-2xl flex items-center justify-center rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                       🕰️
                     </div>
                   </div>
                   <div>
                     <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">レッスンに通わせる時間の余裕がない</h3>
                     <p class="text-gray-600 text-sm leading-relaxed">
                       共働きで送迎の時間を作るのは至難の業。土日も家事や他の用事で潰れてしまい、継続的に通うのが難しい。
                     </p>
                   </div>
                 </div>

                  <!-- Card 3 -->
                 <div class="flex items-start p-6 bg-white rounded-2xl shadow-lg border-l-4 border-gray-300 animate-on-scroll opacity-0 translate-x-10 transition-all duration-1000 ease-out delay-300 hover:shadow-xl hover:translate-x-1 transform transition-all group">
                   <div class="flex-shrink-0 mr-4">
                     <div class="w-12 h-12 bg-gray-100 text-2xl flex items-center justify-center rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                       😓
                     </div>
                   </div>
                   <div>
                     <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">ついつい叱ってしまう自己嫌悪</h3>
                     <p class="text-gray-600 text-sm leading-relaxed">
                       子供がすぐに飽きてしまい、真面目にやらない姿にイライラ。「なんでできないの！」と声を荒らげては、寝顔を見て反省する毎日。
                     </p>
                   </div>
                 </div>
              </div>
          </div>
        </div>
      </section>

      <!-- 3. Solution & Feature -->
      <section id="solution" class="py-16 lg:py-24 bg-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div class="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <span class="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Solution</span>
            <h2 class="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl text-balance">
              <span class="inline-block">『練習』を、</span><span class="inline-block">子供が夢中になる『遊び』へ</span><span class="inline-block">アップデート。</span>
            </h2>
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
             <!-- Features List -->
            <div class="space-y-8">
               <!-- Feature 1: Performance Mode -->
              <div class="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-indigo-50/50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 ease-out">
                <div class="absolute -left-2 -top-2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 tracking-widest">
                  楽しさ
                </div>
                <div class="flex items-start gap-5">
                  <div class="flex-shrink-0">
                    <div class="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-indigo-50 group-hover:ring-indigo-100 transition-all">
                      <img src="/images/lp/feature_visual.webp" alt="演出モードのイメージ" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" width="80" height="80" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">演出モード</h3>
                    <p class="mt-2 text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                      電車、車、ねこ…お子様の『大好き』が音と一緒に動き出すから、<span class="text-indigo-600 bg-indigo-50 px-1 rounded font-bold">集中力が途切れません</span>。
                    </p>
                  </div>
                </div>
              </div>

               <!-- Feature 2: Autoplay -->
              <div class="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-indigo-50/50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 ease-out delay-100">
                <div class="absolute -left-2 -top-2 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 tracking-widest">
                  手軽さ
                </div>
                <div class="flex items-start gap-5">
                  <div class="flex-shrink-0">
                    <div class="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-pink-50 group-hover:ring-pink-100 transition-all">
                      <img src="/images/lp/feature_autoplay.webp" alt="オートプレイのイメージ" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" width="80" height="80" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">BGMとして流すだけ</h3>
                    <p class="mt-2 text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                      「オートプレイ機能」搭載。忙しい家事の合間や移動中、BGMとして流しておくだけで、<span class="text-pink-600 bg-pink-50 px-1 rounded font-bold">無意識のうちに音感が育ちます</span>。
                    </p>
                  </div>
                </div>
              </div>

               <!-- Feature 3: Sound Quality -->
              <div class="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-indigo-50/50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 ease-out delay-200">
                <div class="absolute -left-2 -top-2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 tracking-widest">
                  本物志向
                </div>
                <div class="flex items-start gap-5">
                  <div class="flex-shrink-0">
                    <div class="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-orange-50 group-hover:ring-orange-100 transition-all">
                      <img src="/images/lp/feature_piano.webp" alt="スタインウェイ音源のイメージ" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" width="80" height="80" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">最高峰の音源</h3>
                    <p class="mt-2 text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                      世界最高峰のスタインウェイ音源を採用。電子音ではない本物のグランドピアノの響きが、<span class="text-orange-600 bg-orange-50 px-1 rounded font-bold">お子様の繊細な耳を育てます</span>。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Solution Image -->
            <div class="mt-12 lg:mt-0 relative animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300">
              <div class="rounded-2xl shadow-xl overflow-hidden bg-gray-100">
                 <!-- Solution Image -->
                 <img class="w-full h-full object-cover transform hover:scale-105 transition duration-500" src="/images/lp/solution.webp" alt="アプリ画面から飛び出す電車やねこ" width="1024" height="1024" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2.5 Method / Theory (CIM) -->
      <section id="method" class="py-16 bg-white overflow-hidden relative border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <span class="text-indigo-600 font-bold tracking-wide uppercase text-xs md:text-sm">Method</span>
            <h2 class="mt-2 text-2xl font-extrabold text-gray-900 sm:text-4xl text-balance">
              <span class="inline-block">どうすれば、</span><span class="inline-block">絶対音感を身につけられるのか？</span>
            </h2>
            <p class="mt-4 max-w-2xl text-base md:text-xl text-gray-500 lg:mx-auto font-medium">
              特別な才能は必要ありません。やることは非常にシンプル。<br />
              <span class="text-indigo-600 font-bold text-lg md:text-2xl">「白鍵9種類＋黒鍵5種類の計14種類の和音」</span>を覚えるだけです。
            </p>
          </div>

          <div class="mt-12 md:mt-16">
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 md:p-12 shadow-sm border border-indigo-100 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
              <div class="md:flex md:items-center md:gap-12">
                <div class="md:w-1/2 mb-8 md:mb-0 relative">
                   <div class="aspect-video bg-white rounded-2xl shadow-sm flex items-center justify-center relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100 opacity-30"></div>
                      <div class="text-center relative z-10 w-full h-full">
                        <img src="/images/lp/cim.webp" alt="和音の響きが鮮やかな色に変換されるイメージ" class="w-full h-full object-cover" width="1024" height="1024" loading="lazy" decoding="async" />
                      </div>
                   </div>
                </div>
                <div class="md:w-1/2">
                  <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-snug">
                    なぜ「単音」ではなく、<br />「和音」から始めるのか？
                  </h3>
                  <div class="prose prose-blue text-gray-600 text-sm md:text-base leading-relaxed space-y-4">
                    <p>
                      「ド」はド、「レ」はレ…といった単音は、子供の脳にとっては「細すぎて記憶に残りにくい」という特徴があります。
                    </p>
                    <p class="font-bold text-indigo-900 bg-indigo-100/50 p-4 rounded-lg">
                      一方、複数の音が重なる<span class="text-indigo-600">「和音」</span>は響きが豊かで、脳に鮮烈な印象を与えます。
                      この14種類の和音特有の響き（クロマ）を記憶することで、脳内で音が整理され、やがて一つ一つの音の違いも識別できるようになります（和音→単音分化）。
                    </p>
                    <p>
                      このアプローチこそが、日常言語を覚えるのと同じ仕組みで、一生モノの「絶対的な音の記憶」を定着させる最短ルートなのです。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2.7 Benefits Section -->
      <section id="benefits" class="py-16 lg:py-24 bg-white overflow-hidden border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <span class="text-indigo-600 font-bold tracking-wide uppercase text-xs md:text-sm">Future Benefits</span>
            <h2 class="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl text-balance mb-4">
              絶対音感がお子様の未来に与える<br class="sm:hidden" />「3つの贈り物」
            </h2>
            <h3 class="text-xl font-bold text-indigo-900 mb-6">なぜ、世界の優秀な層はこぞって「耳」を育てるのか？</h3>
            <p class="max-w-3xl mx-auto text-base md:text-lg text-gray-500 font-medium leading-relaxed">
              絶対音感の習得は、単に「ドレミがわかる」ことではありません。脳が最も柔軟な幼児期に「音の基準」を作ることは、お子様の脳の発達に計り知れないメリットをもたらします。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-10">
            <!-- Gift 1 -->
            <div class="relative p-8 pt-12 rounded-3xl bg-white border border-indigo-100 shadow-xl shadow-indigo-100/20 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300">
              <!-- Label Badge -->
              <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-black tracking-widest border-4 border-white">
                GIFT 01
              </div>
              
              <div class="w-24 h-24 mb-6 rounded-full overflow-hidden shadow-lg border-4 border-indigo-50 bg-white group-hover:scale-110 transition-transform duration-300">
                <img src="/images/lp/gift_language.png" alt="語学の贈り物" class="w-full h-full object-cover" width="96" height="96" />
              </div>
              
              <div class="mb-3">
                 <span class="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
                  語学・脳の発達
                </span>
              </div>

              <h4 class="text-xl font-bold text-gray-900 mb-4 whitespace-pre-wrap leading-tight">
                IQの向上につながり<br/>外国語の習得が有利になる
              </h4>
              
              <p class="text-sm text-gray-600 leading-relaxed font-medium">
                色と音を対応付ける訓練により、共感覚（Synesthesia）の能力トレーニングになります。また、音を正確に聴き分ける耳は、外国語（英語）の習得においても圧倒的なアドバンテージとなります。
              </p>
            </div>

            <!-- Gift 2 -->
             <div class="relative p-8 pt-12 rounded-3xl bg-white border border-orange-100 shadow-xl shadow-orange-100/20 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-200 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-100/40 transition-all duration-300">
               <!-- Label Badge -->
              <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-2 rounded-full shadow-lg text-sm font-black tracking-widest border-4 border-white">
                GIFT 02
              </div>

              <div class="w-24 h-24 mb-6 rounded-full overflow-hidden shadow-lg border-4 border-orange-50 bg-white group-hover:scale-110 transition-transform duration-300">
                <img src="/images/lp/gift_music.png" alt="音楽の贈り物" class="w-full h-full object-cover" width="96" height="96" />
              </div>

              <div class="mb-3">
                 <span class="inline-block bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-100">
                  表現力の開花
                </span>
              </div>

              <h4 class="text-xl font-bold text-gray-900 mb-4 whitespace-pre-wrap leading-tight">
                どんな楽器も<br/>「遊び」のように楽しめる
              </h4>
              <p class="text-sm text-gray-600 leading-relaxed font-medium">
                一度絶対音感が身につけば、耳で聴いたメロディをすぐに楽器で再現できる「耳コピ」ができるようになります。 将来、ピアノ、ギター、吹奏楽など、どんな楽器を始める時も<strong class="text-orange-600 bg-orange-50 px-1 rounded">「楽譜が読めなくて挫折する」という最初の壁がありません</strong>。音楽が「お勉強」ではなく、一生の友達になります。
              </p>
            </div>

            <!-- Gift 3 -->
             <div class="relative p-8 pt-12 rounded-3xl bg-white border border-pink-100 shadow-xl shadow-pink-100/20 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-300">
               <!-- Label Badge -->
              <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-2 rounded-full shadow-lg text-sm font-black tracking-widest border-4 border-white">
                GIFT 03
              </div>

              <div class="w-24 h-24 mb-6 rounded-full overflow-hidden shadow-lg border-4 border-pink-50 bg-white group-hover:scale-110 transition-transform duration-300">
                <img src="/images/lp/gift_confidence.png" alt="自信の贈り物" class="w-full h-full object-cover" width="96" height="96" />
              </div>

              <div class="mb-3">
                 <span class="inline-block bg-pink-50 text-pink-700 text-xs font-bold px-3 py-1 rounded-full border border-pink-100">
                  自己肯定感
                </span>
              </div>

              <h4 class="text-xl font-bold text-gray-900 mb-4 whitespace-pre-wrap leading-tight">
                自分だけの特別な力という<br/>「圧倒的な自信」
              </h4>
              <p class="text-sm text-gray-600 leading-relaxed font-medium">
                「救急車のサイレンが『シ・ソ』に聞こえる」など、日常の音がドレミに変換される不思議で特別な感覚。 <strong class="text-pink-600 bg-pink-50 px-1 rounded">20万人に一人</strong>と呼ばれるこの希少な能力は、お子様にとって「他の人にはない自分だけの特別な力」として、大きな自信（自己肯定感）となります。この自信は、音楽だけでなく、勉強やスポーツなどあらゆる挑戦を支える心の土台になります。
              </p>
            </div>
          </div>

          <!-- Microcopy and Image -->
          <div class="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
            <div class="md:w-1/2 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-400">
               <div class="relative">
                 <div class="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-pink-200 blur-3xl opacity-30 rounded-full"></div>
                 <img src="/images/lp/benefits.png" alt="子供が未来を夢見るイメージ" class="relative z-10 w-full h-auto rounded-3xl shadow-xl" width="1024" height="1024" />
               </div>
            </div>
            <div class="md:w-1/2 text-center md:text-left animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-500">
              <div class="bg-gradient-to-br from-gray-900 to-indigo-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div class="relative z-10">
                  <p class="text-white text-lg md:text-xl font-bold leading-relaxed">
                    この「3つの贈り物」をあげられるのは、<span class="text-yellow-300 underline underline-offset-4">聴覚が発達する6歳半まで</span>。
                  </p>
                  <p class="mt-6 text-indigo-100 text-base md:text-lg font-medium leading-relaxed">
                    「いろおと」は、この貴重なチャンスを逃さないためのパスポートです。
                  </p>
                  <div class="mt-8">
                    <a href="/auth?mode=signup" class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transform transition hover:scale-105 shadow-xl">
                      無料で今すぐ始める
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Comparison -->
      <section id="comparison" class="py-16 bg-indigo-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div class="text-center mb-12 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <h2 class="text-3xl font-bold">現代の忙しいパパ・ママに選ばれる理由</h2>
          </div>

          <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-x-auto animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
             <table class="min-w-full border-collapse">
               <thead>
                 <tr class="bg-gray-50 border-b border-gray-200">
                   <th class="sticky left-0 z-30 bg-gray-50 px-4 py-6 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[100px] md:min-w-0">比較項目</th>
                   <th class="px-4 py-6 text-center text-base md:text-lg font-bold text-white uppercase tracking-wider min-w-[140px] md:min-w-0 bg-indigo-600 shadow-lg relative z-10">いろおと</th>
                   <th class="px-4 py-6 text-center text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider min-w-[120px] md:min-w-0">ピアノ教室</th>
                   <th class="px-4 py-6 text-center text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider min-w-[120px] md:min-w-0 border-r border-gray-100">市販の教材</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-gray-100 text-gray-800">
                  <tr>
                    <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                      準備
                    </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 border-x-2 border-indigo-100 relative z-10 shadow-sm">スマホひとつ</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">楽器・楽譜一式</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">多量のカード類</td>
                  </tr>
                  <tr>
                     <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                       場所
                     </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 border-x-2 border-indigo-100 relative z-10 shadow-sm">どこでもOK</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">教室（要送迎）</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">楽器の前（固定）</td>
                  </tr>
                  <tr>
                    <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                      親の負担
                    </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 border-x-2 border-indigo-100 relative z-10 shadow-sm">BGM再生でOK</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">送迎と連絡</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">つきっきり指導</td>
                  </tr>
                  <tr>
                    <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                      反応
                    </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 border-x-2 border-indigo-100 relative z-10 shadow-sm">演出で夢中</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">緊張感がある</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">飽きやすい</td>
                  </tr>
                  <tr>
                    <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                      記録
                    </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 border-x-2 border-indigo-100 relative z-10 shadow-sm">自動集計</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">先生の評価のみ</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">親の手書きメモ</td>
                  </tr>
                  <tr>
                    <td class="sticky left-0 z-20 px-4 py-6 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 bg-white border-r border-gray-100">
                      コスト
                    </td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-sm md:text-lg font-bold text-indigo-700 bg-indigo-50 rounded-b-lg border-x-2 border-b-2 border-indigo-100 relative z-10 shadow-lg transform scale-105 origin-top">月額 980円〜</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">月額 約1万円〜</td>
                    <td class="px-4 py-6 whitespace-nowrap text-center text-xs md:text-sm text-gray-500">高額な教材費</td>
                  </tr>
               </tbody>
             </table>
          </div>
          <div class="mt-4 text-center md:hidden">
            <span class="text-xs text-indigo-200 font-medium">← 横にスクロールして比較できます →</span>
          </div>
        </div>
      </section>
      <!-- 5. Offer & Risk Reversal -->
      <section id="pricing" class="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl text-balance">
              <span class="inline-block">一生モノのギフトを、</span><br/><span class="inline-block">まずは無料で体験。</span>
            </h2>
            <p class="mt-4 text-xl text-gray-600">
              気に入ったら月額 1,980円で本格トレーニング。
            </p>
          </div>

          <div class="mt-12 max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
            <div class="px-6 py-8 sm:p-10 sm:pb-6">
              <div class="flex justify-center">
                <span class="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600">
                  特別オファー
                </span>
              </div>
              <div class="mt-4 flex justify-center items-baseline text-6xl font-extrabold text-gray-900">
                 <span class="text-3xl font-medium text-gray-500 mr-2">実質月額</span>
                980<span class="ml-1 text-2xl font-medium text-gray-500">円〜</span>
              </div>
              <p class="mt-4 text-gray-500">
                14日間の無料トライアルで<br/>
                全ての機能（電車や猫の演出含む）をお試しいただけます。
              </p>
            </div>
             <div class="px-6 pt-2 pb-8 sm:px-10 sm:py-10">
              <a href="/auth?mode=signup" class="block w-full text-center px-6 py-4 border border-transparent rounded-full shadow-md text-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
                今すぐ無料で始める
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. FAQ -->
      <section id="faq" class="py-16 bg-white">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-12 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            よくあるご質問
          </h2>
          
          <div class="space-y-4">
             <!-- FAQ 1 -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
              <button @click="toggleFaq(1)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 本当にスマホだけで絶対音感が身につくのでしょうか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 1 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 1" class="mt-2 pr-12">
                <p class="text-base text-gray-600">
                  A. はい、可能です。絶対音感の習得に最も重要なのは「脳が柔軟な時期（6歳半頃まで）に、いかに高頻度で音の入力を繰り返すか」です。もちろん個人差はありますが、14種類の和音を絶対的な聞き方ができる時期にしっかりと覚えさせることで、高い確率で絶対音感を身につけることができます。「いろおと」は場所を選ばず隙間時間に何度でも取り組めるため、1日1回のピアノ練習よりも圧倒的な習得効率を実現します。
                </p>
              </div>
            </div>

            <!-- FAQ 1.2 Frequency -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-25">
              <button @click="toggleFaq(1.2)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. どれぐらいの頻度と感覚で練習する必要がありますか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 1.2 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 1.2" class="mt-2 pr-12">
                <p class="text-base text-gray-600">
                  A. 一日4回以上、和音を15〜30回ほど聞かせるのが理想です。一回の時間は短くても、生活の中に「音を聞く時間」を細かく作ってあげることが習得の近道です。「オートプレイ機能」を使えば、BGM感覚で無理なく習慣化できます。
                </p>
              </div>
            </div>

            <!-- FAQ 1.5 Adult -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-50">
              <button @click="toggleFaq(1.5)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 大人でも効果はありますか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 1.5 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 1.5" class="mt-2 pr-12">
                <p class="text-base text-gray-600">
                  A. 残念ながら、脳科学の観点から大人になってからの絶対音感習得は「不可能」とされています（臨界期仮説）。6歳頃までに脳の神経回路を形成する必要があるためです。また、本アプリは相対音感のトレーニング用としては設計されていません。あくまで、6歳頃までの「黄金期」にあるお子様を持つ保護者の方が、お子様に絶対音感を教えるための補助ツールとしてご活用いただくことを想定しています。
                </p>
              </div>
            </div>

            <!-- FAQ 2 -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-100">
              <button @click="toggleFaq(2)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 家にあるピアノを使わなくても大丈夫ですか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 2 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 2" class="mt-2 pr-12">
                  <p class="text-base text-gray-600">
                    A. はい、音質には一切の妥協をしていません。絶対音感の習得において最も重要なのは、歪みのない「本物」の倍音成分に触れることです。「いろおと」には、<span class="font-bold">アイオワ大学電子音楽スタジオ (University of Iowa Electronic Music Studios)</span> が収録した、希少な<span class="font-bold">New York Steinway Model B</span>の音源を採用しています。スタジオ環境で緻密にサンプリングされたこの音源は、一般的なアプリで見られるようなデータ圧縮や高域カット（大人の可聴域外の間引き）を一切行わず、<span class="font-bold">20kHzを超える子供にしか聴こえない微細な倍音</span>まで忠実に再現しています。この豊かな響きこそが、脳に正確な音の記憶を刻みます。もし可能であれば、比較的性能の良いスピーカーで鳴らしてあげると、より効果的です。
                  </p>
              </div>
            </div>

            <!-- FAQ 3 -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-200">
              <button @click="toggleFaq(3)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 「アプリのインストール不要」とはどういうことですか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 3 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 3" class="mt-2 pr-12">
                  <p class="text-base text-gray-600">
                    A. 通常のアプリのように、App Storeなどで検索してダウンロードする手間がありません。今見ているこのページを、スマホの「ホーム画面に追加」するだけで、次からはアイコンをタップするだけで普通のアプリと同じように使えます。スマホの容量もほとんど使いません。<br/><br/>
                    Webアプリなので、パソコン、タブレット、スマホいずれでもログインさえすれば同じ設定で同じように使えます。タブレット・スマホでアクセスした場合はアプリをホーム画面にインストールするかどうかを選択する事ができ、あたかもApp Storeなどでアプリをインストールしたかのように使えます。
                  </p>
              </div>
            </div>

            <!-- FAQ 4 -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-300">
              <button @click="toggleFaq(4)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 2歳になったばかりですが、まだ早いでしょうか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 4 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 4" class="mt-2 pr-12">
                 <p class="text-base text-gray-600">
                  A. むしろ、2歳から4歳頃が最も効果が高い「黄金期」の始まりです。「いろおと」には、画面を触るだけで音が鳴る「アイス」や「ねこ」モードなど、遊びの要素が詰まっています。言葉がまだ十分でないお子様でも、色と音で直感的に楽しむことができます。
                </p>
              </div>
            </div>



            <!-- FAQ 6 -->
            <div class="border-b border-gray-200 pb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out delay-500">
              <button @click="toggleFaq(6)" class="flex justify-between items-center w-full text-left focus:outline-none">
                <span class="text-lg font-medium text-gray-900">Q. 途中でやめたくなったら、すぐに解約できますか？</span>
                <span class="ml-6 flex-shrink-0 text-indigo-500 font-bold text-2xl">{{ faqOpen === 6 ? '−' : '＋' }}</span>
              </button>
              <div v-show="faqOpen === 6" class="mt-2 pr-12">
                 <p class="text-base text-gray-600">
                  A. もちろん可能です。契約期間の縛りは一切ありません。管理画面からいつでもご自身で解約の手続きが行えます。
                  <br/><br/>
                  さらに、PROプランであっても<b>最初の14日間は無料</b>ですべての機能をお試しいただけます。もし「合わない」と感じた場合は、無料期間中に解約すれば料金は一切かかりません。まずはお子様が楽しんでくれるかどうか、安心してお試しください。
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 7. Message -->
      <section class="py-16 lg:py-24 bg-gray-50 border-t border-gray-200">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white p-8 md:p-12 rounded-lg shadow-inner animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <h3 class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Message</h3>
            <h2 class="text-2xl font-serif font-bold text-gray-800 mb-8 border-b-2 border-indigo-100 pb-4">
              間に合わなかったという後悔を、<br/>誰にもしてほしくない。
            </h2>
            <div class="prose prose-lg text-gray-600 font-serif leading-relaxed">
              <p>
                はじめまして。いろおとの開発者です。
              </p>
              <p>
                私自身、15歳のときにピアノの演奏にのめり込んでいた際、「自分にも絶対音感があったら」と切実に思っていました。しかし、皮肉にも絶対音感が欲しいと願うのは、もうそれが手に入らない大人になってからなのです。6歳頃までの子供たちは、まだ臨界期の存在すら知らず、自らそれを望むことはありません。
              </p>
              <p>
                親として「良いと言われることはしてあげたい」。その一心で2歳の息子と音感トレーニングに格闘しましたが、現実は甘くありませんでした。様々な研究資料をあたると「和音と色を結びつける方法」が最適であることは分かりましたが、いざ家庭で毎日実践しようとすると、それはあまりにも大変なことでした。教具を揃え、ピアノの前に誘い、なんとか子供を飽きさせないように……。気づけば余裕をなくし、「やりなさい！」と声を荒らげてしまう日々。
              </p>
              <p class="font-bold text-gray-800">
                「これでは本末転倒だ……」
              </p>
              <p>
                そんな挫折と反省から、この「いろおと」は生まれました。
              </p>
              <p>
                子供が自ら「やりたい！」と駆け寄ってくれる。親は隣でニコニコと見守るだけでいい。そんな幸せな景色を作りたくて、徹底的に「子供の視点」で遊びの要素を詰め込みました。
              </p>
              <p>
                絶対音感の習得にはタイムリミットがありますが、焦る必要はありません。正しい方法さえあれば、それはトレーニングの時間ではなく、親子の笑顔の時間になるからです。
              </p>
              <p>
                あなたと、大切なお子様の未来が、色とりどりの音で溢れますように。
              </p>
              <!-- googleoff: index -->
              <ClientOnly>
                <div class="text-right mt-12" v-if="devInfo.name">
                  <p class="text-sm text-gray-500 mb-1">{{ devInfo.title }}</p>
                  <p class="text-xl font-bold text-gray-900">{{ devInfo.name }}</p>
                </div>
              </ClientOnly>
              <!-- googleon: index -->
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-50 py-12 border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <!-- Legal Disclaimer -->
          <div class="max-w-4xl mx-auto mb-12 text-left">
            <div class="bg-white rounded-lg p-6 text-[11px] text-gray-600 leading-relaxed border border-gray-100 shadow-sm">
              <h3 class="font-bold mb-2 text-gray-600">【本ご案内に関する注記・免責事項】</h3>
              <ul class="list-disc pl-4 space-y-1">
                <li><strong class="text-gray-700">絶対音感の習得について：</strong>「絶対音感」の定義や達成度には個人差があります。本サービスは、適切な時期（一般的に2歳〜6歳頃の臨界期）に継続的なトレーニングを行うことで習得をサポートするものですが、全ての方に絶対音感の習得を保証するものではありません。また、本アプリは相対音感のトレーニング用としては設計されておらず、あくまで6歳頃までのお子様を持つ保護者の方が、お子様に絶対音感を教えるための補助ツールとしての利用を想定しています。</li>
                <li><strong class="text-gray-700">比較情報について：</strong>本ページ内に掲載されている「ピアノ教室」「市販の教材」等との比較情報は、当社独自の調査（2026年1月時点）および一般的なサービス事例に基づくものです。全ての事業者・商品に当てはまるわけではありません。また、特定の団体・教室・教材等を指すものではなく、それらとの関係性は一切ありません。</li>
                <li><strong class="text-gray-700">科学的根拠について：</strong>「臨界期」「脳科学的アプローチ」等の記述は、一般的な発達心理学・脳科学の学説や理論（CIM等）に基づいています。特定の医学的効果を標榜するものではありません。</li>
                <li><strong class="text-gray-700">機能について：</strong>「演出モード（電車・車・猫など）」を含む一部の機能は、有料のPROプラン（月額1,980円〜）に含まれます。これらは14日間の無料トライアルですべてお試しいただけます。</li>
                <li><strong class="text-gray-700">音源について：</strong>Steinway Model Bの音源は, University of Iowa Electronic Music Studiosが公開しているMISデータベースの音源を使用しています。</li>
              </ul>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <NuxtLink to="/company" class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">運営会社</NuxtLink>
            <NuxtLink to="/terms" class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">利用規約</NuxtLink>
            <NuxtLink to="/privacy" class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">プライバシーポリシー</NuxtLink>
            <NuxtLink to="/legal" class="text-sm text-gray-600 hover:text-indigo-600 transition-colors">特定商取引法に基づく表記</NuxtLink>
          </div>
          <p class="text-xs text-gray-600 font-medium">&copy; 2026 Akatsuki Inc.</p>
        </div>
      </footer>
    </main>

    <!-- Sticky CTA Component -->
    <ClientOnly>
      <StickyCta />
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed beyond Tailwind */
.font-serif {
  font-family: 'Noto Serif JP', serif;
}

h1, h2, h3 {
  text-wrap: balance;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

p {
  text-wrap: pretty;
}

.inline-block {
  display: inline-block;
}

.animate-on-scroll {
  will-change: opacity, transform;
  backface-visibility: hidden;
}
</style>
