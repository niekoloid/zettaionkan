import { FEATURE_GATES, type FeatureKey, type FeatureConfig } from '~/constants/features'

export const useFeatures = () => {
  const overrides = useCookie<Record<string, Partial<FeatureConfig>>>('feature_overrides', {
    default: () => ({}),
    watch: true,
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  // Get the effective configuration for a feature (Base + Override)
  const getFeatureConfig = (key: FeatureKey): FeatureConfig => {
    const base = FEATURE_GATES[key]
    const override = overrides.value?.[key]
    
    if (override) {
      return { ...base, ...override }
    }
    return base
  }

  // Check if a feature is enabled
  const isEnabled = (key: FeatureKey): boolean => {
    return getFeatureConfig(key)?.enabled ?? false
  }

  // Toggle a feature's enabled state
  const toggleFeature = (key: FeatureKey) => {
    const current = getFeatureConfig(key)
    setFeatureState(key, !current.enabled)
  }

  // Set specific state for a feature
  const setFeatureState = (key: FeatureKey, enabled: boolean) => {
    // Create a new object to ensure reactivity triggers for the cookie
    const newOverrides = { ...overrides.value }
    
    // We only store the diff to keep cookie size small
    if (!newOverrides[key]) {
      newOverrides[key] = {}
    }
    
    newOverrides[key].enabled = enabled
    overrides.value = newOverrides
  }

  const resetFeatures = () => {
    overrides.value = {}
  }
  
  const featuresList = Object.keys(FEATURE_GATES) as FeatureKey[]

  return {
    getFeatureConfig,
    isEnabled,
    toggleFeature,
    setFeatureState,
    resetFeatures,
    featuresList,
    overrides
  }
}
