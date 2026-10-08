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
  onBack?: (e: React.MouseEvent) => void
}

export default function AppHeader({ showBack = false, backTo = '/', transparent = false, onBack }: Props) {
  const { user, userTier } = useAuth()
  const { selectedInstrument } = useAudio()

  const avatarTone =
    userTier === 'free' ? 'bg-white text-gray-400 border-gray-100'
      : userTier === 'entry' ? 'bg-blue-50 text-blue-500 border-blue-200'
        : 'bg-amber-50 text-amber-500 border-amber-200'

  return (
    <header className={`w-full pt-6 pb-2 px-4 flex items-center justify-between shrink-0 relative z-20 ${transparent ? '' : 'bg-white/80 backdrop-blur-md'}`}>
      <div className="w-10 flex items-center">
        {showBack && (
          <Link href={backTo} onClick={onBack} aria-label="戻る" className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
      </div>

      <div className="flex flex-col items-center">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_irooto.png" alt="いろおと 絶対音感トレーニング" className="h-16 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        <StreakCounter />

        {selectedInstrument && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter leading-none mb-0.5">Sound Source</span>
            <span className="text-[9px] font-bold text-gray-400 leading-none whitespace-nowrap">{INSTRUMENT_NAMES[selectedInstrument]}</span>
          </div>
        )}

        <Link
          href={user ? '/account' : '/auth'}
          aria-label={user ? 'アカウント' : 'ログイン'}
          className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors group flex items-center justify-center shrink-0"
        >
          {!user ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border-2 transition-all shadow-sm ${avatarTone}`}>
              {user.email?.charAt(0) || '?'}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
