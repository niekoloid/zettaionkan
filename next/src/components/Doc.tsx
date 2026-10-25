import Link from 'next/link'
import type { ReactNode } from 'react'
import Footer from './Footer'

/** Frame for text pages (terms, privacy, ...) */
export default function Doc({ title, children, updated }: { title: string; children: ReactNode; updated?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-5">
      <header className="flex items-center justify-between py-5">
        <Link href="/">
          <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-7 w-auto" />
        </Link>
        <Link href="/today" className="text-sm font-bold text-gray-500">
          アプリへ
        </Link>
      </header>
      <article className="card space-y-6 p-6 text-sm leading-relaxed text-gray-700 sm:p-8">
        <h1 className="text-xl font-black text-gray-900">{title}</h1>
        {children}
        {updated && <p className="border-t border-gray-100 pt-4 text-right text-xs text-gray-400">最終更新日：{updated}</p>}
      </article>
      <Footer />
    </div>
  )
}
