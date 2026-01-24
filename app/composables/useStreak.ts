import type { Database } from '~/types/database.types'

export const useStreak = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  const streakCount = useState<number>('user_streak_count', () => 0)
  const lastActivityDate = useState<string | null>('user_last_activity', () => null)
  const isLoading = useState<boolean>('streak_is_loading', () => false)

  const fetchStreak = async () => {
    if (!user.value) {
      streakCount.value = 0
      return
    }

    isLoading.value = true
    try {
      // Fetch only the created_at dates, ordered latest first
      // Limit to last 100 sessions relative enough to calc streak
      const { data, error } = await supabase
        .from('training_sessions')
        .select('created_at')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        streakCount.value = 0
        return
      }

      // Logic to calculate consecutive days
      // 1. Unique dates (YYYY-MM-DD)
      const dates = new Set<string>()
      
      // Explicitly type the data iteration or ensure Supabase types are picked up
      // data is typed as { created_at: string }[] based on select('created_at') usually, 
      // but to be safe with strict mode:
      for (const item of data) {
         if (item && typeof item === 'object' && 'created_at' in item) {
             const createdStr = (item as any).created_at
             if (createdStr) {
                const date = new Date(createdStr).toISOString().split('T')[0]
                dates.add(date)
             }
         }
      }

      const sortedDates = Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      
      if (sortedDates.length === 0) {
        streakCount.value = 0
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Determine start of streak (must be today or yesterday)
      let currentStreak = 0
      
      // If the latest activity is NOT today AND NOT yesterday, streak is broken -> 0
      const latest = sortedDates[0]
      if (!latest) {
          streakCount.value = 0
          return
      }
      
      if (latest !== today && latest !== yesterday) {
        streakCount.value = 0
        return
      }

      // Check consecutive days backwards
      // We start checking from expected date (Today or Yesterday)
      // If user practiced today, we count backwards from today.
      // If user practiced yesterday but not yet today, streak is valid (e.g. 5 days), but if they assume today it becomes 6.
      // Wait, "Current Streak" usually implies "Consecutive days ending today or yesterday".
      
      let checkDate = new Date(latest)
      
      for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i]
        const checkStr = checkDate.toISOString().split('T')[0]
        
        if (dateStr === checkStr) {
          currentStreak++
          // Move checkDate back by one day
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          // Break in streak
          break
        }
      }

      streakCount.value = currentStreak

    } catch (e) {
      console.error('Failed to fetch streak:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Auto fetch on auth state change or mount could be handled here or inside component
  
  return {
    streakCount,
    isLoading,
    fetchStreak
  }
}
