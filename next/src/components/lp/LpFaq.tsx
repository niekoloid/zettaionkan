import { Section, SectionHeading } from './ui'

const FAQ = [
  {
    q: '本当にスマホだけで絶対音感が身につくのでしょうか？',
    a: '絶対音感の習得に最も重要なのは「脳が柔軟な時期（6歳半ごろまで）に、どれだけ高い頻度で音の入力を繰り返すか」です。個人差はありますが、この時期に14種類の和音をしっかり覚えることで、習得できる可能性が高まります。「いろおと」は場所を選ばず、隙間時間に何度でも取り組めるので、1日1回のピアノ練習よりも高い頻度を実現できます。'
  },
  {
    q: 'どれくらいの頻度で練習すればよいですか？',
    a: '1日4回以上、和音を15〜30回ほど聞かせるのが理想です。1回の時間は短くて構いません。生活の中に「音を聞く時間」を細かく作ってあげることが近道です。「聞き流し」モードを使えば、BGM感覚で無理なく習慣にできます。'
  },
  {
    q: '2歳になったばかりですが、まだ早いでしょうか？',
    a: 'むしろ2〜4歳ごろが最も効果の高い時期の始まりです。「いろおと」には、画面を触るだけで音が鳴る「アイス」や「ねこ」モードなど、遊びの要素が詰まっています。ことばがまだ十分でないお子さまでも、色と音で直感的に楽しめます。'
  },
  {
    q: '大人でも効果はありますか？',
    a: '大人になってからの絶対音感の習得は、脳科学の観点から非常に難しいとされています（臨界期）。本アプリは、6歳ごろまでのお子さまを持つ保護者の方が、お子さまに絶対音感を教えるための補助ツールとして設計されています。相対音感のトレーニング用には設計されていません。'
  },
  {
    q: '家にピアノがなくても大丈夫ですか？',
    a: 'はい。「いろおと」は、スタジオで収録されたグランドピアノ（Yamaha C5 / Steinway Model B）のサンプリング音源を使っています。電子音ではなく、本物のピアノの倍音を含む響きで学べます。できれば、音の良いスピーカーで鳴らしてあげると、より効果的です。'
  },
  {
    q: '「アプリのインストール不要」とはどういうことですか？',
    a: 'App Store などで検索してダウンロードする手間がありません。このページをスマホの「ホーム画面に追加」するだけで、次からはアイコンをタップするだけで普通のアプリと同じように使えます。パソコン・タブレット・スマホのどれでも、ログインすれば同じ設定で使えます。'
  },
  {
    q: '途中でやめたくなったら、すぐに解約できますか？',
    a: 'はい。契約期間の縛りはなく、マイページからいつでも解約できます。有料プランは最初の14日間が無料なので、合わないと感じたら体験期間中に解約すれば料金はかかりません。'
  }
]

export default function LpFaq() {
  return (
    <Section id="faq" tone="white">
      <SectionHeading eyebrow="Q&A" title="よくあるご質問" />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white shadow-sm">
        {FAQ.map((item, i) => (
          <details key={item.q} className="group px-5 sm:px-6" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-black text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start gap-3">
                <span className="mt-0.5 text-sm font-black text-indigo-600">Q</span>
                <span className="text-sm sm:text-base">{item.q}</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="pb-6 pl-7 text-sm leading-relaxed text-gray-600">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
