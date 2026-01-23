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

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('Webhook Error: No signature present')
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  
  // Environment variables
  const secretProd = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET_PROD')
  const secretTest = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET_TEST')
  const secretLegacy = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  // Initialize Stripe instances (we need them to verify signatures)
  // Note: We use the Secret Key for the API client, but here we only need the constructor to use the webhooks verification utility.
  // The verification utility doesn't strictly need the secret key to be valid if we only do signature verification, 
  // but it's best practice to use the correct one.
  const stripeProdKey = Deno.env.get('STRIPE_SECRET_KEY_PROD') || ''
  const stripeTestKey = Deno.env.get('STRIPE_SECRET_KEY_TEST') || ''
  
  const stripeProd = new Stripe(stripeProdKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
  const stripeTest = new Stripe(stripeTestKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  let event;
  let environment = 'UNKNOWN';

  // 1. Try PROD Secret
  if (secretProd) {
    try {
      event = await stripeProd.webhooks.constructEventAsync(body, signature, secretProd)
      environment = 'PROD'
      console.log('Webhook verified with PROD secret')
    } catch (err) {
      console.log(`PROD verification failed: ${err.message}`)
    }
  }

  // 2. Try TEST Secret
  if (!event && secretTest) {
    try {
      event = await stripeTest.webhooks.constructEventAsync(body, signature, secretTest)
      environment = 'TEST'
      console.log('Webhook verified with TEST secret')
    } catch (err) {
      console.log(`TEST verification failed: ${err.message}`)
    }
  }

  // 3. Try Legacy/Fallback Secret
  if (!event && secretLegacy) {
    try {
      event = await stripeTest.webhooks.constructEventAsync(body, signature, secretLegacy)
      environment = 'LEGACY'
      console.log('Webhook verified with LEGACY secret')
    } catch (err) {
      console.log(`LEGACY verification failed: ${err.message}`)
    }
  }

  if (!event) {
    console.error('Webhook signature verification failed for all environments')
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  console.log(`Received event type: ${event.type} in environment: ${environment}`)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            console.log('Processing checkout.session.completed')
            console.log('Session metadata:', JSON.stringify(session.metadata))
            
            let userId = session.subscription_data?.metadata?.supabase_user_id || session.metadata?.supabase_user_id
            const customerId = session.customer

            if (!userId && customerId) {
                console.log(`Metadata missing. Searching for user with customer ID: ${customerId}`)
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()
                
                if (profile) {
                    userId = profile.id
                    console.log(`Found user ${userId} via customer ID lookup`)
                } else {
                    console.error('Could not find user linked to this customer ID')
                }
            }

            if (userId) {
                console.log(`Updating user ${userId} to premium with customer ID ${customerId}`)
                const { error } = await supabaseAdmin
                .from('profiles')
                .update({ 
                    subscription_tier: 'premium',
                    stripe_customer_id: customerId 
                })
                .eq('id', userId)
                
                if (error) {
                    console.error('Database update failed:', error)
                    throw error
                }
                console.log('Database update successful')
            } else {
                console.error('No supabase_user_id found in metadata and fallback lookup failed')
            }
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object
            const customerId = subscription.customer
            console.log(`Processing subscription deletion for customer ${customerId}`)
            
            await supabaseAdmin
                .from('profiles')
                .update({ subscription_tier: 'free' })
                .eq('stripe_customer_id', customerId)
            console.log('Downgraded user to free')
            break
        }
        
        case 'customer.subscription.updated': {
            const subscription = event.data.object
            const customerId = subscription.customer
            const status = subscription.status
            console.log(`Processing subscription update for customer ${customerId}, status: ${status}`)
            
            let tier = 'free'
            if (['active', 'trialing'].includes(status)) {
                tier = 'premium'
            }

            await supabaseAdmin
                .from('profiles')
                .update({ subscription_tier: tier })
                .eq('stripe_customer_id', customerId)
            console.log(`Updated user tier to ${tier}`)
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
    })

  } catch (err) {
      console.error('Error processing webhook:', err)
      return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
