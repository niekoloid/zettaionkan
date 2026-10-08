'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/app-context'
import { useStreak } from '@/lib/streak'

export default function StreakCounter() {
  const { user } = useAuth()
  const { streakCount, fetchStreak } = useStreak()

  useEffect(() => { fetchStreak() }, [fetchStreak])

  if (!user) return null

  if (streakCount > 1) {
    return (
      <div className="flex flex-col items-center mx-3">
        <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-1 rounded-full border border-orange-200">
          <span className="text-lg leading-none">🔥</span>
          <span className="text-xs font-black text-orange-600 font-mono">{streakCount}</span>
        </div>
        <span className="text-[10px] font-bold text-orange-500 mt-0.5">日連続</span>
      </div>
    )
  }

  return (
    <div className="hidden sm:flex flex-col items-center mx-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="練習してストリークを伸ばそう！">
      <div className="flex items-center space-x-1 px-2 py-1 rounded-full border border-gray-200">
        <span className="text-lg leading-none">🔥</span>
        <span className="text-xs font-black text-gray-400 font-mono">{streakCount || 0}</span>
      </div>
    </div>
  )
}
