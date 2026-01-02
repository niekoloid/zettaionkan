import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing! Authentication features will not work.')
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { auth: { getUser: () => Promise.resolve({ data: { user: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) } }

export const checkPremiumStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isPremium: false, tier: 'free', hasCustomer: false }

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (error || !data) return { tier: 'free', hasCustomer: false }
  return { 
    tier: data.subscription_tier || 'free',
    hasCustomer: !!data.stripe_customer_id
  }
}
