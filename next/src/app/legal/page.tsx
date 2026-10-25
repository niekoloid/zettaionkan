import type { Metadata } from 'next'
import Link from 'next/link'
import Doc from '@/components/Doc'

export const metadata: Metadata = { title: '特定商取引法に基づく表記', robots: { index: false } }

const ROWS: [string, React.ReactNode][] = [
  ['販売業者', '株式会社暁'],
  ['運営責任者', '司空 舜'],
  ['所在地', '長野県長野市大字鶴賀緑町1418番地'],
  ['お問い合わせ先', <><Link href="/contact" className="underline">お問い合わせフォーム</Link>よりご連絡ください。</>],
  ['販売価格', '料金プランのページに表示した価格（消費税込み）です。'],
  ['商品代金以外に必要な料金', 'インターネット接続料金、通信料金等はお客様の負担となります。'],
  ['お支払い方法', 'クレジットカード（Stripe決済）'],
  ['代金の支払い時期', 'お申し込みから14日間は無料期間です。無料期間の終了後、選択した期間（1か月または1年）分の料金を前払いで決済し、解約しない限り同じ期間ごとに自動更新します。'],
  ['サービスの提供時期', 'お申し込み後、ただちにご利用いただけます。'],
  ['返品・キャンセル', 'デジタルコンテンツの性質上、購入確定後の返品・キャンセルはお受けできません。解約は次回更新日の前日までに設定画面のプランから手続きでき、解約後も有効期間内はご利用いただけます。']
]

export default function LegalPage() {
  return (
    <Doc title="特定商取引法に基づく表記">
      <dl className="divide-y divide-gray-100">
        {ROWS.map(([k, v]) => (
          <div key={k} className="py-3">
            <dt className="text-xs text-gray-400">{k}</dt>
            <dd className="mt-0.5 font-bold text-gray-800">{v}</dd>
          </div>
        ))}
      </dl>
    </Doc>
  )
}
