import Image from 'next/image'
import type { ReactNode } from 'react'
import { Eyebrow, Section, SectionHeading } from './ui'

/** Decorative keyboard for the sound-quality feature (no third-party logos) */
function MiniKeyboard() {
  const whites = 10
  const hasBlack = [true, true, false, true, true, true, false, true, true, false]
  const colors = ['#EF4444', '#FFD700', '#0000FF', '#16a34a', '#F97316', '#9333ea', '#fbcfe8', '#713F12', '#84cc16', '#7FDBFF']
  return (
    <div className="relative mx-auto flex h-40 w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-inner" aria-hidden="true">
      {Array.from({ length: whites }).map((_, i) => (
        <div key={i} className="relative flex-1 rounded-b-sm border-x-[0.5px] border-gray-200 bg-white">
          <span className="absolute inset-x-1 bottom-1 h-2 rounded-full opacity-80" style={{ backgroundColor: colors[i] }} />
        </div>
      ))}
      <div className="absolute inset-x-1 top-1 flex h-24">
        {hasBlack.map((b, i) => (
          <div key={i} className="relative flex-1">
            {b && <div className="absolute right-0 h-full w-3/5 translate-x-1/2 rounded-b-sm bg-gray-800" />}
          </div>
        ))}
      </div>
    </div>
  )
}

type Feature = { id: string; eyebrow: string; tone: 'indigo' | 'amber' | 'emerald'; title: ReactNode; body: ReactNode; tags: string[]; visual: ReactNode }

const FEATURES: Feature[] = [
  {
    id: 'visual',
    eyebrow: '楽しさ',
    tone: 'amber',
    title: <>キャラクターが音と一緒に動く。<br className="hidden sm:block" />だから、飽きない。</>,
    body: '電車、車、ねこ。キャラクターが音と一緒に動き出すので、集中が途切れません。正解するとかわいく反応するから、飽きっぽいお子さまでもゲーム感覚で続けられます。',
    tags: ['電車・車・ねこ・アイス', '正解でキャラが反応'],
    visual: (
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-amber-50">
        <Image src="/images/lp/feature_visual_nanobanana_v2.png" alt="ヘッドホンでタブレットを楽しむ子どもと、音と一緒に走る電車とねこ" fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
      </div>
    )
  },
  {
    id: 'autoplay',
    eyebrow: '手軽さ',
    tone: 'indigo',
    title: <>BGMとして流すだけ。<br className="hidden sm:block" />付きっきりは要りません。</>,
    body: '「聞き流し」モードは、家事の合間や移動中に流しておくだけ。無理に聴かせなくても、「なんとなく聴こえている」時間が毎日あることが、音と色を結びつける近道です。',
    tags: ['聞き流しモード', '1回1分からOK'],
    visual: (
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-indigo-50">
        <Image src="/images/lp/feature_autoplay_cropped.png" alt="机の上のスマホから音が流れ、そばで子どもが遊ぶ部屋" fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
      </div>
    )
  },
  {
    id: 'sound',
    eyebrow: '本物の音',
    tone: 'emerald',
    title: <>電子音ではなく、<br className="hidden sm:block" />グランドピアノの録音で。</>,
    body: '音を最も吸収する時期だからこそ、音質に妥協しません。スタジオで収録されたグランドピアノ2機種（Yamaha C5 / Steinway Model B）のサンプリング音源を使い、豊かな倍音を含む本物の響きで耳を育てます。',
    tags: ['Yamaha C5', 'Steinway Model B'],
    visual: (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-emerald-50 p-6">
        <MiniKeyboard />
      </div>
    )
  }
]

export default function LpFeatures() {
  return (
    <Section id="solution" tone="soft">
      <SectionHeading
        eyebrow="いろおとの特徴"
        title={<>「練習」を、<br className="sm:hidden" />子どもが夢中になる<span className="whitespace-nowrap">「遊び」に。</span></>}
        lead="親ががんばらなくても続く。そのために、3つのことにこだわりました。"
      />

      <div className="mt-14 space-y-16">
        {FEATURES.map((f, i) => (
          <div key={f.id} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className={i % 2 === 1 ? 'md:order-2' : ''}>{f.visual}</div>
            <div>
              <Eyebrow tone={f.tone}>{f.eyebrow}</Eyebrow>
              <h3 className="mt-3 text-xl sm:text-2xl font-black leading-snug text-gray-900">{f.title}</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600">{f.body}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {f.tags.map(t => (
                  <li key={t} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 ring-1 ring-black/5">{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
