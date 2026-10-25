import { FEATURE_GATES, type FeatureKey } from '~/constants/features'

export default defineNuxtRouteMiddleware(async (to) => {
  const { userTier, authReady } = useAuth(to)
  const { hasAccess } = usePro()

  // Wait for auth to be determined (especially on initial load)
  if (import.meta.client) {
    await authReady
  }

  // Map route names to FeatureKeys
  const routeToFeature: Record<string, FeatureKey> = {
    'index': 'page_index',
    'autoplay': 'page_autoplay',
    'chordquizz': 'page_chordquiz',
    'voice-settings': 'page_voice_settings',
    'history': 'page_history',
    'songs': 'page_songs',
    'singlenotetest': 'page_single_note_test',
    'settings': 'page_settings'
  }

  const featureKey = routeToFeature[to.name as string]

  if (featureKey) {
    if (!hasAccess(featureKey, userTier.value)) {
      console.warn(`Access denied to ${featureKey} for tier ${userTier.value}`)
      return navigateTo('/subscription')
    }
  }
})
