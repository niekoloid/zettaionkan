import Image from 'next/image'
import { CtaButton, Section, SectionHeading } from './ui'

const GIFTS = [
  {
    n: '01',
    img: '/images/lp/gift_language_simple_nanobanana.png',
    alt: '子どもの頭から色とりどりの文字と贈り物があふれるイラスト',
    title: '細かな音の違いを聞き分ける耳',
    body: '音と色を結びつける毎日の遊びは、音の小さな違いに気づく力を育てます。音楽だけでなく、ことばの聞き取りにも役立つ、一生ものの「耳」です。'
  },
  {
    n: '02',
    img: '/images/lp/gift_music_simple_nanobanana.png',
    alt: '楽器を楽しむ子どものイラスト',
    title: 'どんな楽器も「遊び」のように',
    body: '聴いたメロディをすぐ楽器で再現する「耳コピ」ができるように。ピアノ、ギター、吹奏楽。何を始めても「楽譜が読めなくて挫折する」最初の壁がありません。'
  },
  {
    n: '03',
    img: '/images/lp/gift_confidence.png',
    alt: '光る星を両手で持つ子どものイラスト',
    title: '「自分だけの力」という自信',
    body: '救急車のサイレンがドレミに聞こえる。そんな特別な感覚は、お子さまにとって「自分だけの力」になります。この自信が、勉強やスポーツなど、あらゆる挑戦を支えます。'
  }
]

export default function LpBenefits() {
  return (
    <Section id="benefits" tone="soft">
      <SectionHeading
        eyebrow="絶対音感がもたらすもの"
        tone="amber"
        title={<>お子さまの未来への、<br className="sm:hidden" />3つの贈り物</>}
        lead="脳が最も柔軟な幼児期に「音の基準」を作ることは、ドレミが分かるだけにとどまりません。"
      />

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {GIFTS.map(g => (
          <li key={g.n} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-amber-50/60">
              <Image src={g.img} alt={g.alt} fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <span className="text-xs font-black tracking-widest text-amber-600">GIFT {g.n}</span>
              <h3 className="mt-2 text-lg font-black text-gray-900">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{g.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-col items-center gap-6 rounded-3xl bg-gray-900 px-6 py-10 text-center text-white sm:px-10">
        <p className="text-lg sm:text-2xl font-black leading-snug">
          この贈り物をあげられるのは、<br className="sm:hidden" />聴覚が育つ6歳半ごろまで。
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-white/80">
          「いろおと」は、この時期を逃さないためのパスポートです。まずは無料で、お子さまが楽しんでくれるか試してみてください。
        </p>
        <CtaButton className="!bg-white !text-gray-900 hover:!bg-gray-100">無料で今すぐ始める</CtaButton>
      </div>
    </Section>
  )
}
