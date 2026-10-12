import Link from 'next/link'
import { CtaButton, Section, SectionHeading, SIGNUP_HREF } from './ui'

const PLANS = [
  {
    name: 'Free',
    price: '¥0',
    per: '',
    tagline: 'まずは基本から',
    features: [{ ok: true, t: '白鍵の和音 9種類' }, { ok: true, t: '聞き流し（赤の和音）' }, { ok: true, t: '演出モード 2種類（ねこ・迫る電車）' }, { ok: false, t: '黒鍵の和音（全14種類）' }, { ok: false, t: 'Steinway Model B 音源' }],
    highlight: false
  },
  {
    name: 'Standard',
    price: '¥980',
    per: '/月',
    yearly: '年額 ¥9,800（2か月分おトク）',
    tagline: '基本をしっかり',
    features: [{ ok: true, t: '白鍵の和音 9種類' }, { ok: true, t: '黒鍵の和音（全14種類）' }, { ok: true, t: '聞き流し（全14和音・全モード）' }, { ok: true, t: 'すべての演出モード' }, { ok: false, t: 'Steinway Model B 音源' }],
    highlight: true
  },
  {
    name: 'Premium',
    price: '¥1,980',
    per: '/月',
    yearly: '年額 ¥15,000',
    tagline: '最高の音で',
    features: [{ ok: true, t: 'Standard のすべて' }, { ok: true, t: 'Steinway Model B 音源' }, { ok: true, t: '鍵盤の音・和音カスタマイズ' }],
    highlight: false
  }
]

export default function LpPricing() {
  return (
    <Section id="pricing" tone="soft">
      <SectionHeading
        eyebrow="料金"
        title={<>まずは無料で。<br className="sm:hidden" />気に入ったら月額980円から。</>}
        lead="有料プラン（Standard / Premium）をまとめて「PRO」と呼んでいます。どちらも14日間の無料体験つきで、体験中に解約すれば料金はかかりません。"
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PLANS.map(p => (
          <div key={p.name} className={`relative flex flex-col rounded-3xl p-6 ${p.highlight ? 'bg-gray-900 text-white shadow-xl ring-4 ring-indigo-200' : 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'}`}>
            {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-black text-white">人気</span>}
            <h3 className="text-lg font-black">{p.name}</h3>
            <p className={`text-xs font-bold ${p.highlight ? 'text-white/70' : 'text-gray-500'}`}>{p.tagline}</p>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight">{p.price}</span>
              <span className={`text-sm font-bold ${p.highlight ? 'text-white/70' : 'text-gray-500'}`}>{p.per}</span>
            </p>
            {'yearly' in p && p.yearly && <p className={`mt-1 text-xs font-bold ${p.highlight ? 'text-indigo-200' : 'text-indigo-700'}`}>{p.yearly}</p>}

            <ul className="mt-6 flex-grow space-y-2.5">
              {p.features.map(f => (
                <li key={f.t} className={`flex items-start gap-2 text-sm ${f.ok ? '' : p.highlight ? 'text-white/40' : 'text-gray-400'}`}>
                  {f.ok ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? 'text-indigo-300' : 'text-indigo-600'}`} aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                  )}
                  <span className="font-bold">{f.t}</span>
                </li>
              ))}
            </ul>

            <Link
              href={SIGNUP_HREF}
              className={`mt-6 flex h-12 items-center justify-center rounded-full text-sm font-bold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${p.highlight ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              {p.name === 'Free' ? '無料で始める' : '14日間無料で試す'}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
        決済は Stripe を通じて安全に行われます。契約期間の縛りはなく、マイページからいつでも解約できます。
      </p>
      <div className="mt-8 text-center">
        <CtaButton>今すぐ無料で始める</CtaButton>
      </div>
    </Section>
  )
}
