import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'
import { nextTick } from 'vue'

// Mock supabase and premium status
const mockStatus = { tier: 'premium' }
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      onAuthStateChange: vi.fn((cb) => {
        // Can optionally trigger callback here if needed
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
    }
  },
  checkPremiumStatus: vi.fn(async () => mockStatus)
}))

describe('useAuth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct user and tier', async () => {
    const { user, userTier, authReady } = useAuth()
    
    await authReady
    
    expect(user.value).not.toBeNull()
    expect(user.value.id).toBe('test-user')
    expect(userTier.value).toBe('premium')
  })

  it('provides isAuthReady reactive state', async () => {
    const { isAuthReady, authReady } = useAuth()
    
    await authReady
    expect(isAuthReady.value).toBe(true)
  })
})
