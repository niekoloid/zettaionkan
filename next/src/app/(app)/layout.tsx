import { cookies } from 'next/headers'
import Providers from '@/components/Providers'
import { DEFAULT_SETTINGS } from '@/lib/app-context'
import { CHORD_MAPPINGS_COOKIE } from '@/lib/chords'
import { decodeCookie } from '@/lib/cookie'
import type { AppSettings, SubscriptionTier } from '@/types/app'

// Everything except the landing page (/lp) runs inside the app providers:
// settings, auth, audio engine, PRO modal, route guard.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Read cookies on the server so the first paint already has the user's
  // colours / settings / tier (no flicker, same as Nuxt's useCookie).
  const jar = await cookies()
  const initial = {
    settings: { ...DEFAULT_SETTINGS, ...decodeCookie<Partial<AppSettings>>(jar.get('zettaionkan_app_settings')?.value, {}) },
    mappings: decodeCookie(jar.get(CHORD_MAPPINGS_COOKIE)?.value, {}),
    overrides: decodeCookie(jar.get('feature_overrides')?.value, {}),
    tier: decodeCookie<SubscriptionTier>(jar.get('zettaionkan_user_tier')?.value, 'free'),
    debugTier: decodeCookie<SubscriptionTier | null>(jar.get('zettaionkan_debug_tier')?.value, null)
  }
  return <Providers initial={initial}>{children}</Providers>
}
