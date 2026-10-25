'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { FeatureKey } from '@/constants/features'
import { useAuth, usePro } from '@/lib/app-context'

// Same mapping as the Nuxt feature-gate middleware
const ROUTE_TO_FEATURE: Record<string, FeatureKey> = {
  '/': 'page_index',
  '/autoplay': 'page_autoplay',
  '/chordquizz': 'page_chordquiz',
  '/voice-settings': 'page_voice_settings',
  '/history': 'page_history',
  '/singlenotetest': 'page_single_note_test',
  '/settings': 'page_settings'
}

/** Sends the user to /subscription when a page is not available for their tier (or is switched off in /admin/features). */
export default function RouteGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const { userTier, authReady } = useAuth()
  const { hasAccess } = usePro()

  useEffect(() => {
    if (!authReady) return
    const feature = ROUTE_TO_FEATURE[pathname]
    if (feature && !hasAccess(feature, userTier)) {
      console.warn(`Access denied to ${feature} for tier ${userTier}`)
      router.replace('/subscription')
    }
  }, [pathname, authReady, userTier, hasAccess, router])

  return null
}
