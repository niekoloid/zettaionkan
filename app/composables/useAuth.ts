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

export function useAuth(currentRoute?: { path: string }) {
  const route = currentRoute || useRoute()
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

  const loadTier = async (currentUser: User | null) => {
    if (!currentUser) {
      userTierCookie.value = 'free'
      return
    }
    const status = await checkProStatus(currentUser.id)
    userTierCookie.value = status.tier
  }

  // Explicit refresh: verifies the user with the auth server
  const refreshStatus = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      user.value = data?.user || null
      await loadTier(user.value)
    } catch (err) {
      console.error('refreshStatus error:', err)
      userTierCookie.value = 'free'
    }
  }

  const init = async () => {
    if (isInitialized) return
    
    // Skip auth initialization on LP to keep it static and fast
    // Use the route passed to useAuth or the active route
    if (route.path === '/lp') {
      isAuthReady.value = true
      if (authReadyResolver) authReadyResolver()
      return
    }

    isInitialized = true

    // Initial check. Every page (and the route middleware) waits on this, so
    // read the locally stored session instead of calling getUser(), which is
    // a network round trip. The tier still comes from the profiles table,
    // where RLS checks the token on the server.
    try {
      const { data } = await supabase.auth.getSession()
      user.value = data?.session?.user || null
      await loadTier(user.value)
    } catch (err) {
      console.error('Auth init error:', err)
      userTierCookie.value = 'free'
    }
    isAuthReady.value = true
    if (authReadyResolver) authReadyResolver()

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event (global):', event)
      const nextUser = session?.user || null
      const sameUser = nextUser?.id === user.value?.id
      user.value = nextUser
      // INITIAL_SESSION repeats the check above, and a token refresh for the
      // same user does not change the tier: skip the profile query.
      if (event === 'INITIAL_SESSION' || (event === 'TOKEN_REFRESHED' && sameUser)) return
      try {
        await loadTier(nextUser)
      } catch (err) {
        console.error('Tier refresh error:', err)
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
