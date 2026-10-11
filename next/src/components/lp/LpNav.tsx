import Link from 'next/link'
import Image from 'next/image'
import { CtaButton } from './ui'

const LINKS = [
  { href: '#solution', label: '特徴' },
  { href: '#method', label: '仕組み' },
  { href: '#benefits', label: 'メリット' },
  { href: '#pricing', label: '料金' },
  { href: '#faq', label: 'Q&A' }
]

export default function LpNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/lp" aria-label="いろおと トップ" className="flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          <Image src="/logo_irooto_only_name.webp" alt="いろおと" width={120} height={32} className="h-7 w-auto" priority />
        </Link>

        <nav aria-label="ページ内リンク" className="hidden md:flex items-center gap-7">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">{l.label}</a>
          ))}
        </nav>

        <CtaButton size="md">無料で始める</CtaButton>
      </div>
    </header>
  )
}
