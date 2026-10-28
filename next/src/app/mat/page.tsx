import type { Metadata } from 'next'
import Link from 'next/link'
import { CHORDS } from '@/lib/chords'
import PrintButton from './PrintButton'

export const metadata: Metadata = {
  title: '印刷用の いろマット',
  description: 'いろおとで使う14色の丸。印刷して切り取り、床や机に並べて、聞こえた和音の色にタッチします。'
}

export default function MatPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <div className="no-print">
        <Link href="/today" className="text-sm text-gray-400">
          ← もどる
        </Link>
        <h1 className="mt-4 text-2xl font-black">印刷用の いろマット</h1>
        <p className="mt-2 text-sm text-gray-600">
          カラー印刷して丸を切り取り、床や机に並べてください。並べるのは今練習している色だけです。お子さんは、聞こえた和音の色にタッチします。折り紙やおもちゃなど、同じ色のものでもかまいません。
        </p>
        <PrintButton />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 print:mt-0 print:gap-3">
        {CHORDS.map(c => (
          <div key={c.id} className="flex flex-col items-center print:break-inside-avoid">
            <div
              className="flex aspect-square w-full flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300"
              style={{ background: c.color, color: c.ink, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
            >
              <span className="text-2xl font-black">{c.kana}</span>
              <span className="mt-1 text-xs opacity-70">{c.notes}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
