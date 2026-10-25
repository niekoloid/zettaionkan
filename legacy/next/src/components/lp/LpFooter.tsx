import Link from 'next/link'
import Image from 'next/image'

const NOTES = [
  { h: '絶対音感の習得について', p: '「絶対音感」の定義や達成度には個人差があります。本サービスは、適切な時期（一般的に2歳〜6歳ごろの臨界期）に継続的なトレーニングを行うことで習得をサポートするものですが、すべての方に絶対音感の習得を保証するものではありません。また、本アプリは相対音感のトレーニング用としては設計されておらず、6歳ごろまでのお子さまを持つ保護者の方が、お子さまに絶対音感を教えるための補助ツールとしての利用を想定しています。' },
  { h: '比較情報について', p: '本ページ内に掲載されている「ピアノ教室」「市販の教材」等との比較情報は、当社独自の調査（2026年1月時点）および一般的なサービス事例に基づくものです。すべての事業者・商品に当てはまるわけではありません。また、特定の団体・教室・教材等を指すものではなく、それらとの関係性は一切ありません。' },
  { h: '科学的根拠について', p: '「臨界期」「脳科学的アプローチ」等の記述は、一般的な発達心理学・脳科学の学説や理論に基づいています。特定の医学的効果を標榜するものではありません。' },
  { h: '機能について', p: '「演出モード（電車・車・ねこなど）」を含む一部の機能は、有料プラン（月額980円〜）に含まれます。これらは14日間の無料体験ですべてお試しいただけます。' },
  { h: '音源について', p: 'Steinway Model B の音源は、University of Iowa Electronic Music Studios が公開している MIS データベースの音源を使用しています。Yamaha C5 の音源は Salamander Grand Piano を使用しています。各社の商標は各社に帰属し、本サービスは各社と提携・公認関係にはありません。' }
]

const LEGAL = [
  { to: '/company', label: '運営会社' },
  { to: '/terms', label: '利用規約' },
  { to: '/privacy', label: 'プライバシーポリシー' },
  { to: '/legal', label: '特定商取引法に基づく表記' },
  { to: '/contact', label: 'お問い合わせ' }
]

export default function LpFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <details className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-xs text-gray-600">
          <summary className="cursor-pointer font-bold text-gray-700">本ご案内に関する注記・免責事項</summary>
          <dl className="mt-4 space-y-4">
            {NOTES.map(n => (
              <div key={n.h}>
                <dt className="font-bold text-gray-800">{n.h}</dt>
                <dd className="mt-1 leading-relaxed">{n.p}</dd>
              </div>
            ))}
          </dl>
        </details>

        <div className="mt-10 flex flex-col gap-6 border-t border-gray-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Image src="/logo_irooto_only_name.webp" alt="いろおと" width={120} height={32} className="h-7 w-auto" />
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map(l => (
              <li key={l.to}><Link href={l.to} className="text-xs text-gray-500 hover:text-gray-800">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-xs text-gray-400">&copy; 2026 Akatsuki Inc.</p>
      </div>
    </footer>
  )
}
