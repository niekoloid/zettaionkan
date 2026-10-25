import type { Metadata } from 'next'
import Link from 'next/link'
import { CHORDS } from '@/lib/chords'
import PrintButton from './PrintButton'

export const metadata: Metadata = {
  title: '印刷用の旗',
  description: 'いろおとで使う14色の旗。印刷して切り取り、ストローや割りばしに貼って使えます。'
}

export default function FlagsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <div className="no-print">
        <Link href="/today" className="text-sm text-gray-400">
          ← もどる
        </Link>
        <h1 className="mt-4 text-2xl font-black">印刷用の旗</h1>
        <p className="mt-2 text-sm text-gray-600">
          カラー印刷して点線で切り、ストローや割りばしに貼ってください。使うのは今練習している色だけです。折り紙やハンカチなど、同じ色のものでもかまいません。
        </p>
        <PrintButton />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 print:mt-0 print:gap-3">
        {CHORDS.map(c => (
          <div
            key={c.id}
            className="flex aspect-[3/2] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 print:break-inside-avoid"
            style={{ background: c.color, color: c.ink, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          >
            <span className="text-3xl font-black">{c.kana}</span>
            <span className="mt-1 text-xs opacity-70">{c.notes}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
