import Image from 'next/image'
import { CtaButton } from './ui'

const TRUST = ['14日間の無料体験', '契約の縛りなし', 'アプリのインストール不要']

export default function LpHero() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F2]">
      {/* Soft colour wash: the 14 chord colours, blurred into the background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" />
        <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-24 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-black/5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            2〜6歳のお子さまと保護者のために
          </p>
          <h1 className="text-[2rem] leading-[1.2] sm:text-5xl font-black text-gray-900">
            絶対音感を、<br />
            <span className="text-indigo-600">色</span>でおぼえる。
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">
            14種類の和音を14の色と結びつけて、遊びながら耳を育てる絶対音感トレーニング。
            本物のグランドピアノの音を、スマホひとつで。
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <CtaButton>今すぐ無料で始める</CtaButton>
            <a href="#method" className="text-sm font-bold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline">仕組みを見る</a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {TRUST.map(t => (
              <li key={t} className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual: real photo + real app screen */}
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
            <Image
              src="/images/lp/hero.webp"
              alt="スマホの画面を一緒に見て笑う親子"
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -right-2 w-[38%] sm:-right-4 rotate-3 overflow-hidden rounded-[1.4rem] border-[5px] border-gray-900 bg-white shadow-2xl">
            <Image
              src="/images/lp/screen_home_mobile.jpg"
              alt="いろおとのホーム画面。14色の和音ボタンと鍵盤"
              width={750}
              height={1624}
              sizes="(min-width: 768px) 190px, 40vw"
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
