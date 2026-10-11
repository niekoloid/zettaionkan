'use client'

import { useCallback, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/app-context'

const dayKey = (d: Date) => d.toISOString().split('T')[0]!

/** Consecutive practice days ending today or yesterday. */
export function calcStreak(createdAt: string[], now = new Date()): number {
  const dates = Array.from(new Set(createdAt.map(s => dayKey(new Date(s))))).sort().reverse()
  const latest = dates[0]
  if (!latest) return 0
  const today = dayKey(now)
  const yesterday = dayKey(new Date(now.getTime() - 86400000))
  if (latest !== today && latest !== yesterday) return 0

  let streak = 0
  const check = new Date(latest)
  for (const d of dates) {
    if (d !== dayKey(check)) break
    streak++
    check.setDate(check.getDate() - 1)
  }
  return streak
}

export function useStreak() {
  const { user } = useAuth()
  const [streakCount, setStreakCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStreak = useCallback(async () => {
    if (!user) { setStreakCount(0); return }
    setIsLoading(true)
    try {
      const { data, error } = await getSupabase()
        .from('training_sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setStreakCount(calcStreak(((data ?? []) as { created_at: string }[]).map(r => r.created_at).filter(Boolean)))
    } catch (e) {
      console.error('Failed to fetch streak:', e)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return { streakCount, isLoading, fetchStreak }
}
