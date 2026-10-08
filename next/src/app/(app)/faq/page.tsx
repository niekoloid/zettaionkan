import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { vfor } from '@/lib/vue-compat'

export default function FaqPage() {
  const faqs = [
    {
      q: '本当にスマホだけで絶対音感が身につくのでしょうか？',
      a: 'はい、可能です。絶対音感の習得に最も重要なのは「音と色の結びつきを、脳が柔軟な時期（6歳半頃まで）に、いかに高頻度で入力するか」です。「いろおと」は、場所を選ばず隙間時間に何度でも音に触れられるため、1日1回のピアノ練習よりも圧倒的に入力回数を増やすことができます。'
    },
    {
      q: '大人でも効果はありますか？',
      a: '残念ながら、脳科学の観点から大人になってからの絶対音感習得は「不可能」とされています（臨界期仮説）。6歳頃までに脳の神経回路を形成する必要があるためです。大人の方は、相対音感のトレーニングとしてご活用ください。'
    },
    {
      q: '家にあるピアノを使わなくても大丈夫ですか？',
      a: '大丈夫です。「いろおと」には、世界最高峰のコンサートグランドピアノ（YamahaやSteinway）の音源を収録しています。まずはスマホで正確な「音の基準」を作り、耳を育てることが先決です。もちろん、週末などは実際のピアノに触れることで、お子様の興味はさらに広がります。'
    },
    {
      q: '「アプリのインストール不要」とはどういうことですか？',
      a: '通常のアプリのように、App Storeなどで検索してダウンロードする手間がありません。今見ているこのページを、スマホの「ホーム画面に追加」するだけで、次からはアイコンをタップするだけで普通のアプリと同じように使えます。スマホの容量もほとんど使いません。'
    },
    {
      q: '2歳になったばかりですが、まだ早いでしょうか？',
      a: 'むしろ、2歳から4歳頃が最も効果が高い「黄金期」の始まりです。「いろおと」には、画面を触るだけで音が鳴る「アイス」や「ねこ」モードなど、遊びの要素が詰まっています。言葉がまだ十分でないお子様でも、色と音で直感的に楽しむことができます。'
    },

    {
      q: '途中でやめたくなったら、すぐに解約できますか？',
      a: 'もちろん可能です。契約期間の縛りは一切ありません。管理画面からいつでもご自身で解約の手続きが行えますので、まずはお子様が楽しんでくれるかどうか、安心してお試しください。'
    }
  ]

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP']"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden">{/* Header */}<AppHeader showBack /><main className="flex-grow px-6 pb-20 overflow-y-auto"><div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm"><div className="text-center mb-10"><h1 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Questions & Answers</h1><h2 className="text-xl font-bold text-gray-900 mb-2">よくあるご質問</h2><p className="text-[10px] text-gray-400 font-bold">サービスについて困ったときはご確認ください</p></div><div className="space-y-6">{vfor(faqs, (faq, index) => (<div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"><div className="flex items-start space-x-4"><div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><span className="text-indigo-600 font-black text-sm">Q</span></div><div><h3 className="font-bold text-gray-900 text-sm mb-3 pt-1.5 leading-relaxed">{faq.q}</h3><div className="flex items-start space-x-4"><div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0"><span className="text-amber-600 font-black text-sm">A</span></div><p className="text-xs text-gray-600 leading-relaxed pt-1.5">{faq.a}</p></div></div></div></div>))}</div><div className="mt-12 p-6 bg-indigo-900 rounded-2xl text-center"><p className="text-xs text-indigo-200 mb-4 font-bold">解決しない場合はお問い合わせください</p><Link className="inline-block px-8 py-3 bg-white text-indigo-900 font-black rounded-full text-xs hover:bg-indigo-50 transition-colors" href="/contact">お問い合わせフォーム</Link></div><div className="pt-8 text-right border-t border-gray-100 mt-8"><p className="text-[10px] text-gray-400">最終更新日：2026年1月25日</p></div></div></main><footer className="text-center text-gray-300 text-[10px] pb-8 shrink-0">&copy; 2026 Akatsuki Inc.</footer></div></div>
  )
}
