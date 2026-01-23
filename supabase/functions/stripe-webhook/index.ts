import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.12.0?target=deno'

const stripeProd = new Stripe(Deno.env.get('STRIPE_SECRET_KEY_PROD') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const stripeTest = new Stripe(Deno.env.get('STRIPE_SECRET_KEY_TEST') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('No signature', { status: 400 })

  const body = await req.text()
  let event;
  let usedStripe;

  // Try verifying with PROD secret first
  try {
    const secretProd = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET_PROD')
    if (secretProd) {
      event = await stripeProd.webhooks.constructEventAsync(body, signature, secretProd)
      usedStripe = stripeProd
    }
  } catch (_err) {
    // Skip PROD error and fallback to TEST
  }

  // Fallback to TEST secret if not verified yet
  if (!event) {
    try {
      const secretTest = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET_TEST')
      if (secretTest) {
        event = await stripeTest.webhooks.constructEventAsync(body, signature, secretTest)
        usedStripe = stripeTest
      }
    } catch (err) {
      return new Response(`Webhook Error (Test): ${err.message}`, { status: 400 })
    }
  }

  if (!event) {
    return new Response('Could not verify webhook signature', { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  console.log(`Processing event: ${event.type}`)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const customerId = session.customer as string
      const userId = session.subscription_data?.metadata?.supabase_user_id || session.metadata?.supabase_user_id

      if (userId) {
        await supabaseAdmin
          .from('profiles')
          .update({ 
              subscription_tier: 'premium',
              stripe_customer_id: customerId 
          })
          .eq('id', userId)
        console.log(`User ${userId} upgraded to premium via checkout`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', customerId)
      console.log(`Customer ${customerId} downgraded to free`)
      break
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      const status = subscription.status
      
      let tier = 'free'
      if (['active', 'trialing'].includes(status)) {
          tier = 'premium'
      }

      await supabaseAdmin
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('stripe_customer_id', customerId)
      console.log(`Customer ${customerId} subscription updated to ${status} (Tier: ${tier})`)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
