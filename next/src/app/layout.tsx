import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import Providers from '@/components/Providers'
import { DEFAULT_SETTINGS } from '@/lib/app-context'
import { CHORD_MAPPINGS_COOKIE } from '@/lib/chords'
import { decodeCookie } from '@/lib/cookie'
import type { AppSettings, SubscriptionTier } from '@/types/app'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://zettaionkan.jp'),
  title: 'いろおと - 絶対音感トレーニング',
  alternates: { canonical: './' }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read cookies on the server so the first paint already has the user's
  // colours / settings / tier (no flicker, same as Nuxt's useCookie).
  const jar = await cookies()
  const initial = {
    settings: { ...DEFAULT_SETTINGS, ...decodeCookie<Partial<AppSettings>>(jar.get('zettaionkan_app_settings')?.value, {}) },
    mappings: decodeCookie(jar.get(CHORD_MAPPINGS_COOKIE)?.value, {}),
    overrides: decodeCookie(jar.get('feature_overrides')?.value, {}),
    tier: decodeCookie<SubscriptionTier>(jar.get('zettaionkan_user_tier')?.value, 'free')
  }

  return (
    <html lang="ja">
      <body>
        <Providers initial={initial}>{children}</Providers>
      </body>
    </html>
  )
}
