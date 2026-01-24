import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { SubscriptionTier } from '~/types/app'

const user = ref<User | null>(null)
const isAuthReady = ref(false)

// Initialize and listen for changes
let isInitialized = false
let authReadyResolver: (() => void) | undefined
const authReadyPromise = new Promise<void>(resolve => {
  authReadyResolver = resolve
})

export function useAuth() {
  const route = useRoute()
  if (route.path.startsWith('/lp')) {
    return {
      user: ref(null),
      userTier: computed(() => 'free' as SubscriptionTier),
      isAuthReady: ref(true),
      authReady: Promise.resolve(),
      refreshStatus: async () => {}
    }
  }

  const supabase = useSupabaseClient()
  const { checkProStatus } = usePro()
  
  const debugTierCookie = useCookie<SubscriptionTier | null>('zettaionkan_debug_tier', {
    default: () => null,
    watch: true
  })

  // Use Cookie for tier to enable SSR support and prevent flickering
  const userTierCookie = useCookie<SubscriptionTier>('zettaionkan_user_tier', {
    default: () => 'free',
    maxAge: 60 * 60 * 24 * 365 * 100 // 100 years
  })

  const refreshStatus = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      user.value = data?.user || null
      if (user.value) {
        const status = await checkProStatus()
        userTierCookie.value = status.tier
      } else {
        userTierCookie.value = 'free'
      }
    } catch (err) {
      console.error('refreshStatus error:', err)
      userTierCookie.value = 'free'
    }
  }

  const init = async () => {
    if (isInitialized) return
    
    // Skip auth initialization on LP to keep it static and fast
    const route = useRoute()
    if (route.path === '/lp') {
      isAuthReady.value = true
      if (authReadyResolver) authReadyResolver()
      return
    }

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
        const status = await checkProStatus()
        userTierCookie.value = status.tier
      } else {
        userTierCookie.value = 'free'
      }
    })
  }

  if (import.meta.client) {
     init()
  }

  return {
    user,
    userTier: computed(() => {
        if (!user.value) return 'free'
        if (import.meta.dev && debugTierCookie.value) {
            return debugTierCookie.value
        }
        return userTierCookie.value || 'free'
    }),
    isAuthReady,
    authReady: authReadyPromise,
    refreshStatus
  }
}
