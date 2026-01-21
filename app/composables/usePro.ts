import type { Database } from '~/types/database.types'
import { type FeatureKey } from '~/constants/features'

export type SubscriptionTier = Database['public']['Tables']['profiles']['Row']['subscription_tier']

const TIER_ORDER: Record<SubscriptionTier, number> = {
  'free': 0,
  'entry': 1,
  'standard': 2,
  'premium': 3
}

export interface ProStatus {
  tier: SubscriptionTier
  hasCustomer: boolean
  isPro?: boolean // Legacy support
}

export const usePro = () => {
  const supabase = useSupabaseClient<Database>()
  const { getFeatureConfig, isEnabled: isFeatureEnabled } = useFeatures()

  const checkProStatus = async (): Promise<ProStatus> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { tier: 'free', hasCustomer: false, isPro: false }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, stripe_customer_id')
      .eq('id', user.id)
      .single()
    
    if (error || !data) return { tier: 'free', hasCustomer: false, isPro: false }
    
    const tierData = (data as any).subscription_tier || 'free'
    // If user exists and tier is free in DB, treat as 'entry' for app logic
    const tier: SubscriptionTier = tierData === 'free' ? 'entry' : tierData

    return { 
      tier,
      hasCustomer: !!(data as any).stripe_customer_id,
      isPro: tier === "premium"
    }
  }

  const hasAccess = (feature: FeatureKey, currentTier: SubscriptionTier): boolean => {
    const config = getFeatureConfig(feature)
    if (!config || !config.enabled) return false

    const requiredTier = config.tier
    const currentScore = TIER_ORDER[currentTier] ?? 0
    const requiredScore = TIER_ORDER[requiredTier] ?? 0
    return currentScore >= requiredScore
  }

  const isEnabled = (feature: FeatureKey): boolean => {
    return isFeatureEnabled(feature)
  }

  return {
    checkProStatus,
    hasAccess,
    isEnabled,
    isPro: (tier: SubscriptionTier) => tier === "premium"
  }
}
