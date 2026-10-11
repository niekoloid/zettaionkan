import Image from 'next/image'
import { Section, SectionHeading } from './ui'

const PAINS = [
  { title: '楽器の前に座ってくれない', body: '「練習しよう」と声をかけても遊びに夢中。楽器の準備をするだけで、親の体力が削られていく。' },
  { title: 'レッスンに通う時間がない', body: '共働きで送迎の時間を作るのは至難の業。土日も家事や用事で潰れてしまい、継続して通えない。' },
  { title: 'つい叱ってしまって自己嫌悪', body: 'すぐ飽きる姿にイライラして「なんでできないの！」。寝顔を見て反省する毎日。' }
]

export default function LpPain() {
  return (
    <Section tone="white">
      <SectionHeading
        eyebrow="こんなお悩みありませんか"
        tone="rose"
        title={<>意気込んで始めたのに、<br />毎日の練習に<span className="whitespace-nowrap">疲れていませんか？</span></>}
      />

      <div className="mt-12 grid items-center gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-square overflow-hidden rounded-3xl">
          <Image src="/images/lp/pain.webp" alt="散らかったリビングで頭を抱える保護者" fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-sm font-bold text-white">
            「もう、やめたい…」理想と現実のギャップに悩む日々
          </p>
        </div>

        <ul className="space-y-4">
          {PAINS.map((p, i) => (
            <li key={p.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-600">{i + 1}</span>
              <div>
                <h3 className="font-black text-gray-900">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
