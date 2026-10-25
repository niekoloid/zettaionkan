'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/app-context'
import { useAudio } from '@/lib/audio'
import StreakCounter from '@/components/common/StreakCounter'

const INSTRUMENT_NAMES: Record<string, string> = {
  yamaha: 'Yamaha C5',
  steinway: 'Steinway B'
}

interface Props {
  showBack?: boolean
  backTo?: string
  transparent?: boolean
  /** Stick to the top with a frosted background while the page scrolls */
  sticky?: boolean
  onBack?: (e: React.MouseEvent) => void
}

export default function AppHeader({ showBack = false, backTo = '/', transparent = false, sticky = false, onBack }: Props) {
  const { user, userTier } = useAuth()
  const { selectedInstrument } = useAudio()

  const avatarTone =
    userTier === 'free' ? 'bg-white text-gray-500 border-gray-200'
      : userTier === 'entry' ? 'bg-blue-50 text-blue-600 border-blue-200'
        : 'bg-amber-50 text-amber-600 border-amber-300'

  const surface = sticky
    ? 'sticky top-0 bg-white/80 backdrop-blur-md border-b border-black/5 supports-[backdrop-filter]:bg-white/70'
    : transparent ? '' : 'bg-white/80 backdrop-blur-md'

  return (
    <header className={`w-full shrink-0 z-30 ${surface} ${sticky ? '' : 'relative'}`}>
      <div className="max-w-3xl mx-auto h-16 px-4 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          {showBack && (
            <Link href={backTo} onClick={onBack} aria-label="戻る" className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
        </div>

        <Link href="/" aria-label="いろおと ホーム" className="flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_irooto.png" alt="いろおと 絶対音感トレーニング" className="h-12 w-auto object-contain" />
        </Link>

        <div className="flex items-center justify-end gap-2">
          <StreakCounter />

          {selectedInstrument && (
            <span
              className="hidden md:inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500 whitespace-nowrap"
              title="使用中の音源"
            >
              <span aria-hidden="true">🎹</span>
              {INSTRUMENT_NAMES[selectedInstrument]}
            </span>
          )}

          {user ? (
            <Link
              href="/account"
              aria-label="アカウント"
              className="p-1 -mr-1 rounded-full hover:bg-black/5 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black uppercase border-2 shadow-sm ${avatarTone}`}>
                {user.email?.charAt(0) || '?'}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm hover:border-gray-300 hover:text-gray-900 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
              </svg>
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
