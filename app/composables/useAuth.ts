import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { SubscriptionTier } from './usePremium'

// Singleton state
const user = ref<User | null>(null)
const userTier = ref<SubscriptionTier>('free')
const isAuthReady = ref(false)

// Initialize and listen for changes
let isInitialized = false
let authReadyResolver: (() => void) | undefined
const authReadyPromise = new Promise<void>(resolve => {
  authReadyResolver = resolve
})

export function useAuth() {
  const supabase = useSupabaseClient()
  const { checkPremiumStatus } = usePremium()

  const refreshStatus = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      user.value = data?.user || null
      if (user.value) {
        const status = await checkPremiumStatus()
        userTier.value = status.tier
      } else {
        userTier.value = 'free'
      }
    } catch (err) {
      console.error('refreshStatus error:', err)
      userTier.value = 'free'
    }
  }

  const init = async () => {
    if (isInitialized) return
    isInitialized = true

    // Initial check
    await refreshStatus()
    isAuthReady.value = true
    if (authReadyResolver) authReadyResolver()

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event (global):', event)
      user.value = session?.user || null
      if (user.value) {
        const status = await checkPremiumStatus()
        userTier.value = status.tier
      } else {
        userTier.value = 'free'
      }
    })
  }

  // Auto-init on first use
  // Ensure we are on client to avoid hydration mismatch with singleton state?
  // But init() calls async methods.
  // In Nuxt, useAuth called in setup.
  if (import.meta.client) {
     init()
  }

  return {
    user,
    userTier,
    isAuthReady,
    authReady: authReadyPromise,
    refreshStatus
  }
}
