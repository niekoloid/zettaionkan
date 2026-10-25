import { Section, SectionHeading } from './ui'

const ROWS = [
  { label: '準備', irooto: 'スマホひとつ', school: '楽器・楽譜一式', kit: '多量のカード類' },
  { label: '場所', irooto: 'どこでもOK', school: '教室（要送迎）', kit: '楽器の前（固定）' },
  { label: '親の負担', irooto: 'BGM再生でOK', school: '送迎と連絡', kit: 'つきっきり指導' },
  { label: '子どもの反応', irooto: '演出で夢中', school: '緊張感がある', kit: '飽きやすい' },
  { label: '記録', irooto: '自動で集計', school: '先生の評価のみ', kit: '親の手書きメモ' },
  { label: 'コスト', irooto: '月額980円〜', school: '月額 約1万円〜', kit: '高額な教材費' }
]

const COLS = [
  { key: 'irooto', label: 'いろおと', highlight: true },
  { key: 'school', label: 'ピアノ教室', highlight: false },
  { key: 'kit', label: '市販の教材', highlight: false }
] as const

export default function LpComparison() {
  return (
    <Section id="comparison" tone="white">
      <SectionHeading eyebrow="比較" title={<>忙しいパパ・ママに<br className="sm:hidden" />選ばれる理由</>} />

      {/* Mobile: one card per row */}
      <ul className="mt-10 space-y-3 md:hidden">
        {ROWS.map(r => (
          <li key={r.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black tracking-wider text-gray-500">{r.label}</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              {COLS.map(c => (
                <div key={c.key} className={`rounded-xl p-2 ${c.highlight ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700'}`}>
                  <dt className={`text-[10px] font-bold ${c.highlight ? 'text-white/80' : 'text-gray-400'}`}>{c.label}</dt>
                  <dd className="mt-0.5 font-bold leading-snug">{r[c.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="mt-10 hidden overflow-hidden rounded-3xl border border-gray-100 shadow-sm md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="w-32 p-4 text-left text-xs font-black tracking-wider text-gray-500">比較項目</th>
              {COLS.map(c => (
                <th key={c.key} scope="col" className={`p-4 text-base font-black ${c.highlight ? 'bg-indigo-600 text-white' : 'text-gray-800'}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r.label} className="border-t border-gray-100">
                <th scope="row" className="p-4 text-left font-bold text-gray-600">{r.label}</th>
                {COLS.map(c => (
                  <td key={c.key} className={`p-4 text-center font-bold ${c.highlight ? 'bg-indigo-50 text-indigo-900' : 'text-gray-700'}`}>{r[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-[11px] text-gray-400">※ ピアノ教室・市販教材との比較は当社調べ（2026年1月時点）の一般的な例です。</p>
    </Section>
  )
}
