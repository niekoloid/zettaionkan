import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.12.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tier, interval, return_url, is_test } = await req.json()
    
    // Determine the environment
    const suffix = is_test ? '_TEST' : '_PROD'
    console.log(`Debug Server: Environment mode: ${suffix}`)
    
    const secretKey = Deno.env.get(`STRIPE_SECRET_KEY${suffix}`)
    const priceMonthly = Deno.env.get(`STRIPE_PRICE_MONTHLY${suffix}`)
    const priceYearly = Deno.env.get(`STRIPE_PRICE_YEARLY${suffix}`)

    if (!secretKey) {
        console.error(`Debug Server: Missing Secret Key for ${suffix}`)
        throw new Error(`Stripe Secret Key (${suffix}) not configured in Supabase`)
    }
    if (!priceMonthly) console.error(`Debug Server: Missing Monthly Price for ${suffix}`)

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const authHeader = req.headers.get('Authorization')
    console.log('Debug Server: Auth Header Present:', !!authHeader)
    if (authHeader) {
      console.log('Debug Server: Auth Header Prefix:', authHeader.substring(0, 20))
    }

    if (!authHeader) {
      console.error('No Authorization header provided in request')
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    console.log('Debug Server: Auth User Verification Result:', user?.id ? 'Success' : 'Failed')
    if (userError) {
      console.error('Debug Server: Auth Error:', userError)
    }

    if (userError || !user) {
      console.error('Auth Error Details:', userError)
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'No user found'}` }), { status: 401 })
    }

    // 2. Map interval to Price ID
    const priceId = interval === 'yearly' ? priceYearly : priceMonthly
    if (!priceId) throw new Error(`Price ID for ${interval} ${suffix} not configured`)

    // 3. User mapping logic
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Note: Customers are also separate between Test and Live in Stripe.
    // However, for simplicity in a shared DB, we check if the ID exists.
    // If it's a test request but the ID is a live ID (or vice versa), 
    // retrieving from Stripe will fail, so we just create a new one for that mode if needed.
    
    try {
        if (customerId) {
            await stripe.customers.retrieve(customerId)
        }
    } catch (e) {
        console.log(`Debug Server: Existing customer check failed (likely env mismatch), creating new: ${e.message}`)
        customerId = null // ID was from different environment
    }

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { supabase_user_id: user.id }
        })
        customerId = customer.id
        
        // Save customer ID back to profile
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        if (updateError) {
            console.error('Debug Server: Failed to update profile with customer ID:', updateError)
            // We don't block the checkout, but this is bad.
        }
    }

    // 4. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      metadata: {
        supabase_user_id: user.id
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
            supabase_user_id: user.id
        }
      },
      success_url: return_url || `${req.headers.get('origin')}/subscription/success`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Debug Server: Caught Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
