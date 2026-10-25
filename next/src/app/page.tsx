import Link from 'next/link'
import Flag from '@/components/Flag'
import Footer from '@/components/Footer'
import { CHORDS } from '@/lib/chords'
import { PLANS, yen } from '@/lib/plans'

const STEPS = [
  { title: '和音が鳴る', body: 'アプリがピアノの和音を鳴らします。ピアノがなくても大丈夫です。' },
  { title: '旗をあげる', body: 'お子さんは、その和音の色の旗をあげます。画面は見ません。' },
  { title: '○か×を押す', body: 'おうちの方は、画面の「こたえ」と旗を見くらべて押すだけ。' }
]

const APP_DOES = [
  ['出題', '新しい和音や、まちがえやすい和音を多めに自動で出します'],
  ['記録', '○×から、和音ごとの正解率と毎日の回数を自動で記録します'],
  ['進み方', 'よくできたら「次の色に進めます」と知らせます'],
  ['声かけ', '正解は「そう！あか！」とほめ、まちがいは叱らずに正しい色を聞かせます'],
  ['時刻', '1日4回の時刻を、通知つきでカレンダーに登録できます']
]

const FAQ = [
  ['何歳から使えますか？', '2〜6歳ごろが目安です。旗をあげる遊びができれば始められます。3歳前後から始めるご家庭が多い想定です。'],
  ['1日4回できない日は？', '1回でもできたら、その日は「たっせい」です。続けることをいちばん大切にしています。'],
  ['旗はどうすればいいですか？', '折り紙やハンカチなど、その色のものなら何でもかまいません。印刷して使える旗のページもあります。'],
  ['ピアノは必要ですか？', 'いりません。アプリがグランドピアノの録音で和音を鳴らします。']
]

export default function Home() {
  const free = PLANS[0]!
  const paid = PLANS.slice(1)
  return (
    <div className="mx-auto max-w-3xl px-5">
      <header className="flex items-center justify-between py-5">
        <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-8 w-auto" />
        <Link href="/today" className="btn-ghost px-4 py-2 text-sm">
          アプリをひらく
        </Link>
      </header>

      <section className="pb-12 pt-8 text-center">
        <div className="mb-6 flex justify-center gap-1">
          {CHORDS.slice(0, 5).map(c => (
            <Flag key={c.id} chord={c} size={48} label={false} />
          ))}
        </div>
        <h1 className="text-3xl font-black leading-tight sm:text-5xl">
          1回30秒、1日4回。
          <br />
          和音を聞いて、旗をあげるだけ。
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-gray-600">
          いろおとは、3歳から毎日続けられる親子の絶対音感トレーニングです。おうちの方はボタンを押すだけ。出題も記録も、次に進むタイミングも、アプリが引き受けます。
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/today" className="btn-primary w-full px-8 py-4 text-lg sm:w-auto">
            無料ではじめる
          </Link>
          <Link href="/plans" className="text-sm font-bold text-gray-500 underline">
            料金プランを見る
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-400">登録なしで、3つの和音まで無料</p>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-black">1回のレッスン</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white">{i + 1}</span>
              <h3 className="mt-3 font-black">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-sm text-gray-500">10〜20問、30秒〜1分で終わります。あきる前に終わるのがコツです。</p>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-black">あかから はじめて、1つずつ</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600">
          最初は「あか（ドミソ）」だけ。できるようになったら次の色を1つ足します。白鍵の9和音のあと、黒鍵をふくむ5和音へ進みます。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CHORDS.map(c => (
            <Flag key={c.id} chord={c} size={40} />
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-black">おうちの方の手間を、アプリが引き受けます</h2>
        <dl className="card mt-6 divide-y divide-gray-100 p-0">
          {APP_DOES.map(([k, v]) => (
            <div key={k} className="flex gap-4 px-5 py-4">
              <dt className="w-16 shrink-0 font-black">{k}</dt>
              <dd className="text-sm text-gray-600">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-black">料金</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card">
            <h3 className="font-black">{free.name}</h3>
            <p className="mt-1 text-2xl font-black">0円</p>
            <p className="mt-2 text-sm text-gray-600">{free.points[0]}</p>
          </div>
          {paid.map(p => (
            <div key={p.tier} className="card">
              <h3 className="font-black">{p.name}</h3>
              <p className="mt-1 text-2xl font-black">
                {yen(p.monthly)}
                <span className="text-sm font-normal text-gray-500"> / 月</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">{p.points[0]}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">有料プランは14日間無料。年払いもあります。</p>
      </section>

      <section className="py-10">
        <h2 className="text-center text-2xl font-black">よくある質問</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card">
              <summary className="cursor-pointer font-bold">{q}</summary>
              <p className="mt-2 text-sm text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-12 text-center">
        <Link href="/today" className="btn-primary px-8 py-4 text-lg">
          きょうから はじめる
        </Link>
        <p className="mx-auto mt-6 max-w-xl text-xs text-gray-400">
          音感の身につき方には個人差があり、本サービスは特定の成果を保証するものではありません。
        </p>
      </section>

      <Footer />
    </div>
  )
}
