import { ref, onMounted } from 'vue'
import { supabase, checkPremiumStatus } from '../lib/supabase'

// Singleton state
const user = ref(null)
const userTier = ref('free')
const isAuthReady = ref(false)

// Initialize and listen for changes
let isInitialized = false

export function useAuth() {
  const refreshStatus = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data?.user || null
    if (user.value) {
      const status = await checkPremiumStatus()
      userTier.value = status.tier
    } else {
      userTier.value = 'free'
    }
  }

  const init = async () => {
    if (isInitialized) return
    isInitialized = true

    // Initial check
    await refreshStatus()
    isAuthReady.value = true

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
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
  init()

  return {
    user,
    userTier,
    isAuthReady,
    refreshStatus
  }
}
