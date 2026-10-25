'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const NAV = [
  { href: '/today', label: 'きょう', icon: 'M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { href: '/record', label: 'きろく', icon: 'M5 20V10m7 10V4m7 16v-7' },
  { href: '/listen', label: 'きく', icon: 'M9 18V6l11-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/settings', label: 'せってい', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2-1.2L14.5 3h-5l-.4 2.6a7.6 7.6 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 002 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z' }
]

/** Page frame for the app screens: title bar and a bottom tab bar */
export default function Shell({ title, children, back }: { title?: string; children: ReactNode; back?: string }) {
  const path = usePathname()
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center gap-2 px-4 pb-2 pt-4">
        {back ? (
          <Link href={back} className="-ml-2 rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="もどる">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <Link href="/" aria-label="いろおと トップ">
            <img src="/logo_irooto_only_name.webp" alt="いろおと" className="h-7 w-auto" />
          </Link>
        )}
        {title && <h1 className="text-lg font-black">{title}</h1>}
      </header>
      <main className="flex-1 px-4 pb-28">{children}</main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 backdrop-blur">
        <ul className="mx-auto flex max-w-md justify-around pb-[env(safe-area-inset-bottom)]">
          {NAV.map(n => {
            const active = path === n.href
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`flex flex-col items-center px-4 py-2 text-[11px] font-bold ${active ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <svg className="mb-0.5 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
                  </svg>
                  {n.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
