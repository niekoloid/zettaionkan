import type { Database } from '~/types/database.types'

export type SubscriptionTier = Database['public']['Tables']['profiles']['Row']['subscription_tier']

export interface PremiumStatus {
  tier: SubscriptionTier
  hasCustomer: boolean
  isPremium?: boolean // Legacy support
}

export const usePremium = () => {
  const supabase = useSupabaseClient<Database>()

  const checkPremiumStatus = async (): Promise<PremiumStatus> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { tier: 'free', hasCustomer: false, isPremium: false }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, stripe_customer_id')
      .eq('id', user.id)
      .single()
    
    const profile = data as any

    if (error || !data) return { tier: 'free', hasCustomer: false, isPremium: false }
    
    const tier = profile.subscription_tier || 'free'
    return { 
      tier,
      hasCustomer: !!profile.stripe_customer_id,
      isPremium: tier !== 'free'
    }
  }

  return {
    checkPremiumStatus
  }
}
