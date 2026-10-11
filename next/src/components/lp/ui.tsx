import Link from 'next/link'
import type { ReactNode } from 'react'

export const SIGNUP_HREF = '/auth?mode=signup'

/** Primary call to action. Same look everywhere so the page reads as one system. */
export function CtaButton({ children = '無料で始める', className = '', size = 'lg' }: { children?: ReactNode; className?: string; size?: 'md' | 'lg' }) {
  return (
    <Link
      href={SIGNUP_HREF}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 font-bold text-white shadow-lg shadow-gray-900/15 transition-all hover:bg-gray-700 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${size === 'lg' ? 'h-14 px-8 text-base' : 'h-11 px-5 text-sm'} ${className}`}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </Link>
  )
}

/** Small coloured label above a section heading */
export function Eyebrow({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'amber' | 'rose' | 'emerald' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700'
  }
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider ${tones[tone]}`}>{children}</span>
}

export function SectionHeading({ eyebrow, tone, title, lead, align = 'center' }: { eyebrow?: ReactNode; tone?: 'indigo' | 'amber' | 'rose' | 'emerald'; title: ReactNode; lead?: ReactNode; align?: 'center' | 'left' }) {
  return (
    <div className={`${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-2xl`}>
      {eyebrow && <div className="mb-3"><Eyebrow tone={tone}>{eyebrow}</Eyebrow></div>}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-gray-900">{title}</h2>
      {lead && <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600">{lead}</p>}
    </div>
  )
}

export function Section({ id, children, className = '', tone = 'white' }: { id?: string; children: ReactNode; className?: string; tone?: 'white' | 'soft' | 'dark' }) {
  const bg = tone === 'soft' ? 'bg-[#FBF8F2]' : tone === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
  return (
    <section id={id} className={`${bg} scroll-mt-16 ${className}`}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">{children}</div>
    </section>
  )
}
