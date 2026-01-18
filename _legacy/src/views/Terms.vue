<script setup>
import { onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'

onMounted(() => {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex'
  document.head.appendChild(meta)
})
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP']">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">
    <!-- Header -->
    <AppHeader showBack />

    <main class="flex-grow px-6 pb-20 overflow-y-auto">
        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div class="text-center mb-10">
            <h1 class="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Terms of Service</h1>
            <h2 class="text-xl font-bold text-gray-900 mb-2">利用規約</h2>
          </div>

          <div class="space-y-8">
            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第1条（適用）
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                本規約は、株式会社暁（以下「当社」）が提供する本アプリ「いろおと」（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するユーザーは、本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第2条（アカウント管理）
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                ユーザーは、自己の責任において本サービスのアカウントを管理するものとします。アカウントの不正利用等により生じた損害について、当社は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第3条（有料サービス）
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                1. ユーザーは、当社の定める料金を支払うことで、プレミアム機能を利用することができます。<br>
                2. 決済は外部サービス（Stripe）を通じて行われます。支払済みの料金については、法令に定める場合を除き、返金いたしません。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第4条（禁止事項）
              </h3>
              <ul class="text-xs text-gray-600 mt-2 list-disc pl-5 space-y-1">
                <li>法令または公序良俗に反する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他のユーザーに対する迷惑行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第5条（免責事項）
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                1. 当社は、本サービスの内容変更、中断、終了によって生じた損害について、一切の責任を負いません。<br>
                2. 本サービスによる音感向上等の効果を保証するものではありません。
              </p>
            </section>

            <section>
              <h3 class="font-bold text-gray-800 text-sm mb-2 flex items-center">
                <span class="bg-indigo-500 w-1 h-4 rounded-full mr-2"></span>
                第6条（規約の変更）
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                当社は、ユーザーへの通知なく本規約を変更できるものとします。変更後の規約は、本サービス上に表示された時点から効力を生じるものとします。
              </p>
            </section>

            <div class="pt-8 text-right border-t border-gray-100">
              <p class="text-[10px] text-gray-400">
                最終更新日：2026年1月7日
              </p>
            </div>
          </div>
        </div>
    </main>

    <footer class="text-center text-gray-300 text-[10px] pb-8 shrink-0">
      &copy; 2026 Akatsuki Inc.
    </footer>
    </div>
  </div>
</template>
