import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppProvider, DEFAULT_SETTINGS, useChordSettings, usePro, useAuth } from '@/lib/app-context'
import type { SubscriptionTier } from '@/types/app'

// No network: pretend nobody is signed in
jest.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) })
  })
}))

const wrap = (tier: SubscriptionTier, overrides = {}) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider initial={{ settings: DEFAULT_SETTINGS, mappings: {}, overrides, tier }}>{children}</AppProvider>
  }

describe('feature gates', () => {
  it('orders tiers: free < entry < standard < premium', () => {
    const { result } = renderHook(() => usePro(), { wrapper: wrap('free') })
    const { hasAccess } = result.current
    expect(hasAccess('home_chord_domiso', 'free')).toBe(true)
    expect(hasAccess('home_chord_lacismi', 'free')).toBe(false) // black keys need entry
    expect(hasAccess('home_chord_lacismi', 'entry')).toBe(true)
    expect(hasAccess('autoplay_chord_dofara', 'entry')).toBe(false)
    expect(hasAccess('autoplay_chord_dofara', 'standard')).toBe(true)
    expect(hasAccess('instrument_steinway', 'standard')).toBe(false)
    expect(hasAccess('instrument_steinway', 'premium')).toBe(true)
  })

  it('a feature switched off in /admin/features is closed for everyone', () => {
    const { result } = renderHook(() => usePro(), { wrapper: wrap('premium', { page_history: { enabled: false } }) })
    expect(result.current.hasAccess('page_history', 'premium')).toBe(false)
    expect(result.current.isEnabled('page_history')).toBe(false)
  })

  it('isPro is true only for premium', () => {
    const { result } = renderHook(() => usePro(), { wrapper: wrap('free') })
    expect(result.current.isPro('premium')).toBe(true)
    expect(result.current.isPro('standard')).toBe(false)
  })

  it('starts from the tier in the cookie and becomes ready after the auth check', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrap('standard') })
    await waitFor(() => expect(result.current.authReady).toBe(true))
    // not signed in -> falls back to free
    expect(result.current.userTier).toBe('free')
  })

  it('exposes the 14 chords through useChordSettings', () => {
    const { result } = renderHook(() => useChordSettings(), { wrapper: wrap('free') })
    expect(result.current.allChords).toHaveLength(14)
  })
})
