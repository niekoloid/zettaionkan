import { ChordDefinitions } from '@/constants/chords'
import { isLightColor } from '@/lib/chords'
import { Section, SectionHeading } from './ui'

const STEPS = [
  { n: '1', title: '色で音を具体化する', body: '目に見えない「音」を幼児が覚えるのは大変。でも「色」はもう分かります。音と色をセットで入力することで、音が「色のついた記憶」として定着します。' },
  { n: '2', title: '響きを丸ごと覚える', body: '子どもは細かいパーツより、全体の雰囲気を先につかむのが得意。お母さんの顔を「全体」で覚えるように、14種類の和音の響きを14色として覚えます。' },
  { n: '3', title: '和音から単音へ', body: '14色が定着すると、脳の中で和音がほどけて「ド」「ミ」「ソ」が別々に聴こえてきます。ここまで来れば、どんな曲でも音の名前が分かるようになります。' }
]

export default function LpMethod() {
  const chords = Object.values(ChordDefinitions).filter(c => c.scoreImage).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return (
    <Section id="method" tone="white">
      <SectionHeading
        eyebrow="仕組み"
        title={<>やることはひとつ。<br />14種類の和音を、14の色でおぼえる。</>}
        lead="白鍵の和音9種類と黒鍵の和音5種類。1オクターブの13音すべてが含まれるように組み合わせた14の和音を、それぞれの色と結びつけます。特別な才能は要りません。"
      />

      {/* 14 colour chips, built from the same chord data the app uses */}
      <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-4 gap-3 sm:grid-cols-7 sm:gap-4" aria-label="14種類の和音と色">
        {chords.map(c => {
          const light = isLightColor(c.color)
          return (
            <li key={c.id} className="flex flex-col items-center gap-2 text-center">
              <span
                className="flex aspect-square w-full max-w-[72px] items-center justify-center rounded-full text-lg font-black shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: c.color, color: light ? 'rgba(0,0,0,0.75)' : '#fff' }}
              >
                {c.sortOrder}
              </span>
              <span className="text-[11px] font-bold leading-tight text-gray-800">{c.nameIt}</span>
              <span className="-mt-1 text-[10px] text-gray-500">{c.colorName}</span>
            </li>
          )
        })}
      </ul>

      <div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-[#FBF8F2] p-6 sm:p-10">
        <h3 className="text-lg sm:text-xl font-black text-gray-900">なぜ「和音」で<br className="sm:hidden" />絶対音感が身につくのか</h3>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
          「ド」「レ」といった単音は、子どもの脳にとって細すぎて記憶に残りにくい一方、複数の音が重なる和音は響きが豊かで、強い印象を残します。
          14種類の和音それぞれの響きを覚えることで脳内に音の基準ができ、やがて一音ずつの違いも聞き分けられるようになります。
          ことばを覚えるのと同じ仕組みで、一生ものの音の記憶を作る方法です。
        </p>
      </div>

      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map(s => (
          <li key={s.n} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-base font-black text-white">{s.n}</span>
            <h3 className="mt-4 font-black text-gray-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
