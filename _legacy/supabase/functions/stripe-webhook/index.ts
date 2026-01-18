import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;
    
    // サブスクリプション詳細を取得してメタデータ（tier）を確認
    const subscriptionId = session.subscription;
    let tier = 'free';
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      tier = subscription.metadata.tier || 'entry'; // デフォルトはエントリー
    }

    if (userId) {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ 
          is_premium: true,
          subscription_tier: tier,
          stripe_customer_id: customerId 
        })
        .eq("id", userId);

      if (error) console.error("Error updating profile:", error);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const { error } = await supabaseClient
      .from("profiles")
      .update({ 
        is_premium: false,
        subscription_tier: 'free' 
      })
      .eq("stripe_customer_id", customerId);
      
    if (error) console.error("Error revoking premium:", error);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
